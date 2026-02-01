/**
 * NexPath.AI - Psychometric assessment questions (structured data)
 * Used by backend for scoring. UI can consume same structure for dynamic render.
 * 7 sections × 5 questions = 35 questions. Weight per section = 15 (1+2+3+4+5).
 */

export const SECTION_IDS = [
  "logical_reasoning",
  "verbal_reasoning",
  "learning_adaptability",
  "problem_solving_speed",
  "curiosity_openness",
  "persistence_grit",
  "attention_focus",
] as const

export type SectionId = (typeof SECTION_IDS)[number]

/** CRI uses only these 4 sections with given weights */
export const CRI_WEIGHTS: Record<string, number> = {
  logical_reasoning: 0.4,
  verbal_reasoning: 0.25,
  problem_solving_speed: 0.2,
  attention_focus: 0.15,
}

export interface PsychometricQuestion {
  id: number // 1–35 global
  sectionId: SectionId
  weight: number // 1–5
  type: "mcq"
  question: string
  options: string[]
  correctOptionIndex: number
}

const SECTION_QUESTIONS: Record<SectionId, Omit<PsychometricQuestion, "id" | "sectionId">[]> = {
  logical_reasoning: [
    { weight: 1, type: "mcq", question: "What comes next in the sequence: 2, 6, 12, 20, 30, ?", options: ["40", "42", "44", "36"], correctOptionIndex: 1 },
    { weight: 2, type: "mcq", question: "If all Zorks are Morks, and some Morks are Borks, which statement must be true?", options: ["All Zorks are Borks", "Some Zorks might be Borks", "No Zorks are Borks", "All Borks are Zorks"], correctOptionIndex: 1 },
    { weight: 3, type: "mcq", question: "A cube has 6 faces. If you cut the cube with 3 planes parallel to its faces, how many smaller pieces do you get?", options: ["6", "8", "9", "12"], correctOptionIndex: 1 },
    { weight: 4, type: "mcq", question: "In a certain code, COMPUTER is written as RFUVQNPC. How would MEDICINE be written?", options: ["EOJDJEFM", "MFEJDJOE", "FOJEJDNM", "ENICIDME"], correctOptionIndex: 0 },
    { weight: 5, type: "mcq", question: "If the day after tomorrow is two days before Thursday, what day is today?", options: ["Saturday", "Sunday", "Monday", "Friday"], correctOptionIndex: 0 },
  ],
  verbal_reasoning: [
    { weight: 1, type: "mcq", question: "Choose the word most similar in meaning to 'Ephemeral':", options: ["Permanent", "Transient", "Solid", "Ancient"], correctOptionIndex: 1 },
    { weight: 2, type: "mcq", question: "Complete the analogy: Architect is to Building as Composer is to:", options: ["Music", "Symphony", "Instrument", "Orchestra"], correctOptionIndex: 1 },
    { weight: 3, type: "mcq", question: "Which word does NOT belong: Meticulous, Scrupulous, Careless, Thorough?", options: ["Meticulous", "Scrupulous", "Careless", "Thorough"], correctOptionIndex: 2 },
    { weight: 4, type: "mcq", question: "If 'ubiquitous' means 'present everywhere,' what does its antonym most likely mean?", options: ["Common", "Rare", "Visible", "Absent"], correctOptionIndex: 1 },
    { weight: 5, type: "mcq", question: "Identify the logical flaw: 'All successful people wake up early. I wake up early. Therefore, I am successful.'", options: ["Affirming the consequent", "Appeal to authority", "Circular reasoning", "No flaw exists"], correctOptionIndex: 0 },
  ],
  learning_adaptability: [
    { weight: 1, type: "mcq", question: "When learning something completely new, you prefer to:", options: ["Follow a structured curriculum", "Explore freely and experiment", "Watch others first", "Read comprehensive documentation"], correctOptionIndex: 1 },
    { weight: 2, type: "mcq", question: "You encounter an error in a new software. Your first instinct is to:", options: ["Search for the exact error message", "Understand why the error occurred", "Ask someone for help immediately", "Try random solutions until one works"], correctOptionIndex: 1 },
    { weight: 3, type: "mcq", question: "A new framework contradicts what you learned before. How do you respond?", options: ["Stick with what you know works", "Evaluate both approaches objectively", "Adopt the new one completely", "Feel confused and frustrated"], correctOptionIndex: 1 },
    { weight: 4, type: "mcq", question: "You're asked to lead a project using technology you've never used. You would:", options: ["Decline until you're fully trained", "Accept and learn while executing", "Request a longer timeline", "Delegate the technical parts"], correctOptionIndex: 1 },
    { weight: 5, type: "mcq", question: "After failing to understand a concept after 3 attempts, you:", options: ["Conclude it's too advanced for now", "Seek alternative explanations and perspectives", "Memorize it without understanding", "Move on to something else"], correctOptionIndex: 1 },
  ],
  problem_solving_speed: [
    { weight: 1, type: "mcq", question: "A meeting starts in 15 minutes. You have 3 urgent tasks. You would:", options: ["Rush through all three", "Prioritize the most critical one", "Postpone the meeting", "Ask for help with all tasks"], correctOptionIndex: 1 },
    { weight: 2, type: "mcq", question: "Your code works locally but fails in production. First action?", options: ["Revert to the previous version", "Check environment differences", "Rewrite the entire module", "Wait for more error reports"], correctOptionIndex: 1 },
    { weight: 3, type: "mcq", question: "A client changes requirements mid-project. You:", options: ["Refuse as it's outside scope", "Assess impact and propose solutions", "Accept all changes immediately", "Escalate to management"], correctOptionIndex: 1 },
    { weight: 4, type: "mcq", question: "You notice a critical bug 1 hour before launch. You would:", options: ["Delay the launch indefinitely", "Fix, test rapidly, and communicate", "Launch anyway and patch later", "Blame the QA process"], correctOptionIndex: 1 },
    { weight: 5, type: "mcq", question: "Two equally viable solutions exist. Time is limited. You choose based on:", options: ["Gut feeling", "Reversibility and risk assessment", "What others recommend", "Random selection"], correctOptionIndex: 1 },
  ],
  curiosity_openness: [
    { weight: 1, type: "mcq", question: "How often do you explore topics outside your field of expertise?", options: ["Rarely", "Sometimes", "Frequently", "Constantly"], correctOptionIndex: 2 },
    { weight: 2, type: "mcq", question: "When someone presents an idea you disagree with, you:", options: ["Dismiss it politely", "Listen and consider their perspective", "Argue your point strongly", "Ignore it entirely"], correctOptionIndex: 1 },
    { weight: 3, type: "mcq", question: "A colleague suggests a radically different approach. Your response:", options: ["Prefer proven methods", "Evaluate it with genuine interest", "Feel threatened by change", "Agree without analysis"], correctOptionIndex: 1 },
    { weight: 4, type: "mcq", question: "You discover your long-held belief might be wrong. You:", options: ["Defend your original belief", "Investigate the new evidence", "Feel uncomfortable and avoid it", "Change your belief immediately"], correctOptionIndex: 1 },
    { weight: 5, type: "mcq", question: "Innovation in your field excites you because:", options: ["It might make your skills obsolete", "It opens new possibilities to explore", "Others will expect you to learn it", "You prefer stability over change"], correctOptionIndex: 1 },
  ],
  persistence_grit: [
    { weight: 1, type: "mcq", question: "When facing a setback in a long-term goal, you typically:", options: ["Reassess and adjust your approach", "Give up and try something new", "Blame external factors", "Wait for conditions to improve"], correctOptionIndex: 0 },
    { weight: 2, type: "mcq", question: "A project you've worked on for months gets cancelled. You:", options: ["Feel devastated and demotivated", "Extract learnings and move forward", "Blame the decision-makers", "Question your career choice"], correctOptionIndex: 1 },
    { weight: 3, type: "mcq", question: "You've failed at the same task three times. Your next step:", options: ["Accept you're not suited for it", "Analyze patterns and try differently", "Keep trying the same way", "Avoid similar tasks in future"], correctOptionIndex: 1 },
    { weight: 4, type: "mcq", question: "A goal requires 5 years of consistent effort with uncertain outcome. You:", options: ["Choose a shorter-term goal instead", "Commit if aligned with your values", "Wait until success is guaranteed", "Start but likely abandon midway"], correctOptionIndex: 1 },
    { weight: 5, type: "mcq", question: "Your definition of failure is:", options: ["Not achieving expected results", "Giving up before reaching potential", "Others perceiving you negatively", "Making any mistakes"], correctOptionIndex: 1 },
  ],
  attention_focus: [
    { weight: 1, type: "mcq", question: "During deep work, how often do you check notifications?", options: ["Every few minutes", "When I take planned breaks", "Whenever they appear", "I disable them completely"], correctOptionIndex: 3 },
    { weight: 2, type: "mcq", question: "When reviewing your own work, you typically:", options: ["Skim quickly for obvious errors", "Check systematically against criteria", "Rely on others to review", "Assume it's correct if it runs"], correctOptionIndex: 1 },
    { weight: 3, type: "mcq", question: "In a 2-hour meeting, your attention level:", options: ["Drops significantly after 30 minutes", "Remains consistent throughout", "Fluctuates based on interest", "Requires external stimulation"], correctOptionIndex: 1 },
    { weight: 4, type: "mcq", question: "You're working on a complex problem when interrupted. You:", options: ["Lose your train of thought completely", "Can resume after brief reorientation", "Feel frustrated and need time", "Welcome the distraction"], correctOptionIndex: 1 },
    { weight: 5, type: "mcq", question: "A subtle inconsistency exists in a document you're reviewing. You:", options: ["Miss it unless explicitly looking", "Notice it naturally while reading", "Depend on tools to catch it", "Consider minor issues unimportant"], correctOptionIndex: 1 },
  ],
}

let id = 0
export const PSYCHOMETRIC_QUESTIONS: PsychometricQuestion[] = SECTION_IDS.flatMap((sectionId) =>
  SECTION_QUESTIONS[sectionId].map((q) => ({
    ...q,
    id: ++id,
    sectionId,
  }))
)

export const MAX_WEIGHT_PER_SECTION = 15 // 1+2+3+4+5
