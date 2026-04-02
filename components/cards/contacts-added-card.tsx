"use client"

import { UserPlus, TrendingUp } from "lucide-react"
import type { Contact } from "@/types"

interface ContactsAddedCardProps {
  contacts: Contact[]
  onClick: () => void
}

export function ContactsAddedCard({ contacts, onClick }: ContactsAddedCardProps) {
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const addedThisMonth = contacts.filter((c) => {
    const d = new Date(c.addedDate)
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear
  }).length

  const totalInDatabase = contacts.length

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 cursor-pointer hover:shadow-lg hover:border-blue-100 transition-all group overflow-hidden relative h-full flex flex-col justify-between"
    >
      <div className="flex items-start justify-between mb-2.5">
        <div className="p-2 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors border border-blue-50">
          <UserPlus className="w-4 h-4 text-blue-600" />
        </div>
        <div className="flex items-center text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest">
          <TrendingUp className="w-2 h-2 mr-1" />
          +18%
        </div>
      </div>

      <div className="space-y-0">
        <h3 className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em]">Contacts</h3>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black text-slate-900 tracking-tight">{addedThisMonth}</span>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">this month</span>
        </div>
      </div>

      <div className="mt-3.5 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
        <div>
          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Total DB</p>
          <p className="text-xs font-black text-slate-800">{totalInDatabase}</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Growth</p>
          <p className="text-xs font-black text-slate-800 uppercase">Steady</p>
        </div>
      </div>

      <div className="absolute -right-4 -bottom-4 opacity-[0.03] pointer-events-none text-blue-600 rotate-6 transition-transform duration-500 group-hover:scale-110">
        <UserPlus className="w-24 h-24" />
      </div>
    </div>
  )
}
