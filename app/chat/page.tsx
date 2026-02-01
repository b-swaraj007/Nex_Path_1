"use client"

import React, { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { auth, getChatSessions, createChatSession } from "@/lib/firebase"
import { useChatFirestore } from "@/hooks/useChatFirestore"
import { Button } from "@/components/ui/button"
import {
  Plus,
  Send,
  Pencil,
  Trash2,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Menu,
  Sparkles,
  Brain,
  Target,
  Briefcase,
  GraduationCap,
  TrendingUp,
  BookOpen,
  Map,
  User,
  MoreVertical,
  Clock,
  Download,
  FileText,
  Loader2,
} from "lucide-react"

// Types
interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
  isTyping?: boolean
}

interface SessionMeta {
  id: string
  title: string
  lastUpdated: Date
  hasAssessment: boolean
}

interface CareerSuggestion {
  domain: string
  icon: React.ReactNode
  description: string
}

const careerDomains: CareerSuggestion[] = [
  { domain: "Technology", icon: <Brain size={20} />, description: "Software, AI, Data Science, Cybersecurity" },
  { domain: "Healthcare", icon: <Target size={20} />, description: "Medicine, Nursing, Research, Public Health" },
  { domain: "Business", icon: <Briefcase size={20} />, description: "Finance, Marketing, Consulting, Management" },
  { domain: "Creative Arts", icon: <Sparkles size={20} />, description: "Design, Media, Writing, Entertainment" },
  { domain: "Education", icon: <GraduationCap size={20} />, description: "Teaching, Training, Academic Research" },
  { domain: "Science", icon: <TrendingUp size={20} />, description: "Research, Engineering, Environmental Science" },
]

function toDate(v: unknown): Date {
  if (!v) return new Date()
  if (v instanceof Date) return v
  const o = v as { seconds?: number; _seconds?: number }
  const sec = o.seconds ?? o._seconds
  if (typeof sec === "number") return new Date(sec * 1000)
  return new Date()
}

export default function ChatPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionIdFromUrl = searchParams.get("sessionId")

  const [userId, setUserId] = useState<string | null>(null)
  const [sessions, setSessions] = useState<SessionMeta[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string>("")
  const [sessionsLoading, setSessionsLoading] = useState(true)
  const [inputMessage, setInputMessage] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState("")
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null)
  const [showDomainSelector, setShowDomainSelector] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [createSessionLoading, setCreateSessionLoading] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const activeSessionMeta = sessions.find((s) => s.id === activeSessionId)
  const hasAssessment = activeSessionMeta?.hasAssessment ?? false

  const {
    messages,
    isLoading: messagesLoading,
    isSending,
    error: sendError,
    sendMessage: sendMessageToApi,
  } = useChatFirestore({
    userId,
    sessionId: activeSessionId || null,
    hasAssessment,
  })

  const activeSession = activeSessionMeta
    ? { ...activeSessionMeta, messages }
    : null

  // Auth: redirect if not signed in
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUserId(user?.uid ?? null)
      if (!user) router.replace("/auth")
    })
    return () => unsub()
  }, [router])

  // Load sessions from Firestore (or use sessionId from URL if load fails)
  useEffect(() => {
    if (!userId) {
      setSessionsLoading(false)
      return
    }
    setSessionsLoading(true)
    getChatSessions()
      .then((data) => {
        const list: SessionMeta[] = (data.sessions || []).map((s: { id: string; title: string; lastUpdated: unknown; hasAssessment: boolean }) => ({
          id: s.id,
          title: s.title || "Untitled",
          lastUpdated: toDate(s.lastUpdated),
          hasAssessment: Boolean(s.hasAssessment),
        }))
        const urlIdInList = sessionIdFromUrl && list.some((x) => x.id === sessionIdFromUrl)
        const finalList: SessionMeta[] =
          sessionIdFromUrl && !list.some((x) => x.id === sessionIdFromUrl)
            ? [{ id: sessionIdFromUrl, title: "Career Session", lastUpdated: new Date(), hasAssessment: false }, ...list]
            : list
        setSessions(finalList)
        const idToUse = urlIdInList ? sessionIdFromUrl : (finalList[0]?.id ?? sessionIdFromUrl ?? null)
        if (idToUse) {
          setActiveSessionId(idToUse)
          router.replace(`/chat?sessionId=${idToUse}`)
        }
      })
      .catch((err) => {
        console.error("Failed to load sessions:", err)
        // If we have sessionId in URL (e.g. just came from dashboard), still open that session
        if (sessionIdFromUrl) {
          setSessions([{ id: sessionIdFromUrl, title: "Career Session", lastUpdated: new Date(), hasAssessment: false }])
          setActiveSessionId(sessionIdFromUrl)
        } else {
          setSessions([])
        }
      })
      .finally(() => setSessionsLoading(false))
  }, [userId, sessionIdFromUrl])

  // Sync activeSessionId from URL when it changes (e.g. browser back)
  useEffect(() => {
    if (sessionIdFromUrl && sessionIdFromUrl !== activeSessionId) {
      setActiveSessionId(sessionIdFromUrl)
    }
  }, [sessionIdFromUrl])

  // When we have no session and sessions are loaded: create one and redirect (skip if URL has sessionId — we're opening that session)
  useEffect(() => {
    if (!userId || sessionsLoading || createSessionLoading) return
    if (sessions.length > 0) return
    if (activeSessionId) return
    if (sessionIdFromUrl) return
    setCreateSessionLoading(true)
    createChatSession("New Career Session", false)
      .then(({ sessionId }) => {
        router.replace(`/chat?sessionId=${sessionId}`)
        setActiveSessionId(sessionId)
        setSessions([{ id: sessionId, title: "New Career Session", lastUpdated: new Date(), hasAssessment: false }])
      })
      .catch((err) => {
        console.error("Failed to create session:", err)
        setCreateSessionLoading(false)
      })
      .finally(() => setCreateSessionLoading(false))
  }, [userId, sessionsLoading, sessions.length, activeSessionId, sessionIdFromUrl, createSessionLoading, router])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Show domain selector when session has assessment and no messages yet
  useEffect(() => {
    if (hasAssessment && messages.length === 0 && !showDomainSelector) {
      setShowDomainSelector(true)
    }
  }, [hasAssessment, messages.length, showDomainSelector])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const createNewSession = async () => {
    if (!userId || createSessionLoading) return
    setCreateSessionLoading(true)
    try {
      const { sessionId } = await createChatSession("New Career Session", false)
      setSessions((prev) => [
        { id: sessionId, title: "New Career Session", lastUpdated: new Date(), hasAssessment: false },
        ...prev,
      ])
      setActiveSessionId(sessionId)
      setShowDomainSelector(false)
      setSelectedDomain(null)
      setMobileSidebarOpen(false)
      router.replace(`/chat?sessionId=${sessionId}`)
    } catch (err) {
      console.error("Failed to create session:", err)
    } finally {
      setCreateSessionLoading(false)
    }
  }

  const deleteSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id))
    if (activeSessionId === id) {
      const remaining = sessions.filter((s) => s.id !== id)
      const next = remaining[0]?.id ?? ""
      setActiveSessionId(next)
      if (next) router.replace(`/chat?sessionId=${next}`)
      else router.replace("/chat")
    }
  }

  const startEditingSession = (id: string, currentTitle: string) => {
    setEditingSessionId(id)
    setEditingTitle(currentTitle)
  }

  const saveSessionTitle = () => {
    if (editingSessionId && editingTitle.trim()) {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === editingSessionId ? { ...s, title: editingTitle.trim() } : s
        )
      )
    }
    setEditingSessionId(null)
    setEditingTitle("")
  }

  const handleDomainSelect = async (domain: string) => {
    setSelectedDomain(domain)
    setShowDomainSelector(false)
    try {
      await sendMessageToApi(`I'm interested in exploring careers in ${domain}.`)
    } catch {
      // Error already surfaced by useChatFirestore
    }
  }

  const sendMessage = async () => {
    const text = inputMessage.trim()
    if (!text || !activeSessionId) return
    setInputMessage("")
    try {
      await sendMessageToApi(text)
    } catch {
      // Error already surfaced
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      void sendMessage()
    }
  }

  const setActiveSession = (id: string) => {
    setActiveSessionId(id)
    setMobileSidebarOpen(false)
    router.replace(`/chat?sessionId=${id}`)
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const generatePDF = () => {
    setShowMenu(false)
    
    // Create PDF content with branding
    const pdfContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>NexPath.AI - Career Guidance Report</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      line-height: 1.6;
      color: #1a1a2e;
      background: #fff;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 30px;
      border-bottom: 3px solid #e67e22;
      margin-bottom: 40px;
    }
    
    .logo {
      font-size: 28px;
      font-weight: 700;
      color: #1a1a2e;
    }
    
    .logo span {
      color: #e67e22;
    }
    
    .report-info {
      text-align: right;
      font-size: 12px;
      color: #666;
    }
    
    .title {
      font-size: 24px;
      font-weight: 700;
      color: #1a1a2e;
      margin-bottom: 10px;
    }
    
    .subtitle {
      font-size: 14px;
      color: #666;
      margin-bottom: 30px;
    }
    
    .section {
      margin-bottom: 30px;
      page-break-inside: avoid;
    }
    
    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #e67e22;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 1px solid #eee;
    }
    
    .profile-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }
    
    .profile-item {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      border-left: 3px solid #e67e22;
    }
    
    .profile-label {
      font-size: 11px;
      font-weight: 600;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 5px;
    }
    
    .profile-value {
      font-size: 14px;
      color: #1a1a2e;
      font-weight: 500;
    }
    
    .cri-score {
      background: linear-gradient(135deg, #e67e22 0%, #d35400 100%);
      color: white;
      padding: 20px;
      border-radius: 12px;
      text-align: center;
      margin-bottom: 20px;
    }
    
    .cri-score .score {
      font-size: 48px;
      font-weight: 700;
    }
    
    .cri-score .label {
      font-size: 12px;
      opacity: 0.9;
      margin-top: 5px;
    }
    
    .strengths-list {
      list-style: none;
      padding: 0;
    }
    
    .strengths-list li {
      padding: 10px 15px;
      background: #f8f9fa;
      margin-bottom: 8px;
      border-radius: 6px;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .strengths-list li::before {
      content: "✓";
      color: #e67e22;
      font-weight: bold;
    }
    
    .conversation-section {
      margin-top: 30px;
    }
    
    .message {
      margin-bottom: 15px;
      padding: 15px;
      border-radius: 12px;
    }
    
    .message.user {
      background: #e67e22;
      color: white;
      margin-left: 50px;
    }
    
    .message.assistant {
      background: #f0f0f0;
      color: #1a1a2e;
      margin-right: 50px;
    }
    
    .message.system {
      background: linear-gradient(135deg, rgba(230, 126, 34, 0.1) 0%, rgba(230, 126, 34, 0.05) 100%);
      border: 1px solid rgba(230, 126, 34, 0.3);
      color: #1a1a2e;
    }
    
    .message-role {
      font-size: 11px;
      font-weight: 600;
      margin-bottom: 8px;
      opacity: 0.8;
    }
    
    .message-content {
      font-size: 13px;
      line-height: 1.7;
      white-space: pre-wrap;
    }
    
    .message-time {
      font-size: 10px;
      opacity: 0.6;
      margin-top: 8px;
      text-align: right;
    }
    
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      text-align: center;
      font-size: 11px;
      color: #888;
    }
    
    .disclaimer {
      background: #fff9f5;
      border: 1px solid #fde8d8;
      padding: 15px;
      border-radius: 8px;
      margin-top: 30px;
      font-size: 11px;
      color: #666;
    }
    
    .disclaimer-title {
      font-weight: 600;
      color: #e67e22;
      margin-bottom: 5px;
    }
    
    @media print {
      body {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
      .container {
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">NexPath<span>.AI</span></div>
      <div class="report-info">
        <div><strong>Career Guidance Report</strong></div>
        <div>Session: ${activeSession?.title || "Career Session"}</div>
        <div>Generated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
      </div>
    </div>
    
    <h1 class="title">AI Career Mentor Session Report</h1>
    <p class="subtitle">Personalized career guidance powered by psychometric analysis</p>
    
    ${activeSession?.hasAssessment ? `
    <div class="section">
      <h2 class="section-title">Psychometric Profile Summary</h2>
      <p class="subtitle">This session used your psychometric assessment for personalized guidance. See your full report on the Report page.</p>
    </div>
    ` : ""}
    
    <div class="section conversation-section">
      <h2 class="section-title">Conversation History</h2>
      ${(activeSession?.messages ?? []).map((msg: Message) => `
        <div class="message ${msg.role}">
          <div class="message-role">${msg.role === "user" ? "You" : msg.role === "system" ? "Profile Synthesis" : "AI Career Mentor"}</div>
          <div class="message-content">${msg.content.replace(/\*\*/g, "").replace(/\n/g, "<br>")}</div>
          <div class="message-time">${msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${msg.timestamp.toLocaleDateString()}</div>
        </div>
      `).join("") || "<p>No messages in this session.</p>"}
    </div>
    
    <div class="disclaimer">
      <div class="disclaimer-title">Important Disclaimer</div>
      NexPath.AI provides AI-generated career guidance based on your inputs and psychometric data. 
      This report is intended for informational purposes only and should not be considered as professional career counseling. 
      Always verify career decisions with real-world research and consult with qualified career advisors when making important life decisions.
    </div>
    
    <div class="footer">
      <p><strong>NexPath.AI</strong> - Discover Your Career Path</p>
      <p style="margin-top: 5px;">© ${new Date().getFullYear()} NexPath.AI. All rights reserved.</p>
      <p style="margin-top: 10px; font-size: 10px;">This document was automatically generated and contains confidential information.</p>
    </div>
  </div>
</body>
</html>
`

    // Open in new window for printing/saving
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(pdfContent)
      printWindow.document.close()
      printWindow.focus()
      // Auto-trigger print dialog
      setTimeout(() => {
        printWindow.print()
      }, 500)
    }
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:relative z-50 h-full flex flex-col
          bg-sidebar/80 backdrop-blur-xl border-r border-sidebar-border
          transition-all duration-300 ease-in-out
          ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${sidebarOpen ? "w-72" : "w-0 lg:w-16"}
        `}
      >
        {/* Sidebar Header */}
        <div className={`p-4 border-b border-sidebar-border ${!sidebarOpen && "lg:px-2"}`}>
          {sidebarOpen ? (
            <div className="flex items-center justify-between">
              <Link href="/dashboard" className="flex items-center gap-2">
                <span className="text-lg font-bold text-foreground">
                  NexPath<span className="text-primary">.AI</span>
                </span>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="hidden lg:flex p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors"
              >
                <ChevronLeft size={18} className="text-muted-foreground" />
              </button>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="lg:hidden p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors"
              >
                <X size={18} className="text-muted-foreground" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSidebarOpen(true)}
              className="hidden lg:flex w-full justify-center p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors"
            >
              <ChevronRight size={18} className="text-muted-foreground" />
            </button>
          )}
        </div>

        {/* New Session Button */}
        <div className={`p-3 ${!sidebarOpen && "lg:px-2"}`}>
          <Button
            onClick={createNewSession}
            disabled={createSessionLoading}
            className={`
              w-full bg-primary text-primary-foreground hover:bg-primary/90
              font-medium gap-2 transition-all
              ${!sidebarOpen && "lg:px-0 lg:justify-center"}
            `}
          >
            {createSessionLoading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
            {sidebarOpen && <span>{createSessionLoading ? "Creating…" : "New Career Session"}</span>}
          </Button>
        </div>

        {/* Sessions List */}
        {sidebarOpen && (
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`
                  group relative rounded-xl p-3 cursor-pointer
                  transition-all duration-200
                  ${
                    activeSessionId === session.id
                      ? "bg-sidebar-accent border border-primary/30"
                      : "hover:bg-sidebar-accent/50 border border-transparent"
                  }
                `}
                onClick={() => setActiveSession(session.id)}
              >
                {editingSessionId === session.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      className="flex-1 bg-input rounded-lg px-2 py-1 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveSessionTitle()
                        if (e.key === "Escape") setEditingSessionId(null)
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        saveSessionTitle()
                      }}
                      className="p-1 hover:bg-primary/20 rounded"
                    >
                      <Check size={14} className="text-primary" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingSessionId(null)
                      }}
                      className="p-1 hover:bg-destructive/20 rounded"
                    >
                      <X size={14} className="text-destructive" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {session.title}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock size={10} />
                          {formatTime(session.lastUpdated)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            startEditingSession(session.id, session.title)
                          }}
                          className="p-1.5 hover:bg-sidebar-accent rounded-lg transition-colors"
                        >
                          <Pencil size={12} className="text-muted-foreground" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteSession(session.id)
                          }}
                          className="p-1.5 hover:bg-destructive/20 rounded-lg transition-colors"
                        >
                          <Trash2 size={12} className="text-destructive" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Sidebar Footer */}
        {sidebarOpen && (
          <div className="p-4 border-t border-sidebar-border">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ChevronLeft size={16} />
              Back to Dashboard
            </Link>
          </div>
        )}
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/30 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              <Menu size={20} className="text-foreground" />
            </button>
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="hidden lg:flex p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                <Menu size={20} className="text-foreground" />
              </button>
            )}
            <div>
              <h1 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Sparkles size={18} className="text-primary" />
                AI Career Mentor
              </h1>
              <p className="text-xs text-muted-foreground">
                {activeSession?.hasAssessment
                  ? "Using psychometric context"
                  : "Chat-only mode"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-muted-foreground">Online</span>
            </div>
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                <MoreVertical size={18} className="text-muted-foreground" />
              </button>
              
              {/* Dropdown Menu */}
              {showMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-card/95 backdrop-blur-xl border border-border rounded-xl shadow-xl shadow-black/20 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-1">
                    <button
                      onClick={generatePDF}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-foreground hover:bg-secondary rounded-lg transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Download size={16} className="text-primary" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">Download Report</p>
                        <p className="text-xs text-muted-foreground">Save as PDF with branding</p>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false)
                        window.location.href = "/report"
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-foreground hover:bg-secondary rounded-lg transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <FileText size={16} className="text-primary" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">View Full Report</p>
                        <p className="text-xs text-muted-foreground">Detailed career analysis</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {!userId || sessionsLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={32} className="animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">Loading sessions…</span>
              </div>
            ) : !activeSessionId && createSessionLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={32} className="animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">Creating session…</span>
              </div>
            ) : messagesLoading && messages.length === 0 ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={32} className="animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">Loading chat…</span>
              </div>
            ) : messages.length === 0 && !showDomainSelector ? (
              <div className="text-center py-12 px-4">
                <p className="text-muted-foreground mb-2">Welcome to NexPath.AI</p>
                <p className="text-sm text-muted-foreground">Type below to start your career conversation. The AI mentor will use your profile to guide you.</p>
              </div>
            ) : null}
            {activeSession && messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`
                    max-w-[85%] rounded-2xl px-4 py-3
                    ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : message.role === "system"
                        ? "bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 text-foreground"
                        : "bg-card/60 backdrop-blur-sm border border-border/50 text-foreground rounded-bl-md"
                    }
                  `}
                >
                  {message.role !== "user" && (
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/30">
                      {message.role === "system" ? (
                        <>
                          <Brain size={16} className="text-primary" />
                          <span className="text-xs font-medium text-primary">Profile Synthesis</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={16} className="text-primary" />
                          <span className="text-xs font-medium text-muted-foreground">AI Career Mentor</span>
                        </>
                      )}
                    </div>
                  )}
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content.split("\n").map((line, i) => {
                      if (line.startsWith("**") && line.endsWith("**")) {
                        return (
                          <p key={i} className="font-semibold mt-3 mb-1 text-foreground">
                            {line.replace(/\*\*/g, "")}
                          </p>
                        )
                      }
                      if (line.startsWith("- ")) {
                        return (
                          <p key={i} className="ml-3 flex items-start gap-2">
                            <span className="text-primary mt-1.5">-</span>
                            <span>{line.substring(2)}</span>
                          </p>
                        )
                      }
                      return line ? <p key={i}>{line}</p> : <br key={i} />
                    })}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2 text-right">
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}

            {/* Domain Selector Cards */}
            {showDomainSelector && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <p className="text-sm text-muted-foreground mb-4 text-center">
                  Select a career domain to explore:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {careerDomains.map((domain) => (
                    <button
                      key={domain.domain}
                      onClick={() => handleDomainSelect(domain.domain)}
                      className={`
                        p-4 rounded-xl border text-left transition-all duration-300
                        bg-card/40 backdrop-blur-sm hover:bg-card/60
                        hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5
                        hover:-translate-y-0.5
                        ${
                          selectedDomain === domain.domain
                            ? "border-primary bg-primary/10"
                            : "border-border/50"
                        }
                      `}
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-3 text-primary">
                        {domain.icon}
                      </div>
                      <p className="font-medium text-foreground text-sm">{domain.domain}</p>
                      <p className="text-xs text-muted-foreground mt-1">{domain.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Typing Indicator */}
            {isSending && (
              <div className="flex justify-start">
                <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-primary" />
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Suggested Actions */}
        {activeSession && activeSession.messages.length > 0 && !showDomainSelector && !isSending && (
          <div className="px-4 py-2 border-t border-border/30">
            <div className="max-w-3xl mx-auto">
              <div className="flex flex-wrap gap-2">
                {[
                  { icon: <Map size={14} />, text: "Show career roadmap" },
                  { icon: <BookOpen size={14} />, text: "Suggest learning resources" },
                  { icon: <TrendingUp size={14} />, text: "Industry trends" },
                ].map((action) => (
                  <button
                    key={action.text}
                    onClick={() => setInputMessage(action.text)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs
                      bg-secondary/50 border border-border/50 text-muted-foreground
                      hover:bg-secondary hover:text-foreground hover:border-primary/30
                      transition-all duration-200"
                  >
                    {action.icon}
                    {action.text}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Send error */}
        {sendError && (
          <div className="px-4 py-2 bg-destructive/10 border-b border-destructive/30 text-destructive text-sm text-center">
            {sendError}
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t border-border bg-card/30 backdrop-blur-xl">
          <div className="max-w-3xl mx-auto">
            <div className="relative flex items-end gap-3 bg-secondary/30 border border-border/50 rounded-2xl p-2 focus-within:border-primary/50 transition-colors">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Share your thoughts, ask questions, or explore career paths..."
                rows={1}
                className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground
                  resize-none outline-none px-3 py-2 text-sm max-h-32 overflow-y-auto"
                style={{ minHeight: "40px" }}
              />
              <Button
                onClick={() => void sendMessage()}
                disabled={!inputMessage.trim() || isSending || !activeSessionId}
                className="bg-primary text-primary-foreground hover:bg-primary/90
                  rounded-xl h-10 w-10 p-0 flex-shrink-0 transition-all
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground text-center mt-2">
              NexPath.AI provides guidance based on your inputs. Always verify career decisions with real-world research.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
