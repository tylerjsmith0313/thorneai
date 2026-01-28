"use client"

import { MessageSquare, Zap } from "lucide-react"
import type { Conversation } from "@/types.ts"

interface ActiveConversationsCardProps {
  conversations: Conversation[]
  onClick: () => void
}

export function ActiveConversationsCard({ conversations, onClick }: ActiveConversationsCardProps) {
  const activeCount = conversations.length
  const thorneHandling = conversations.filter(c => c.status === "thorne_handling").length
  const awaitingReply = conversations.filter(c => c.status === "awaiting_reply").length

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 cursor-pointer hover:shadow-lg hover:border-violet-100 transition-all group overflow-hidden relative h-full flex flex-col justify-between"
    >
      <div className="flex items-start justify-between mb-2.5">
        <div className="p-2 bg-violet-50 rounded-xl group-hover:bg-violet-100 transition-colors border border-violet-50">
          <MessageSquare className="w-4 h-4 text-violet-600" />
        </div>
        <div className="flex items-center text-violet-600 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest">
          <Zap className="w-2 h-2 mr-1" />
          AI Active
        </div>
      </div>

      <div className="space-y-0">
        <h3 className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em]">Conversations</h3>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black text-slate-900 tracking-tight">
            {activeCount}
          </span>
          <span className="text-[10px] font-bold text-slate-600">Ongoing</span>
        </div>
      </div>

      <div className="mt-3.5 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
        <div>
          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Managed</p>
          <p className="text-xs font-black text-slate-800">{thorneHandling}</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Action</p>
          <p className="text-xs font-black text-rose-600">{awaitingReply}</p>
        </div>
      </div>

      <div className="absolute -right-4 -bottom-4 opacity-[0.03] pointer-events-none text-violet-600 rotate-12 transition-transform duration-500 group-hover:scale-110">
        <MessageSquare className="w-24 h-24" />
      </div>
    </div>
  )
}
