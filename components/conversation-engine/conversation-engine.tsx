"use client"

import { useState, useEffect } from "react"
import { 
  MessageSquare, Search, Filter, User, Zap, Sparkles, Send, 
  Paperclip, Mail, MessageCircle, Linkedin, Phone, X,
  ChevronDown, Clock, Activity, Flame, FileText, Calendar, Gift
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"
import type { Contact } from "@/types"

type ChannelType = "email" | "sms" | "linkedin" | "whatsapp" | "phone"
type FilterType = "all" | "flow-active" | "flow-deactivated" | "awaiting-reply"

interface Thread {
  id: string
  contact: Contact
  channel: ChannelType
  lastMessage: string
  timestamp: string
  unread: number
  flowActive: boolean
  awaitingReply: boolean
}

interface Message {
  id: string
  content: string
  sender: "user" | "contact" | "system"
  timestamp: string
  type?: "phone-transcription"
}

const CHANNEL_ICONS: Record<ChannelType, typeof Mail> = {
  email: Mail,
  sms: MessageCircle,
  linkedin: Linkedin,
  whatsapp: MessageCircle,
  phone: Phone,
}

const CHANNEL_COLORS: Record<ChannelType, string> = {
  email: "text-indigo-500",
  sms: "text-emerald-500",
  linkedin: "text-blue-600",
  whatsapp: "text-green-500",
  phone: "text-amber-500",
}

const QUICK_REPLIES = [
  { id: "growth", label: "GROWTH BOOST", color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  { id: "value", label: "VALUE-FIRST", color: "bg-blue-50 text-blue-600 border-blue-100" },
  { id: "inquiry", label: "DIRECT INQUIRY", color: "bg-indigo-50 text-indigo-600 border-indigo-100" },
  { id: "social", label: "SOCIAL PROOF", color: "bg-amber-50 text-amber-600 border-amber-100" },
]

const TACTICAL_ACTIONS = [
  { id: "case-study", label: "Send Case Study", icon: FileText },
  { id: "discovery", label: "Propose Discovery Call", icon: Calendar },
  { id: "gift", label: "Send Custom Gift", icon: Gift },
]

export function ConversationEngine() {
  const supabase = createClient()
  const [threads, setThreads] = useState<Thread[]>([])
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [draftMessage, setDraftMessage] = useState("")
  const [filter, setFilter] = useState<FilterType>("all")
  const [showFilter, setShowFilter] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isFlowMode, setIsFlowMode] = useState(true)
  const [aiInsight, setAiInsight] = useState("")
  const [sentiment, setSentiment] = useState("Neutral")
  const [heat, setHeat] = useState(88)

  // Load threads from contacts
  useEffect(() => {
    async function loadThreads() {
      const { data: contacts } = await supabase
        .from("contacts")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(20)

      if (contacts) {
        const mockThreads: Thread[] = contacts.map((contact, i) => ({
          id: contact.id,
          contact: contact as Contact,
          channel: (["email", "sms", "linkedin", "whatsapp"][i % 4]) as ChannelType,
          lastMessage: `"${contact.first_name ? `Looking forward to the pr...` : "Great, thanks for the upda..."}"`,
          timestamp: "2m ago",
          unread: i < 2 ? i + 1 : 0,
          flowActive: i % 3 !== 2,
          awaitingReply: i % 4 === 0,
        }))
        setThreads(mockThreads)
      }
    }
    loadThreads()
  }, [])

  // Filter threads
  const filteredThreads = threads.filter(thread => {
    if (filter === "flow-active" && !thread.flowActive) return false
    if (filter === "flow-deactivated" && thread.flowActive) return false
    if (filter === "awaiting-reply" && !thread.awaitingReply) return false
    if (searchQuery) {
      const name = `${thread.contact.first_name} ${thread.contact.last_name}`.toLowerCase()
      if (!name.includes(searchQuery.toLowerCase())) return false
    }
    return true
  })

  // Load messages when thread selected
  useEffect(() => {
    if (selectedThread) {
      setMessages([
        {
          id: "1",
          content: `Connection established with ${selectedThread.contact.first_name} ${selectedThread.contact.last_name}. I am monitoring this node for engagement signals.`,
          sender: "system",
          timestamp: "System"
        }
      ])
      setAiInsight(`The message provided is empty, making it impossible to determine sentiment or provide tactical sales advice.`)
    }
  }, [selectedThread])

  const sendMessage = () => {
    if (!draftMessage.trim() || !selectedThread) return
    
    const newMessage: Message = {
      id: Date.now().toString(),
      content: draftMessage,
      sender: "user",
      timestamp: "Just now"
    }
    setMessages([...messages, newMessage])
    setDraftMessage("")
  }

  const getInitials = (contact: Contact) => {
    return `${contact.first_name?.[0] || ""}${contact.last_name?.[0] || ""}`.toUpperCase()
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Conversation Engine</h2>
            <p className="text-xs text-slate-500">Multi-channel engagement hub with AI tactical assistance.</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Threads Panel */}
        <div className="w-72 border-r border-slate-100 flex flex-col bg-slate-50/50">
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Threads</h3>
              <div className="relative">
                <button 
                  onClick={() => setShowFilter(!showFilter)}
                  className={`p-2 rounded-lg transition-all ${showFilter ? "bg-indigo-100 text-indigo-600" : "bg-white text-slate-400 hover:text-slate-600"} border border-slate-200`}
                >
                  <Filter size={14} />
                </button>
                
                {showFilter && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-10">
                    {[
                      { id: "all", label: "All Conversations", icon: null },
                      { id: "flow-active", label: "Flow Active", icon: <Zap size={12} className="text-emerald-500" /> },
                      { id: "flow-deactivated", label: "Flow De-activated", icon: <X size={12} className="text-rose-500" /> },
                      { id: "awaiting-reply", label: "Awaiting Reply", icon: <Clock size={12} className="text-amber-500" /> },
                    ].map(item => (
                      <button
                        key={item.id}
                        onClick={() => { setFilter(item.id as FilterType); setShowFilter(false) }}
                        className={`w-full px-4 py-2 text-left text-xs flex items-center gap-2 hover:bg-slate-50 ${filter === item.id ? "text-indigo-600 font-bold" : "text-slate-600"}`}
                      >
                        {item.icon}
                        {item.label}
                        {filter === item.id && <span className="ml-auto text-indigo-600">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search threads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-300"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredThreads.map((thread) => {
              const ChannelIcon = CHANNEL_ICONS[thread.channel]
              return (
                <button
                  key={thread.id}
                  onClick={() => setSelectedThread(thread)}
                  className={`w-full p-4 border-b border-slate-100 text-left hover:bg-white transition-all ${selectedThread?.id === thread.id ? "bg-white shadow-sm" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                        <AvatarFallback className="bg-indigo-100 text-indigo-600 text-xs font-bold">
                          {getInitials(thread.contact)}
                        </AvatarFallback>
                      </Avatar>
                      {thread.unread > 0 && (
                        <span className="absolute -top-1 -left-1 w-5 h-5 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                          {thread.unread}
                        </span>
                      )}
                      {thread.flowActive && (
                        <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                          <Zap size={10} className="text-white" />
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-900">
                          {thread.contact.first_name} {thread.contact.last_name}
                        </span>
                        <ChannelIcon size={12} className={CHANNEL_COLORS[thread.channel]} />
                      </div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wide mt-0.5">{thread.channel}</p>
                      <p className="text-xs text-slate-500 truncate mt-1">{thread.lastMessage}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Chat Panel */}
        <div className="flex-1 flex flex-col">
          {selectedThread ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="w-10 h-10 bg-indigo-600 text-white">
                    <AvatarFallback>{getInitials(selectedThread.contact)}</AvatarFallback>
                  </Avatar>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium flex items-center gap-1.5">
                      <User size={12} />
                      User
                    </button>
                    <button 
                      onClick={() => setIsFlowMode(!isFlowMode)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${isFlowMode ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"}`}
                    >
                      <Zap size={12} />
                      Flow
                    </button>
                  </div>
                </div>
                <button className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Sparkles size={16} />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : msg.sender === "system" ? "justify-center" : "justify-start"}`}>
                    {msg.sender === "system" ? (
                      <div className="flex items-start gap-3 max-w-md">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                          <Activity size={14} className="text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">{msg.content}</p>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">{msg.timestamp}</p>
                        </div>
                      </div>
                    ) : msg.type === "phone-transcription" ? (
                      <div className="space-y-1">
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider text-right flex items-center gap-1 justify-end">
                          <Phone size={10} />
                          Phone Transcription
                        </p>
                        <div className="bg-indigo-600 text-white rounded-2xl rounded-br-sm px-4 py-3 max-w-sm">
                          <p className="text-sm">{msg.content}</p>
                        </div>
                        <p className="text-[10px] text-slate-400 text-right">{msg.timestamp}</p>
                      </div>
                    ) : msg.sender === "user" ? (
                      <div className="space-y-1">
                        <div className="bg-indigo-600 text-white rounded-2xl rounded-br-sm px-4 py-3 max-w-sm">
                          <p className="text-sm">{msg.content}</p>
                        </div>
                        <p className="text-[10px] text-slate-400 text-right">{msg.timestamp}</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="bg-slate-100 text-slate-900 rounded-2xl rounded-bl-sm px-4 py-3 max-w-sm">
                          <p className="text-sm">{msg.content}</p>
                        </div>
                        <p className="text-[10px] text-slate-400">{msg.timestamp}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Draft Interface */}
              <div className="p-4 border-t border-slate-100">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={12} className="text-indigo-500" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Neural Draft Interface</span>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4">
                  <textarea
                    value={draftMessage}
                    onChange={(e) => setDraftMessage(e.target.value)}
                    placeholder={`Draft a reply to ${selectedThread.contact.first_name}...`}
                    className="w-full bg-transparent text-sm outline-none resize-none min-h-[60px]"
                  />
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200">
                    <button className="p-2 text-slate-400 hover:text-slate-600">
                      <Paperclip size={16} />
                    </button>
                    <div className="flex items-center gap-2">
                      <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-50">
                        <Sparkles size={14} />
                        Thorne Draft
                      </button>
                      <button 
                        onClick={sendMessage}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-indigo-500"
                      >
                        <Send size={14} />
                        Send Node
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare size={32} className="text-slate-400" />
                </div>
                <p className="text-sm text-slate-500">Select a thread to start messaging</p>
              </div>
            </div>
          )}
        </div>

        {/* AI Sidebar */}
        {selectedThread && (
          <div className="w-72 border-l border-slate-100 p-4 overflow-y-auto bg-slate-50/50">
            {/* Quick Replies */}
            <div className="mb-6">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Tactical Quick Replies</h4>
              <div className="space-y-2">
                {QUICK_REPLIES.map((reply) => (
                  <button
                    key={reply.id}
                    className={`w-full p-3 rounded-xl border text-left transition-all hover:shadow-sm ${reply.color}`}
                  >
                    <span className="text-[9px] font-bold uppercase tracking-wider">{reply.label}</span>
                    <p className="text-xs mt-1 opacity-80">
                      "Hi {selectedThread.contact.first_name}, I've been following {selectedThread.contact.company || "your company"}'s recent progress and I'm..."
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Neural Intelligence Node */}
            <div className="mb-6">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Neural Intelligence Node</h4>
              <div className="bg-slate-900 rounded-2xl p-4 text-white">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={14} className="text-indigo-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">Live Insight</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{aiInsight}</p>
                <div className="flex gap-4 mt-4 pt-3 border-t border-slate-700">
                  <div>
                    <p className="text-[9px] text-slate-500 uppercase">Sentiment</p>
                    <p className="text-xs font-bold text-indigo-300">{sentiment}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-500 uppercase">Heat</p>
                    <p className="text-xs font-bold text-emerald-400">{heat}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* System Context */}
            <div className="mb-6">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">System Context</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Flame size={12} className="text-slate-400" />
                    <span className="text-xs text-slate-600">Persona</span>
                  </div>
                  <span className="text-xs font-bold text-rose-500">Hot</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Activity size={12} className="text-slate-400" />
                    <span className="text-xs text-slate-600">Node Integrity</span>
                  </div>
                  <span className="text-xs font-bold text-slate-900">99.8%</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <Clock size={12} className="text-slate-400" />
                    <span className="text-xs text-slate-600">Last Touch</span>
                  </div>
                  <span className="text-xs font-bold text-slate-900">10m ago</span>
                </div>
              </div>
            </div>

            {/* Tactical Actions */}
            <div>
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Tactical Actions</h4>
              <div className="space-y-2">
                {TACTICAL_ACTIONS.map((action) => (
                  <button
                    key={action.id}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-left flex items-center gap-3 hover:border-indigo-300 hover:shadow-sm transition-all"
                  >
                    <action.icon size={16} className="text-slate-400" />
                    <span className="text-xs font-medium text-slate-700">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
