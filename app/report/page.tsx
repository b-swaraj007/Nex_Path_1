"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
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
} from "lucide-react"

// Mock report data - would come from AI generation in production
const reportData = {
  generatedDate: "January 31, 2026",
  userName: "Alex",
  career: {
    title: "Data Scientist",
    field: "Technology & Analytics",
    explanation:
      "Based on your strong logical reasoning abilities, high problem-solving speed, and natural curiosity for patterns and systems, Data Science emerges as an excellent career fit. Your cognitive profile shows you excel at abstract thinking and have the persistence needed for complex analytical challenges. This role will leverage your strengths while providing continuous intellectual stimulation.",
  },
  psychometricProfile: {
    cri: 134,
    criInterpretation:
      "Your CRI of 134 places you in the top 15% of analytical thinkers. This indicates strong potential for careers requiring complex reasoning and data interpretation.",
    parameters: [
      {
        name: "Logical Reasoning",
        score: 87,
        interpretation: "Exceptional ability to identify patterns and draw logical conclusions",
      },
      {
        name: "Verbal Reasoning",
        score: 72,
        interpretation: "Strong communication skills with room for technical writing improvement",
      },
      {
        name: "Learning Adaptability",
        score: 81,
        interpretation: "Quick to acquire new concepts and adapt to changing requirements",
      },
      {
        name: "Problem-Solving Speed",
        score: 79,
        interpretation: "Efficient at breaking down complex problems into manageable parts",
      },
      {
        name: "Curiosity & Openness",
        score: 91,
        interpretation: "Highly motivated to explore new ideas and approaches",
      },
      {
        name: "Persistence & Grit",
        score: 76,
        interpretation: "Good perseverance with occasional need for external motivation",
      },
      {
        name: "Attention & Focus",
        score: 83,
        interpretation: "Strong sustained attention suitable for detailed analytical work",
      },
    ],
  },
  careerFit: {
    strengths: [
      "Strong analytical and logical thinking aligns perfectly with data analysis requirements",
      "High curiosity drives continuous learning in a rapidly evolving field",
      "Problem-solving efficiency supports complex model development",
      "Good attention to detail ensures accuracy in data interpretation",
    ],
    challenges: [
      "May need to develop patience for stakeholder communication",
      "Technical writing skills could benefit from focused improvement",
      "Consider building tolerance for repetitive data cleaning tasks",
    ],
    workEnvironment:
      "You would thrive in environments that offer intellectual challenges, autonomy in problem-solving, and opportunities for continuous learning. Consider roles in tech companies, research institutions, or consulting firms that value analytical depth over routine tasks.",
  },
  marketOutlook: {
    currentDemand: "Very High",
    futureTrend: "Strong Growth Expected",
    trendDescription:
      "Data Science roles are projected to grow 35% over the next decade, driven by AI adoption and data-driven decision making across industries.",
    safetyScore: 78,
    safetyNote:
      "While automation may handle routine analysis, complex problem-solving and strategic interpretation roles remain secure.",
  },
  roadmap: [
    {
      phase: "Foundation Building",
      duration: "0-6 months",
      skills: ["Python Programming", "Statistics & Probability", "SQL & Database Fundamentals"],
      subjects: ["Mathematics", "Computer Science Basics"],
      difficulty: "Moderate",
      masteryTarget: 80,
    },
    {
      phase: "Core Competencies",
      duration: "6-12 months",
      skills: ["Machine Learning Fundamentals", "Data Visualization", "Feature Engineering"],
      subjects: ["Linear Algebra", "Calculus", "Statistical Modeling"],
      difficulty: "Challenging",
      masteryTarget: 75,
    },
    {
      phase: "Specialization",
      duration: "12-18 months",
      skills: ["Deep Learning", "Natural Language Processing", "Big Data Technologies"],
      subjects: ["Neural Networks", "Cloud Computing", "MLOps"],
      difficulty: "Advanced",
      masteryTarget: 70,
    },
    {
      phase: "Professional Readiness",
      duration: "18-24 months",
      skills: ["End-to-End ML Projects", "Business Communication", "Domain Expertise"],
      subjects: ["Industry Applications", "Ethics in AI", "Project Management"],
      difficulty: "Professional",
      masteryTarget: 85,
    },
  ],
  certifications: [
    {
      name: "Professional Data Science Certificate",
      provider: "Major University Online Platform",
      importance: "High",
    },
    {
      name: "Machine Learning Specialization",
      provider: "Leading Tech Company",
      importance: "High",
    },
    {
      name: "Cloud Data Engineering Certificate",
      provider: "Cloud Platform Provider",
      importance: "Medium",
    },
    {
      name: "Statistical Analysis Professional",
      provider: "Industry Association",
      importance: "Medium",
    },
  ],
  resources: [
    "Interactive coding platforms for Python and SQL practice",
    "Open-source datasets for portfolio projects",
    "Online communities for peer learning and networking",
    "Technical blogs and research paper repositories",
  ],
  actionPlan: [
    {
      category: "Immediate (Week 1-2)",
      items: [
        "Set up Python development environment",
        "Enroll in introductory statistics course",
        "Join 2-3 data science communities online",
      ],
    },
    {
      category: "Short-term (Month 1-2)",
      items: [
        "Complete Python basics and start SQL fundamentals",
        "Begin first small data analysis project",
        "Schedule weekly learning blocks (minimum 10 hours/week)",
      ],
    },
    {
      category: "Exploration (Month 2-3)",
      items: [
        "Attend virtual data science meetups",
        "Research companies and roles that interest you",
        "Start building your portfolio website",
      ],
    },
  ],
}

export default function CareerReportPage() {
  const [isVisible, setIsVisible] = useState(false)
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set())
  const containerRef = useRef<HTMLDivElement>(null)

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
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <header
          className={`mb-12 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
          }`}
        >
          <Link href="/dashboard" className="inline-block mb-6">
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
          className={`transition-all duration-700 delay-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 font-medium px-8 py-6 text-base gap-2 w-full sm:w-auto"
            >
              <Download size={18} />
              Download PDF Report
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="bg-transparent border-border/50 text-foreground hover:bg-primary/10 hover:border-primary/50 font-medium px-8 py-6 text-base gap-2 w-full sm:w-auto"
            >
              <Save size={18} />
              Save to Profile
            </Button>
          </div>
        </section>

        {/* Back Link */}
        <div className="mt-8 text-center">
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
