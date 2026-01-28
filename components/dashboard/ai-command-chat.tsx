"use client"

import React from "react"

import { useState } from "react"
import { Shield, User, Send, Sparkles, BarChart3, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Message {
  id: string
  role: "assistant" | "user"
  content: string
  timestamp: string
}

const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content: "Hello! I am your AI Success Development Manager. How can I assist you with your pipeline today?",
    timestamp: "10:30 AM",
  },
  {
    id: "2",
    role: "user",
    content: "Summarize the health of my hot leads.",
    timestamp: "10:32 AM",
  },
  {
    id: "3",
    role: "assistant",
    content: "Analyzing your Hot leads... You have 5 Hot leads with an average engagement score of 88%. I recommend a physical gift for Acme Corp to seal the current proposal.",
    timestamp: "10:32 AM",
  },
]

export function AICommandChat() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [activeMode, setActiveMode] = useState<"ai" | "neural">("ai")

  const handleSend = () => {
    if (!input.trim()) return
    
    const newMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
    
    setMessages([...messages, newMessage])
    setInput("")
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm processing your request. Based on my analysis of your current pipeline...",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
      setMessages((prev) => [...prev, aiResponse])
    }, 1000)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground">AI Command</h3>
          <p className="text-xs text-muted-foreground">Direct conversation with AgyntSynq Neural Core.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={activeMode === "ai" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveMode("ai")}
            className={activeMode === "ai" ? "bg-thorne-indigo hover:bg-thorne-indigo/90 text-white" : ""}
          >
            AI Command
          </Button>
          <Button
            variant={activeMode === "neural" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveMode("neural")}
            className={activeMode === "neural" ? "bg-thorne-indigo hover:bg-thorne-indigo/90 text-white" : ""}
          >
            Neural Link
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="h-64 overflow-y-auto mb-4 space-y-4 pr-2">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
          >
            {message.role === "assistant" ? (
              <div className="w-8 h-8 rounded-full bg-thorne-lavender/40 flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4 text-thorne-indigo" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
            )}
            <div className={`flex-1 ${message.role === "user" ? "text-right" : ""}`}>
              <div
                className={`inline-block px-4 py-2 rounded-2xl max-w-md ${
                  message.role === "user"
                    ? "bg-thorne-indigo text-white"
                    : "bg-secondary text-foreground"
                }`}
              >
                <p className="text-sm">{message.content}</p>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">{message.timestamp}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="border border-border rounded-xl p-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
          placeholder="Talk to your Success Development Manager..."
          className="w-full resize-none bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground min-h-[60px]"
        />
        <div className="flex items-center justify-between mt-2">
          <div className="flex gap-2">
            <QuickAction icon={<BarChart3 className="w-3 h-3" />} label="Audit Pipeline" />
            <QuickAction icon={<Sparkles className="w-3 h-3" />} label="Generate Strategy" />
            <QuickAction icon={<FileText className="w-3 h-3" />} label="Quick Summary" />
          </div>
          <Button
            size="icon"
            onClick={handleSend}
            className="bg-thorne-indigo hover:bg-thorne-indigo/90 text-white rounded-full w-9 h-9"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

function QuickAction({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="flex items-center gap-1.5 px-2 py-1 text-[10px] text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors">
      {icon}
      {label}
    </button>
  )
}
