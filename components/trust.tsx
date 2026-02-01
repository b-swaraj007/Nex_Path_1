"use client"

import { useEffect, useRef, useState } from "react"
import { ShieldCheck, Target, UserCheck } from "lucide-react"

const trustPoints = [
  {
    icon: ShieldCheck,
    title: "Guidance, Not Guarantees",
    description:
      "NexPath.AI provides informed guidance based on data and analysis, helping you make better decisions while respecting that outcomes vary.",
  },
  {
    icon: Target,
    title: "Data-Driven Insights",
    description:
      "Career suggestions are based on AI reasoning, market analysis, and industry trends to give you realistic perspectives.",
  },
  {
    icon: UserCheck,
    title: "You Decide",
    description:
      "Final decisions always remain with you. We empower you with information, but your career path is yours to choose.",
  },
]

export function Trust() {
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
    <section
      id="about"
      ref={sectionRef}
      className="py-24 sm:py-32 relative overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/10 to-background" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          className={`text-center mb-16 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 text-balance">
            Responsible & Realistic AI Guidance
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            We believe in transparency and setting the right expectations
          </p>
        </div>

        {/* Trust Points */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {trustPoints.map((point, index) => (
            <div
              key={point.title}
              className={`text-center transition-all duration-700 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${(index + 1) * 150}ms` }}
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 mb-6">
                <point.icon className="text-primary" size={28} />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {point.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {point.description}
              </p>
            </div>
          ))}
        </div>

        {/* Disclaimer text */}
        <div
          className={`mt-16 p-6 rounded-2xl border border-border/30 bg-card/20 backdrop-blur-sm text-center transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          style={{ transitionDelay: "600ms" }}
        >
          <p className="text-sm text-muted-foreground leading-relaxed">
            NexPath.AI is designed to assist and inform, not to replace
            professional career counseling. Our AI-powered suggestions are based
            on algorithms and data analysis. Individual results may vary based
            on numerous factors including personal effort, market conditions,
            and other variables.
          </p>
        </div>
      </div>
    </section>
  )
}
