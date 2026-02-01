"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function SignedInHeader() {
  const [user, setUser] = useState(auth.currentUser)
  const pathname = usePathname()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u))
    return () => unsubscribe()
  }, [])

  if (!user) return null

  const isAuthPage = pathname === "/auth"
  if (isAuthPage) return null

  const initial = user.displayName
    ? user.displayName.trim().charAt(0).toUpperCase()
    : user.email
      ? user.email.charAt(0).toUpperCase()
      : "U"

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <Link
        href="/dashboard"
        className="text-lg font-bold text-foreground hover:text-primary transition-colors"
      >
        NexPath<span className="text-primary">.AI</span>
      </Link>
      <Link
        href="/profile"
        className="flex items-center gap-2 rounded-full p-1 hover:bg-secondary/60 transition-colors"
        aria-label="Profile"
      >
        <Avatar className="h-9 w-9 border-2 border-border/50">
          <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? "Profile"} />
          <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
            {initial}
          </AvatarFallback>
        </Avatar>
      </Link>
    </header>
  )
}

/** Spacer so main content is not hidden under fixed header when signed in */
export function SignedInHeaderSpacer() {
  const [user, setUser] = useState(auth.currentUser)
  const pathname = usePathname()
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u))
    return () => unsub()
  }, [])
  if (!user || pathname === "/auth") return null
  return <div className="h-14 flex-shrink-0" aria-hidden />
}
