"use client"

import React from 'react'
import { Target } from 'lucide-react'
import type { Deal } from '@/types'

interface OpportunitiesCardProps {
  deals: Deal[]
  onClick: () => void
}

export function OpportunitiesCard({ deals, onClick }: OpportunitiesCardProps) {
  const totalCount = deals.length || 1
  const openCount = deals.filter(d => d.status === 'open').length
  const winRate = Math.round((deals.filter(d => d.status === 'closed-won').length / totalCount) * 100) || 0

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-[24px] shadow-sm border border-slate-200 p-4 cursor-pointer hover:shadow-lg hover:border-emerald-100 transition-all group overflow-hidden relative h-full flex flex-col justify-between"
    >
      <div className="flex items-start justify-between mb-2.5">
        <div className="p-2 bg-emerald-50 rounded-xl group-hover:bg-emerald-100 transition-colors border border-emerald-50">
          <Target className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="flex items-center text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100">
          {winRate}% Win
        </div>
      </div>

      <div className="space-y-0">
        <h3 className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em]">Opportunities</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black text-slate-900 tracking-tight">
            {openCount} Active
          </span>
          <span className="text-[10px] font-bold text-slate-400">/ {totalCount}</span>
        </div>
      </div>

      <div className="mt-3.5 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
        <div>
          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Avg Size</p>
          <p className="text-xs font-black text-slate-800">
            ${Math.round(deals.reduce((a, b) => a + b.amount, 0) / totalCount / 1000)}k
          </p>
        </div>
        <div className="text-right">
          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Velocity</p>
          <p className="text-xs font-black text-emerald-600 uppercase">High</p>
        </div>
      </div>

      <div className="absolute -right-4 -bottom-4 opacity-[0.03] pointer-events-none text-emerald-600 rotate-12 transition-transform duration-500 group-hover:scale-110">
        <Target className="w-24 h-24" />
      </div>
    </div>
  )
}
