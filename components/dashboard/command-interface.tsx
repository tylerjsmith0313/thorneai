"use client"

import { useState } from "react"
import { Zap, Target, BrainCircuit, Sparkles } from "lucide-react"
import { BaseButton } from "@/components/ui/base-button"
import { BaseTextArea } from "@/components/ui/base-textarea"
import { ChatBubble } from "@/components/conversation/chat-bubble"

export function CommandInterface() {
  const [messages] = useState([
    {
      role: "thorne" as const,
      content:
        "Hello! I am your AI Success Development Manager. How can I assist you with your pipeline today?",
      timestamp: "10:30 AM",
    },
    {
      role: "user" as const,
      content: "Summarize the health of my hot leads.",
      timestamp: "10:32 AM",
    },
    {
      role: "thorne" as const,
      content:
        "Analyzing your Hot leads... You have 5 Hot leads with an average engagement score of 88%. I recommend a physical gift for Acme Corp to seal the current proposal.",
      timestamp: "10:32 AM",
    },
  ])

  return (
    <div className="flex flex-col h-[500px] animate-in fade-in duration-500">
      <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar bg-slate-50/50 rounded-t-[40px] border-x border-t border-slate-100 shadow-inner">
        {messages.map((msg, i) => (
          <ChatBubble key={i} {...msg} />
        ))}
      </div>

      <div className="p-6 bg-white border border-slate-100 rounded-b-[40px] shadow-lg">
        <div className="relative group">
          <BaseTextArea
            placeholder="Talk to your Success Development Manager..."
            className="pr-20"
          />
          <div className="absolute right-4 bottom-4">
            <BaseButton
              variant="primary"
              size="sm"
              className="rounded-2xl shadow-xl shadow-indigo-100"
            >
              <Zap size={18} />
            </BaseButton>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <BaseButton variant="ghost" size="xs" icon={<Target size={12} />}>
            Audit Pipeline
          </BaseButton>
          <BaseButton variant="ghost" size="xs" icon={<BrainCircuit size={12} />}>
            Generate Strategy
          </BaseButton>
          <BaseButton variant="ghost" size="xs" icon={<Sparkles size={12} />}>
            Quick Summary
          </BaseButton>
        </div>
      </div>
    </div>
  )
}
