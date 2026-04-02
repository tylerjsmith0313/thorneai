"use client"

import { Building2, MapPin, MoreHorizontal } from "lucide-react"
import type { Contact } from "@/types"
import { StatusBadge } from "@/components/ui/status-badge"

interface ContactCardProps {
  contact: Contact
  onClick?: (id: string) => void
}

export function ContactCard({ contact, onClick }: ContactCardProps) {
  return (
    <div 
      onClick={() => onClick?.(contact.id)}
      className="p-6 bg-white border border-slate-200 rounded-[32px] hover:shadow-xl hover:border-indigo-100 transition-all cursor-pointer group relative overflow-hidden"
    >
      <div className="flex items-start justify-between mb-6">
        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500 font-bold text-lg group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
          {contact.firstName[0]}{contact.lastName[0]}
        </div>
        <StatusBadge status={contact.status} dot />
      </div>

      <div className="space-y-1 mb-6">
        <h4 className="text-base font-bold text-slate-900 leading-tight">{contact.firstName} {contact.lastName}</h4>
        <div className="space-y-0.5">
          <p className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
            <Building2 size={12} className="text-slate-300" /> {contact.company || "No company"}
          </p>
          <p className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
            <MapPin size={12} className="text-slate-300" /> {contact.source || "Unknown"}
          </p>
        </div>
      </div>

      <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
        <div className="space-y-0.5">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Last Contact</p>
          <p className="text-xs font-bold text-slate-700">
            {contact.lastContactDate ? new Date(contact.lastContactDate).toLocaleDateString() : "Never"}
          </p>
        </div>
        <button 
          className="p-2 text-slate-300 hover:text-indigo-600 transition-colors"
          onClick={(e) => {
            e.stopPropagation()
          }}
        >
          <MoreHorizontal size={20} />
        </button>
      </div>

      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/20 rounded-full -mr-12 -mt-12 pointer-events-none group-hover:scale-150 transition-all duration-500" />
    </div>
  )
}
