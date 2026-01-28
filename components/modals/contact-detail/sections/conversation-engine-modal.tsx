"use client"

import { useState, useEffect } from "react"
import { 
  Send, Zap, User, Sparkles, Settings, 
  Paperclip, FileText, Calendar, Gift,
  Loader2, Activity, X, Phone
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { communicationManager } from "@/lib/services/communication-manager"
import type { Contact } from "@/types"

interface ConversationEngineModalProps {
  contact: Contact
  onClose: () => void
}

interface Message {
  id: string
  type: "ai" | "user" | "system" | "transcription"
  content: string
  timestamp: string
}

export function ConversationEngineModal({ contact, onClose }: ConversationEngineModalProps) {
  const [mode, setMode] = useState<"user" | "flow">("flow")
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [aiInsight, setAiInsight] = useState<string | null>(null)
  
  const supabase = createClient()

  // Load email conversations for this contact only
  useEffect(() => {
    async function loadEmailConversations() {
      setIsLoading(true)
      
      // Get email conversations from contact_communications table
      const { data: communications } = await supabase
        .from("contact_communications")
        .select("*")
        .eq("contact_id", contact.id)
        .eq("channel", "email")
        .order("created_at", { ascending: true })

      if (communications && communications.length > 0) {
        const loadedMessages: Message[] = communications.map(comm => ({
          id: comm.id,
          type: comm.direction === "inbound" ? "user" : "ai",
          content: comm.content,
          timestamp: formatTimestamp(comm.created_at)
        }))
        setMessages(loadedMessages)
      } else {
        // Default welcome message
        setMessages([{
          id: "system-1",
          type: "system",
          content: `Connection established with ${contact.firstName} ${contact.lastName}. I am monitoring this node for engagement signals.`,
          timestamp: "Just now"
        }])
      }

      // Generate AI insight based on contact data
      generateAiInsight()
      setIsLoading(false)
    }

    loadEmailConversations()
  }, [contact.id, contact.firstName, contact.lastName])

  function formatTimestamp(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return `${Math.floor(diffMins / 1440)}d ago`
  }

  function generateAiInsight() {
    const insights = [
      `"AgyntSynq is currently drafting a reply that leverages the 'Q2 Onboarding' node. Recommended: Schedule call for tomorrow 2PM."`,
      `"Based on ${contact.firstName}'s engagement pattern, optimal outreach window is Tuesday-Thursday, 10AM-2PM."`,
      `"${contact.company} recently announced expansion. Consider positioning value prop around scalability."`,
    ]
    setAiInsight(insights[Math.floor(Math.random() * insights.length)])
  }

  const handleSend = async () => {
    if (!message.trim() || isSending) return
    setIsSending(true)

    try {
      await communicationManager.sendMessage(contact.id, "email", message)
      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}`,
        type: "ai",
        content: message,
        timestamp: "Just now"
      }])
      setMessage("")
    } catch (error) {
      console.error("Failed to send message:", error)
    } finally {
      setIsSending(false)
    }
  }

  const handleAgyntDraft = async () => {
    setIsSending(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const drafts = [
      `Hi ${contact.firstName}, I've been following ${contact.company}'s recent progress and I'm impressed by your growth trajectory. I wanted to share some insights that might be valuable...`,
      `Hi ${contact.firstName}, since you've expressed interest in our platform recently, I wanted to reach out with a brief analysis on industry trends that I think you'll find interesting.`,
      `Hi ${contact.firstName}, I noticed you were looking into our solutions and wanted to share some relevant case studies from similar companies in the ${contact.industry || "tech"} space.`
    ]
    
    setMessage(drafts[Math.floor(Math.random() * drafts.length)])
    setIsSending(false)
  }

  const handleTacticalAction = async (action: string) => {
    setIsSending(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    let actionMessage = ""
    switch (action) {
      case "case-study":
        actionMessage = `Hi ${contact.firstName}, I thought you might find this case study relevant to ${contact.company}'s current initiatives. It covers how similar organizations achieved 40% efficiency gains...`
        break
      case "discovery":
        actionMessage = `Hi ${contact.firstName}, I'd love to schedule a quick discovery call to better understand ${contact.company}'s goals. Would you be available for a 30-minute chat this week?`
        break
      case "gift":
        actionMessage = `Hi ${contact.firstName}, I wanted to send you a small token of appreciation for your time. Please check your email for a gift card...`
        break
    }
    
    setMessage(actionMessage)
    setIsSending(false)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-5xl h-[85vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-600 to-violet-600">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Sparkles className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-sm font-black text-white tracking-tight">AGYNTSYNQ CONVERSATION ENGINE</h2>
              <p className="text-[10px] text-indigo-200">
                Multi-channel engagement for {contact.firstName} {contact.lastName}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-white/20 rounded-full text-white hover:bg-white/30 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Chat */}
          <div className="flex-1 flex flex-col border-r border-slate-100">
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <Sparkles className="text-indigo-600" size={20} />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900 tracking-tight">CONVERSATION ENGINE</h2>
                  <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    Active Intelligence: {contact.firstName} {contact.lastName}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Mode Toggle */}
                <div className="flex items-center bg-slate-100 rounded-full p-0.5">
                  <button
                    onClick={() => setMode("user")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all ${
                      mode === "user" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                    }`}
                  >
                    <User size={12} />
                    User
                  </button>
                  <button
                    onClick={() => setMode("flow")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all ${
                      mode === "flow" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500"
                    }`}
                  >
                    <Zap size={12} />
                    Flow
                  </button>
                </div>
                
                <button className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors">
                  <Settings size={16} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="animate-spin text-indigo-500" size={24} />
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.type === "user" || msg.type === "transcription" ? "justify-end" : "justify-start"}`}>
                    {msg.type === "system" ? (
                      <div className="flex items-start gap-2 max-w-sm">
                        <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                          <Activity className="text-emerald-600" size={12} />
                        </div>
                        <div>
                          <p className="text-xs text-slate-600">{msg.content}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">System</p>
                        </div>
                      </div>
                    ) : msg.type === "transcription" ? (
                      <div className="max-w-xs">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1 justify-end">
                          <Phone size={10} />
                          Phone Transcription
                        </p>
                        <div className="bg-indigo-600 text-white rounded-2xl rounded-br-sm px-3 py-2 text-xs">
                          {msg.content}
                        </div>
                        <p className="text-[9px] text-slate-400 mt-1 text-right">{msg.timestamp}</p>
                      </div>
                    ) : msg.type === "ai" ? (
                      <div className="flex items-start gap-2 max-w-sm">
                        <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                          <Activity className="text-indigo-600" size={12} />
                        </div>
                        <div>
                          <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-3 py-2 text-xs text-slate-700">
                            {msg.content}
                          </div>
                          <p className="text-[9px] text-rose-500 font-bold mt-1">{msg.timestamp}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="max-w-xs">
                        <div className="bg-indigo-600 text-white rounded-2xl rounded-br-sm px-3 py-2 text-xs">
                          {msg.content}
                        </div>
                        <p className="text-[9px] text-slate-400 mt-1 text-right">{msg.timestamp}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-100 bg-white">
              <div className="bg-slate-50 rounded-xl p-3">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`Reply to ${contact.firstName}...`}
                  className="w-full bg-transparent text-xs resize-none outline-none min-h-[50px]"
                  disabled={isSending}
                />
                <div className="flex items-center justify-between mt-2">
                  <button className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors">
                    <Paperclip size={14} />
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleAgyntDraft}
                      disabled={isSending}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[9px] font-bold uppercase tracking-wider text-slate-600 hover:border-indigo-300 transition-all disabled:opacity-50"
                    >
                      <Zap size={12} className="text-indigo-500" />
                      Agynt Draft
                    </button>
                    <button
                      onClick={handleSend}
                      disabled={!message.trim() || isSending}
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-[9px] font-bold uppercase tracking-wider hover:bg-indigo-700 transition-all disabled:opacity-50"
                    >
                      {isSending ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Intel & Context */}
          <div className="w-72 flex flex-col gap-4 p-4 overflow-y-auto bg-slate-50/50">
            {/* AgyntSynq Real-Time Intel */}
            <div className="bg-white rounded-[24px] border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="text-indigo-500" size={14} />
                <h3 className="text-[9px] font-black text-slate-900 uppercase tracking-widest">AgyntSynq Real-Time Intel</h3>
              </div>
              
              <div className="bg-slate-800 rounded-xl p-3">
                <p className="text-[10px] text-slate-300 italic leading-relaxed">
                  {aiInsight}
                </p>
              </div>
            </div>

            {/* Contact Profile Context */}
            <div className="bg-white rounded-[24px] border border-slate-200 p-4">
              <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Contact Profile Context</h3>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Industry</span>
                  <span className="text-[10px] font-medium text-slate-900">{contact.industry || "SaaS Architecture"}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Interests</span>
                  <span className="text-[10px] font-medium text-slate-900 text-right">{contact.interests?.join(", ") || "Golf, Tech Investing"}</span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Demeanor</span>
                  <span className="text-[10px] font-medium text-slate-900">{contact.demeanor || "Analytical"}</span>
                </div>
              </div>
            </div>

            {/* Tactical Actions */}
            <div className="bg-white rounded-[24px] border border-slate-200 p-4">
              <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Tactical Actions</h3>
              
              <div className="space-y-2">
                <button
                  onClick={() => handleTacticalAction("case-study")}
                  disabled={isSending}
                  className="w-full flex items-center gap-2 px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-medium text-slate-700 hover:border-indigo-200 hover:bg-indigo-50 transition-all disabled:opacity-50"
                >
                  <FileText size={14} className="text-slate-400" />
                  Send Case Study
                </button>
                <button
                  onClick={() => handleTacticalAction("discovery")}
                  disabled={isSending}
                  className="w-full flex items-center gap-2 px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-medium text-slate-700 hover:border-indigo-200 hover:bg-indigo-50 transition-all disabled:opacity-50"
                >
                  <Calendar size={14} className="text-slate-400" />
                  Propose Discovery Call
                </button>
                <button
                  onClick={() => handleTacticalAction("gift")}
                  disabled={isSending}
                  className="w-full flex items-center gap-2 px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-medium text-slate-700 hover:border-indigo-200 hover:bg-indigo-50 transition-all disabled:opacity-50"
                >
                  <Gift size={14} className="text-slate-400" />
                  Send Custom Gift
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
