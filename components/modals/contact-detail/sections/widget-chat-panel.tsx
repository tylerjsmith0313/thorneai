"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { 
  Send, MessageCircle, User as UserIcon, 
  Loader2, Bot, Clock, ExternalLink, RefreshCw
} from "lucide-react"
import type { Contact } from "@/types"

interface WidgetSession {
  id: string
  chatbot_id: string
  visitor_name: string | null
  visitor_email: string | null
  source_url: string | null
  status: string
  unread_count: number
  last_message_at: string
  created_at: string
  widget_chatbots?: {
    name: string
    theme_color: string
  }
}

interface WidgetMessage {
  id: string
  session_id: string
  sender_type: "visitor" | "agent" | "ai"
  content: string
  is_read: boolean
  created_at: string
}

interface WidgetChatPanelProps {
  contact: Contact
}

export function WidgetChatPanel({ contact }: WidgetChatPanelProps) {
  const [sessions, setSessions] = useState<WidgetSession[]>([])
  const [selectedSession, setSelectedSession] = useState<WidgetSession | null>(null)
  const [messages, setMessages] = useState<WidgetMessage[]>([])
  const [inputValue, setInputValue] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Fetch sessions for this contact
  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch(`/api/widget/sessions?contactId=${contact.id}`)
      const data = await res.json()
      if (data.sessions) {
        setSessions(data.sessions)
        // Auto-select first session if none selected
        if (!selectedSession && data.sessions.length > 0) {
          setSelectedSession(data.sessions[0])
        }
      }
    } catch (error) {
      console.error("[v0] Error fetching sessions:", error)
    } finally {
      setLoading(false)
    }
  }, [contact.id, selectedSession])

  // Fetch messages for selected session
  const fetchMessages = useCallback(async () => {
    if (!selectedSession) return
    
    try {
      const res = await fetch(`/api/widget/message?sessionId=${selectedSession.id}`)
      const data = await res.json()
      if (data.messages) {
        setMessages(data.messages)
      }
    } catch (error) {
      console.error("[v0] Error fetching messages:", error)
    }
  }, [selectedSession])

  // Initial fetch
  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  // Fetch messages when session changes
  useEffect(() => {
    if (selectedSession) {
      fetchMessages()
      
      // Mark session as read
      fetch("/api/widget/sessions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: selectedSession.id, unreadCount: 0 }),
      })
    }
  }, [selectedSession, fetchMessages])

  // Subscribe to real-time updates
  useEffect(() => {
    if (!selectedSession) return

    const channel = supabase
      .channel(`widget-messages-${selectedSession.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "widget_messages",
          filter: `session_id=eq.${selectedSession.id}`,
        },
        (payload) => {
          const newMessage = payload.new as WidgetMessage
          setMessages((prev) => [...prev, newMessage])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedSession, supabase])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Send reply
  const handleSend = async () => {
    if (!inputValue.trim() || !selectedSession || sending) return

    const messageContent = inputValue.trim()
    setInputValue("")
    setSending(true)

    try {
      await fetch("/api/widget/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: selectedSession.id,
          message: messageContent,
          senderType: "agent",
        }),
      })
    } catch (error) {
      console.error("[v0] Error sending reply:", error)
      setInputValue(messageContent) // Restore message on error
    } finally {
      setSending(false)
    }
  }

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatDate = (date: string) => {
    const d = new Date(date)
    const today = new Date()
    if (d.toDateString() === today.toDateString()) {
      return "Today"
    }
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    if (d.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    }
    return d.toLocaleDateString([], { month: "short", day: "numeric" })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-indigo-500" size={24} />
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center px-6">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
          <MessageCircle className="text-slate-400" size={28} />
        </div>
        <h3 className="text-sm font-semibold text-slate-900 mb-1">No Widget Chats Yet</h3>
        <p className="text-xs text-slate-500 max-w-xs">
          When {contact.firstName} chats through your website widget, conversations will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-[400px] bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Sessions sidebar */}
      <div className="w-48 border-r border-slate-200 flex flex-col">
        <div className="p-3 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Conversations</span>
            <button 
              onClick={fetchSessions}
              className="p-1 hover:bg-slate-100 rounded transition-colors"
            >
              <RefreshCw size={12} className="text-slate-400" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => setSelectedSession(session)}
              className={`w-full p-3 text-left border-b border-slate-50 hover:bg-slate-50 transition-colors ${
                selectedSession?.id === session.id ? "bg-indigo-50" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: session.widget_chatbots?.theme_color || "#6366f1" }}
                />
                <span className="text-xs font-medium text-slate-900 truncate flex-1">
                  {session.widget_chatbots?.name || "Widget"}
                </span>
                {session.unread_count > 0 && (
                  <span className="w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {session.unread_count}
                  </span>
                )}
              </div>
              <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                <Clock size={10} />
                {formatDate(session.last_message_at)}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {selectedSession ? (
          <>
            {/* Chat header */}
            <div className="p-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: selectedSession.widget_chatbots?.theme_color || "#6366f1" }}
                >
                  <MessageCircle className="text-white" size={16} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900">
                    {selectedSession.widget_chatbots?.name || "Widget Chat"}
                  </div>
                  {selectedSession.source_url && (
                    <a 
                      href={selectedSession.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-indigo-500 hover:underline flex items-center gap-1"
                    >
                      <ExternalLink size={8} />
                      {new URL(selectedSession.source_url).hostname}
                    </a>
                  )}
                </div>
              </div>
              <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${
                selectedSession.status === "active" 
                  ? "bg-green-100 text-green-700" 
                  : "bg-slate-100 text-slate-600"
              }`}>
                {selectedSession.status}
              </span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50/50">
              {messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={`flex ${msg.sender_type === "visitor" ? "justify-start" : "justify-end"}`}
                >
                  <div className={`flex items-end gap-2 max-w-[80%] ${
                    msg.sender_type === "visitor" ? "" : "flex-row-reverse"
                  }`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                      msg.sender_type === "visitor"
                        ? "bg-slate-200"
                        : msg.sender_type === "ai"
                          ? "bg-gradient-to-br from-indigo-500 to-purple-600"
                          : "bg-emerald-500"
                    }`}>
                      {msg.sender_type === "visitor" ? (
                        <UserIcon size={12} className="text-slate-600" />
                      ) : msg.sender_type === "ai" ? (
                        <Bot size={12} className="text-white" />
                      ) : (
                        <UserIcon size={12} className="text-white" />
                      )}
                    </div>
                    <div className={`rounded-2xl px-3 py-2 ${
                      msg.sender_type === "visitor"
                        ? "bg-white border border-slate-200 text-slate-700 rounded-bl-sm"
                        : msg.sender_type === "ai"
                          ? "bg-indigo-600 text-white rounded-br-sm"
                          : "bg-emerald-600 text-white rounded-br-sm"
                    }`}>
                      <p className="text-xs leading-relaxed">{msg.content}</p>
                      <span className={`text-[9px] mt-1 block ${
                        msg.sender_type === "visitor" ? "text-slate-400" : "text-white/70"
                      }`}>
                        {formatTime(msg.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-slate-100 bg-white">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  placeholder="Type a reply..."
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all"
                  disabled={sending}
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || sending}
                  className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
            Select a conversation
          </div>
        )}
      </div>
    </div>
  )
}
