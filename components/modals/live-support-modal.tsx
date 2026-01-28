"use client"

import React from "react"

import { useState, useEffect, useRef } from "react"
import { X, Send, LifeBuoy, Sparkles, Info } from "lucide-react"

interface Message {
  id: string
  role: "support" | "user"
  text: string
  timestamp: string
}

interface LiveSupportModalProps {
  onClose: () => void
}

export function LiveSupportModal({ onClose }: LiveSupportModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "support",
      text: "Hello! I am the Thorne Support AI. How can I assist your operations today?",
      timestamp: "Now",
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: input,
      timestamp: "Just now",
    }

    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setIsTyping(true)

    setTimeout(() => {
      const supportMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "support",
        text: "I've logged your request in the triage queue. A human specialist will intervene if my neural response is insufficient. What's the priority level of this query?",
        timestamp: "Just now",
      }
      setIsTyping(false)
      setMessages((prev) => [...prev, supportMsg])
    }, 1500)
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div className="bg-white w-full max-w-2xl h-[70vh] rounded-[48px] shadow-2xl overflow-hidden relative flex flex-col animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-indigo-600 rounded-[22px] text-white flex items-center justify-center shadow-xl shadow-indigo-100">
              <LifeBuoy size={28} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-none">
                Thorne Support
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  Active Triage Monitoring
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-4 bg-slate-50 rounded-full text-slate-300 hover:text-rose-500 transition-all border border-slate-100"
          >
            <X size={24} />
          </button>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-10 space-y-6 no-scrollbar bg-slate-50/30"
        >
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div
                className={`max-w-[85%] p-5 rounded-[28px] text-sm leading-relaxed shadow-sm ${
                  m.role === "support"
                    ? "bg-white border border-slate-100 text-slate-700 rounded-tl-none"
                    : "bg-indigo-600 text-white rounded-tr-none"
                }`}
              >
                {m.text}
              </div>
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-2 px-2">
                {m.timestamp}
              </p>
            </div>
          ))}
          {isTyping && (
            <div className="flex items-center gap-2 text-indigo-400 bg-white w-fit px-4 py-2 rounded-full border border-indigo-50 shadow-sm animate-pulse">
              <Sparkles size={12} className="animate-spin" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Thorne Triage Processing...
              </span>
            </div>
          )}
        </div>

        {/* Quick Triage Buttons */}
        <div className="px-10 py-4 bg-white flex gap-2 overflow-x-auto no-scrollbar border-t border-slate-100">
          {["Technical Issue", "Billing Query", "Strategy Advice", "Feature Request"].map((tag) => (
            <button
              key={tag}
              onClick={() => setInput(tag)}
              className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all whitespace-nowrap"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-8 bg-white border-t border-slate-100">
          <div className="relative group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your issue or ask a question..."
              className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500/10 focus:bg-white rounded-[32px] py-5 px-8 pr-20 text-sm font-bold outline-none transition-all shadow-inner"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
            >
              <Send size={20} />
            </button>
          </div>
          <div className="flex items-center gap-2 mt-4 justify-center">
            <Info size={12} className="text-slate-300" />
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              Thorne AI triages all requests before specialist intervention.
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
