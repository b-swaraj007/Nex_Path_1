/**
 * NexPath.AI - Firebase Cloud Functions
 * All LLM calls happen here. Frontend NEVER calls OpenAI directly.
 */

import "./admin" // Initialize Firebase Admin first
export { sendChatMessage, createChatSession, getChatSessions } from "./chat"
