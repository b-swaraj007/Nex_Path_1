/**
 * NexPath.AI - Chat Cloud Functions
 * Handles LLM orchestration. Frontend NEVER calls OpenAI directly.
 *
 * OpenAI key: Add secret OPENAI_API_KEY in Google Cloud Secret Manager
 * (Console → Security → Secret Manager, or: firebase functions:secrets:set OPENAI_API_KEY)
 */

import { defineSecret } from "firebase-functions/params"
import { onCall, HttpsError } from "firebase-functions/v2/https"
import { FieldValue } from "firebase-admin/firestore"
import OpenAI from "openai"
import { db } from "./admin"
import { buildLLMContext, storedProfileToContextProfile } from "./contextBuilder"
import type { UserProfile, PsychometricProfile, PsychometricProfileStored, ChatMessage } from "./types"

const openaiApiKey = defineSecret("OPENAI_API_KEY")

interface SendMessageRequest {
  sessionId: string
  userMessage: string
}

interface CreateSessionRequest {
  title?: string
  hasAssessment?: boolean
}

/**
 * Callable: sendChatMessage
 * Receives user message, fetches context from Firestore, calls OpenAI, saves messages.
 */
export const sendChatMessage = onCall(
  {
    enforceAppCheck: false,
    region: "us-central1",
    secrets: [openaiApiKey],
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "User must be signed in to send messages")
    }
    const userId = request.auth.uid
    const openai = new OpenAI({ apiKey: openaiApiKey.value() })

    const { sessionId, userMessage } = request.data as SendMessageRequest
    if (!sessionId || typeof userMessage !== "string" || !userMessage.trim()) {
      throw new HttpsError("invalid-argument", "sessionId and userMessage are required")
    }

    const sessionRef = db.doc(`users/${userId}/chatSessions/${sessionId}`)
    const sessionSnap = await sessionRef.get()
    if (!sessionSnap.exists) {
      throw new HttpsError("not-found", "Chat session not found")
    }

    // 1. Save user message
    const userMsgRef = await sessionRef.collection("messages").add({
      role: "user",
      content: userMessage.trim(),
      timestamp: FieldValue.serverTimestamp(),
    })

    const userMsgId = userMsgRef.id

    // 2. Fetch user profile
    const userDoc = await db.doc(`users/${userId}`).get()
    const userProfile = userDoc.exists ? (userDoc.data() as UserProfile) : null

    // 3. Fetch psychometric profile
    const psychometricSnap = await db.doc(`users/${userId}/psychometric/profile`).get()
    const psychometricProfile = psychometricSnap.exists
      ? (psychometricSnap.data() as PsychometricProfile)
      : null

    // 4. Fetch chat history (last 15 messages including the one we just added)
    const messagesSnap = await sessionRef
      .collection("messages")
      .orderBy("timestamp", "asc")
      .get()

    const chatHistory: ChatMessage[] = messagesSnap.docs.map((d) => {
      const data = d.data()
      const ts = data.timestamp
      return {
        id: d.id,
        role: data.role as "user" | "assistant" | "system",
        content: data.content,
        timestamp: ts,
      }
    })

    // 5. Build context and call OpenAI
    const { system, user } = buildLLMContext({
      userProfile,
      psychometricProfile,
      chatHistory,
      currentUserMessage: userMessage.trim(),
    })

    let assistantContent: string
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      })
      assistantContent =
        completion.choices[0]?.message?.content?.trim() ||
        "I apologize, but I couldn't generate a response. Please try again."
    } catch (err) {
      console.error("OpenAI error:", err)
      throw new HttpsError(
        "internal",
        "Failed to generate AI response. Please try again."
      )
    }

    // 6. Save assistant message
    const assistantMsgRef = await sessionRef.collection("messages").add({
      role: "assistant",
      content: assistantContent,
      timestamp: FieldValue.serverTimestamp(),
    })

    // 7. Update session lastUpdated
    await sessionRef.update({
      lastUpdated: FieldValue.serverTimestamp(),
    })

    return {
      userMessageId: userMsgId,
      assistantMessageId: assistantMsgRef.id,
      assistantContent,
    }
  }
)

/**
 * Callable: createChatSession
 * Creates a new chat session for the user. Does not use OpenAI.
 */
export const createChatSession = onCall(
  {
    enforceAppCheck: false,
    region: "us-central1",
  },
  async (request) => {
    try {
      if (!request.auth) {
        throw new HttpsError("unauthenticated", "User must be signed in")
      }
      const userId = request.auth.uid

      const { title = "New Career Session", hasAssessment = false } =
        (request.data as CreateSessionRequest) || {}

      const sessionsRef = db.collection(`users/${userId}/chatSessions`)
      const sessionRef = await sessionsRef.add({
        title: typeof title === "string" ? title : "New Career Session",
        lastUpdated: FieldValue.serverTimestamp(),
        hasAssessment: Boolean(hasAssessment),
      })

      return {
        sessionId: sessionRef.id,
        title: typeof title === "string" ? title : "New Career Session",
        hasAssessment: Boolean(hasAssessment),
      }
    } catch (err) {
      if (err instanceof HttpsError) throw err
      console.error("createChatSession error:", err)
      const message = err instanceof Error ? err.message : "Failed to create chat session"
      throw new HttpsError("internal", message)
    }
  }
)

/**
 * Callable: createPsychometricChatSession
 * Creates a session with hasAssessment: true and writes an initial "profile synthesis"
 * assistant message so the user sees an in-depth summary when they land on chat.
 */
export const createPsychometricChatSession = onCall(
  {
    enforceAppCheck: false,
    region: "us-central1",
    secrets: [openaiApiKey],
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "User must be signed in")
    }
    const userId = request.auth.uid
    const openai = new OpenAI({ apiKey: openaiApiKey.value() })

    const title = "Career Guidance (Psychometric)"
    const sessionsRef = db.collection(`users/${userId}/chatSessions`)
    const sessionRef = await sessionsRef.add({
      title,
      lastUpdated: FieldValue.serverTimestamp(),
      hasAssessment: true,
    })

    const userDoc = await db.doc(`users/${userId}`).get()
    const userProfile = userDoc.exists ? (userDoc.data() as UserProfile) : null
    const psychometricSnap = await db.doc(`users/${userId}/psychometric/profile`).get()
    const psychometricStored = psychometricSnap.exists
      ? (psychometricSnap.data() as PsychometricProfileStored)
      : null
    const psychometricProfile = storedProfileToContextProfile(psychometricStored)

    const profileSummary: string[] = []
    if (userProfile) {
      profileSummary.push(
        `Onboarding: age ${userProfile.ageRange}, education ${userProfile.education}, field ${userProfile.field}, country ${userProfile.country}, career stage ${userProfile.careerStage}.`
      )
    }
    if (psychometricProfile) {
      profileSummary.push(`CRI: ${psychometricProfile.cri}/160. ${psychometricProfile.criInterpretation || ""}`)
      if (psychometricProfile.parameters?.length) {
        profileSummary.push(
          "Parameters: " +
            psychometricProfile.parameters
              .map((p) => `${p.name} ${p.score}/100: ${p.interpretation}`)
              .join(" | ")
        )
      }
    }
    const contextBlock = profileSummary.length
      ? profileSummary.join("\n")
      : "No user or psychometric data available."

    const synthesisPrompt = `You are the NexPath.AI career mentor. Based on the following profile data, write a single in-depth profile synthesis (2 to 4 short paragraphs) that will be shown to the user as the first message when they start career guidance after their psychometric assessment.

Write in second person ("You show...", "Your profile suggests..."). Be warm, professional, and realistic. Do not list raw scores; synthesize strengths and what they mean for learning and career fit. End with one sentence inviting them to explore broad career domains or tell you their interests.

Profile data:
${contextBlock}

Write only the synthesis text, no headings or labels.`

    let synthesisContent: string
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: synthesisPrompt }],
        temperature: 0.4,
        max_tokens: 600,
      })
      synthesisContent =
        completion.choices[0]?.message?.content?.trim() ||
        "Based on your psychometric assessment, I have a good understanding of your cognitive profile. Let's explore career paths that fit your strengths. You can choose a broad domain below or tell me your interests."
    } catch (err) {
      console.error("OpenAI synthesis error:", err)
      synthesisContent =
        "Based on your psychometric assessment, I have a good understanding of your cognitive profile. Let's explore career paths that fit your strengths. You can choose a broad domain below or tell me your interests."
    }

    await sessionRef.collection("messages").add({
      role: "assistant",
      content: synthesisContent,
      timestamp: FieldValue.serverTimestamp(),
    })
    await sessionRef.update({ lastUpdated: FieldValue.serverTimestamp() })

    return {
      sessionId: sessionRef.id,
      title,
      hasAssessment: true,
    }
  }
)

/**
 * Callable: getChatSessions
 * Returns list of user's chat sessions (metadata only).
 */
export const getChatSessions = onCall(
  {
    enforceAppCheck: false,
    region: "us-central1",
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "User must be signed in")
    }
    const userId = request.auth.uid

    const snap = await db
      .collection(`users/${userId}/chatSessions`)
      .orderBy("lastUpdated", "desc")
      .get()

    const sessions = snap.docs.map((d) => {
      const data = d.data()
      return {
        id: d.id,
        title: data.title || "Untitled",
        lastUpdated: data.lastUpdated,
        hasAssessment: Boolean(data.hasAssessment),
      }
    })

    return { sessions }
  }
)
