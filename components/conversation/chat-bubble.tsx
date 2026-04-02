"use client"

import { Shield, User, Phone } from "lucide-react"

interface ChatBubbleProps {
  role: "thorne" | "user" | "contact"
  content: string
  timestamp: string
  type?: "email" | "sms" | "call_transcript"
}

export function ChatBubble({ role, content, timestamp, type }: ChatBubbleProps) {
  const isThorne = role === "thorne"

  return (
    <div
      className={`flex flex-col gap-1 ${isThorne ? "items-start" : "items-end"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
    >
      {type === "call_transcript" && (
        <div className="flex items-center gap-2 mb-1 px-4">
          <Phone size={14} className="text-indigo-600" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Phone Transcription
          </span>
        </div>
      )}

      <div className={`flex gap-4 ${isThorne ? "flex-row" : "flex-row-reverse"}`}>
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
            isThorne
              ? "bg-indigo-600 text-white"
              : "bg-slate-100 border border-slate-200 text-slate-400"
          }`}
        >
          {isThorne ? <Shield size={18} /> : <User size={18} />}
        </div>
        <div className={`max-w-[85%] space-y-1 ${isThorne ? "text-left" : "text-right"}`}>
          <div
            className={`p-5 rounded-[28px] text-sm leading-relaxed shadow-sm ${
              isThorne
                ? "bg-slate-50 border border-slate-100 text-slate-700 rounded-tl-none"
                : "bg-indigo-600 text-white rounded-tr-none"
            }`}
          >
            {content}
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mt-2">
            {timestamp}
          </p>
        </div>
      </div>
    </div>
  )
}
