"use client"

import React from "react"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null)

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
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16"
      style={
        {
          "--mouse-x": "50%",
          "--mouse-y": "50%",
        } as React.CSSProperties
      }
    >
      {/* Animated Background */}
      <div className="absolute inset-0 bg-background">
        {/* Gradient orbs */}
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
      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
            <Sparkles size={16} className="text-primary" />
            <span className="text-sm text-primary font-medium">
              AI-Powered Career Guidance
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight tracking-tight text-balance mb-6">
            Discover the Right Career Path
            <span className="block text-primary">Built for You</span>
          </h1>

          {/* Subheading */}
          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground leading-relaxed mb-10 text-pretty">
            NexPath.AI uses artificial intelligence to understand your
            abilities, interests, and thinking style to guide you toward
            realistic and future-proof careers.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium px-8 py-6 text-base gap-2 group"
            >
              <Link href="/auth">
                Get Started
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-border/50 text-foreground hover:bg-secondary/50 font-medium px-8 py-6 text-base bg-transparent"
            >
              Explore How It Works
            </Button>
          </div>
        </div>

        {/* Abstract Path Visualization */}
        <div className="mt-16 relative">
          <div className="relative mx-auto max-w-3xl">
            {/* Glassmorphic preview card */}
            <div className="relative rounded-2xl overflow-hidden border border-border/50 bg-card/30 backdrop-blur-xl p-8 shadow-2xl">
              {/* Mock UI elements */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 rounded-full bg-primary/60" />
                <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
                <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Sparkles className="text-primary" size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="h-4 w-48 bg-foreground/20 rounded mb-2" />
                    <div className="h-3 w-32 bg-muted-foreground/20 rounded" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-6">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl bg-secondary/30 border border-border/30"
                    >
                      <div className="h-3 w-16 bg-primary/30 rounded mb-2" />
                      <div className="h-2 w-full bg-muted-foreground/20 rounded" />
                    </div>
                  ))}
                </div>

                <div className="h-24 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent mt-4" />
              </div>

              {/* Glow effect */}
              <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-3/4 h-40 bg-primary/20 blur-[80px] rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-primary rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  )
}
