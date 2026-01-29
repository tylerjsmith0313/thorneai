"use client"

import React, { useState, useCallback, useRef, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { 
  Shield, User, Send, Sparkles, BarChart3, FileText, 
  Loader2, Brain, Zap, Calendar, Users, TrendingUp
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { NeuralLink } from "@/components/neural-link/neural-link"

export function AICommandChat() {
  const [inputValue, setInputValue] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { messages, append, status, setMessages } = useChat({
    id: "ai-command-center",
    api: "/api/ai/chat",
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content: "Hello! I'm AgyntSynq, your AI Success Development Manager. I can help you analyze your pipeline, draft outreach, schedule follow-ups, and strategize your sales approach. How can I assist you today?",
      },
    ],
  })

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = useCallback(() => {
    if (!inputValue.trim() || status === "streaming") return
    append({ role: "user", content: inputValue })
    setInputValue("")
  }, [inputValue, append, status])

  const handleQuickAction = useCallback((prompt: string) => {
    append({ role: "user", content: prompt })
  }, [append])

  const getMessageText = (msg: typeof messages[0]) => {
    // AI SDK 6 uses content directly
    if (typeof msg.content === "string") return msg.content
    // Fallback for parts-based messages
    if (msg.parts && Array.isArray(msg.parts)) {
      return msg.parts
        .filter((p): p is { type: "text"; text: string } => p.type === "text")
        .map((p) => p.text)
        .join("")
    }
    return ""
  }

  // Check for tool calls in the message
  const getToolCalls = (msg: typeof messages[0]) => {
    // AI SDK 6 uses toolInvocations array
    if (msg.toolInvocations && Array.isArray(msg.toolInvocations)) {
      return msg.toolInvocations
    }
    // Fallback for parts-based messages
    if (msg.parts && Array.isArray(msg.parts)) {
      return msg.parts.filter((p): p is { type: "tool-invocation"; toolInvocation: unknown } => 
        p.type === "tool-invocation"
      )
    }
    return []
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground">AI Command</h3>
          <p className="text-xs text-muted-foreground">Direct conversation with AgyntSynq Neural Core.</p>
        </div>
        <NeuralLink />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2 min-h-0">
        {messages.map((message) => {
          const text = getMessageText(message)
          const toolCalls = getToolCalls(message)
          
          return (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
            >
              {message.role === "assistant" ? (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
              <div className={`flex-1 ${message.role === "user" ? "text-right" : ""} max-w-[85%]`}>
                {/* Tool calls indicator */}
                {toolCalls.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {toolCalls.map((tc: { toolName?: string }, i: number) => (
                      <div 
                        key={i}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs"
                      >
                        <Zap size={10} />
                        {formatToolName(tc.toolName || "tool")}
                      </div>
                    ))}
                  </div>
                )}
                
                {text && (
                  <div
                    className={`inline-block px-4 py-3 rounded-2xl ${
                      message.role === "user"
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-900"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{text}</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
        
        {/* Streaming indicator */}
        {status === "streaming" && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
              <Sparkles className="w-4 h-4 text-white animate-pulse" />
            </div>
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-100 rounded-2xl">
              <Loader2 size={14} className="animate-spin text-indigo-600" />
              <span className="text-sm text-slate-600">AgyntSynq is thinking...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2 mb-3">
        <QuickActionButton 
          icon={<BarChart3 className="w-3 h-3" />} 
          label="Audit Pipeline" 
          onClick={() => handleQuickAction("Give me a full audit of my current sales pipeline. What opportunities need attention?")}
        />
        <QuickActionButton 
          icon={<Users className="w-3 h-3" />} 
          label="Hot Leads" 
          onClick={() => handleQuickAction("Show me my hottest leads and recommend next steps for each.")}
        />
        <QuickActionButton 
          icon={<Calendar className="w-3 h-3" />} 
          label="Today's Tasks" 
          onClick={() => handleQuickAction("What should I focus on today? Show my upcoming events and priority follow-ups.")}
        />
        <QuickActionButton 
          icon={<TrendingUp className="w-3 h-3" />} 
          label="Win Strategy" 
          onClick={() => handleQuickAction("Help me create a strategy to close more deals this week.")}
        />
      </div>

      {/* Input */}
      <div className="border border-border rounded-xl p-3 bg-white">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
          placeholder="Ask AgyntSynq anything about your pipeline, contacts, or sales strategy..."
          className="w-full resize-none bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground min-h-[60px]"
          disabled={status === "streaming"}
        />
        <div className="flex items-center justify-end mt-2">
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!inputValue.trim() || status === "streaming"}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full w-9 h-9"
          >
            {status === "streaming" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

function QuickActionButton({ 
  icon, 
  label, 
  onClick 
}: { 
  icon: React.ReactNode
  label: string
  onClick: () => void 
}) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-slate-200 hover:border-indigo-200"
    >
      {icon}
      {label}
    </button>
  )
}

function formatToolName(name: string): string {
  return name
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim()
}
