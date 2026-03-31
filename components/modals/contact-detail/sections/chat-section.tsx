"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { 
  Send, Sparkles, Bot, User as UserIcon, 
  Loader2, ExternalLink, Zap, MessageCircle, Mail
} from "lucide-react"
import type { Contact } from "@/types"
import { ConversationEngineModal } from "./conversation-engine-modal"
import { WidgetChatPanel } from "./widget-chat-panel"
import { EmailsPanel } from "./emails-panel"

interface ChatSectionProps {
  contact: Contact
}

type ChatTab = "assistant" | "widget" | "emails"

export function ChatSection({ contact }: ChatSectionProps) {
  const [activeTab, setActiveTab] = useState<ChatTab>("assistant")
  const [inputValue, setInputValue] = useState("")
  const [showConversationEngine, setShowConversationEngine] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Create contact context for the AI
  const contactContext = {
    id: contact.id,
    firstName: contact.firstName,
    lastName: contact.lastName,
    company: contact.company,
    industry: contact.industry,
    interests: contact.interests,
    demeanor: contact.demeanor,
    engagementScore: contact.engagementScore,
  }

  const { messages, sendMessage, status } = useChat({
    id: `contact-chat-${contact.id}`,
    transport: new DefaultChatTransport({ 
      api: "/api/ai/chat",
      prepareSendMessagesRequest: ({ id, messages }) => ({
        body: {
          messages,
          contactContext,
        },
      }),
    }),
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        parts: [{ 
          type: "text", 
          text: `Hello! I'm AgyntSynq, your AI assistant. I have access to ${contact.firstName} ${contact.lastName}'s profile and can help you with insights, communication strategies, and recommendations for this contact. What would you like to know?` 
        }],
      },
    ],
  })

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = useCallback(() => {
    if (!inputValue.trim() || status === "streaming") return
    sendMessage({ text: inputValue })
    setInputValue("")
  }, [inputValue, sendMessage, status])

  const handleQuickPrompt = useCallback((prompt: string) => {
    sendMessage({ text: prompt })
  }, [sendMessage])

  const getMessageText = (msg: typeof messages[0]) => {
    if (!msg.parts || !Array.isArray(msg.parts)) return ""
    return msg.parts
      .filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join("")
  }

  const getToolCalls = (msg: typeof messages[0]) => {
    if (!msg.parts || !Array.isArray(msg.parts)) return []
    return msg.parts.filter((p): p is { type: "tool-invocation"; toolInvocation: any } => 
      p.type === "tool-invocation"
    )
  }

  const formatToolName = (name: string): string => {
    return name
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim()
  }

  return (
    <>
      {/* Tab Navigation */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setActiveTab("assistant")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === "assistant"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Sparkles size={16} />
          AI Assistant
        </button>
        <button
          onClick={() => setActiveTab("widget")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === "widget"
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <MessageCircle size={16} />
          Website Chats
        </button>
        <button
          onClick={() => setActiveTab("emails")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === "emails"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Mail size={16} />
          Emails
        </button>
      </div>

      {/* Widget Chat Panel */}
      {activeTab === "widget" && (
        <WidgetChatPanel contact={contact} />
      )}

      {/* Emails Panel */}
      {activeTab === "emails" && (
        <EmailsPanel contact={contact} />
      )}

      {/* AI Assistant Panel */}
      {activeTab === "assistant" && (
      <div className="flex flex-col h-[500px] bg-white rounded-[32px] border border-slate-200 overflow-hidden animate-in fade-in duration-300">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="text-white" size={20} />
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
          {messages.map((msg) => {
            const text = getMessageText(msg)
            const toolCalls = getToolCalls(msg)
            
            return (
              <div 
                key={msg.id} 
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex items-start gap-2 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === "user" 
                      ? "bg-slate-200" 
                      : "bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg"
                  }`}>
                    {msg.role === "user" 
                      ? <UserIcon size={14} className="text-slate-600" />
                      : <Sparkles size={14} className="text-white" />
                    }
                  </div>
                  <div>
                    {/* Tool calls indicator */}
                    {toolCalls.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {toolCalls.map((tc, i) => (
                          <div 
                            key={i}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs"
                          >
                            <Zap size={10} />
                            {formatToolName(tc.toolInvocation?.toolName || "tool")}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {text && (
                      <div className={`rounded-2xl px-4 py-3 ${
                        msg.role === "user"
                          ? "bg-indigo-600 text-white rounded-br-sm"
                          : "bg-white border border-slate-200 text-slate-700 rounded-bl-sm shadow-sm"
                      }`}>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{text}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
          
          {status === "streaming" && (
            <div className="flex justify-start">
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Sparkles size={14} className="text-white animate-pulse" />
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
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder={`Ask about ${contact.firstName}...`}
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all"
              disabled={status === "streaming"}
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || status === "streaming"}
              className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === "streaming" ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
          
          {/* Quick prompts */}
          <div className="flex flex-wrap gap-2 mt-3">
            {[
              { label: "Best approach?", prompt: `What's the best approach to engage with ${contact.firstName} based on their profile and current status?` },
              { label: "Draft an email", prompt: `Help me draft a personalized email for ${contact.firstName} at ${contact.company}.` },
              { label: "Profile insights", prompt: `Give me key insights about ${contact.firstName} ${contact.lastName} that would help me build rapport.` },
              { label: "Schedule a call", prompt: `Help me schedule a discovery call with ${contact.firstName}. What should I include in the invite?` },
            ].map(({ label, prompt }) => (
              <button
                key={label}
                onClick={() => handleQuickPrompt(prompt)}
                className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                disabled={status === "streaming"}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
      )}

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
