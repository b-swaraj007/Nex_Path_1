"use client"

/**
 * NexPath.AI - Chat Firestore hook
 * Subscribes to a chat session's messages and provides sendMessage via Cloud Function.
 * Session-based memory: each session has isolated conversational history in Firestore.
 */

import { useState, useEffect, useCallback } from "react"
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore"
import { db, sendChatMessage as callSendChatMessage } from "@/lib/firebase"
import type { Message, ChatSession } from "@/lib/firestore-types"

interface UseChatFirestoreOptions {
  userId: string | null
  sessionId: string | null
  hasAssessment?: boolean
}

export function useChatFirestore({
  userId,
  sessionId,
  hasAssessment = false,
}: UseChatFirestoreOptions) {
  const [session, setSession] = useState<ChatSession | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Subscribe to session metadata
  useEffect(() => {
    if (!userId || !sessionId) {
      setSession(null)
      setIsLoading(false)
      return
    }
    const sessionRef = doc(db, "users", userId, "chatSessions", sessionId)
    const unsubscribe = onSnapshot(
      sessionRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data()
          setSession({
            id: snap.id,
            title: data?.title ?? "Untitled",
            lastUpdated: (data?.lastUpdated as Timestamp)?.toDate?.() ?? new Date(),
            messages: [],
            hasAssessment: Boolean(data?.hasAssessment),
          })
        } else {
          setSession(null)
        }
        setIsLoading(false)
      },
      (err) => {
        setError(err.message)
        setIsLoading(false)
      }
    )
    return () => unsubscribe()
  }, [userId, sessionId])

  // Subscribe to messages
  useEffect(() => {
    if (!userId || !sessionId) {
      setMessages([])
      return
    }
    const messagesRef = collection(
      db,
      "users",
      userId,
      "chatSessions",
      sessionId,
      "messages"
    )
    const q = query(messagesRef, orderBy("timestamp", "asc"))
    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const msgs: Message[] = snap.docs.map((d) => {
          const data = d.data()
          const ts = data.timestamp as Timestamp
          return {
            id: d.id,
            role: data.role as Message["role"],
            content: data.content ?? "",
            timestamp: ts?.toDate?.() ?? new Date(),
          }
        })
        setMessages(msgs)
      },
      (err) => setError(err.message)
    )
    return () => unsubscribe()
  }, [userId, sessionId])

  const sendMessage = useCallback(
    async (content: string) => {
      if (!sessionId || !content.trim()) return
      setIsSending(true)
      setError(null)
      try {
        await callSendChatMessage(sessionId, content.trim())
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to send message")
        throw err
      } finally {
        setIsSending(false)
      }
    },
    [sessionId]
  )

  return {
    session,
    messages,
    isLoading,
    isSending,
    error,
    sendMessage,
  }
}
