"use client"

import React from 'react'
import { Wind, AlertTriangle } from 'lucide-react'
import type { Contact } from '@/types.ts'

interface WitheringCardProps {
  contacts: Contact[]
  onClick: () => void
}

export function WitheringCard({ contacts, onClick }: WitheringCardProps) {
  const witheringCount = contacts.filter(c => c.status === 'Withering').length
  const totalContacts = contacts.length || 1
  const witheringPercentage = Math.round((witheringCount / totalContacts) * 100)

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-[24px] shadow-sm border border-slate-100 p-4 cursor-pointer hover:shadow-lg hover:border-amber-100 transition-all group overflow-hidden relative h-full flex flex-col justify-between"
    >
      <div className="flex items-start justify-between mb-2.5">
        <div className="p-2 bg-amber-50 rounded-xl group-hover:bg-amber-100 transition-colors border border-amber-50">
          <Wind className="w-4 h-4 text-amber-600" />
        </div>
        <div className="flex items-center text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest">
          <AlertTriangle className="w-2 h-2 mr-1" />
          Attention
        </div>
      </div>

      <div className="space-y-0">
        <h3 className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em]">Withering</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black text-slate-900 tracking-tight">
            {witheringCount}
          </span>
          <span className="text-[10px] font-bold text-slate-600">Leads</span>
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest ml-0.5">({witheringPercentage}%)</span>
        </div>
      </div>

      <div className="mt-3.5 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
        <div>
          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Risk</p>
          <p className="text-xs font-black text-amber-600 uppercase">Elevated</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Recapture</p>
          <p className="text-xs font-black text-slate-800">14%</p>
        </div>
      </div>

      <div className="absolute -right-4 -bottom-4 opacity-[0.03] pointer-events-none text-amber-600 rotate-[-12deg] transition-transform duration-500 group-hover:scale-110">
        <Wind className="w-24 h-24" />
      </div>
    </div>
  )
}
