"use client"

import React, { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { auth, updateUserProfile } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowRight, User, Briefcase, CheckCircle2, Loader2 } from "lucide-react"
import {
  ageRanges,
  educationLevels,
  fieldOptions,
  countries,
  careerStages,
} from "@/lib/onboarding-options"

export default function OnboardingPage() {
  const router = useRouter()
  const [authReady, setAuthReady] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Form state
  const [ageRange, setAgeRange] = useState("")
  const [education, setEducation] = useState("")
  const [field, setField] = useState("")
  const [country, setCountry] = useState("")
  const [careerStage, setCareerStage] = useState("")

  const isFormValid = ageRange && education && field && country && careerStage

  // Wait for Firebase Auth to be ready; redirect to auth if not signed in
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setAuthReady(true)
      setUserId(user?.uid ?? null)
      if (!user) {
        router.replace("/auth")
      }
    })
    return () => unsub()
  }, [router])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid || isSubmitting || !userId) return
    setIsSubmitting(true)
    setError(null)
    const profileData = { ageRange, education, field, country, careerStage }
    try {
      // Save to Firestore permanently so we can use it for the user
      const savePromise = updateUserProfile(userId, profileData)
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), 8000)
      )
      await Promise.race([savePromise, timeoutPromise])
      router.push("/dashboard")
      return
    } catch (err) {
      // Fallback: store locally and still redirect; Firestore may sync later
      localStorage.setItem("nexpath_profile", JSON.stringify(profileData))
      updateUserProfile(userId, profileData).catch(() => {})
      setError("Saved locally; we'll sync when online.")
    }
    setIsSubmitting(false)
    // Redirect after a short delay so user sees the message
    setTimeout(() => router.push("/dashboard"), 1200)
  }

  const handleSkip = () => {
    if (isSubmitting) return
    router.push("/dashboard")
  }

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-8"
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
      <div
        className={`relative z-10 w-full max-w-xl transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* Glassmorphic Card */}
        <div className="relative rounded-2xl overflow-hidden border border-border/50 bg-card/30 backdrop-blur-xl p-8 shadow-2xl">
          {/* Glow effect behind card */}
          <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-primary/20 via-transparent to-primary/10 -z-10" />

          {/* Logo */}
          <div className="text-center mb-2">
            <Link href="/" className="inline-block">
              <span className="text-xl font-bold text-foreground">
                NexPath<span className="text-primary">.AI</span>
              </span>
            </Link>
          </div>

          {/* Progress Indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <User size={16} className="text-primary-foreground" />
                </div>
                <span className="text-sm font-medium text-foreground">Basic Profile</span>
              </div>
              <div className="w-12 h-0.5 bg-border/50 relative overflow-hidden">
                <div className="absolute inset-y-0 left-0 w-0 bg-primary/50" />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-secondary/50 border border-border/50 flex items-center justify-center">
                  <Briefcase size={16} className="text-muted-foreground" />
                </div>
                <span className="text-sm text-muted-foreground">Career Guidance</span>
              </div>
            </div>
            {/* Progress bar */}
            <div className="h-1 bg-secondary/50 rounded-full overflow-hidden">
              <div className="h-full w-1/2 bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-500" />
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {"Let's Get to Know You"}
            </h1>
            <p className="text-muted-foreground text-sm">
              This helps NexPath.AI personalize your career guidance. You can update this later.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Age Range */}
            <div className="space-y-2">
              <Label htmlFor="age" className="text-foreground text-sm">
                Age Range
              </Label>
              <Select value={ageRange} onValueChange={setAgeRange}>
                <SelectTrigger
                  id="age"
                  className="bg-secondary/50 border-border/50 text-foreground focus:border-primary focus:ring-primary/20 transition-all"
                >
                  <SelectValue placeholder="Select your age range" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border/50 backdrop-blur-xl">
                  {ageRanges.map((age) => (
                    <SelectItem
                      key={age.value}
                      value={age.value}
                      className="text-foreground focus:bg-primary/20 focus:text-foreground"
                    >
                      {age.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Education Level */}
            <div className="space-y-2">
              <Label htmlFor="education" className="text-foreground text-sm">
                Highest Education Level
              </Label>
              <Select value={education} onValueChange={setEducation}>
                <SelectTrigger
                  id="education"
                  className="bg-secondary/50 border-border/50 text-foreground focus:border-primary focus:ring-primary/20 transition-all"
                >
                  <SelectValue placeholder="Select your education level" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border/50 backdrop-blur-xl">
                  {educationLevels.map((edu) => (
                    <SelectItem
                      key={edu.value}
                      value={edu.value}
                      className="text-foreground focus:bg-primary/20 focus:text-foreground"
                    >
                      {edu.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Field / Stream */}
            <div className="space-y-2">
              <Label htmlFor="field" className="text-foreground text-sm">
                Current Field / Stream
              </Label>
              <Select value={field} onValueChange={setField}>
                <SelectTrigger
                  id="field"
                  className="bg-secondary/50 border-border/50 text-foreground focus:border-primary focus:ring-primary/20 transition-all"
                >
                  <SelectValue placeholder="Select your field" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border/50 backdrop-blur-xl">
                  {fieldOptions.map((f) => (
                    <SelectItem
                      key={f.value}
                      value={f.value}
                      className="text-foreground focus:bg-primary/20 focus:text-foreground"
                    >
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Country / Region */}
            <div className="space-y-2">
              <Label htmlFor="country" className="text-foreground text-sm">
                Country / Region
              </Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger
                  id="country"
                  className="bg-secondary/50 border-border/50 text-foreground focus:border-primary focus:ring-primary/20 transition-all"
                >
                  <SelectValue placeholder="Select your country" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border/50 backdrop-blur-xl">
                  {countries.map((c) => (
                    <SelectItem
                      key={c.value}
                      value={c.value}
                      className="text-foreground focus:bg-primary/20 focus:text-foreground"
                    >
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Career Stage */}
            <div className="space-y-2">
              <Label className="text-foreground text-sm">
                Current Career Stage
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {careerStages.map((stage) => (
                  <button
                    key={stage.value}
                    type="button"
                    onClick={() => setCareerStage(stage.value)}
                    className={`relative p-4 rounded-xl text-left transition-all duration-300 border ${
                      careerStage === stage.value
                        ? "bg-primary/20 border-primary/50 shadow-lg shadow-primary/10"
                        : "bg-secondary/30 border-border/50 hover:bg-secondary/50 hover:border-border"
                    }`}
                  >
                    {careerStage === stage.value && (
                      <CheckCircle2
                        size={16}
                        className="absolute top-3 right-3 text-primary"
                      />
                    )}
                    <span
                      className={`block text-sm font-medium ${
                        careerStage === stage.value
                          ? "text-foreground"
                          : "text-foreground/80"
                      }`}
                    >
                      {stage.label}
                    </span>
                    <span className="block text-xs text-muted-foreground mt-1">
                      {stage.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Skip Option */}
            <div className="text-center">
              <button
                type="button"
                onClick={handleSkip}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {"Skip for now — I'll explain through chat"}
              </button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!authReady || !userId || !isFormValid || isSubmitting}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-6 text-base transition-all hover:shadow-lg hover:shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none gap-2 group"
            >
              {!authReady ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Loading…
                </>
              ) : isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  Continue to Dashboard
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </>
              )}
            </Button>
          </form>

          {/* Trust & Reassurance Text */}
          <div className="mt-6 pt-6 border-t border-border/30">
            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              Your information is used only to improve guidance.
              <br />
              NexPath.AI does not judge — it guides.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
