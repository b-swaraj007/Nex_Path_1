/**
 * NexPath.AI - Shared types for Cloud Functions
 * Matches Firestore structure and frontend interfaces
 */

export interface UserProfile {
  ageRange: string
  education: string
  field: string
  country: string
  careerStage: string
}

export interface PsychometricParameter {
  name: string
  score: number
  interpretation: string
}

export interface PsychometricProfile {
  cri: number
  criInterpretation?: string
  parameters: PsychometricParameter[]
  strengths?: string[]
  learningStyle?: string
  workPreference?: string
  reasoning?: string
  completedAt: unknown // Firestore Timestamp
}

/** Canonical backend→UI psychometric contract (Firestore + API response) */
export interface PsychometricCRI {
  score: number
  max: number
  band: string
  summary: string
  disclaimer: string
}

export interface PsychometricParameterStored {
  score: number
  max: number
  status: "active" | "removed"
  interpretation: string
}

export type PsychometricParametersStored = Record<string, PsychometricParameterStored>

export interface PsychometricProfileStored {
  CRI: PsychometricCRI
  parameters: PsychometricParametersStored
  userCorrections?: Record<string, string>
  removedInsights?: string[]
  rawAnswers?: Record<string, number>
  completedAt: unknown
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: unknown // Firestore Timestamp
}

export interface ChatSession {
  id: string
  title: string
  lastUpdated: unknown // Firestore Timestamp
  hasAssessment: boolean
}
