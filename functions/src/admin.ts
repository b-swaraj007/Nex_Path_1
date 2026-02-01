/**
 * Firebase Admin initialization - must be imported before any Firestore usage
 */
import * as admin from "firebase-admin"

admin.initializeApp()

export const db = admin.firestore()
