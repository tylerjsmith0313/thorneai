"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { 
  Send, Mail, User as UserIcon, 
  Loader2, Clock, RefreshCw, Inbox, ArrowUpRight, ArrowDownLeft,
  Paperclip, ChevronDown, ChevronRight
} from "lucide-react"
import type { Contact } from "@/types"

interface EmailMessage {
  id: string
  contact_id: string
  direction: "inbound" | "outbound"
  from_email: string
  to_email: string
  subject: string
  body_plain: string | null
  body_html: string | null
  stripped_text: string | null
  status: string
  attachments: any[] | null
  created_at: string
  received_at: string | null
  sent_at: string | null
}

interface EmailsPanelProps {
  contact: Contact
}

export function EmailsPanel({ contact }: EmailsPanelProps) {
  const [emails, setEmails] = useState<EmailMessage[]>([])
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [showCompose, setShowCompose] = useState(false)
  const [expandedEmails, setExpandedEmails] = useState<Set<string>>(new Set())
  
  // Compose form state
  const [composeSubject, setComposeSubject] = useState("")
  const [composeBody, setComposeBody] = useState("")
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Fetch emails for this contact
  const fetchEmails = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/email/inbox?contactId=${contact.id}`)
      const data = await res.json()
      if (data.emails) {
        setEmails(data.emails)
      }
    } catch (error) {
      console.error("[v0] Error fetching emails:", error)
    } finally {
      setLoading(false)
    }
  }, [contact.id])

  // Initial fetch
  useEffect(() => {
    fetchEmails()
  }, [fetchEmails])

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel(`contact-emails-${contact.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "email_messages",
          filter: `contact_id=eq.${contact.id}`,
        },
        (payload) => {
          const newEmail = payload.new as EmailMessage
          setEmails((prev) => [newEmail, ...prev])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [contact.id, supabase])

  // Send email
  const handleSend = async () => {
    if (!composeSubject.trim() || !composeBody.trim() || sending) return
    if (!contact.email) {
      alert("Contact has no email address")
      return
    }

    setSending(true)

    try {
      const res = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactId: contact.id,
          to: contact.email,
          subject: composeSubject,
          body: composeBody,
        }),
      })

      if (res.ok) {
        setComposeSubject("")
        setComposeBody("")
        setShowCompose(false)
        fetchEmails()
      } else {
        const error = await res.json()
        alert(error.message || "Failed to send email")
      }
    } catch (error) {
      console.error("[v0] Error sending email:", error)
      alert("Failed to send email")
    } finally {
      setSending(false)
    }
  }

  // Reply to email
  const handleReply = (email: EmailMessage) => {
    setComposeSubject(`Re: ${email.subject || "(no subject)"}`)
    setComposeBody(`\n\n---\nOn ${formatFullDate(email.created_at)}, ${email.from_email} wrote:\n\n${email.stripped_text || email.body_plain || ""}`)
    setShowCompose(true)
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

  const formatFullDate = (date: string) => {
    return new Date(date).toLocaleString([], { 
      month: "short", 
      day: "numeric", 
      year: "numeric",
      hour: "2-digit", 
      minute: "2-digit" 
    })
  }

  const toggleEmailExpanded = (emailId: string) => {
    setExpandedEmails(prev => {
      const next = new Set(prev)
      if (next.has(emailId)) {
        next.delete(emailId)
      } else {
        next.add(emailId)
      }
      return next
    })
  }

  const getEmailPreview = (email: EmailMessage) => {
    const text = email.stripped_text || email.body_plain || ""
    return text.substring(0, 100) + (text.length > 100 ? "..." : "")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-indigo-500" size={24} />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <Mail className="text-white" size={16} />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-900">Email History</span>
            <p className="text-[10px] text-slate-500">{emails.length} message{emails.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchEmails}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <RefreshCw size={14} className="text-slate-400" />
          </button>
          <button
            onClick={() => setShowCompose(!showCompose)}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
          >
            <Send size={12} />
            Compose
          </button>
        </div>
      </div>

      {/* Compose form */}
      {showCompose && (
        <div className="p-4 border-b border-slate-200 bg-slate-50 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 w-12">To:</span>
            <span className="text-xs font-medium text-slate-700">{contact.email || "No email"}</span>
          </div>
          <input
            type="text"
            value={composeSubject}
            onChange={(e) => setComposeSubject(e.target.value)}
            placeholder="Subject"
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
          />
          <textarea
            value={composeBody}
            onChange={(e) => setComposeBody(e.target.value)}
            placeholder="Write your message..."
            rows={4}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 resize-none"
          />
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setShowCompose(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={!composeSubject.trim() || !composeBody.trim() || sending}
              className="flex items-center gap-1 px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Send size={12} />
              )}
              Send
            </button>
          </div>
        </div>
      )}

      {/* Email list */}
      {emails.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
            <Inbox className="text-slate-400" size={28} />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 mb-1">No Emails Yet</h3>
          <p className="text-xs text-slate-500 max-w-xs">
            Send the first email to {contact.firstName} or wait for incoming messages.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {emails.map((email) => {
            const isExpanded = expandedEmails.has(email.id)
            const isInbound = email.direction === "inbound"
            
            return (
              <div 
                key={email.id}
                className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
              >
                {/* Email header row */}
                <button
                  onClick={() => toggleEmailExpanded(email.id)}
                  className="w-full p-3 text-left"
                >
                  <div className="flex items-start gap-3">
                    {/* Direction indicator */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isInbound 
                        ? "bg-green-100" 
                        : "bg-blue-100"
                    }`}>
                      {isInbound ? (
                        <ArrowDownLeft size={14} className="text-green-600" />
                      ) : (
                        <ArrowUpRight size={14} className="text-blue-600" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-900 truncate">
                          {email.subject || "(no subject)"}
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          {email.attachments && email.attachments.length > 0 && (
                            <Paperclip size={12} className="text-slate-400" />
                          )}
                          <span className="text-[10px] text-slate-400">
                            {formatDate(email.created_at)} {formatTime(email.created_at)}
                          </span>
                          {isExpanded ? (
                            <ChevronDown size={14} className="text-slate-400" />
                          ) : (
                            <ChevronRight size={14} className="text-slate-400" />
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                          isInbound 
                            ? "bg-green-100 text-green-700" 
                            : "bg-blue-100 text-blue-700"
                        }`}>
                          {isInbound ? "Received" : "Sent"}
                        </span>
                        <span className="text-[10px] text-slate-500 truncate">
                          {isInbound ? `From: ${email.from_email}` : `To: ${email.to_email}`}
                        </span>
                      </div>
                      
                      {!isExpanded && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                          {getEmailPreview(email)}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
                
                {/* Expanded email content */}
                {isExpanded && (
                  <div className="px-3 pb-3 pl-14">
                    <div className="bg-white border border-slate-200 rounded-lg p-4">
                      <div className="text-xs text-slate-500 mb-3 space-y-1">
                        <div><span className="font-medium">From:</span> {email.from_email}</div>
                        <div><span className="font-medium">To:</span> {email.to_email}</div>
                        <div><span className="font-medium">Date:</span> {formatFullDate(email.created_at)}</div>
                        {email.status && (
                          <div><span className="font-medium">Status:</span> {email.status}</div>
                        )}
                      </div>
                      
                      <div className="prose prose-sm max-w-none text-slate-700 text-xs leading-relaxed whitespace-pre-wrap">
                        {email.stripped_text || email.body_plain || "(no content)"}
                      </div>
                      
                      {isInbound && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleReply(email)
                          }}
                          className="mt-4 flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-200 transition-colors"
                        >
                          <Send size={12} />
                          Reply
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  )
}
