"use client"

import { useState } from "react"
import { X, MessageCircle, Mail, Smartphone, Linkedin, MessageSquare, AlertCircle, Sparkles, ChevronRight } from "lucide-react"
import type { Conversation } from "@/types"

interface ActiveConversationsBreakdownProps {
  conversations: Conversation[]
  onClose: () => void
}

export function ActiveConversationsBreakdown({ conversations, onClose }: ActiveConversationsBreakdownProps) {
  const [filter, setFilter] = useState<"all" | "SMS" | "Email" | "LinkedIn" | "WhatsApp">("all")

  const filtered = conversations.filter(c => filter === "all" || c.channel === filter)

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "SMS": return <Smartphone size={14} />
      case "Email": return <Mail size={14} />
      case "LinkedIn": return <Linkedin size={14} />
      case "WhatsApp": return <MessageCircle size={14} />
      default: return <MessageSquare size={14} />
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden relative flex flex-col animate-in fade-in zoom-in duration-300">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Active Conversations</h2>
            <p className="text-sm text-slate-500">Real-time engagement across all verified channels.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2 overflow-x-auto">
          {(["all", "SMS", "Email", "LinkedIn", "WhatsApp"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all shrink-0 ${
                filter === f 
                ? "bg-violet-600 text-white shadow-md" 
                : "bg-white text-slate-500 border border-slate-200 hover:border-violet-300"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="p-4 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl text-white flex items-center justify-between shadow-lg shadow-violet-100">
            <div>
              <p className="text-violet-100 text-[10px] font-bold uppercase tracking-widest mb-1">Live Management</p>
              <h4 className="text-lg font-bold">Thorne AI is monitoring {conversations.filter(c => c.status === "thorne_handling").length} threads</h4>
            </div>
            <Sparkles className="w-8 h-8 text-violet-300 opacity-50" />
          </div>

          <div className="grid grid-cols-1 gap-3 mt-6">
            {filtered.map(conv => (
              <div 
                key={conv.id} 
                className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between hover:border-violet-200 transition-all cursor-pointer group shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                      {conv.contactName.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-sm border border-slate-100 text-slate-400">
                      {getChannelIcon(conv.channel)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h5 className="text-sm font-bold text-slate-900 truncate">{conv.contactName}</h5>
                      {conv.unreadCount > 0 && (
                        <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5 italic">{`"${conv.lastMessage}"`}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 ml-4 shrink-0">
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      conv.status === "awaiting_reply" ? "bg-rose-50 text-rose-600" :
                      conv.status === "thorne_handling" ? "bg-violet-50 text-violet-600" :
                      "bg-slate-100 text-slate-500"
                    }`}>
                      {conv.status === "awaiting_reply" && <AlertCircle size={10} className="mr-1" />}
                      {conv.status.replace("_", " ")}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1">{new Date(conv.lastActive).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-violet-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
