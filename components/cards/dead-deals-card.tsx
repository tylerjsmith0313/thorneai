"use client"

import React from 'react'
import { FileX, AlertOctagon } from 'lucide-react'
import type { Deal } from '@/types'

interface DeadDealsCardProps {
  deals: Deal[]
  onClick: () => void
}

export function DeadDealsCard({ deals, onClick }: DeadDealsCardProps) {
  const deadDeals = deals.filter(d => d.status === 'closed-lost')
  const lostValue = deadDeals.reduce((sum, d) => sum + d.amount, 0)

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-[24px] shadow-sm border border-slate-200 p-4 cursor-pointer hover:shadow-lg hover:border-rose-100 transition-all group overflow-hidden relative h-full flex flex-col justify-between"
    >
      <div className="flex items-start justify-between mb-2.5">
        <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-rose-50 transition-colors border border-slate-100 group-hover:border-rose-100">
          <FileX className="w-4 h-4 text-slate-400 group-hover:text-rose-500" />
        </div>
        <div className="flex items-center text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest">
          <AlertOctagon className="w-2 h-2 mr-1" />
          Autopsy
        </div>
      </div>

      <div className="space-y-0">
        <h3 className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em]">Dead Deals</h3>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black text-slate-900 tracking-tight">
            {deadDeals.length} Lost
          </span>
        </div>
      </div>

      <div className="mt-3.5 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
        <div>
          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Lost Val</p>
          <p className="text-xs font-black text-slate-800">${(lostValue / 1000).toFixed(0)}k</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Recovery</p>
          <p className="text-xs font-black text-rose-500 uppercase">Critical</p>
        </div>
      </div>

      <div className="absolute -right-4 -bottom-4 opacity-[0.03] pointer-events-none text-slate-900 rotate-12 transition-transform duration-500 group-hover:scale-110">
        <FileX className="w-24 h-24" />
      </div>
    </div>
  )
}
