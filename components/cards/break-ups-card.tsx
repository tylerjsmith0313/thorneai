"use client"

import { HeartCrack, MessageSquareOff } from "lucide-react"
import type { Contact } from "@/lib/mock-data"

interface BreakUpsCardProps {
  contacts: Contact[]
  onClick: () => void
}

export function BreakUpsCard({ contacts, onClick }: BreakUpsCardProps) {
  const breakUpsCount = contacts.filter((c) => c.status === "Retouch").length

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 cursor-pointer hover:shadow-lg hover:border-rose-100 transition-all group overflow-hidden relative h-full flex flex-col justify-between"
    >
      <div className="flex items-start justify-between mb-2.5">
        <div className="p-2 bg-rose-50 rounded-xl group-hover:bg-rose-100 transition-colors border border-rose-50">
          <HeartCrack className="w-4 h-4 text-rose-600" />
        </div>
        <div className="flex items-center text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest">
          <MessageSquareOff className="w-2 h-2 mr-1" />
          Silence
        </div>
      </div>

      <div className="space-y-0">
        <h3 className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em]">Break Ups</h3>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black text-slate-900 tracking-tight">{breakUpsCount}</span>
          <span className="text-[10px] font-bold text-slate-600">Contacts</span>
        </div>
      </div>

      <div className="mt-3.5 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
        <div>
          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Last Msg</p>
          <p className="text-xs font-black text-slate-800 uppercase">14d+ avg</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Risk</p>
          <p className="text-xs font-black text-rose-600 uppercase">HIGH</p>
        </div>
      </div>

      <div className="absolute -right-4 -bottom-4 opacity-[0.03] pointer-events-none text-rose-600 rotate-12 transition-transform duration-500 group-hover:scale-110">
        <HeartCrack className="w-24 h-24" />
      </div>
    </div>
  )
}
