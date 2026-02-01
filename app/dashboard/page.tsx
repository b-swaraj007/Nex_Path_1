"use client"

import React, { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  MessageSquare,
  Brain,
  ArrowRight,
  Sparkles,
  User,
  RefreshCw,
} from "lucide-react"

export default function DashboardPage() {
  const [isVisible, setIsVisible] = useState(false)
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsVisible(true)
  }, [])

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

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen overflow-hidden px-4 py-8"
      style={
        {
          "--mouse-x": "50%",
          "--mouse-y": "50%",
        } as React.CSSProperties
      }
    >
      {/* Animated Background */}
      <div className="absolute inset-0 bg-background">
        {/* Mouse-following gradient orb */}
        <div
          className="absolute w-[600px] h-[600px] rounded-full opacity-20 blur-[120px]"
          style={{
            background:
              "radial-gradient(circle, oklch(0.75 0.18 55) 0%, transparent 70%)",
            left: "var(--mouse-x)",
            top: "var(--mouse-y)",
            transform: "translate(-50%, -50%)",
            transition: "left 0.3s ease-out, top 0.3s ease-out",
          }}
        />
        {/* Static gradient orbs */}
        <div
          className="absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-10 blur-[100px] animate-pulse"
          style={{
            background:
              "radial-gradient(circle, oklch(0.65 0.15 45) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] rounded-full opacity-10 blur-[80px] animate-pulse"
          style={{
            background:
              "radial-gradient(circle, oklch(0.80 0.16 60) 0%, transparent 70%)",
            animationDelay: "1s",
          }}
        />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(oklch(0.98 0 0) 1px, transparent 1px),
                            linear-gradient(90deg, oklch(0.98 0 0) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header */}
        <header
          className={`flex items-center justify-between mb-12 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
          }`}
        >
          <div>
            <Link href="/" className="inline-block mb-4">
              <span className="text-xl font-bold text-foreground">
                NexPath<span className="text-primary">.AI</span>
              </span>
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Welcome to NexPath.AI
            </h1>
            <p className="text-muted-foreground text-lg">
              Choose how you&apos;d like to begin your career guidance
            </p>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
              <User size={18} className="text-primary" />
            </div>
          </div>
        </header>

        {/* Main Action Cards */}
        <div
          className={`grid md:grid-cols-2 gap-6 mb-8 transition-all duration-700 delay-150 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* Chat Card */}
          <Link
            href="/chat"
            className="block group"
            onMouseEnter={() => setHoveredCard("chat")}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div
              className={`relative h-full rounded-2xl overflow-hidden border transition-all duration-500 ${
                hoveredCard === "chat"
                  ? "border-primary/50 shadow-2xl shadow-primary/10 -translate-y-1"
                  : "border-border/50"
              } bg-card/30 backdrop-blur-xl p-8`}
            >
              {/* Glow effect */}
              <div
                className={`absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-primary/20 via-transparent to-primary/10 -z-10 transition-opacity duration-500 ${
                  hoveredCard === "chat" ? "opacity-100" : "opacity-0"
                }`}
              />

              {/* Icon */}
              <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <MessageSquare size={28} className="text-primary" />
              </div>

              {/* Content */}
              <h2 className="text-2xl font-bold text-foreground mb-3">
                Talk with an AI Career Mentor
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Explain your thoughts naturally and get career guidance like
                talking to an experienced mentor.
              </p>

              {/* Highlights */}
              <ul className="space-y-2 mb-8">
                {[
                  "Natural conversation",
                  "Flexible & adaptive guidance",
                  "No tests required",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <Sparkles size={14} className="text-primary" />
                    {item}
                  </li>
                ))}
              </ul>

              {/* Button */}
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-5 text-base gap-2 group/btn">
                Start Career Chat
                <ArrowRight
                  size={18}
                  className="group-hover/btn:translate-x-1 transition-transform"
                />
              </Button>
            </div>
          </Link>

          {/* Assessment Card */}
          <Link
            href="/psychometric-test"
            className="block group"
            onMouseEnter={() => setHoveredCard("assessment")}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div
              className={`relative h-full rounded-2xl overflow-hidden border transition-all duration-500 ${
                hoveredCard === "assessment"
                  ? "border-primary/50 shadow-2xl shadow-primary/10 -translate-y-1"
                  : "border-border/50"
              } bg-card/30 backdrop-blur-xl p-8`}
            >
              {/* Glow effect */}
              <div
                className={`absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-primary/20 via-transparent to-primary/10 -z-10 transition-opacity duration-500 ${
                  hoveredCard === "assessment" ? "opacity-100" : "opacity-0"
                }`}
              />

              {/* Icon */}
              <div className="w-14 h-14 rounded-xl bg-secondary/50 border border-border/50 flex items-center justify-center mb-6 group-hover:bg-primary/10 group-hover:border-primary/20 transition-colors">
                <Brain size={28} className="text-primary" />
              </div>

              {/* Content */}
              <h2 className="text-2xl font-bold text-foreground mb-3">
                Take a Psychometric Assessment
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Answer structured questions to help NexPath.AI understand your
                cognitive reasoning, learning style, and preferences.
              </p>

              {/* Highlights */}
              <ul className="space-y-2 mb-8">
                {[
                  "Cognitive Reasoning Index (CRI)",
                  "Learning speed & adaptability",
                  "AI-generated insight summary",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <Sparkles size={14} className="text-primary" />
                    {item}
                  </li>
                ))}
              </ul>

              {/* Button */}
              <Button
                variant="outline"
                className="w-full bg-transparent border-border/50 text-foreground hover:bg-primary/10 hover:border-primary/50 font-medium py-5 text-base gap-2 group/btn"
              >
                Start Assessment
                <ArrowRight
                  size={18}
                  className="group-hover/btn:translate-x-1 transition-transform"
                />
              </Button>
            </div>
          </Link>
        </div>

        {/* Reassurance Section */}
        <div
          className={`text-center mb-8 transition-all duration-700 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <p className="text-muted-foreground text-sm">
            Both paths lead to personalized career guidance.
            <br />
            You can switch approaches anytime.
          </p>
        </div>

        {/* Secondary Actions */}
        <div
          className={`flex flex-wrap items-center justify-center gap-4 transition-all duration-700 delay-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
            <User size={16} />
            View Profile Summary
          </button>
          <span className="text-border">|</span>
          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
            <RefreshCw size={16} />
            Start a New Career Session
          </button>
        </div>
      </div>
    </div>
  )
}
