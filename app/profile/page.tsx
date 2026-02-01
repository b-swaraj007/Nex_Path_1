"use client"

import React, { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { auth, getUserProfile, updateUserProfile } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Loader2, User } from "lucide-react"
import {
  ageRanges,
  educationLevels,
  fieldOptions,
  countries,
  careerStages,
} from "@/lib/onboarding-options"
import type { UserProfileDoc } from "@/lib/firestore-types"

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState(auth.currentUser)
  const [profile, setProfile] = useState<UserProfileDoc | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [displayName, setDisplayName] = useState("")
  const [email, setEmail] = useState("")
  const [ageRange, setAgeRange] = useState("")
  const [education, setEducation] = useState("")
  const [field, setField] = useState("")
  const [country, setCountry] = useState("")
  const [careerStage, setCareerStage] = useState("")

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u)
      if (!u) {
        router.push("/auth")
        return
      }
      setEmail(u.email ?? "")
      setDisplayName(u.displayName ?? "")
    })
    return () => unsubscribe()
  }, [router])

  useEffect(() => {
    if (!user) return
    let cancelled = false
    async function load() {
      try {
        const data = await getUserProfile(user.uid)
        if (cancelled) return
        setProfile(data as UserProfileDoc | null)
        if (data) {
          setDisplayName((data.displayName as string) ?? user.displayName ?? "")
          setAgeRange((data.ageRange as string) ?? "")
          setEducation((data.education as string) ?? "")
          setField((data.field as string) ?? "")
          setCountry((data.country as string) ?? "")
          setCareerStage((data.careerStage as string) ?? "")
        }
      } catch {
        if (!cancelled) setError("Failed to load profile.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [user])

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
    if (!user) return
    setError(null)
    setSuccessMessage(null)
    setSaving(true)
    try {
      await updateUserProfile(user.uid, {
        displayName: displayName.trim() || undefined,
        email: user.email ?? undefined,
        ageRange: ageRange || undefined,
        education: education || undefined,
        field: field || undefined,
        country: country || undefined,
        careerStage: careerStage || undefined,
      })
      setSuccessMessage("Profile updated successfully.")
    } catch {
      setError("Failed to update profile. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  if (!user) return null

  const initial = displayName
    ? displayName.trim().charAt(0).toUpperCase()
    : user.email
      ? user.email.charAt(0).toUpperCase()
      : "U"

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-8 pt-20"
      style={
        {
          "--mouse-x": "50%",
          "--mouse-y": "50%",
        } as React.CSSProperties
      }
    >
      <div className="absolute inset-0 bg-background">
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
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(oklch(0.98 0 0) 1px, transparent 1px),
                            linear-gradient(90deg, oklch(0.98 0 0) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div
        className={`relative z-10 w-full max-w-xl transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="relative rounded-2xl overflow-hidden border border-border/50 bg-card/30 backdrop-blur-xl p-8 shadow-2xl">
          <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-primary/20 via-transparent to-primary/10 -z-10" />

          <div className="text-center mb-6">
            <Link href="/dashboard" className="inline-block mb-4">
              <span className="text-2xl font-bold text-foreground">
                NexPath<span className="text-primary">.AI</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm">Your profile</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={32} className="animate-spin text-primary" />
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                  {error}
                </div>
              )}
              {successMessage && (
                <div className="mb-4 p-3 rounded-lg bg-primary/10 border border-primary/30 text-primary text-sm">
                  {successMessage}
                </div>
              )}

              <div className="flex justify-center mb-6">
                <Avatar className="h-20 w-20 border-2 border-primary/20">
                  <AvatarImage src={user.photoURL ?? undefined} alt={displayName || "Profile"} />
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl font-medium">
                    {initial}
                  </AvatarFallback>
                </Avatar>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName" className="text-foreground text-sm">
                    Full Name
                  </Label>
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="Your name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="bg-secondary/50 border-border/50 text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground text-sm">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    readOnly
                    className="bg-secondary/30 border-border/50 text-muted-foreground cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
                </div>

                <div className="border-t border-border/50 pt-4 mt-6">
                  <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                    <User size={16} className="text-primary" />
                    Career context (optional)
                  </p>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-foreground text-sm">Age range</Label>
                      <Select value={ageRange} onValueChange={setAgeRange}>
                        <SelectTrigger className="bg-secondary/50 border-border/50">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {ageRanges.map((a) => (
                            <SelectItem key={a.value} value={a.value}>
                              {a.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground text-sm">Education</Label>
                      <Select value={education} onValueChange={setEducation}>
                        <SelectTrigger className="bg-secondary/50 border-border/50">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {educationLevels.map((e) => (
                            <SelectItem key={e.value} value={e.value}>
                              {e.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground text-sm">Field</Label>
                      <Select value={field} onValueChange={setField}>
                        <SelectTrigger className="bg-secondary/50 border-border/50">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {fieldOptions.map((f) => (
                            <SelectItem key={f.value} value={f.value}>
                              {f.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground text-sm">Country</Label>
                      <Select value={country} onValueChange={setCountry}>
                        <SelectTrigger className="bg-secondary/50 border-border/50">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map((c) => (
                            <SelectItem key={c.value} value={c.value}>
                              {c.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground text-sm">Career stage</Label>
                      <Select value={careerStage} onValueChange={setCareerStage}>
                        <SelectTrigger className="bg-secondary/50 border-border/50">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {careerStages.map((c) => (
                            <SelectItem key={c.value} value={c.value}>
                              {c.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-5 mt-6 disabled:opacity-70"
                >
                  {saving ? (
                    <Loader2 size={20} className="animate-spin mx-auto" />
                  ) : (
                    "Save changes"
                  )}
                </Button>
              </form>
            </>
          )}
        </div>

        <Link
          href="/dashboard"
          className="flex items-center justify-center gap-2 mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
