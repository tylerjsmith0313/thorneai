"use client"

import { Heart, FileText, User } from "lucide-react"
import type { Contact } from "@/types"

interface SummarySectionProps {
  contact: Contact
}

export function SummarySection({ contact }: SummarySectionProps) {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-rose-500">
          <Heart size={16} />
          <h4 className="text-sm font-bold">Hobbies & Interests</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {["Golf", "SaaS Architecture", "Fine Wine", "NY Yankees", "Tech Investing"].map(tag => (
            <span key={tag} className="px-3 py-1 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold border border-rose-100">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-indigo-500">
          <FileText size={16} />
          <h4 className="text-sm font-bold">Human Verified Notes</h4>
        </div>
        <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-200">
          <p className="text-sm text-slate-600 leading-relaxed italic">
            "Spoke with {contact.firstName} at the conference last year. Very interested in how Thorne handles DNC scrubbing for large enterprise teams. Prefers text communication over email for quick updates."
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-slate-500">
          <User size={16} />
          <h4 className="text-sm font-bold">Persona Attributes</h4>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Demeanor</p>
            <p className="text-xs font-bold text-slate-700">Analytical</p>
          </div>
          <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Pace</p>
            <p className="text-xs font-bold text-slate-700">Rapid</p>
          </div>
        </div>
      </div>
    </div>
  )
}
