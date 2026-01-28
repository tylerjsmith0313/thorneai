"use client"

import { ShieldCheck, Clock, ExternalLink } from "lucide-react"
import type { Contact } from "@/types"

interface ResearchSectionProps {
  contact: Contact
}

export function ResearchSection({ contact }: ResearchSectionProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-slate-900">Thorne AI Research Log</h4>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">3 Sources Verified</span>
      </div>

      <div className="space-y-3">
        <ResearchCard 
          source="LinkedIn Public Profile" 
          status="Verified" 
          date="2 hours ago" 
          detail={`Identified career move to ${contact.company || "current company"} in Q4 2023.`}
        />
        <ResearchCard 
          source="Corporate Press Release" 
          status="Waiting Approval" 
          date="1 day ago" 
          detail="Potential match in recent partnership announcement."
        />
        <ResearchCard 
          source="ZeroBounce API" 
          status="Verified" 
          date="Initial Sync" 
          detail="Email deliverability confirmed at 99.8%."
        />
      </div>
    </div>
  )
}

function ResearchCard({ source, status, date, detail }: { source: string; status: string; date: string; detail: string }) {
  return (
    <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {status === "Verified" ? <ShieldCheck size={14} className="text-emerald-500" /> : <Clock size={14} className="text-amber-500" />}
          <span className="text-xs font-bold text-slate-700">{source}</span>
        </div>
        <ExternalLink size={12} className="text-slate-300" />
      </div>
      <p className="text-xs text-slate-500 leading-relaxed">{detail}</p>
      <p className="text-[10px] text-slate-400 font-medium italic">{date}</p>
    </div>
  )
}
