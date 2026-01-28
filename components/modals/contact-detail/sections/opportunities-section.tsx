"use client"

import { useState } from "react"
import { Target, Plus, FileText, Calendar } from "lucide-react"
import { BaseButton } from "@/components/ui/base-button"
import { MeetingScheduler } from "../common/meeting-scheduler"
import type { Contact } from "@/types"

interface OpportunitiesSectionProps {
  contact: Contact
}

export function OpportunitiesSection({ contact }: OpportunitiesSectionProps) {
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false)

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Active Opportunities</h4>
        <BaseButton variant="secondary" size="sm" className="rounded-xl px-3 py-1.5" icon={<Plus size={14} />}>
          Add Opportunity
        </BaseButton>
      </div>

      <div className="p-8 bg-white border border-slate-200 rounded-[40px] space-y-6 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-[18px] flex items-center justify-center shadow-sm border border-indigo-100/50">
              <Target size={22} />
            </div>
            <div>
              <h5 className="text-base font-black text-slate-900 tracking-tight">SaaS Implementation</h5>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">IN PROGRESS - $15,000</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase border border-emerald-100 tracking-wider">Hot</span>
        </div>

        <div className="flex gap-3 pt-6 border-t border-slate-50 relative z-10">
          <BaseButton 
            variant="outline" 
            size="sm" 
            className="flex-1 rounded-2xl py-3 border-slate-100 text-slate-600" 
            icon={<FileText size={14} />}
          >
            Send Proposal
          </BaseButton>
          <BaseButton 
            variant="outline" 
            size="sm" 
            className="flex-1 rounded-2xl py-3 border-slate-100 text-slate-600" 
            icon={<Calendar size={14} />}
            onClick={() => setIsSchedulerOpen(true)}
          >
            Book Meeting
          </BaseButton>
        </div>

        <Target size={120} className="absolute -right-8 -bottom-8 text-indigo-500/5 pointer-events-none" />
      </div>

      {isSchedulerOpen && (
        <MeetingScheduler 
          contact={contact} 
          onClose={() => setIsSchedulerOpen(false)} 
        />
      )}
    </div>
  )
}
