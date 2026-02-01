"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"

export function CTA() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.2 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="py-24 sm:py-32 relative">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div
          className={`relative rounded-3xl border border-border/50 bg-card/30 backdrop-blur-xl overflow-hidden transition-all duration-700 ${
            isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        >
          {/* Background decoration */}
          <div className="absolute inset-0">
            <div
              className="absolute top-0 left-1/4 w-[400px] h-[400px] rounded-full opacity-20 blur-[100px]"
              style={{
                background:
                  "radial-gradient(circle, oklch(0.75 0.18 55) 0%, transparent 70%)",
              }}
            />
            <div
              className="absolute bottom-0 right-1/4 w-[300px] h-[300px] rounded-full opacity-15 blur-[80px]"
              style={{
                background:
                  "radial-gradient(circle, oklch(0.65 0.15 45) 0%, transparent 70%)",
              }}
            />
          </div>

          {/* Content */}
          <div className="relative z-10 py-16 px-8 sm:py-20 sm:px-16 text-center">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 mb-8">
              <Sparkles className="text-primary" size={32} />
            </div>

            {/* Headline */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance">
              Start Your Career Discovery Journey Today
            </h2>

            {/* Subtext */}
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 text-pretty">
              Join thousands of users who have already discovered their ideal
              career path with NexPath.AI
            </p>

            {/* CTA Button */}
            <Button
              asChild
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium px-10 py-6 text-lg gap-2 group"
            >
              <Link href="/auth">
                Create Your Free Account
                <ArrowRight
                  size={20}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </Button>

            {/* Trust badge */}
            <p className="mt-6 text-sm text-muted-foreground">
              No credit card required • Free to start
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
