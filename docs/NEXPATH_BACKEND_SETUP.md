# NexPath.AI Backend Setup

This document describes the Firebase backend architecture and how to deploy and use it.

## Architecture Overview

- **Frontend** (Next.js): Auth, Firestore listeners, calls Cloud Functions
- **Backend** (Firebase Cloud Functions): All LLM calls via OpenAI; never exposed to frontend
- **Database** (Firestore): users, psychometric profiles, chat sessions, messages, reports

### Firestore Structure

```
users/{userId}                      # User doc (onboarding data)
users/{userId}/psychometric/profile # Psychometric assessment results
users/{userId}/chatSessions/{sessionId}
users/{userId}/chatSessions/{sessionId}/messages/{messageId}
users/{userId}/reports/{reportId}
```

### LLM Prompt Structure (Mandatory)

1. **System Prompt** – Mentor role and ethical rules
2. **Platform Context** – NexPath.AI career guidance platform
3. **User Profile Context** – Onboarding (age, education, field, country, career stage)
4. **Psychometric Context** – CRI, parameters, strengths (if available)
5. **Chat History** – Last 10–15 messages of the session
6. **Current User Message**

## Setup

### 1. Firebase Project

1. Create a project at [Firebase Console](https://console.firebase.google.com)
2. **Enable Authentication:**
   - Go to **Authentication** → **Sign-in method**
   - Enable **Email/Password** (and **Email link** if you want)
   - Enable **Google** and set support email / project public name
3. Create a Firestore database
4. Run `firebase login` and `firebase use <project-id>`

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in your Firebase config from Firebase Console > Project Settings > General:

```bash
cp .env.example .env.local
```

Then edit `.env.local` with your values. Do not commit `.env.local` (it's in `.gitignore`).

### 3. OpenAI API Key (Secret)

Set the secret for Cloud Functions:

```bash
firebase functions:secrets:set OPENAI_API_KEY
# Enter your OpenAI API key when prompted
```

### 4. Deploy Cloud Functions

```bash
cd functions
npm install
npm run build
cd ..
firebase deploy --only functions
```

### 5. Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

## Cloud Functions

| Function         | Purpose                                |
|------------------|----------------------------------------|
| `sendChatMessage`| Receives user message, calls OpenAI, saves to Firestore |
| `createChatSession` | Creates a new chat session         |
| `getChatSessions`   | Returns list of user's sessions    |

## Frontend Integration

- `lib/firebase.ts` – Firebase init, Auth, Firestore, callable wrappers
- `hooks/useChatFirestore.ts` – Real-time messages + `sendMessage` via Cloud Function
- `lib/firestore-types.ts` – Shared types

To wire the chat page to the backend:

1. Ensure the user is authenticated (e.g. redirect to `/auth` if not).
2. Use `createChatSession` when creating a new session.
3. Use `getChatSessions` or Firestore `onSnapshot` for the sessions list.
4. Use `useChatFirestore({ userId, sessionId, hasAssessment })` for the active session.
5. Call `sendMessage(content)` from the hook instead of local simulation.

## Saving Onboarding and Psychometric Data

- **Onboarding**: Write to `users/{userId}` when the user completes onboarding.
- **Psychometric**: Write to `users/{userId}/psychometric/profile` when the assessment is completed.

The chat Cloud Function reads these automatically for context injection.
