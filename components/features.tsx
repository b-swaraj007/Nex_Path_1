"use client"

import { useEffect, useRef, useState } from "react"
import {
  MessageSquare,
  Brain,
  BarChart3,
  Shield,
  Sparkles,
  History,
  CheckCircle2,
  Send,
} from "lucide-react"

const features = [
  {
    icon: Sparkles,
    text: "AI mentor-like career guidance",
  },
  {
    icon: Brain,
    text: "Cognitive Reasoning Index (CRI) based analysis",
  },
  {
    icon: MessageSquare,
    text: "Psychometric assessment + natural chat",
  },
  {
    icon: BarChart3,
    text: "Market-aware career safety scores",
  },
  {
    icon: CheckCircle2,
    text: "Personalized learning & certification roadmap",
  },
  {
    icon: History,
    text: "ChatGPT-like conversation history",
  },
]

export function Features() {
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
    <section id="features" ref={sectionRef} className="py-24 sm:py-32 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 text-balance">
            What Makes NexPath.AI Different
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Powered by advanced AI to deliver personalized, market-aware career guidance
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Features List */}
          <div className="space-y-6">
            {features.map((feature, index) => (
              <div
                key={feature.text}
                className={`flex items-center gap-4 transition-all duration-500 ${
                  isVisible
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-8"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <feature.icon className="text-primary" size={20} />
                </div>
                <span className="text-foreground text-lg">{feature.text}</span>
              </div>
            ))}
          </div>

          {/* Mock Chat UI */}
          <div
            className={`transition-all duration-700 ${
              isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-8"
            }`}
            style={{ transitionDelay: "300ms" }}
          >
            <div className="relative rounded-2xl border border-border/50 bg-card/30 backdrop-blur-xl overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Sparkles className="text-primary" size={16} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      NexPath AI Assistant
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Always here to help
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs text-muted-foreground">Online</span>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="p-6 space-y-4 min-h-[300px]">
                {/* User Message */}
                <div className="flex justify-end">
                  <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-primary px-4 py-3">
                    <p className="text-sm text-primary-foreground">
                      {"I'm interested in technology but not sure which career path suits me best."}
                    </p>
                  </div>
                </div>

                {/* AI Response */}
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-secondary/50 border border-border/50 px-4 py-3">
                    <p className="text-sm text-foreground mb-3">
                      {"I'd love to help you explore that! Based on our conversation, you show strong analytical thinking and creativity."}
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Shield size={14} className="text-primary" />
                        <span>High Career Safety Score: Data Science</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <BarChart3 size={14} className="text-primary" />
                        <span>Growing Demand: +34% by 2028</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Typing indicator */}
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-tl-sm bg-secondary/30 border border-border/30 px-4 py-3">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Input */}
              <div className="px-6 py-4 border-t border-border/50">
                <div className="flex items-center gap-3">
                  <div className="flex-1 rounded-xl bg-secondary/50 border border-border/50 px-4 py-3">
                    <span className="text-sm text-muted-foreground">
                      Ask me about career paths...
                    </span>
                  </div>
                  <button
                    type="button"
                    className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors"
                    aria-label="Send message"
                  >
                    <Send size={18} className="text-primary-foreground" />
                  </button>
                </div>
              </div>

              {/* Glow effect */}
              <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-3/4 h-40 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
