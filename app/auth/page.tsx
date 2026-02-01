"use client"

import React, { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react"
import {
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle,
  resetPassword,
} from "@/lib/firebase"

function getAuthErrorMessage(code: string): string {
  switch (code) {
    case "auth/email-already-in-use":
      return "This email is already registered. Try signing in."
    case "auth/invalid-email":
      return "Please enter a valid email address."
    case "auth/operation-not-allowed":
      return "Email/password sign-in is not enabled. Check Firebase Console."
    case "auth/weak-password":
      return "Password should be at least 6 characters."
    case "auth/user-disabled":
      return "This account has been disabled."
    case "auth/user-not-found":
      return "No account found with this email."
    case "auth/wrong-password":
      return "Incorrect password."
    case "auth/invalid-credential":
      return "Invalid email or password."
    case "auth/popup-closed-by-user":
      return "Sign-in was cancelled."
    case "auth/popup-blocked":
      return "Popup was blocked. Please allow popups and try again."
    case "auth/account-exists-with-different-credential":
      return "An account already exists with the same email but different sign-in method."
    default:
      return "Something went wrong. Please try again."
  }
}

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  useEffect(() => {
    setError(null)
    setSuccessMessage(null)
  }, [mode])

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
    setError(null)
    setSuccessMessage(null)

    if (!email.trim()) {
      setError("Please enter your email.")
      return
    }
    if (!password) {
      setError("Please enter your password.")
      return
    }
    if (mode === "signup") {
      if (password.length < 6) {
        setError("Password must be at least 6 characters.")
        return
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.")
        return
      }
    }

    setIsLoading(true)
    try {
      if (mode === "signup") {
        await signUpWithEmail(email.trim(), password, fullName)
        setSuccessMessage("Account created! Check your email to verify, then sign in.")
        setMode("login")
        setPassword("")
        setConfirmPassword("")
      } else {
        await signInWithEmail(email.trim(), password)
        router.push("/onboarding")
        return
      }
    } catch (err: unknown) {
      console.error("Auth error:", err)
      let message = "Something went wrong. Please try again."
      if (err && typeof err === "object") {
        const code = (err as { code?: string }).code
        const msg = (err as { message?: string }).message
        if (code) {
          message = getAuthErrorMessage(code)
        } else if (msg && /auth\/[a-z-]+/.test(msg)) {
          const match = msg.match(/auth\/([a-z-]+)/)
          if (match) message = getAuthErrorMessage(`auth/${match[1]}`)
          else message = msg
        } else if (msg) {
          message = msg
        }
      }
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError(null)
    setIsLoading(true)
    try {
      await signInWithGoogle()
      router.push("/onboarding")
      return
    } catch (err: unknown) {
      console.error("Google sign-in error:", err)
      let message = "Something went wrong. Please try again."
      if (err && typeof err === "object") {
        const code = (err as { code?: string }).code
        const msg = (err as { message?: string }).message
        if (code) {
          message = getAuthErrorMessage(code)
        } else if (msg && /auth\/[a-z-]+/.test(msg)) {
          const match = msg.match(/auth\/([a-z-]+)/)
          if (match) message = getAuthErrorMessage(`auth/${match[1]}`)
          else message = msg
        } else if (msg) {
          message = msg
        }
      }
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError("Enter your email above, then click Forgot password?")
      return
    }
    setError(null)
    setIsLoading(true)
    try {
      await resetPassword(email.trim())
      setSuccessMessage("Check your email for a link to reset your password.")
    } catch (err: unknown) {
      console.error("Reset password error:", err)
      let message = "Something went wrong. Please try again."
      if (err && typeof err === "object") {
        if ("code" in err && typeof (err as { code: string }).code === "string") {
          message = getAuthErrorMessage((err as { code: string }).code)
        } else if ("message" in err && typeof (err as { message: string }).message === "string") {
          message = (err as { message: string }).message
        }
      }
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden px-4"
      style={
        {
          "--mouse-x": "50%",
          "--mouse-y": "50%",
        } as React.CSSProperties
      }
    >
      {/* Animated Background */}
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
        className={`relative z-10 w-full max-w-md transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="relative rounded-2xl overflow-hidden border border-border/50 bg-card/30 backdrop-blur-xl p-8 shadow-2xl">
          <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-primary/20 via-transparent to-primary/10 -z-10" />

          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-4">
              <span className="text-2xl font-bold text-foreground">
                NexPath<span className="text-primary">.AI</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm">
              {mode === "login"
                ? "Sign in to continue your career discovery journey"
                : "Create an account to start your journey"}
            </p>
          </div>

          <div className="flex rounded-lg bg-secondary/50 p-1 mb-6">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-300 ${
                mode === "login"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-300 ${
                mode === "signup"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign Up
            </button>
          </div>

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

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-foreground text-sm">
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-secondary/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 transition-all"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground text-sm">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="bg-secondary/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground text-sm">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  className="bg-secondary/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {mode === "signup" && (
              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-foreground text-sm"
                >
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    className="bg-secondary/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 transition-all pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>
            )}

            {mode === "login" && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={isLoading}
                  className="text-xs text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-5 transition-all hover:shadow-lg hover:shadow-primary/20 disabled:opacity-70 disabled:pointer-events-none"
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin mx-auto" />
              ) : mode === "login" ? (
                "Login"
              ) : (
                "Create Account"
              )}
            </Button>

            {mode === "signup" && (
              <p className="text-xs text-muted-foreground text-center">
                By signing up, you agree to our{" "}
                <button type="button" className="text-primary hover:underline">
                  terms
                </button>{" "}
                and{" "}
                <button type="button" className="text-primary hover:underline">
                  privacy policy
                </button>
              </p>
            )}
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-border/50" />
            <span className="text-xs text-muted-foreground">OR</span>
            <div className="flex-1 h-px bg-border/50" />
          </div>

          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={handleGoogleSignIn}
            className="w-full border-border/50 text-foreground hover:bg-secondary/50 font-medium py-5 bg-transparent gap-3 disabled:opacity-70 disabled:pointer-events-none"
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            Continue with Google
          </Button>

          <div className="mt-6 pt-6 border-t border-border/30">
            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              Your data is used only to personalize career guidance.
              <br />
              We do not make decisions for you — we guide you.
            </p>
          </div>
        </div>

        <Link
          href="/"
          className="flex items-center justify-center gap-2 mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft
            size={16}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Back to Home
        </Link>
      </div>
    </div>
  )
}
