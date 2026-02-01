/**
 * NexPath.AI - Firestore data types (frontend)
 * Matches Cloud Functions types and Firestore structure
 */

export interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
}

export interface ChatSession {
  id: string
  title: string
  lastUpdated: Date
  messages: Message[]
  hasAssessment: boolean
}

export interface UserProfile {
  ageRange: string
  education: string
  field: string
  country: string
  careerStage: string
}

/** User document in Firestore users/{userId} - basic profile + optional onboarding */
export interface UserProfileDoc {
  displayName?: string
  email?: string
  photoURL?: string
  ageRange?: string
  education?: string
  field?: string
  country?: string
  careerStage?: string
  updatedAt?: unknown
}
