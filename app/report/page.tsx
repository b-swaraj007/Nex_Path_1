"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { auth, getUserProfile, getPsychometricProfile } from "@/lib/firebase"
import type { PsychometricResult } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import {
  Download,
  Save,
  ChevronRight,
  Brain,
  Target,
  TrendingUp,
  BookOpen,
  Award,
  CheckCircle,
  Shield,
  Briefcase,
  Clock,
  BarChart3,
  Lightbulb,
  AlertCircle,
  Building,
  Calendar,
  Loader2,
  MessageSquare,
  ArrowRight,
} from "lucide-react"

const SECTION_KEY_TO_DISPLAY: Record<string, string> = {
  logical_reasoning: "Logical Reasoning",
  verbal_reasoning: "Verbal Reasoning",
  learning_adaptability: "Learning Adaptability",
  problem_solving_speed: "Problem-Solving Speed",
  curiosity_openness: "Curiosity & Openness",
  persistence_grit: "Persistence & Grit",
  attention_focus: "Attention & Focus",
}

/** Default/placeholder report when no psychometric or chat data */
const defaultReportData = {
  generatedDate: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
  userName: "",
  career: {
    title: "—",
    field: "—",
    explanation:
      "Generate career roadmap in a chat session first to get it displayed in this report. Go to Career Chat from the dashboard, discuss your goals and preferred role, and ask for a roadmap and action plan.",
  },
  psychometricProfile: {
    cri: 0,
    criInterpretation: "Complete the psychometric assessment to see your Cognitive Reasoning Index and interpretation.",
    parameters: [] as Array<{ name: string; score: number; interpretation: string }>,
  },
  careerFit: {
    strengths: ["Generate career roadmap in chat session first to get it displayed in this report."],
    challenges: ["Then return here to see strengths and growth areas."],
    workEnvironment:
      "Generate career roadmap in a chat session first to get work environment recommendations in this report.",
  },
  marketOutlook: {
    currentDemand: "—",
    futureTrend: "—",
    trendDescription: "Generate career roadmap in chat session first to get market outlook and safety insights here.",
    safetyScore: 0,
    safetyNote: "Discuss your target role in Career Chat for a personalized safety note.",
  },
  roadmap: [
    {
      phase: "Generate career roadmap in chat first",
      duration: "—",
      skills: ["Go to Career Chat, discuss your goals and preferred role, and ask for a roadmap and action plan. Then this section will show your personalized roadmap."],
      subjects: ["—"],
      difficulty: "—",
      masteryTarget: 0,
    },
  ],
  certifications: [] as Array<{ name: string; provider: string; importance: string }>,
  resources: ["Generate career roadmap in chat session first to get recommended resources in this report."],
  actionPlan: [
    { category: "Next step", items: ["Go to Career Chat and generate your career roadmap first; then your action plan will appear here."] },
  ],
}

export type ReportData = typeof defaultReportData

/** True when career/roadmap sections are still placeholders (not yet generated from chat). */
function isPlaceholderCareerRoadmap(data: ReportData): boolean {
  const defaultCareerTitle = "—"
  const placeholderPhase = "Generate career roadmap in chat first"
  const hasPlaceholderCareer = data.career.title === defaultCareerTitle
  const hasPlaceholderRoadmap =
    data.roadmap.length === 1 &&
    data.roadmap[0].phase === placeholderPhase
  return hasPlaceholderCareer || hasPlaceholderRoadmap
}

function buildReportFromData(
  userProfile: Record<string, unknown> | null,
  psychometric: PsychometricResult | null
): ReportData {
  const generatedDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  const userName = (userProfile?.displayName as string) || (userProfile?.email as string) || "User"

  if (!psychometric) {
    return {
      ...defaultReportData,
      generatedDate,
      userName,
    }
  }

  const params = Object.entries(psychometric.parameters || {})
    .filter(([, p]) => p.status !== "removed")
    .map(([key, p]) => ({
      name: SECTION_KEY_TO_DISPLAY[key] || key.replace(/_/g, " "),
      score: p.max > 0 ? Math.round((p.score / p.max) * 100) : 0,
      interpretation: psychometric.userCorrections?.[key] ?? p.interpretation,
    }))

  return {
    ...defaultReportData,
    generatedDate,
    userName,
    psychometricProfile: {
      cri: psychometric.CRI?.score ?? 0,
      criInterpretation: psychometric.CRI?.summary ?? psychometric.CRI?.disclaimer ?? defaultReportData.psychometricProfile.criInterpretation,
      parameters: params,
    },
    career: {
      ...defaultReportData.career,
      title: psychometric.CRI?.band ? `CRI Band: ${psychometric.CRI.band}` : defaultReportData.career.title,
      field: "Based on your assessment",
      explanation: psychometric.CRI?.summary ?? defaultReportData.career.explanation,
    },
  }
}

export default function CareerReportPage() {
  const router = useRouter()
  const [authReady, setAuthReady] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [reportData, setReportData] = useState<ReportData>(defaultReportData)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set())
  const [downloading, setDownloading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const reportContentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setAuthReady(true)
      setUserId(user?.uid ?? null)
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    if (!authReady || !userId) {
      if (authReady && !userId) {
        router.replace("/auth")
      }
      return
    }
    let cancelled = false
    setLoading(true)
    setLoadError(null)
    Promise.all([getUserProfile(userId), getPsychometricProfile(userId)])
      .then(([userProfile, psychometric]) => {
        if (cancelled) return
        setReportData(buildReportFromData(userProfile ?? null, psychometric))
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err?.message ?? "Failed to load report data")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [authReady, userId, router])

  useEffect(() => {
    setIsVisible(true)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, entry.target.id]))
          }
        })
      },
      { threshold: 0.1 }
    )

    const sections = document.querySelectorAll("[data-section]")
    sections.forEach((section) => observer.observe(section))

    return () => observer.disconnect()
  }, [])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Moderate":
        return "text-green-400"
      case "Challenging":
        return "text-yellow-400"
      case "Advanced":
        return "text-orange-400"
      case "Professional":
        return "text-primary"
      default:
        return "text-muted-foreground"
    }
  }

  const handleDownloadPdf = () => {
    setDownloading(true)
    window.print()
    setDownloading(false)
  }

  if (!authReady || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your report…</p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen bg-background overflow-hidden"
    >
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-10 blur-[150px]"
          style={{
            background:
              "radial-gradient(circle, oklch(0.75 0.18 55) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-10 blur-[120px]"
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
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Content */}
      <div ref={reportContentRef} className="relative z-10 max-w-4xl mx-auto px-4 py-8 md:py-12">
        {loadError && (
          <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm">
            {loadError}
          </div>
        )}
        {/* Header */}
        <header
          className={`mb-12 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
          }`}
        >
          <Link href="/dashboard" className="inline-block mb-6 print:hidden">
            <span className="text-lg font-bold text-foreground">
              NexPath<span className="text-primary">.AI</span>
            </span>
          </Link>

          <div className="text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 text-balance">
              Your NexPath.AI Career Guidance Report
            </h1>
            <p className="text-muted-foreground text-lg mb-4 max-w-2xl mx-auto text-pretty">
              A personalized career roadmap based on your cognitive profile, preferences, and market analysis
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                Generated on: {reportData.generatedDate}
              </span>
              {reportData.userName && (
                <>
                  <span className="text-border">|</span>
                  <span>Prepared for: {reportData.userName}</span>
                </>
              )}
            </div>
          </div>
        </header>

        {/* CTA when career roadmap not yet generated from chat */}
        {isPlaceholderCareerRoadmap(reportData) && (
          <div className="mb-8 rounded-2xl border border-primary/30 bg-primary/5 p-6 md:p-8 print:hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                  <MessageSquare size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    Career roadmap not in this report yet
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Generate your career roadmap in a chat session first to get it displayed here. Go to Career Chat, discuss your goals and preferred role, and ask for a roadmap and action plan—then return to this page to download a full report.
                  </p>
                </div>
              </div>
              <Link href="/dashboard" className="flex-shrink-0">
                <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                  Go to Career Chat
                  <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Section 1: Career Summary */}
        <section
          id="career-summary"
          data-section
          className={`mb-8 transition-all duration-700 ${
            visibleSections.has("career-summary") || isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Target size={20} className="text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Career Summary</h2>
            </div>

            <div className="mb-4">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="text-2xl md:text-3xl font-bold text-primary">
                  {reportData.career.title}
                </span>
                <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary">
                  {reportData.career.field}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-secondary/30 border border-border/30">
              <h3 className="text-sm font-medium text-primary mb-2 flex items-center gap-2">
                <Lightbulb size={14} />
                Why This Career Fits You
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {reportData.career.explanation}
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Psychometric Profile */}
        <section
          id="psychometric-profile"
          data-section
          className={`mb-8 transition-all duration-700 delay-100 ${
            visibleSections.has("psychometric-profile")
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Brain size={20} className="text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">
                Your Cognitive & Behavioral Profile
              </h2>
            </div>

            {/* CRI Score */}
            <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-transparent border border-primary/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Cognitive Reasoning Index (CRI)
                </span>
                <span className="text-3xl font-bold text-primary">
                  {reportData.psychometricProfile.cri}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {reportData.psychometricProfile.criInterpretation}
              </p>
            </div>

            {/* Parameters Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              {reportData.psychometricProfile.parameters.map((param) => (
                <div
                  key={param.name}
                  className="p-4 rounded-xl bg-secondary/30 border border-border/30"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-foreground text-sm">
                      {param.name}
                    </span>
                    <span className="text-lg font-bold text-primary">
                      {param.score}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-secondary mb-2">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary/70 to-primary"
                      style={{ width: `${param.score}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{param.interpretation}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 3: Career Fit Analysis */}
        <section
          id="career-fit"
          data-section
          className={`mb-8 transition-all duration-700 delay-150 ${
            visibleSections.has("career-fit")
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Briefcase size={20} className="text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Career Fit Analysis</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Strengths */}
              <div>
                <h3 className="text-sm font-medium text-primary mb-3 flex items-center gap-2">
                  <CheckCircle size={14} />
                  Strengths That Align
                </h3>
                <ul className="space-y-2">
                  {reportData.careerFit.strengths.map((strength, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <ChevronRight size={14} className="text-primary mt-0.5 flex-shrink-0" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Challenges */}
              <div>
                <h3 className="text-sm font-medium text-yellow-400 mb-3 flex items-center gap-2">
                  <AlertCircle size={14} />
                  Potential Challenges
                </h3>
                <ul className="space-y-2">
                  {reportData.careerFit.challenges.map((challenge, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <ChevronRight size={14} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                      <span>{challenge}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Work Environment */}
            <div className="p-4 rounded-xl bg-secondary/30 border border-border/30">
              <h3 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Building size={14} className="text-primary" />
                Work Environment Suitability
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {reportData.careerFit.workEnvironment}
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Market Outlook */}
        <section
          id="market-outlook"
          data-section
          className={`mb-8 transition-all duration-700 delay-200 ${
            visibleSections.has("market-outlook")
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <TrendingUp size={20} className="text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">
                Job Market & Future Outlook
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {/* Current Demand */}
              <div className="p-4 rounded-xl bg-secondary/30 border border-border/30 text-center">
                <BarChart3 size={24} className="text-primary mx-auto mb-2" />
                <span className="text-xs text-muted-foreground block mb-1">
                  Current Demand
                </span>
                <span className="text-lg font-bold text-green-400">
                  {reportData.marketOutlook.currentDemand}
                </span>
              </div>

              {/* Future Trend */}
              <div className="p-4 rounded-xl bg-secondary/30 border border-border/30 text-center">
                <TrendingUp size={24} className="text-primary mx-auto mb-2" />
                <span className="text-xs text-muted-foreground block mb-1">
                  5-10 Year Outlook
                </span>
                <span className="text-lg font-bold text-primary">
                  {reportData.marketOutlook.futureTrend}
                </span>
              </div>

              {/* Safety Score */}
              <div className="p-4 rounded-xl bg-secondary/30 border border-border/30 text-center">
                <Shield size={24} className="text-primary mx-auto mb-2" />
                <span className="text-xs text-muted-foreground block mb-1">
                  Career Safety Score
                </span>
                <span className="text-3xl font-bold text-primary">
                  {reportData.marketOutlook.safetyScore}
                </span>
                <span className="text-sm text-muted-foreground">/100</span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              {reportData.marketOutlook.trendDescription}
            </p>

            <div className="p-3 rounded-lg bg-secondary/20 border border-border/20">
              <p className="text-xs text-muted-foreground italic">
                {reportData.marketOutlook.safetyNote}
              </p>
            </div>
          </div>
        </section>

        {/* Section 5: Learning Roadmap */}
        <section
          id="roadmap"
          data-section
          className={`mb-8 transition-all duration-700 delay-250 ${
            visibleSections.has("roadmap")
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <BookOpen size={20} className="text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">
                Your Personalized Roadmap
              </h2>
            </div>

            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-primary/20 hidden md:block" />

              <div className="space-y-6">
                {reportData.roadmap.map((phase, index) => (
                  <div key={phase.phase} className="relative md:pl-12">
                    {/* Timeline dot */}
                    <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-xs font-bold text-primary hidden md:flex">
                      {index + 1}
                    </div>

                    <div className="p-4 rounded-xl bg-secondary/30 border border-border/30">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                        <h3 className="text-lg font-bold text-foreground">
                          {phase.phase}
                        </h3>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock size={14} />
                            {phase.duration}
                          </span>
                          <span
                            className={`text-sm font-medium ${getDifficultyColor(
                              phase.difficulty
                            )}`}
                          >
                            {phase.difficulty}
                          </span>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <span className="text-xs font-medium text-primary mb-2 block">
                            Skills to Acquire
                          </span>
                          <ul className="space-y-1">
                            {phase.skills.map((skill) => (
                              <li
                                key={skill}
                                className="text-sm text-muted-foreground flex items-center gap-2"
                              >
                                <ChevronRight size={12} className="text-primary" />
                                {skill}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-primary mb-2 block">
                            Key Subjects
                          </span>
                          <ul className="space-y-1">
                            {phase.subjects.map((subject) => (
                              <li
                                key={subject}
                                className="text-sm text-muted-foreground flex items-center gap-2"
                              >
                                <ChevronRight size={12} className="text-primary" />
                                {subject}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          Target Mastery:
                        </span>
                        <div className="flex-1 h-2 rounded-full bg-secondary max-w-[200px]">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${phase.masteryTarget}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-primary">
                          {phase.masteryTarget}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 6: Certifications & Resources */}
        <section
          id="certifications"
          data-section
          className={`mb-8 transition-all duration-700 delay-300 ${
            visibleSections.has("certifications")
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Award size={20} className="text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">
                Recommended Certifications & Learning Resources
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Certifications */}
              <div>
                <h3 className="text-sm font-medium text-primary mb-3">
                  Industry Certifications
                </h3>
                <ul className="space-y-3">
                  {reportData.certifications.map((cert) => (
                    <li
                      key={cert.name}
                      className="p-3 rounded-lg bg-secondary/30 border border-border/30"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-sm font-medium text-foreground block">
                            {cert.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {cert.provider}
                          </span>
                        </div>
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            cert.importance === "High"
                              ? "bg-primary/20 text-primary"
                              : "bg-secondary text-muted-foreground"
                          }`}
                        >
                          {cert.importance}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h3 className="text-sm font-medium text-primary mb-3">
                  Learning Resources
                </h3>
                <ul className="space-y-2">
                  {reportData.resources.map((resource, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-muted-foreground p-3 rounded-lg bg-secondary/30 border border-border/30"
                    >
                      <ChevronRight size={14} className="text-primary mt-0.5 flex-shrink-0" />
                      <span>{resource}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-secondary/20 border border-border/20">
              <p className="text-xs text-muted-foreground italic">
                Certifications support skills but do not guarantee employment. Focus on building practical experience alongside credentials.
              </p>
            </div>
          </div>
        </section>

        {/* Section 7: Action Plan */}
        <section
          id="action-plan"
          data-section
          className={`mb-8 transition-all duration-700 delay-350 ${
            visibleSections.has("action-plan")
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <CheckCircle size={20} className="text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">
                Next 90-Day Action Plan
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {reportData.actionPlan.map((section) => (
                <div
                  key={section.category}
                  className="p-4 rounded-xl bg-secondary/30 border border-border/30"
                >
                  <h3 className="text-sm font-medium text-primary mb-3">
                    {section.category}
                  </h3>
                  <ul className="space-y-2">
                    {section.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded border border-border/50 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Ethical Disclaimer */}
        <section
          id="disclaimer"
          data-section
          className={`mb-8 transition-all duration-700 delay-400 ${
            visibleSections.has("disclaimer")
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <div className="p-4 rounded-xl bg-secondary/20 border border-border/20">
            <p className="text-xs text-muted-foreground/70 text-center leading-relaxed">
              This report provides AI-assisted guidance based on available inputs and market analysis. 
              Career outcomes depend on individual effort, circumstances, and external factors. 
              NexPath.AI does not guarantee employment or career success. 
              Use this report as a guide, not a guarantee.
            </p>
          </div>
        </section>

        {/* Download & Share Actions */}
        <section
          className={`transition-all duration-700 delay-500 print:hidden ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              disabled={downloading}
              onClick={handleDownloadPdf}
              className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 font-medium px-8 py-6 text-base gap-2 w-full sm:w-auto print:hidden"
            >
              {downloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
              {downloading ? "Preparing…" : "Download PDF Report"}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="bg-transparent border-border/50 text-foreground hover:bg-primary/10 hover:border-primary/50 font-medium px-8 py-6 text-base gap-2 w-full sm:w-auto print:hidden"
            >
              <Save size={18} />
              Save to Profile
            </Button>
          </div>
        </section>

        {/* Back Link */}
        <div className="mt-8 text-center print:hidden">
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
