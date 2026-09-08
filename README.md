# NexPath — AI-Based Career Guidance System

A personalized career guidance platform that combines a student's academic background with a 30-question psychometric assessment to generate AI-assisted career guidance.

## Overview

NexPath is designed to help students make more informed career decisions by combining two kinds of information:

1. **Academic profile** — the user's educational background and related information.
2. **Psychometric profile** — responses to a 30-question assessment designed around multiple psychometric parameters.

The resulting profile is used as the basis for personalized career guidance.

```text
Academic Background
        |
        +----------------------+
                               |
                               v
                    User Profile / Context
                               ^
                               |
        +----------------------+
        |
30-Question Psychometric Test
        |
        v
Psychometric Parameter Scores
        |
        +----------------------+
                               |
                               v
                     Career Guidance
                               |
                               v
                  Personalized Recommendations
```

## How It Works

### 1. User Onboarding

The user provides relevant academic and profile information.

### 2. Psychometric Assessment

The user is redirected to a structured psychometric assessment containing approximately 30 questions.

### 3. Parameter Scoring

Assessment responses are used to derive scores across the psychometric parameters represented by the application.

### 4. Profile Combination

The psychometric scores are considered alongside the user's academic background rather than treating the test score in isolation.

### 5. AI-Assisted Career Guidance

The combined user profile is used to guide the user toward career options that better align with the information collected.

### 6. Report / Guidance Experience

The application presents the resulting guidance through a dedicated web experience for the user.

## Core Features

- Academic-profile onboarding
- 30-question psychometric assessment
- Psychometric parameter scoring
- Personalized career guidance workflow
- User profile management
- Dashboard experience
- Career guidance chat/report interfaces
- Firebase integration
- Serverless function structure
- Responsive web application

## Tech Stack

| Area | Technology |
|---|---|
| Framework | Next.js |
| Language | TypeScript |
| UI | React |
| Styling | Tailwind CSS |
| Forms / Validation | React Hook Form, Zod |
| Backend / Cloud | Firebase |
| Database | Cloud Firestore |
| Serverless | Firebase Functions |
| Charts | Recharts |
| Icons | Lucide React |

## Architecture

```text
Next.js Application
        |
        +-------------------+
        |                   |
        v                   v
 Authentication        User Profile
        |                   |
        +---------+---------+
                  |
                  v
        Psychometric Test
                  |
                  v
          Assessment Scores
                  |
                  v
       Career Guidance Logic
                  |
                  v
         Report / Guidance UI

                 +
                 |
                 v
            Firebase
      Auth / Firestore / Functions
```

## Project Structure

```text
Nex_Path_1/
├── app/
│   ├── auth/
│   ├── chat/
│   ├── dashboard/
│   ├── onboarding/
│   ├── profile/
│   ├── psychometric-test/
│   └── report/
├── components/
├── docs/
├── functions/
├── hooks/
├── lib/
│   ├── firebase.ts
│   ├── firestore-types.ts
│   ├── onboarding-options.ts
│   └── utils.ts
├── public/
├── styles/
├── package.json
├── next.config.mjs
├── tsconfig.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js
- npm or pnpm
- Firebase project/configuration for the enabled application features

### Install

```bash
git clone https://github.com/b-swaraj007/Nex_Path_1.git
cd Nex_Path_1
npm install
```

### Run Development Server

```bash
npm run dev
```

Open the local development URL shown by Next.js.

### Build

```bash
npm run build
```

### Start Production Build

```bash
npm run start
```

### Lint

```bash
npm run lint
```

## Firebase / Deployment

The repository includes Firebase configuration and deployment scripts for application and Firestore deployment.

Available package scripts include:

```bash
npm run deploy:functions
npm run deploy:firebase
npm run deploy:firestore
```

Before deployment, configure your Firebase project and required credentials according to your environment.

## Design Principles

- Combine multiple user signals instead of relying on one questionnaire result.
- Separate assessment collection from the final guidance experience.
- Keep the career recommendation process understandable to the user.
- Treat recommendations as guidance rather than deterministic career decisions.

## Limitations

- Psychometric results are dependent on the quality and design of the questionnaire and scoring methodology.
- Career recommendations should be treated as guidance, not definitive psychological or professional assessment.
- The quality of AI-assisted recommendations depends on the underlying guidance logic and configured AI services.
- The repository should include explicit evaluation criteria for recommendation quality before being used at scale.

## Future Improvements

- Add a documented psychometric scoring methodology.
- Add recommendation evaluation datasets and offline evaluation.
- Track recommendation quality and user feedback.
- Add explainable reasoning for why a career path was suggested.
- Add stronger privacy controls for student profile and assessment data.
- Add automated tests for assessment scoring and recommendation logic.
- Add a reproducible deployment and environment setup guide.

## Author

**Swaraj Bhosale**

GitHub: https://github.com/b-swaraj007
