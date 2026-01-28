"use client"

import { useState } from "react"
import { Zap, MessageSquare } from "lucide-react"
import type { Contact } from "@/types"

interface ChatSectionProps {
  contact: Contact
}

export function ChatSection({ contact }: ChatSectionProps) {
  const [message, setMessage] = useState("")

  return (
    <div className="space-y-6 animate-in fade-in duration-300 h-full flex flex-col">
      <div className="flex-1 min-h-[300px] bg-slate-50 rounded-[32px] border border-slate-200 border-dashed flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-4">
          <MessageSquare className="text-indigo-400" size={32} />
        </div>
        <h4 className="text-base font-bold text-slate-900">Start a conversation</h4>
        <p className="text-xs text-slate-500 max-w-xs mt-2 leading-relaxed">
          Send a manual message. You can choose to write it yourself or have Thorne assist.
        </p>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <textarea 
            placeholder="Type your message here..."
            className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[32px] text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none min-h-[120px]"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button 
            className="absolute right-6 bottom-6 p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all"
            title="Thorne Assist"
          >
            <Zap size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
