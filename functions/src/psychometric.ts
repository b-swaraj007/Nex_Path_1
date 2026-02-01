/**
 * NexPath.AI - Psychometric assessment Cloud Functions
 * Receives raw answers, computes scores, CRI, calls OpenAI for interpretation,
 * stores canonical profile in Firestore. Supports user corrections and removals.
 */

import { defineSecret } from "firebase-functions/params"
import { onCall, HttpsError } from "firebase-functions/v2/https"
import { FieldValue } from "firebase-admin/firestore"
import OpenAI from "openai"
import { db } from "./admin"
import {
  PSYCHOMETRIC_QUESTIONS,
  SECTION_IDS,
  CRI_WEIGHTS,
  MAX_WEIGHT_PER_SECTION,
  type SectionId,
} from "./psychometricData"
import type {
  PsychometricProfileStored,
  PsychometricCRI,
  PsychometricParametersStored,
} from "./types"

const openaiApiKey = defineSecret("OPENAI_API_KEY")

/** Raw answers: question id (1-35) -> selected option index (0-based) */
interface SubmitPsychometricRequest {
  answers: Record<string, number>
}

/** Compute section scores (0-100) from raw answers */
function computeSectionScores(answers: Record<string, number>): Record<SectionId, number> {
  const scores = {} as Record<SectionId, number>
  for (const sectionId of SECTION_IDS) {
    const sectionQuestions = PSYCHOMETRIC_QUESTIONS.filter((q) => q.sectionId === sectionId)
    let earned = 0
    for (const q of sectionQuestions) {
      const userChoice = answers[String(q.id)]
      if (typeof userChoice === "number" && userChoice === q.correctOptionIndex) {
        earned += q.weight
      }
    }
    scores[sectionId] = Math.round((earned / MAX_WEIGHT_PER_SECTION) * 100)
  }
  return scores
}

/** CRI (0-160) from LR 40%, VR 25%, PS 20%, AF 15% */
function computeCRI(sectionScores: Record<SectionId, number>): number {
  let weightedSum = 0
  let totalWeight = 0
  for (const [sectionId, weight] of Object.entries(CRI_WEIGHTS)) {
    const score = sectionScores[sectionId as SectionId]
    if (typeof score === "number") {
      weightedSum += score * weight
      totalWeight += weight
    }
  }
  if (totalWeight === 0) return 0
  return Math.round((weightedSum / totalWeight) * 1.6)
}

const SECTION_DISPLAY_NAMES: Record<SectionId, string> = {
  logical_reasoning: "Logical Reasoning",
  verbal_reasoning: "Verbal Reasoning",
  learning_adaptability: "Learning Adaptability",
  problem_solving_speed: "Problem-Solving Speed",
  curiosity_openness: "Curiosity & Openness",
  persistence_grit: "Persistence & Grit",
  attention_focus: "Attention & Focus",
}

/** Call OpenAI to generate CRI band/summary/disclaimer and parameter interpretations */
async function getInterpretations(
  openai: OpenAI,
  cri: number,
  sectionScores: Record<SectionId, number>
): Promise<{ cri: PsychometricCRI; parameters: PsychometricParametersStored }> {
  const scoresText = SECTION_IDS.map(
    (id) => `${SECTION_DISPLAY_NAMES[id]}: ${sectionScores[id]}/100`
  ).join("\n")

  const prompt = `You are a professional, ethical career assessment interpreter for NexPath.AI. You interpret psychometric scores calmly and realistically. You must NOT act as a clinical authority or guarantee outcomes.

Given these section scores (each 0-100):
${scoresText}

Cognitive Reasoning Index (CRI): ${cri}/160 (derived from Logical Reasoning 40%, Verbal Reasoning 25%, Problem-Solving Speed 20%, Attention & Focus 15%).

Respond with a valid JSON object only, no markdown or extra text. Use this exact structure:
{
  "CRI": {
    "band": "Emerging" | "Developing" | "Moderate" | "High" | "Exceptional",
    "summary": "One or two short sentences describing what this CRI range suggests for learning and reasoning.",
    "disclaimer": "CRI is an AI-estimated reasoning indicator for career guidance, not a clinical IQ score."
  },
  "parameters": {
    "logical_reasoning": "One short sentence interpretation for this score.",
    "verbal_reasoning": "One short sentence interpretation.",
    "learning_adaptability": "One short sentence interpretation.",
    "problem_solving_speed": "One short sentence interpretation.",
    "curiosity_openness": "One short sentence interpretation.",
    "persistence_grit": "One short sentence interpretation.",
    "attention_focus": "One short sentence interpretation."
  }
}`

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 800,
  })

  const content = completion.choices[0]?.message?.content?.trim() || "{}"
  let parsed: {
    CRI?: { band?: string; summary?: string; disclaimer?: string }
    parameters?: Record<string, string>
  }
  try {
    parsed = JSON.parse(content.replace(/^```\w*\n?|\n?```$/g, ""))
  } catch {
    parsed = {}
  }

  const criObj: PsychometricCRI = {
    score: cri,
    max: 160,
    band: parsed.CRI?.band || "Moderate",
    summary: parsed.CRI?.summary || "Cognitive reasoning profile available for career guidance.",
    disclaimer:
      parsed.CRI?.disclaimer ||
      "CRI is an AI-estimated reasoning indicator for career guidance, not a clinical IQ score.",
  }

  const parameters: PsychometricParametersStored = {}
  for (const sectionId of SECTION_IDS) {
    const score = sectionScores[sectionId]
    const interpretation =
      parsed.parameters?.[sectionId] ||
      `Score ${score}/100. Consider how this dimension may influence your career fit.`
    parameters[sectionId] = {
      score,
      max: 100,
      status: "active",
      interpretation,
    }
  }

  return { cri: criObj, parameters }
}

/**
 * Callable: submitPsychometric
 * Receives raw answers, computes scores and CRI, gets AI interpretation, stores profile, returns canonical object.
 */
export const submitPsychometric = onCall(
  {
    enforceAppCheck: false,
    region: "us-central1",
    secrets: [openaiApiKey],
  },
  async (request) => {
    try {
      if (!request.auth) {
        throw new HttpsError("unauthenticated", "User must be signed in to submit the assessment")
      }
      const userId = request.auth.uid

      let apiKey: string
      try {
        apiKey = openaiApiKey.value()
      } catch (secretErr) {
        console.error("OPENAI_API_KEY secret not available:", secretErr)
        throw new HttpsError(
          "failed-precondition",
          "OpenAI API key is not configured. Add OPENAI_API_KEY in Firebase Secret Manager and redeploy functions."
        )
      }

      const openai = new OpenAI({ apiKey })

      const { answers } = (request.data as SubmitPsychometricRequest) || {}
      if (!answers || typeof answers !== "object") {
        throw new HttpsError("invalid-argument", "answers object is required")
      }

      const sectionScores = computeSectionScores(answers)
      const cri = computeCRI(sectionScores)

      let criObj: PsychometricCRI
      let parameters: PsychometricParametersStored
      try {
        const interpreted = await getInterpretations(openai, cri, sectionScores)
        criObj = interpreted.cri
        parameters = interpreted.parameters
      } catch (openaiErr) {
        console.error("OpenAI interpretation error:", openaiErr)
        const msg = openaiErr instanceof Error ? openaiErr.message : "OpenAI request failed"
        throw new HttpsError(
          "internal",
          msg.includes("API key") || msg.includes("401") || msg.includes("authentication")
            ? "Invalid or missing OpenAI API key. Check OPENAI_API_KEY in Firebase Secret Manager."
            : `AI interpretation failed: ${msg}`
        )
      }

      const profile: PsychometricProfileStored = {
        CRI: criObj,
        parameters,
        userCorrections: {},
        removedInsights: [],
        rawAnswers: answers,
        completedAt: FieldValue.serverTimestamp(),
      }

      const profileRef = db.doc(`users/${userId}/psychometric/profile`)
      await profileRef.set(profile)

      return {
        CRI: profile.CRI,
        parameters: profile.parameters,
        userCorrections: profile.userCorrections,
        removedInsights: profile.removedInsights,
      }
    } catch (err) {
      if (err instanceof HttpsError) throw err
      console.error("submitPsychometric error:", err)
      const message = err instanceof Error ? err.message : "Failed to submit assessment"
      throw new HttpsError("internal", message)
    }
  }
)

/**
 * Callable: updatePsychometricCorrections
 * Updates userCorrections and removedInsights. Removed parameters get status "removed" and must be excluded from LLM context.
 */
interface UpdatePsychometricCorrectionsRequest {
  userCorrections?: Record<string, string>
  removedInsights?: string[]
}

export const updatePsychometricCorrections = onCall(
  {
    enforceAppCheck: false,
    region: "us-central1",
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "User must be signed in")
    }
    const userId = request.auth.uid
    const { userCorrections, removedInsights } = (request.data as UpdatePsychometricCorrectionsRequest) || {}

    const profileRef = db.doc(`users/${userId}/psychometric/profile`)
    const snap = await profileRef.get()
    if (!snap.exists) {
      throw new HttpsError("not-found", "No psychometric profile found. Complete the assessment first.")
    }

    const data = snap.data() as PsychometricProfileStored
    const updates: Partial<PsychometricProfileStored> = {}

    if (userCorrections != null && typeof userCorrections === "object") {
      updates.userCorrections = { ...(data.userCorrections || {}), ...userCorrections }
    }
    if (Array.isArray(removedInsights)) {
      updates.removedInsights = [...new Set(removedInsights)]
      const removedSet = new Set(updates.removedInsights)
      const params = { ...data.parameters }
      for (const key of Object.keys(params)) {
        params[key] = {
          ...params[key],
          status: removedSet.has(key) ? ("removed" as const) : ("active" as const),
        }
      }
      updates.parameters = params
    }

    await profileRef.update({
      ...updates,
      completedAt: FieldValue.serverTimestamp(),
    })

    const updated = (await profileRef.get()).data() as PsychometricProfileStored
    return {
      CRI: updated.CRI,
      parameters: updated.parameters,
      userCorrections: updated.userCorrections,
      removedInsights: updated.removedInsights,
    }
  }
)
