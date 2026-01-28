"use client"

import { useState, useEffect, useRef } from "react"
import { 
  Send, Sparkles, Bot, User as UserIcon, 
  Loader2, ExternalLink, MessageSquare
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Contact } from "@/types"
import { ConversationEngineModal } from "./conversation-engine-modal"

interface ChatSectionProps {
  contact: Contact
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export function ChatSection({ contact }: ChatSectionProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showConversationEngine, setShowConversationEngine] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Initialize with a welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: "welcome",
      role: "assistant",
      content: `Hello! I'm AgyntSynq, your AI assistant. I have access to ${contact.firstName} ${contact.lastName}'s profile and can help you with insights, communication strategies, and recommendations for this contact. What would you like to know?`,
      timestamp: new Date()
    }
    setMessages([welcomeMessage])
  }, [contact.firstName, contact.lastName])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate AI response with context about the contact
    await new Promise(resolve => setTimeout(resolve, 1500))

    const contactContext = {
      name: `${contact.firstName} ${contact.lastName}`,
      company: contact.company,
      jobTitle: contact.jobTitle,
      industry: contact.industry,
      status: contact.status,
      interests: contact.interests,
      demeanor: contact.demeanor
    }

    // Generate contextual response based on input
    let responseContent = generateContextualResponse(input.toLowerCase(), contactContext)

    const assistantMessage: Message = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: responseContent,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, assistantMessage])
    setIsLoading(false)
  }

  const generateContextualResponse = (query: string, context: { name: string; company: string | undefined; jobTitle: string | undefined; industry: string | undefined; status: string; interests: string[] | undefined; demeanor: string | undefined }) => {
    if (query.includes("email") || query.includes("message") || query.includes("write")) {
      return `Based on ${context.name}'s profile at ${context.company || "their company"}, I'd recommend a personalized approach. Given their ${context.demeanor || "professional"} demeanor, consider opening with industry-specific insights. Would you like me to draft a message for you?`
    }
    
    if (query.includes("strategy") || query.includes("approach") || query.includes("how")) {
      return `For ${context.name}, who works as ${context.jobTitle || "a professional"} at ${context.company || "their company"}, I'd suggest:\n\n1. **Lead with value** - Share relevant ${context.industry || "industry"} insights\n2. **Personal touch** - Reference their interests: ${context.interests?.join(", ") || "business growth"}\n3. **Clear CTA** - Propose a specific next step\n\nTheir current status is "${context.status}" - ${context.status === "hot" ? "strike while the iron is hot!" : "a nurture approach might work best."}`
    }
    
    if (query.includes("insight") || query.includes("tell me") || query.includes("about")) {
      return `Here's what I know about ${context.name}:\n\n**Position:** ${context.jobTitle || "Not specified"} at ${context.company || "Unknown company"}\n**Industry:** ${context.industry || "Not specified"}\n**Status:** ${context.status}\n**Demeanor:** ${context.demeanor || "Professional"}\n**Interests:** ${context.interests?.join(", ") || "Not specified"}\n\nWould you like specific recommendations for engagement?`
    }
    
    if (query.includes("call") || query.includes("meeting") || query.includes("schedule")) {
      return `For scheduling a call with ${context.name}, I'd recommend:\n\n1. **Optimal timing** - Mid-week (Tue-Thu) tends to work best for ${context.industry || "professional"} contacts\n2. **Duration** - Start with a 15-20 minute intro call\n3. **Agenda** - Be clear about the value you'll provide\n\nWould you like me to help draft a meeting request?`
    }

    return `I'm here to help you with ${context.name}'s engagement. I can assist with:\n\n• **Communication strategies** - Email drafts, call scripts\n• **Profile insights** - Key information and recommendations\n• **Engagement tactics** - Best approaches based on their profile\n• **Scheduling advice** - Optimal timing and meeting formats\n\nWhat specific aspect would you like to explore?`
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <>
      <div className="flex flex-col h-[500px] bg-white rounded-[32px] border border-slate-200 overflow-hidden animate-in fade-in duration-300">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Bot className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 tracking-tight">AGYNTSYNQ ASSISTANT</h2>
              <p className="text-[10px] text-slate-500">
                Context: <span className="font-semibold text-indigo-600">{contact.firstName} {contact.lastName}</span>
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setShowConversationEngine(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
          >
            <ExternalLink size={14} />
            Open Conversation Engine
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex items-start gap-2 max-w-[80%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === "user" 
                    ? "bg-slate-200" 
                    : "bg-indigo-600"
                }`}>
                  {msg.role === "user" 
                    ? <UserIcon size={14} className="text-slate-600" />
                    : <Sparkles size={14} className="text-white" />
                  }
                </div>
                <div>
                  <div className={`rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-br-sm"
                      : "bg-white border border-slate-200 text-slate-700 rounded-bl-sm shadow-sm"
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  <p className={`text-[10px] text-slate-400 mt-1 ${msg.role === "user" ? "text-right" : ""}`}>
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                  <Sparkles size={14} className="text-white" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin text-indigo-500" />
                    <span className="text-sm text-slate-500">AgyntSynq is thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder={`Ask about ${contact.firstName}...`}
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={18} />
            </button>
          </div>
          
          {/* Quick prompts */}
          <div className="flex flex-wrap gap-2 mt-3">
            {[
              "Best approach?",
              "Draft an email",
              "Profile insights",
              "Schedule a call"
            ].map((prompt) => (
              <button
                key={prompt}
                onClick={() => setInput(prompt)}
                className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium hover:bg-indigo-50 hover:text-indigo-600 transition-all"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Conversation Engine Modal */}
      {showConversationEngine && (
        <ConversationEngineModal 
          contact={contact} 
          onClose={() => setShowConversationEngine(false)} 
        />
      )}
    </>
  )
}
