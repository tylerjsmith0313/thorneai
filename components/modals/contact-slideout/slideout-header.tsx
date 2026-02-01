"use client"

import { ChevronDown, ShieldCheck } from "lucide-react"
import type { Contact } from "@/types"

interface SlideoutHeaderProps {
  contact: Contact
  onClose: () => void
}

export function SlideoutHeader({ contact, onClose }: SlideoutHeaderProps) {
  return (
    <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-100">
          {contact.firstName[0]}{contact.lastName[0]}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              {contact.firstName} {contact.lastName}
            </h3>
            <ShieldCheck size={16} className="text-indigo-600" />
          </div>
          <p className="text-xs text-slate-500 font-medium">{contact.company} - Human Verified</p>
        </div>
      </div>
      <button 
        onClick={onClose} 
        className="p-3 hover:bg-slate-100 rounded-2xl text-slate-400 transition-all hover:text-slate-900"
      >
        <ChevronDown className="rotate-[-90deg]" size={24} />
      </button>
    </div>
  )
}
