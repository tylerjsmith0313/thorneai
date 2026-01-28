"use client"

import { Database as DatabaseIcon, ShieldCheck, Lock } from "lucide-react"
import type { Contact } from "@/lib/mock-data"

interface DatabaseCardProps {
  contacts: Contact[]
  onClick: () => void
}

export function DatabaseCard({ contacts, onClick }: DatabaseCardProps) {
  const totalCount = contacts.length

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 cursor-pointer hover:shadow-lg hover:border-indigo-100 transition-all group overflow-hidden relative h-full flex flex-col justify-between"
    >
      <div className="flex items-start justify-between mb-2.5">
        <div className="p-2 bg-indigo-50 rounded-xl group-hover:bg-indigo-100 transition-colors border border-indigo-50">
          <DatabaseIcon className="w-4 h-4 text-indigo-600" />
        </div>
        <div className="flex items-center text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest">
          <ShieldCheck className="w-2 h-2 mr-1" />
          Verified
        </div>
      </div>

      <div className="space-y-0">
        <h3 className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em]">DB Health</h3>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black text-slate-900 tracking-tight">{totalCount} Nodes</span>
        </div>
      </div>

      <div className="mt-3.5 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
        <div>
          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Enriched</p>
          <p className="text-xs font-black text-slate-800">91%</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Storage</p>
          <div className="flex items-center justify-end gap-1">
            <Lock className="w-2 h-2 text-indigo-400" />
            <p className="text-[10px] font-black text-indigo-600 uppercase">Secure</p>
          </div>
        </div>
      </div>

      <div className="absolute -right-4 -bottom-4 opacity-[0.03] pointer-events-none text-indigo-600 -rotate-6 transition-transform duration-500 group-hover:scale-110">
        <DatabaseIcon className="w-24 h-24" />
      </div>
    </div>
  )
}
