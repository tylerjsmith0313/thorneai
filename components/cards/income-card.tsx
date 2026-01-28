"use client"

import React from 'react'
import { Wallet, ArrowUpRight } from 'lucide-react'
import type { Deal } from '@/types.ts'

interface IncomeCardProps {
  deals: Deal[]
  onClick: () => void
}

export function IncomeCard({ deals, onClick }: IncomeCardProps) {
  const earnedIncome = deals
    .filter(d => d.status === 'closed-won')
    .reduce((sum, d) => sum + d.amount, 0)

  const openValue = deals
    .filter(d => d.status === 'open' || d.isMonthlyRecurring)
    .reduce((sum, d) => sum + d.amount, 0)

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val)

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-[24px] shadow-sm border border-slate-200 p-4 cursor-pointer hover:shadow-lg hover:border-indigo-100 transition-all group overflow-hidden relative h-full flex flex-col justify-between"
    >
      <div className="flex items-start justify-between mb-2.5">
        <div className="p-2 bg-indigo-50 rounded-xl group-hover:bg-indigo-100 transition-colors border border-indigo-50">
          <Wallet className="w-4 h-4 text-indigo-600" />
        </div>
        <div className="flex items-center text-green-600 bg-green-50 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-green-100">
          <ArrowUpRight className="w-2 h-2 mr-1" />
          +12%
        </div>
      </div>

      <div className="space-y-0">
        <h3 className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em]">Earned Income</h3>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black text-slate-900 tracking-tight">
            {formatCurrency(earnedIncome)}
          </span>
        </div>
      </div>

      <div className="mt-3.5 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
        <div>
          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Pipeline</p>
          <p className="text-xs font-black text-slate-800">{formatCurrency(openValue)}</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Conv.</p>
          <p className="text-xs font-black text-slate-800">68%</p>
        </div>
      </div>

      <div className="absolute -right-4 -bottom-4 opacity-[0.03] pointer-events-none text-indigo-600 rotate-12 transition-transform duration-500 group-hover:scale-110">
        <Wallet className="w-24 h-24" />
      </div>
    </div>
  )
}
