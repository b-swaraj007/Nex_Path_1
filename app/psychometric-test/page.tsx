"use client"

import React, { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Brain,
  ChevronRight,
  ChevronLeft,
  X,
  Plus,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Clock,
  Target,
  Lightbulb,
  Zap,
  Eye,
  Compass,
  Shield,
} from "lucide-react"

// Types
interface Question {
  id: number
  text: string
  options: string[]
  correctIndex: number
  weight: number
}

interface Section {
  id: number
  name: string
  icon: React.ReactNode
  description: string
  questions: Question[]
}

interface InsightCard {
  id: string
  parameter: string
  score: number
  interpretation: string
  visible: boolean
  userNote?: string
}

// Question Data - 7 Sections with 5 questions each
const sections: Section[] = [
  {
    id: 1,
    name: "Logical Reasoning",
    icon: <Brain size={20} />,
    description: "Pattern recognition and abstract thinking",
    questions: [
      {
        id: 1,
        text: "What comes next in the sequence: 2, 6, 12, 20, 30, ?",
        options: ["40", "42", "44", "36"],
        correctIndex: 1,
        weight: 1,
      },
      {
        id: 2,
        text: "If all Zorks are Morks, and some Morks are Borks, which statement must be true?",
        options: [
          "All Zorks are Borks",
          "Some Zorks might be Borks",
          "No Zorks are Borks",
          "All Borks are Zorks",
        ],
        correctIndex: 1,
        weight: 2,
      },
      {
        id: 3,
        text: "A cube has 6 faces. If you cut the cube with 3 planes parallel to its faces, how many smaller pieces do you get?",
        options: ["6", "8", "9", "12"],
        correctIndex: 1,
        weight: 3,
      },
      {
        id: 4,
        text: "In a certain code, COMPUTER is written as RFUVQNPC. How would MEDICINE be written?",
        options: ["EOJDJEFM", "MFEJDJOE", "FOJEJDNM", "ENICIDME"],
        correctIndex: 0,
        weight: 4,
      },
      {
        id: 5,
        text: "If the day after tomorrow is two days before Thursday, what day is today?",
        options: ["Saturday", "Sunday", "Monday", "Friday"],
        correctIndex: 0,
        weight: 5,
      },
    ],
  },
  {
    id: 2,
    name: "Verbal Reasoning",
    icon: <Target size={20} />,
    description: "Language comprehension and communication",
    questions: [
      {
        id: 6,
        text: "Choose the word most similar in meaning to 'Ephemeral':",
        options: ["Permanent", "Transient", "Solid", "Ancient"],
        correctIndex: 1,
        weight: 1,
      },
      {
        id: 7,
        text: "Complete the analogy: Architect is to Building as Composer is to:",
        options: ["Music", "Symphony", "Instrument", "Orchestra"],
        correctIndex: 1,
        weight: 2,
      },
      {
        id: 8,
        text: "Which word does NOT belong: Meticulous, Scrupulous, Careless, Thorough?",
        options: ["Meticulous", "Scrupulous", "Careless", "Thorough"],
        correctIndex: 2,
        weight: 3,
      },
      {
        id: 9,
        text: "If 'ubiquitous' means 'present everywhere,' what does its antonym most likely mean?",
        options: ["Common", "Rare", "Visible", "Absent"],
        correctIndex: 1,
        weight: 4,
      },
      {
        id: 10,
        text: "Identify the logical flaw: 'All successful people wake up early. I wake up early. Therefore, I am successful.'",
        options: [
          "Affirming the consequent",
          "Appeal to authority",
          "Circular reasoning",
          "No flaw exists",
        ],
        correctIndex: 0,
        weight: 5,
      },
    ],
  },
  {
    id: 3,
    name: "Learning Adaptability",
    icon: <Lightbulb size={20} />,
    description: "Ability to acquire and apply new knowledge",
    questions: [
      {
        id: 11,
        text: "When learning something completely new, you prefer to:",
        options: [
          "Follow a structured curriculum",
          "Explore freely and experiment",
          "Watch others first",
          "Read comprehensive documentation",
        ],
        correctIndex: 1,
        weight: 1,
      },
      {
        id: 12,
        text: "You encounter an error in a new software. Your first instinct is to:",
        options: [
          "Search for the exact error message",
          "Understand why the error occurred",
          "Ask someone for help immediately",
          "Try random solutions until one works",
        ],
        correctIndex: 1,
        weight: 2,
      },
      {
        id: 13,
        text: "A new framework contradicts what you learned before. How do you respond?",
        options: [
          "Stick with what you know works",
          "Evaluate both approaches objectively",
          "Adopt the new one completely",
          "Feel confused and frustrated",
        ],
        correctIndex: 1,
        weight: 3,
      },
      {
        id: 14,
        text: "You're asked to lead a project using technology you've never used. You would:",
        options: [
          "Decline until you're fully trained",
          "Accept and learn while executing",
          "Request a longer timeline",
          "Delegate the technical parts",
        ],
        correctIndex: 1,
        weight: 4,
      },
      {
        id: 15,
        text: "After failing to understand a concept after 3 attempts, you:",
        options: [
          "Conclude it's too advanced for now",
          "Seek alternative explanations and perspectives",
          "Memorize it without understanding",
          "Move on to something else",
        ],
        correctIndex: 1,
        weight: 5,
      },
    ],
  },
  {
    id: 4,
    name: "Problem-Solving Speed",
    icon: <Zap size={20} />,
    description: "Quick analysis and decision-making under pressure",
    questions: [
      {
        id: 16,
        text: "A meeting starts in 15 minutes. You have 3 urgent tasks. You would:",
        options: [
          "Rush through all three",
          "Prioritize the most critical one",
          "Postpone the meeting",
          "Ask for help with all tasks",
        ],
        correctIndex: 1,
        weight: 1,
      },
      {
        id: 17,
        text: "Your code works locally but fails in production. First action?",
        options: [
          "Revert to the previous version",
          "Check environment differences",
          "Rewrite the entire module",
          "Wait for more error reports",
        ],
        correctIndex: 1,
        weight: 2,
      },
      {
        id: 18,
        text: "A client changes requirements mid-project. You:",
        options: [
          "Refuse as it's outside scope",
          "Assess impact and propose solutions",
          "Accept all changes immediately",
          "Escalate to management",
        ],
        correctIndex: 1,
        weight: 3,
      },
      {
        id: 19,
        text: "You notice a critical bug 1 hour before launch. You would:",
        options: [
          "Delay the launch indefinitely",
          "Fix, test rapidly, and communicate",
          "Launch anyway and patch later",
          "Blame the QA process",
        ],
        correctIndex: 1,
        weight: 4,
      },
      {
        id: 20,
        text: "Two equally viable solutions exist. Time is limited. You choose based on:",
        options: [
          "Gut feeling",
          "Reversibility and risk assessment",
          "What others recommend",
          "Random selection",
        ],
        correctIndex: 1,
        weight: 5,
      },
    ],
  },
  {
    id: 5,
    name: "Curiosity & Openness",
    icon: <Compass size={20} />,
    description: "Drive to explore and embrace new ideas",
    questions: [
      {
        id: 21,
        text: "How often do you explore topics outside your field of expertise?",
        options: ["Rarely", "Sometimes", "Frequently", "Constantly"],
        correctIndex: 2,
        weight: 1,
      },
      {
        id: 22,
        text: "When someone presents an idea you disagree with, you:",
        options: [
          "Dismiss it politely",
          "Listen and consider their perspective",
          "Argue your point strongly",
          "Ignore it entirely",
        ],
        correctIndex: 1,
        weight: 2,
      },
      {
        id: 23,
        text: "A colleague suggests a radically different approach. Your response:",
        options: [
          "Prefer proven methods",
          "Evaluate it with genuine interest",
          "Feel threatened by change",
          "Agree without analysis",
        ],
        correctIndex: 1,
        weight: 3,
      },
      {
        id: 24,
        text: "You discover your long-held belief might be wrong. You:",
        options: [
          "Defend your original belief",
          "Investigate the new evidence",
          "Feel uncomfortable and avoid it",
          "Change your belief immediately",
        ],
        correctIndex: 1,
        weight: 4,
      },
      {
        id: 25,
        text: "Innovation in your field excites you because:",
        options: [
          "It might make your skills obsolete",
          "It opens new possibilities to explore",
          "Others will expect you to learn it",
          "You prefer stability over change",
        ],
        correctIndex: 1,
        weight: 5,
      },
    ],
  },
  {
    id: 6,
    name: "Persistence & Grit",
    icon: <Shield size={20} />,
    description: "Long-term commitment and resilience",
    questions: [
      {
        id: 26,
        text: "When facing a setback in a long-term goal, you typically:",
        options: [
          "Reassess and adjust your approach",
          "Give up and try something new",
          "Blame external factors",
          "Wait for conditions to improve",
        ],
        correctIndex: 0,
        weight: 1,
      },
      {
        id: 27,
        text: "A project you've worked on for months gets cancelled. You:",
        options: [
          "Feel devastated and demotivated",
          "Extract learnings and move forward",
          "Blame the decision-makers",
          "Question your career choice",
        ],
        correctIndex: 1,
        weight: 2,
      },
      {
        id: 28,
        text: "You've failed at the same task three times. Your next step:",
        options: [
          "Accept you're not suited for it",
          "Analyze patterns and try differently",
          "Keep trying the same way",
          "Avoid similar tasks in future",
        ],
        correctIndex: 1,
        weight: 3,
      },
      {
        id: 29,
        text: "A goal requires 5 years of consistent effort with uncertain outcome. You:",
        options: [
          "Choose a shorter-term goal instead",
          "Commit if aligned with your values",
          "Wait until success is guaranteed",
          "Start but likely abandon midway",
        ],
        correctIndex: 1,
        weight: 4,
      },
      {
        id: 30,
        text: "Your definition of failure is:",
        options: [
          "Not achieving expected results",
          "Giving up before reaching potential",
          "Others perceiving you negatively",
          "Making any mistakes",
        ],
        correctIndex: 1,
        weight: 5,
      },
    ],
  },
  {
    id: 7,
    name: "Attention & Focus",
    icon: <Eye size={20} />,
    description: "Sustained concentration and detail orientation",
    questions: [
      {
        id: 31,
        text: "During deep work, how often do you check notifications?",
        options: [
          "Every few minutes",
          "When I take planned breaks",
          "Whenever they appear",
          "I disable them completely",
        ],
        correctIndex: 3,
        weight: 1,
      },
      {
        id: 32,
        text: "When reviewing your own work, you typically:",
        options: [
          "Skim quickly for obvious errors",
          "Check systematically against criteria",
          "Rely on others to review",
          "Assume it's correct if it runs",
        ],
        correctIndex: 1,
        weight: 2,
      },
      {
        id: 33,
        text: "In a 2-hour meeting, your attention level:",
        options: [
          "Drops significantly after 30 minutes",
          "Remains consistent throughout",
          "Fluctuates based on interest",
          "Requires external stimulation",
        ],
        correctIndex: 1,
        weight: 3,
      },
      {
        id: 34,
        text: "You're working on a complex problem when interrupted. You:",
        options: [
          "Lose your train of thought completely",
          "Can resume after brief reorientation",
          "Feel frustrated and need time",
          "Welcome the distraction",
        ],
        correctIndex: 1,
        weight: 4,
      },
      {
        id: 35,
        text: "A subtle inconsistency exists in a document you're reviewing. You:",
        options: [
          "Miss it unless explicitly looking",
          "Notice it naturally while reading",
          "Depend on tools to catch it",
          "Consider minor issues unimportant",
        ],
        correctIndex: 1,
        weight: 5,
      },
    ],
  },
]

// CRI Interpretation
const getCRIInterpretation = (cri: number) => {
  if (cri >= 130)
    return {
      band: "Exceptional Cognitive Reasoning",
      description:
        "Able to handle abstract, complex, and fast-evolving domains",
      color: "text-emerald-400",
    }
  if (cri >= 110)
    return {
      band: "High Cognitive Reasoning",
      description: "Strong analytical ability with good learning speed",
      color: "text-primary",
    }
  if (cri >= 90)
    return {
      band: "Moderate Cognitive Reasoning",
      description: "Suitable for structured growth with guided learning",
      color: "text-blue-400",
    }
  if (cri >= 70)
    return {
      band: "Developing Cognitive Reasoning",
      description:
        "Benefits from foundational strengthening and paced roadmap",
      color: "text-yellow-400",
    }
  return {
    band: "Emerging Cognitive Reasoning",
    description: "Requires structured support and gradual skill acquisition",
    color: "text-orange-400",
  }
}

// Parameter interpretations for AI insights
const getParameterInterpretation = (parameter: string, score: number) => {
  const interpretations: Record<string, Record<string, string>> = {
    "Logical Reasoning": {
      high: "You demonstrate exceptional pattern recognition and abstract thinking capabilities. This suggests strong suitability for roles requiring complex problem analysis and systematic approaches.",
      medium:
        "You show solid logical reasoning abilities with room for growth in abstract pattern recognition. Structured analytical roles would benefit from your methodical approach.",
      low: "Your logical reasoning shows potential for development. Consider roles that allow gradual complexity increase with clear guidelines and mentorship support.",
    },
    "Verbal Reasoning": {
      high: "Your verbal comprehension and communication skills are highly developed. You would excel in roles requiring clear articulation, persuasion, and complex written communication.",
      medium:
        "You demonstrate competent verbal reasoning with good comprehension. Roles involving documentation, client communication, or technical writing would suit your abilities.",
      low: "Your verbal reasoning indicates preference for concrete over abstract communication. Consider roles with clear communication templates and structured documentation.",
    },
    "Learning Adaptability": {
      high: "You show remarkable ability to acquire and apply new knowledge quickly. Fast-paced industries with evolving technologies would align well with your learning agility.",
      medium:
        "You adapt well to new learning when given appropriate time and resources. Structured learning programs and gradual skill transitions would optimize your growth.",
      low: "You prefer stability and mastery over rapid change. Roles with established processes and incremental learning opportunities would support your development style.",
    },
    "Problem-Solving Speed": {
      high: "Your rapid analysis and decision-making under pressure is notable. Time-critical roles and dynamic environments would leverage your quick-thinking abilities.",
      medium:
        "You balance speed with thoroughness effectively. Roles allowing moderate time pressure while valuing quality decisions would suit your problem-solving style.",
      low: "You prefer careful deliberation over rapid decisions. Roles with adequate planning time and systematic decision processes would optimize your contributions.",
    },
    "Curiosity & Openness": {
      high: "Your drive to explore and embrace new ideas is exceptional. Innovation-focused roles and cross-functional positions would benefit from your intellectual curiosity.",
      medium:
        "You balance openness with practicality. Roles that combine established practices with periodic innovation would align with your exploration style.",
      low: "You prefer depth over breadth in knowledge. Specialist roles with deep expertise requirements would leverage your focused interest approach.",
    },
    "Persistence & Grit": {
      high: "Your long-term commitment and resilience are outstanding. Challenging, multi-year projects and leadership roles requiring sustained effort would suit your persistence.",
      medium:
        "You demonstrate solid perseverance with realistic goal adjustment. Roles with clear milestones and periodic achievement recognition would support your motivation.",
      low: "You perform best with shorter-term goals and visible progress. Roles with frequent deliverables and immediate feedback would optimize your engagement.",
    },
    "Attention & Focus": {
      high: "Your sustained concentration and detail orientation are exceptional. Roles requiring deep work, precision, and quality assurance would leverage your focus abilities.",
      medium:
        "You maintain good attention with appropriate environment support. Roles with dedicated focus time and manageable interruption levels would suit your concentration style.",
      low: "You thrive in dynamic environments with variety. Roles involving task switching, collaboration, and diverse responsibilities would align with your attention style.",
    },
  }

  const level = score >= 75 ? "high" : score >= 50 ? "medium" : "low"
  return interpretations[parameter]?.[level] || ""
}

export default function PsychometricTestPage() {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)

  // State
  const [currentSection, setCurrentSection] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [showResults, setShowResults] = useState(false)
  const [insights, setInsights] = useState<InsightCard[]>([])
  const [isVisible, setIsVisible] = useState(false)
  const [addingNote, setAddingNote] = useState<string | null>(null)
  const [noteText, setNoteText] = useState("")

  // Calculate progress
  const totalQuestions = 35
  const answeredQuestions = Object.keys(answers).length
  const progressPercent = (answeredQuestions / totalQuestions) * 100

  // Current question data
  const section = sections[currentSection]
  const question = section?.questions[currentQuestion]
  const globalQuestionIndex =
    sections
      .slice(0, currentSection)
      .reduce((acc, s) => acc + s.questions.length, 0) + currentQuestion

  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Mouse follow effect
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      container.style.setProperty("--mouse-x", `${x}%`)
      container.style.setProperty("--mouse-y", `${y}%`)
    }

    container.addEventListener("mousemove", handleMouseMove)
    return () => container.removeEventListener("mousemove", handleMouseMove)
  }, [])

  // Calculate scores
  const calculateScores = () => {
    const sectionScores: Record<string, number> = {}

    sections.forEach((section) => {
      let earned = 0
      let maxScore = 0

      section.questions.forEach((q) => {
        maxScore += q.weight
        const userAnswer = answers[q.id]
        if (userAnswer === q.correctIndex) {
          earned += q.weight
        }
      })

      sectionScores[section.name] = Math.round((earned / maxScore) * 100)
    })

    return sectionScores
  }

  // Calculate CRI
  const calculateCRI = (scores: Record<string, number>) => {
    const weights = {
      "Logical Reasoning": 0.4,
      "Verbal Reasoning": 0.25,
      "Problem-Solving Speed": 0.2,
      "Attention & Focus": 0.15,
    }

    let weightedSum = 0
    let totalWeight = 0

    Object.entries(weights).forEach(([param, weight]) => {
      if (scores[param] !== undefined) {
        weightedSum += scores[param] * weight
        totalWeight += weight
      }
    })

    // Scale to 0-160 range
    return Math.round((weightedSum / totalWeight) * 1.6)
  }

  // Generate insights
  const generateInsights = (scores: Record<string, number>) => {
    return sections.map((section) => ({
      id: section.name,
      parameter: section.name,
      score: scores[section.name] || 0,
      interpretation: getParameterInterpretation(
        section.name,
        scores[section.name] || 0
      ),
      visible: true,
    }))
  }

  // Handle answer selection
  const handleAnswer = (optionIndex: number) => {
    if (!question) return
    setAnswers((prev) => ({ ...prev, [question.id]: optionIndex }))
  }

  // Navigation
  const goNext = () => {
    if (currentQuestion < section.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
    } else if (currentSection < sections.length - 1) {
      setCurrentSection((prev) => prev + 1)
      setCurrentQuestion(0)
    } else {
      // Submit assessment
      const scores = calculateScores()
      const generatedInsights = generateInsights(scores)
      setInsights(generatedInsights)
      setShowResults(true)
    }
  }

  const goPrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1)
    } else if (currentSection > 0) {
      setCurrentSection((prev) => prev - 1)
      setCurrentQuestion(sections[currentSection - 1].questions.length - 1)
    }
  }

  // Remove insight
  const removeInsight = (id: string) => {
    setInsights((prev) =>
      prev.map((insight) =>
        insight.id === id ? { ...insight, visible: false } : insight
      )
    )
  }

  // Restore insight
  const restoreInsight = (id: string) => {
    setInsights((prev) =>
      prev.map((insight) =>
        insight.id === id ? { ...insight, visible: false } : insight
      )
    )
  }

  // Add note to insight
  const addNoteToInsight = (id: string) => {
    setInsights((prev) =>
      prev.map((insight) =>
        insight.id === id ? { ...insight, userNote: noteText } : insight
      )
    )
    setAddingNote(null)
    setNoteText("")
  }

  // Continue to chat
  const continueToChat = () => {
    // In a real app, store insights in context/state management
    router.push("/chat")
  }

  const scores = showResults ? calculateScores() : {}
  const cri = showResults ? calculateCRI(scores) : 0
  const criInterpretation = getCRIInterpretation(cri)

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen overflow-x-hidden px-4 py-8"
      style={
        {
          "--mouse-x": "50%",
          "--mouse-y": "50%",
        } as React.CSSProperties
      }
    >
      {/* Animated Background */}
      <div className="fixed inset-0 bg-background">
        <div
          className="absolute w-[600px] h-[600px] rounded-full opacity-15 blur-[120px]"
          style={{
            background:
              "radial-gradient(circle, oklch(0.75 0.18 55) 0%, transparent 70%)",
            left: "var(--mouse-x)",
            top: "var(--mouse-y)",
            transform: "translate(-50%, -50%)",
            transition: "left 0.3s ease-out, top 0.3s ease-out",
          }}
        />
        <div
          className="absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-10 blur-[100px] animate-pulse"
          style={{
            background:
              "radial-gradient(circle, oklch(0.65 0.15 45) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(oklch(0.98 0 0) 1px, transparent 1px),
                            linear-gradient(90deg, oklch(0.98 0 0) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <header
          className={`mb-8 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
          }`}
        >
          <Link href="/dashboard" className="inline-block mb-6">
            <span className="text-xl font-bold text-foreground">
              NexPath<span className="text-primary">.AI</span>
            </span>
          </Link>

          {!showResults && (
            <>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Cognitive & Career Psychometric Assessment
              </h1>
              <p className="text-muted-foreground mb-1">
                This assessment helps NexPath.AI understand how you think,
                learn, and solve problems.
              </p>
              <p className="text-sm text-muted-foreground/70">
                There are no right or wrong answers. Answer honestly.
              </p>
            </>
          )}

          {showResults && (
            <>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Psychometric Insight Dashboard
              </h1>
              <p className="text-muted-foreground">
                Your cognitive profile based on the assessment
              </p>
            </>
          )}
        </header>

        {!showResults ? (
          <>
            {/* Progress Indicator */}
            <div
              className={`mb-8 transition-all duration-700 delay-100 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              {/* Progress Bar */}
              <div className="relative h-2 bg-secondary rounded-full overflow-hidden mb-4">
                <div
                  className="absolute left-0 top-0 h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Section Indicators */}
              <div className="flex items-center justify-between mb-4">
                {sections.map((s, idx) => (
                  <div
                    key={s.id}
                    className={`flex items-center gap-1 text-xs transition-colors ${
                      idx === currentSection
                        ? "text-primary font-medium"
                        : idx < currentSection
                          ? "text-primary/60"
                          : "text-muted-foreground/50"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border transition-colors ${
                        idx === currentSection
                          ? "bg-primary text-primary-foreground border-primary"
                          : idx < currentSection
                            ? "bg-primary/20 border-primary/40 text-primary"
                            : "bg-secondary border-border/50"
                      }`}
                    >
                      {idx < currentSection ? (
                        <CheckCircle2 size={14} />
                      ) : (
                        idx + 1
                      )}
                    </div>
                    <span className="hidden md:inline">{s.name}</span>
                  </div>
                ))}
              </div>

              {/* Current Progress Text */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  {section.icon}
                  <span className="font-medium text-foreground">
                    {section.name}
                  </span>
                  <span className="text-muted-foreground/60">
                    - {section.description}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span>
                    Question {globalQuestionIndex + 1} of {totalQuestions}
                  </span>
                  <div className="flex items-center gap-1 text-primary">
                    <Clock size={14} />
                    <span>
                      Weight: {question?.weight}x
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Question Card */}
            <div
              className={`relative rounded-2xl overflow-hidden border border-border/50 bg-card/30 backdrop-blur-xl p-8 mb-6 transition-all duration-700 delay-200 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
            >
              {/* Glow effect */}
              <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-primary/10 via-transparent to-primary/5 -z-10" />

              {/* Question Text */}
              <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-8 leading-relaxed">
                {question?.text}
              </h2>

              {/* Options */}
              <div className="space-y-3">
                {question?.options.map((option, idx) => {
                  const isSelected = answers[question.id] === idx
                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(idx)}
                      className={`w-full text-left p-4 rounded-xl border transition-all duration-300 ${
                        isSelected
                          ? "bg-primary/10 border-primary/50 text-foreground"
                          : "bg-secondary/30 border-border/30 text-foreground/80 hover:bg-secondary/50 hover:border-border/50"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                            isSelected
                              ? "border-primary bg-primary"
                              : "border-muted-foreground/30"
                          }`}
                        >
                          {isSelected && (
                            <CheckCircle2
                              size={14}
                              className="text-primary-foreground"
                            />
                          )}
                        </div>
                        <span className="text-base">{option}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Navigation */}
            <div
              className={`flex items-center justify-between transition-all duration-700 delay-300 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              <Button
                variant="outline"
                onClick={goPrev}
                disabled={currentSection === 0 && currentQuestion === 0}
                className="bg-transparent border-border/50 text-foreground hover:bg-secondary/50 gap-2"
              >
                <ChevronLeft size={18} />
                Previous
              </Button>

              <Button
                onClick={goNext}
                disabled={answers[question?.id] === undefined}
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
              >
                {currentSection === sections.length - 1 &&
                currentQuestion === section.questions.length - 1
                  ? "Submit Assessment"
                  : "Next"}
                <ChevronRight size={18} />
              </Button>
            </div>
          </>
        ) : (
          /* Results Dashboard */
          <div
            className={`space-y-8 transition-all duration-700 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            {/* CRI Card */}
            <div className="relative rounded-2xl overflow-hidden border border-primary/30 bg-card/40 backdrop-blur-xl p-8">
              <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-primary/20 via-transparent to-primary/10 -z-10" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Brain size={24} className="text-primary" />
                    <h2 className="text-xl font-bold text-foreground">
                      Cognitive Reasoning Index (CRI)
                    </h2>
                  </div>
                  <p className={`text-3xl font-bold ${criInterpretation.color}`}>
                    {cri}
                    <span className="text-lg text-muted-foreground font-normal">
                      {" "}
                      / 160
                    </span>
                  </p>
                  <p className="text-lg font-medium text-foreground mt-1">
                    {criInterpretation.band}
                  </p>
                  <p className="text-muted-foreground mt-1">
                    {criInterpretation.description}
                  </p>
                </div>

                <div className="md:text-right">
                  <div className="flex items-start gap-2 p-4 rounded-xl bg-secondary/30 border border-border/30">
                    <AlertCircle
                      size={18}
                      className="text-muted-foreground mt-0.5 shrink-0"
                    />
                    <p className="text-sm text-muted-foreground">
                      CRI is an AI-estimated reasoning indicator, not a clinical
                      IQ score.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Insight Cards */}
            <div className="grid md:grid-cols-2 gap-4">
              {insights.map(
                (insight) =>
                  insight.visible && (
                    <div
                      key={insight.id}
                      className="relative rounded-xl overflow-hidden border border-border/50 bg-card/30 backdrop-blur-xl p-6 group"
                    >
                      {/* Remove button */}
                      <button
                        onClick={() => removeInsight(insight.id)}
                        className="absolute top-4 right-4 w-6 h-6 rounded-full bg-secondary/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20"
                        title="Remove this insight"
                      >
                        <X size={14} className="text-muted-foreground" />
                      </button>

                      {/* Header */}
                      <div className="flex items-center justify-between mb-3 pr-8">
                        <h3 className="font-semibold text-foreground">
                          {insight.parameter}
                        </h3>
                        <span
                          className={`font-bold ${
                            insight.score >= 75
                              ? "text-emerald-400"
                              : insight.score >= 50
                                ? "text-primary"
                                : "text-yellow-400"
                          }`}
                        >
                          {insight.score}/100
                        </span>
                      </div>

                      {/* Score bar */}
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden mb-4">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            insight.score >= 75
                              ? "bg-emerald-400"
                              : insight.score >= 50
                                ? "bg-primary"
                                : "bg-yellow-400"
                          }`}
                          style={{ width: `${insight.score}%` }}
                        />
                      </div>

                      {/* Interpretation */}
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {insight.interpretation}
                      </p>

                      {/* User note */}
                      {insight.userNote && (
                        <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
                          <p className="text-sm text-foreground">
                            <span className="font-medium">Your note:</span>{" "}
                            {insight.userNote}
                          </p>
                        </div>
                      )}

                      {/* Add note */}
                      {addingNote === insight.id ? (
                        <div className="mt-4 space-y-2">
                          <textarea
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="Add your correction or note..."
                            className="w-full p-3 rounded-lg bg-secondary/50 border border-border/50 text-foreground placeholder:text-muted-foreground/50 text-sm resize-none focus:outline-none focus:border-primary/50"
                            rows={2}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => addNoteToInsight(insight.id)}
                              className="bg-primary text-primary-foreground"
                            >
                              Save Note
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setAddingNote(null)
                                setNoteText("")
                              }}
                              className="bg-transparent"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setAddingNote(insight.id)}
                          className="mt-4 flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Plus size={14} />
                          Add correction or note
                        </button>
                      )}
                    </div>
                  )
              )}
            </div>

            {/* Removed insights notice */}
            {insights.some((i) => !i.visible) && (
              <div className="p-4 rounded-xl bg-secondary/30 border border-border/30">
                <p className="text-sm text-muted-foreground mb-2">
                  Removed insights (AI will not consider these):
                </p>
                <div className="flex flex-wrap gap-2">
                  {insights
                    .filter((i) => !i.visible)
                    .map((insight) => (
                      <button
                        key={insight.id}
                        onClick={() => restoreInsight(insight.id)}
                        className="px-3 py-1 rounded-full bg-secondary/50 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {insight.parameter} - Restore
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* Continue Button */}
            <div className="flex justify-center pt-4">
              <Button
                size="lg"
                onClick={continueToChat}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium px-10 py-6 text-lg gap-2 group"
              >
                Continue to Career Guidance
                <ArrowRight
                  size={20}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
