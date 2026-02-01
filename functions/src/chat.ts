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
import { buildLLMContext } from "./contextBuilder"
import type { UserProfile, PsychometricProfile, ChatMessage } from "./types"

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
 * Creates a new chat session for the user.
 */
export const createChatSession = onCall(
  {
    enforceAppCheck: false,
    region: "us-central1",
  },
  async (request) => {
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
