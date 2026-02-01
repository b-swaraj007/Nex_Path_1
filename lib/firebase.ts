/**
 * NexPath.AI - Firebase client initialization
 * Used by frontend for Auth, Firestore, and callable Functions
 */

import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import { getAnalytics } from "firebase/analytics"
import {
  getAuth,
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  type Auth,
  type User,
  type UserCredential,
} from "firebase/auth"
import {
  getFirestore,
  connectFirestoreEmulator,
  enableIndexedDbPersistence,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  type Firestore,
} from "firebase/firestore"
import { getFunctions, httpsCallable, connectFunctionsEmulator, type Functions } from "firebase/functions"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

let app: FirebaseApp
let auth: Auth
let db: Firestore
let functions: Functions

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
  functions = getFunctions(app, "us-central1")

  if (typeof window !== "undefined") {
    getAnalytics(app)
    // Enable Firestore offline persistence so reads/writes work when network is slow or briefly offline
    enableIndexedDbPersistence(db).catch((err) => {
      if (err.code !== "failed-precondition" && err.code !== "unimplemented") {
        console.warn("Firestore persistence skipped:", err)
      }
    })
  }

  // Connect to emulators in development if enabled
  if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true") {
    connectAuthEmulator(auth, "http://127.0.0.1:9099")
    connectFirestoreEmulator(db, "127.0.0.1", 8080)
    connectFunctionsEmulator(functions, "127.0.0.1", 5001)
  }
} else {
  app = getApps()[0] as FirebaseApp
  auth = getAuth(app)
  db = getFirestore(app)
  functions = getFunctions(app, "us-central1")
}

export { app, auth, db, functions, firebaseConfig }

/**
 * Auth: Sign up with email/password and send verification email
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  displayName?: string
): Promise<UserCredential> {
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  if (displayName?.trim()) {
    await updateProfile(cred.user, { displayName: displayName.trim() })
  }
  await sendEmailVerification(cred.user)
  // Profile doc is created on first sign-in (no Firestore during sign-up to avoid "client offline" errors)
  return cred
}

/**
 * Auth: Sign in with email/password
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<UserCredential> {
  const cred = await signInWithEmailAndPassword(auth, email, password)
  // Sync profile in background so sign-in never hangs on Firestore
  ensureUserProfileInFirestore(cred.user).catch((e) =>
    console.warn("Could not sync profile to Firestore (offline?):", e)
  )
  return cred
}

/**
 * Auth: Sign in with Google popup
 */
export async function signInWithGoogle(): Promise<UserCredential> {
  const provider = new GoogleAuthProvider()
  const cred = await signInWithPopup(auth, provider)
  // Sync profile in background so sign-in never hangs on Firestore
  ensureUserProfileInFirestore(cred.user).catch((e) =>
    console.warn("Could not sync profile to Firestore (offline?):", e)
  )
  return cred
}

/**
 * Auth: Send password reset email
 */
export async function resetPassword(email: string): Promise<void> {
  return sendPasswordResetEmail(auth, email)
}

/**
 * Ensure user doc exists in Firestore (merge auth data). Call after sign-in/sign-up.
 */
export async function ensureUserProfileInFirestore(user: User): Promise<void> {
  const ref = doc(db, "users", user.uid)
  const snap = await getDoc(ref)
  const payload = {
    displayName: user.displayName ?? undefined,
    email: user.email ?? undefined,
    photoURL: user.photoURL ?? undefined,
    updatedAt: serverTimestamp(),
  }
  if (snap.exists()) {
    await setDoc(ref, payload, { merge: true })
  } else {
    await setDoc(ref, { ...payload }, { merge: true })
  }
}

/**
 * Get user profile from Firestore
 */
export async function getUserProfile(uid: string) {
  const ref = doc(db, "users", uid)
  const snap = await getDoc(ref)
  return snap.exists() ? snap.data() : null
}

/**
 * Update user profile in Firestore
 */
export async function updateUserProfile(
  uid: string,
  data: { displayName?: string; email?: string; photoURL?: string; ageRange?: string; education?: string; field?: string; country?: string; careerStage?: string }
): Promise<void> {
  const ref = doc(db, "users", uid)
  await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true })
}

/**
 * Callable: sendChatMessage
 */
export async function sendChatMessage(sessionId: string, userMessage: string) {
  const callable = httpsCallable<
    { sessionId: string; userMessage: string },
    { userMessageId: string; assistantMessageId: string; assistantContent: string }
  >(functions, "sendChatMessage")
  const result = await callable({ sessionId, userMessage })
  return result.data
}

/**
 * Get a user-facing message from a callable function error.
 * Firebase callables throw with code/message; we prefer the server message when available.
 */
export function getCallableErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    const msg = err.message || ""
    if (msg === "INTERNAL" || msg === "internal" || msg.startsWith("INTERNAL:"))
      return "Server error. Check that Cloud Functions are deployed and try again."
    if (msg.includes("OPENAI_API_KEY") || msg.includes("OpenAI API key"))
      return "OpenAI API key is not set. Add OPENAI_API_KEY in Firebase Secret Manager and redeploy functions."
    return msg
  }
  return "Something went wrong. Please try again."
}

/**
 * Callable: createChatSession
 */
export async function createChatSession(
  title?: string,
  hasAssessment?: boolean
) {
  const callable = httpsCallable<
    { title?: string; hasAssessment?: boolean },
    { sessionId: string; title: string; hasAssessment: boolean }
  >(functions, "createChatSession")
  const result = await callable({ title, hasAssessment })
  return result.data
}

/**
 * Callable: createPsychometricChatSession
 * Creates a session with hasAssessment: true and writes an initial profile synthesis
 * assistant message. Use when user continues from psychometric results to chat.
 */
export async function createPsychometricChatSession(): Promise<{
  sessionId: string
  title: string
  hasAssessment: boolean
}> {
  const callable = httpsCallable<
    void,
    { sessionId: string; title: string; hasAssessment: boolean }
  >(functions, "createPsychometricChatSession")
  const result = await callable()
  return result.data as { sessionId: string; title: string; hasAssessment: boolean }
}

/**
 * Callable: getChatSessions
 */
export async function getChatSessions() {
  const callable = httpsCallable<
    void,
    {
      sessions: Array<{
        id: string
        title: string
        lastUpdated: unknown
        hasAssessment: boolean
      }>
    }
  >(functions, "getChatSessions")
  const result = await callable()
  return result.data
}

/** Canonical psychometric response (backend→UI) */
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

export interface PsychometricResult {
  CRI: PsychometricCRI
  parameters: Record<string, PsychometricParameterStored>
  userCorrections?: Record<string, string>
  removedInsights?: string[]
}

/**
 * Callable: submitPsychometric
 * Submit raw answers; returns CRI + parameters + interpretations (stored in Firestore).
 */
export async function submitPsychometric(answers: Record<string, number>): Promise<PsychometricResult> {
  const callable = httpsCallable<
    { answers: Record<string, number> },
    PsychometricResult
  >(functions, "submitPsychometric")
  const result = await callable({ answers })
  return result.data as PsychometricResult
}

/**
 * Callable: updatePsychometricCorrections
 * Update user corrections and/or removed insights (excluded from LLM context).
 */
export async function updatePsychometricCorrections(
  userCorrections?: Record<string, string>,
  removedInsights?: string[]
): Promise<PsychometricResult> {
  const callable = httpsCallable<
    { userCorrections?: Record<string, string>; removedInsights?: string[] },
    PsychometricResult
  >(functions, "updatePsychometricCorrections")
  const result = await callable({ userCorrections, removedInsights })
  return result.data as PsychometricResult
}

/**
 * Get psychometric profile from Firestore (users/{uid}/psychometric/profile)
 */
export async function getPsychometricProfile(uid: string): Promise<PsychometricResult | null> {
  const ref = doc(db, "users", uid, "psychometric", "profile")
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return snap.data() as PsychometricResult
}
