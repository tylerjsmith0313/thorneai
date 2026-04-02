"use client"

import { useState, useEffect, useRef } from "react"
import {
  MessageSquare,
  Filter,
  Search,
  Zap,
  Sparkles,
  Send,
  EllipsisVertical,
  Mic,
  RefreshCw,
  Mail,
  Phone,
  MessageCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import type { Conversation, Message, Contact } from "@/lib/database.types"
import {
  getConversations,
  getMessages,
  createMessage,
  markMessagesAsRead,
  getContactById,
} from "@/lib/data-access"

type ConversationWithContact = Conversation & {
  contacts?: { first_name: string; last_name: string; email: string; company: string } | null
}

interface TacticalSuggestion {
  tone: string
  label: string
  response: string
}

export function ConversationEngine() {
  const [conversations, setConversations] = useState<ConversationWithContact[]>([])
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithContact | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [contact, setContact] = useState<Contact | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [flowMode, setFlowMode] = useState(true)
  const [replyText, setReplyText] = useState("")
  const [sentimentScore, setSentimentScore] = useState<"POSITIVE" | "NEUTRAL" | "NEGATIVE">("NEUTRAL")
  const [aiAnalysis, setAiAnalysis] = useState("")
  const [tacticalSuggestions, setTacticalSuggestions] = useState<TacticalSuggestion[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch conversations from Supabase
  useEffect(() => {
    async function loadConversations() {
      setIsLoading(true)
      try {
        const data = await getConversations()
        setConversations(data)
        if (data.length > 0 && !selectedConversation) {
          setSelectedConversation(data[0])
        }
      } catch (error) {
        console.error("[v0] Error loading conversations:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadConversations()
  }, [])

  // Fetch messages when conversation changes
  useEffect(() => {
    async function loadMessages() {
      if (!selectedConversation) return
      try {
        const msgs = await getMessages(selectedConversation.id)
        setMessages(msgs)
        await markMessagesAsRead(selectedConversation.id)
        
        // Load contact details
        const contactData = await getContactById(selectedConversation.contact_id)
        setContact(contactData)
        
        // Generate AI analysis based on messages
        generateAiAnalysis(msgs)
      } catch (error) {
        console.error("[v0] Error loading messages:", error)
      }
    }
    loadMessages()
  }, [selectedConversation])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const generateAiAnalysis = (msgs: Message[]) => {
    // Simulated AI analysis based on message content
    const lastContactMsg = msgs.filter(m => m.sender_type === "contact").pop()
    
    if (lastContactMsg?.content.toLowerCase().includes("budget")) {
      setSentimentScore("NEUTRAL")
      setAiAnalysis("The salesperson has identified a financial barrier but proactively suggested a phased roll-out; the manager should validate if this structure preserves the long-term deal value while meeting the client's current budget.")
      setTacticalSuggestions([
        {
          tone: "CONSULTATIVE & PROFESSIONAL",
          label: "Consultative",
          response: `"I understand that Q2 budgets can be tight. A phased approach would allow us to begin the core implementation now while deferring the remaining costs to Q3. Would you be open to reviewing a revised timeline that aligns with your fiscal constraints?"`
        },
        {
          tone: "CASUAL & HIGH-TOUCH",
          label: "Casual",
          response: `"Totally get the Q2 budget crunch. We're happy to be flexible to make this work for ${contact?.company || 'your team'}. How about we hop on a quick 5-minute call to figure out a rollout plan that fits your current numbers?"`
        },
        {
          tone: "DIRECT & ACTION-ORIENTED",
          label: "Direct",
          response: `"Let's pivot to a phased implementation. I can send over a revised proposal today that splits the project into two milestones, keeping the initial investment within your Q2 budget."`
        }
      ])
    } else {
      setSentimentScore("POSITIVE")
      setAiAnalysis("Contact is engaged and responsive. Thorne recommends maintaining momentum with a clear next step to advance the conversation toward a meeting or proposal.")
      setTacticalSuggestions([
        {
          tone: "CONSULTATIVE & PROFESSIONAL",
          label: "Consultative",
          response: `"Thank you for your continued interest. I'd like to schedule a brief call to discuss how we can best support your goals. Would Thursday at 2 PM work for you?"`
        },
        {
          tone: "CASUAL & HIGH-TOUCH",
          label: "Casual",
          response: `"Great chatting with you! Let's find a time to connect this week. I have some ideas that I think you'll find valuable."`
        },
        {
          tone: "DIRECT & ACTION-ORIENTED",
          label: "Direct",
          response: `"I'll send over a proposal draft by EOD. Let me know if you have 15 minutes tomorrow to walk through the key points."`
        }
      ])
    }
  }

  const handleSendMessage = async () => {
    if (!replyText.trim() || !selectedConversation) return

    try {
      const newMessage = await createMessage({
        conversation_id: selectedConversation.id,
        sender_type: "user",
        content: replyText,
        message_type: selectedConversation.channel.toLowerCase() as "email" | "sms",
        is_read: true,
      })
      
      setMessages(prev => [...prev, newMessage])
      setReplyText("")
    } catch (error) {
      console.error("[v0] Error sending message:", error)
    }
  }

  const filteredConversations = conversations.filter(conv => {
    const name = conv.contacts 
      ? `${conv.contacts.first_name} ${conv.contacts.last_name}`.toLowerCase()
      : ""
    return name.includes(searchQuery.toLowerCase()) || 
           conv.last_message.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "awaiting_reply":
        return <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Awaiting Reply</span>
      case "thorne_handling":
        return <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">Thorne Handling</span>
      case "responded":
        return <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Responded</span>
      default:
        return null
    }
  }

  const getChannelIcon = (channel: string) => {
    switch (channel.toUpperCase()) {
      case "EMAIL":
        return <Mail className="w-3 h-3" />
      case "SMS":
      case "WHATSAPP":
        return <MessageCircle className="w-3 h-3" />
      case "PHONE":
        return <Phone className="w-3 h-3" />
      default:
        return <MessageSquare className="w-3 h-3" />
    }
  }

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "?"
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-[40px] border border-slate-100 p-12 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500">Loading conversations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-[40px] border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Conversation Engine</h2>
            <p className="text-xs text-slate-500">Multi-channel engagement hub with AI tactical assistance.</p>
          </div>
        </div>
      </div>

      <div className="flex h-[600px]">
        {/* Left Panel - Intelligence Threads */}
        <div className="w-80 border-r border-slate-100 flex flex-col">
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">Intelligence Threads</h3>
              <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                <Filter className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Filter conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-sm bg-slate-50 border-0 rounded-xl"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                No conversations found
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`w-full p-4 flex items-start gap-3 hover:bg-slate-50 transition-colors border-b border-slate-50 text-left ${
                    selectedConversation?.id === conv.id ? "bg-indigo-50/50" : ""
                  }`}
                >
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-indigo-100 text-indigo-700 text-sm font-bold">
                        {getInitials(conv.contacts?.first_name, conv.contacts?.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    {conv.unread_count > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm text-slate-900 truncate">
                        {conv.contacts ? `${conv.contacts.first_name} ${conv.contacts.last_name}` : "Unknown"}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {formatTime(conv.last_active)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate mb-1.5">{conv.last_message}</p>
                    {getStatusBadge(conv.status)}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Center Panel - Chat View */}
        <div className="flex-1 flex flex-col bg-slate-50/30">
          {selectedConversation ? (
            <>
              {/* Conversation Header */}
              <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-indigo-600 text-white font-bold">
                      {getInitials(selectedConversation.contacts?.first_name, selectedConversation.contacts?.last_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-slate-900">
                      {selectedConversation.contacts 
                        ? `${selectedConversation.contacts.first_name} ${selectedConversation.contacts.last_name}`
                        : "Unknown Contact"}
                    </h4>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      {getChannelIcon(selectedConversation.channel)}
                      <span>{selectedConversation.channel}</span>
                      <span className="text-emerald-500">• CONNECTED</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setFlowMode(!flowMode)}
                    className={`h-8 px-4 rounded-full text-xs font-bold ${
                      flowMode 
                        ? "bg-indigo-600 text-white hover:bg-indigo-700" 
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 mr-1.5" />
                    FLOW {flowMode ? "ON" : "OFF"}
                  </Button>
                  <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <EllipsisVertical className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender_type === "contact" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`flex items-end gap-2 max-w-[70%] ${msg.sender_type === "contact" ? "flex-row-reverse" : ""}`}>
                      {msg.sender_type !== "contact" && (
                        <Avatar className="w-8 h-8 shrink-0">
                          <AvatarFallback className={`text-xs font-bold ${
                            msg.sender_type === "thorne" 
                              ? "bg-slate-700 text-white" 
                              : "bg-indigo-100 text-indigo-700"
                          }`}>
                            {msg.sender_type === "thorne" ? "T" : "ME"}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`px-4 py-3 rounded-2xl ${
                          msg.sender_type === "contact"
                            ? "bg-indigo-600 text-white rounded-br-md"
                            : msg.sender_type === "thorne"
                            ? "bg-slate-100 text-slate-700 rounded-bl-md"
                            : "bg-white border border-slate-200 text-slate-700 rounded-bl-md"
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* AI Tactical Toolbar */}
              <div className="px-6 py-3 bg-white border-t border-slate-100">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Tactical Toolbar</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="px-3 py-1 text-xs font-medium cursor-pointer hover:bg-indigo-50 hover:border-indigo-200">
                    Consultative
                  </Badge>
                  <Badge variant="outline" className="px-3 py-1 text-xs font-medium cursor-pointer hover:bg-indigo-50 hover:border-indigo-200">
                    Urgent
                  </Badge>
                  <Badge variant="outline" className="px-3 py-1 text-xs font-medium cursor-pointer hover:bg-indigo-50 hover:border-indigo-200">
                    Casual
                  </Badge>
                  <button className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-slate-500 hover:text-indigo-600 transition-colors">
                    <RefreshCw className="w-3 h-3" />
                    Regenerate
                  </button>
                </div>
              </div>

              {/* Reply Input */}
              <div className="p-4 bg-white border-t border-slate-100">
                <div className="flex items-end gap-3">
                  <div className="flex-1 relative">
                    <Textarea
                      placeholder={`Reply to ${selectedConversation.contacts?.first_name || "contact"}...`}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="min-h-[60px] max-h-[120px] resize-none pr-12 rounded-2xl border-slate-200"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                    />
                    <button className="absolute right-3 bottom-3 p-1.5 text-slate-400 hover:text-slate-600 transition-colors">
                      <Mic className="w-4 h-4" />
                    </button>
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!replyText.trim()}
                    className="h-12 px-6 bg-indigo-600 hover:bg-indigo-700 rounded-2xl"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
              Select a conversation to view
            </div>
          )}
        </div>

        {/* Right Panel - Thorne Intel Core */}
        <div className="w-80 border-l border-slate-100 flex flex-col bg-white">
          <div className="p-4 bg-slate-800 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold">Thorne Intel Core</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sentiment Score</span>
                <Badge className={`text-[10px] ${
                  sentimentScore === "POSITIVE" ? "bg-emerald-500" :
                  sentimentScore === "NEGATIVE" ? "bg-red-500" : "bg-slate-500"
                }`}>
                  {sentimentScore}
                </Badge>
              </div>
              
              <p className="text-xs text-slate-300 leading-relaxed italic">
                &quot;{aiAnalysis}&quot;
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tactical Suggestions</h4>
              <Sparkles className="w-3.5 h-3.5 text-slate-300" />
            </div>

            {tacticalSuggestions.map((suggestion, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-colors cursor-pointer"
              >
                <h5 className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-2">
                  {suggestion.tone}
                </h5>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {suggestion.response}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
