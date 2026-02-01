# NexPath.AI Backend Setup

This document describes the Firebase backend architecture and how to deploy and use it.

**Why is Firestore empty?** Firestore has no schema or seed data. Documents are created when your app runs: e.g. `users/{uid}` when a user signs in or completes onboarding, `chatSessions` when they start a chat, `psychometric/profile` when they submit the assessment. So an empty database in the console is normal until users use the app.

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

### 1. Firebase Project & Firestore Database

1. Create a project at [Firebase Console](https://console.firebase.google.com) (or use an existing one).
2. **Enable Authentication:**
   - Go to **Build** → **Authentication** → **Sign-in method**
   - Enable **Email/Password** (and **Email link** if you want)
   - Enable **Google** and set support email / project public name
3. **Create the Firestore database (required before anything works):**
   - Go to **Build** → **Firestore Database**
   - Click **Create database**
   - Choose **Start in production mode** (we deploy rules next) or **test mode** for quick local testing
   - Pick a region (e.g. `us-central1`) and confirm
   - The database will be empty until your app and Cloud Functions create documents (e.g. on sign-up, chat, psychometric submit)
4. Link your project locally:
   ```bash
   firebase login
   firebase use <your-project-id>
   ```

### 2. Environment Variables (Frontend)

Copy `.env.example` to `.env.local` and fill in your Firebase config from **Firebase Console** → **Project settings** (gear) → **General** → **Your apps**:

```bash
cp .env.example .env.local
```

Then edit `.env.local` with your values. Do not commit `.env.local` (it's in `.gitignore`).

### 3. OpenAI API Key (Backend Secret)

Cloud Functions need your OpenAI API key as a secret:

```bash
firebase functions:secrets:set OPENAI_API_KEY
# Enter your OpenAI API key when prompted
```

**Verify the secret:**

- List secrets:  
  `firebase functions:secrets:access OPENAI_API_KEY`  
  (prompts to view the value; use only locally, never log it.)
- Or in **Google Cloud Console** → **Security** → **Secret Manager** → confirm `OPENAI_API_KEY` exists and has a version with your key.
- The key must be a valid **OpenAI API key** (starts with `sk-...`). Create one at [platform.openai.com/api-keys](https://platform.openai.com/api-keys). No extra spaces or newlines when pasting.

### 4. Deploy Everything (Firestore + Functions)

Deploy **Firestore rules**, **Firestore indexes**, and **Cloud Functions** in one go:

```bash
firebase deploy
```

Or from the project root using npm:

```bash
npm run deploy:firebase
```

This will:

- Deploy **Firestore rules** (`firestore.rules`) so your app can read/write `users/{userId}`, chat sessions, psychometric profile, etc.
- Deploy **Firestore indexes** (`firestore.indexes.json`) so queries for chat sessions and messages work.
- Build and deploy **Cloud Functions** (chat, psychometric, etc.).

**First-time only:** Ensure `functions` dependencies are installed:

```bash
cd functions && npm install && cd ..
```

Then run `firebase deploy` (or `npm run deploy:firebase`) again if needed.

### 5. Deploy Only One Part (Optional)

- Firestore rules + indexes only:  
  `firebase deploy --only firestore`
- Cloud Functions only:  
  `firebase deploy --only functions`

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
