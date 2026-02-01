/**
 * NexPath.AI - LLM Context Builder
 * Builds the full prompt context following the mandatory structure:
 * 1. System Prompt
 * 2. Platform Context
 * 3. User Profile Context
 * 4. Psychometric Context
 * 5. Chat History (last 10-15 messages)
 * 6. Current User Message
 */

import type {
  UserProfile,
  PsychometricProfile,
  PsychometricProfileStored,
  ChatMessage,
} from "./types"

const SYSTEM_PROMPT = `You are a wise, ethical, experienced career mentor for NexPath.AI. Your role is to guide users toward fulfilling careers based on their goals, strengths, and psychometric insights.

RULES YOU MUST FOLLOW:
- Never overpromise outcomes. Be realistic about career paths, timelines, and success rates.
- Ask clarifying questions when information is insufficient—do not assume.
- Be market-aware: reference real trends, demands, and salary ranges when relevant.
- Always respect user corrections over any AI inferences. If a user corrects you, acknowledge and adapt immediately.
- Do not make definitive statements about guaranteed success. Use phrases like "tends to", "often", "typically".
- Maintain a supportive but honest tone. Encourage exploration while being grounded in reality.`

const PLATFORM_CONTEXT = `PLATFORM: NexPath.AI is a career guidance platform that combines psychometric assessment with AI mentoring. Users complete an onboarding profile and optionally a cognitive assessment. Your responses inform their career exploration.`

function buildUserProfileContext(profile: UserProfile | null): string {
  if (!profile) return "USER PROFILE: No onboarding data available. You may ask the user about their background."
  return `USER PROFILE (from onboarding):
- Age range: ${profile.ageRange}
- Education: ${profile.education}
- Field: ${profile.field}
- Country/Region: ${profile.country}
- Career stage: ${profile.careerStage}`
}

/** Convert stored profile (canonical) to legacy shape; exclude removed insights, apply user corrections */
export function storedProfileToContextProfile(
  stored: PsychometricProfileStored | null
): PsychometricProfile | null {
  if (!stored?.CRI) return null
  const params = stored.parameters || {}
  const removed = new Set(stored.removedInsights || [])
  const corrections = stored.userCorrections || {}
  const parameterNames: Record<string, string> = {
    logical_reasoning: "Logical Reasoning",
    verbal_reasoning: "Verbal Reasoning",
    learning_adaptability: "Learning Adaptability",
    problem_solving_speed: "Problem-Solving Speed",
    curiosity_openness: "Curiosity & Openness",
    persistence_grit: "Persistence & Grit",
    attention_focus: "Attention & Focus",
  }
  const parameters = Object.entries(params)
    .filter(([k, p]) => p.status !== "removed" && !removed.has(k))
    .map(([k, p]) => ({
      name: parameterNames[k] || k,
      score: p.score,
      interpretation: corrections[k] ?? p.interpretation,
    }))
  return {
    cri: stored.CRI.score,
    criInterpretation: `${stored.CRI.band}: ${stored.CRI.summary}`,
    parameters,
    completedAt: stored.completedAt,
  }
}

function buildPsychometricContext(psychometric: PsychometricProfile | null): string {
  if (!psychometric) return "PSYCHOMETRIC: No assessment data. Provide general career guidance without cognitive profile assumptions."
  const parts = [
    `PSYCHOMETRIC PROFILE (inject into every response when relevant):`,
    `- Cognitive Reasoning Index (CRI): ${psychometric.cri}/160`,
  ]
  if (psychometric.criInterpretation) parts.push(`- CRI Interpretation: ${psychometric.criInterpretation}`)
  if (psychometric.strengths?.length) parts.push(`- Key Strengths: ${psychometric.strengths.join(", ")}`)
  if (psychometric.learningStyle) parts.push(`- Learning Style: ${psychometric.learningStyle}`)
  if (psychometric.workPreference) parts.push(`- Work Preference: ${psychometric.workPreference}`)
  if (psychometric.reasoning) parts.push(`- Reasoning Pattern: ${psychometric.reasoning}`)
  if (psychometric.parameters?.length) {
    parts.push("- Parameter Scores:")
    psychometric.parameters.forEach((p) => {
      parts.push(`  - ${p.name}: ${p.score}/100 - ${p.interpretation}`)
    })
  }
  return parts.join("\n")
}

function buildChatHistoryContext(messages: ChatMessage[], maxMessages = 15): string {
  if (!messages.length) return "CHAT HISTORY: (No prior messages in this session)"
  const recent = messages.slice(-maxMessages)
  const formatted = recent
    .filter((m) => m.role !== "system") // Exclude system messages from history
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n\n")
  return `CHAT HISTORY (last ${recent.length} messages):\n${formatted}`
}

export interface BuildContextInput {
  userProfile: UserProfile | null
  psychometricProfile: PsychometricProfile | null
  chatHistory: ChatMessage[]
  currentUserMessage: string
}

export function buildLLMContext(input: BuildContextInput): { system: string; user: string } {
  const { userProfile, psychometricProfile, chatHistory, currentUserMessage } = input
  const profileForContext =
    psychometricProfile &&
    "CRI" in psychometricProfile &&
    psychometricProfile.parameters &&
    !Array.isArray(psychometricProfile.parameters)
      ? storedProfileToContextProfile(psychometricProfile as unknown as PsychometricProfileStored)
      : psychometricProfile
  const system = [
    SYSTEM_PROMPT,
    PLATFORM_CONTEXT,
    buildUserProfileContext(userProfile),
    buildPsychometricContext(profileForContext),
  ].join("\n\n")
  const user = [
    buildChatHistoryContext(chatHistory),
    "",
    `CURRENT USER MESSAGE:\n${currentUserMessage}`,
  ].join("\n")
  return { system, user }
}
