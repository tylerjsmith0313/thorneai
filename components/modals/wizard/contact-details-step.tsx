"use client"

import { Shield, Mail, Building2, User } from "lucide-react"
import type { WizardFormData } from "../add-contact-wizard"

interface StepProps {
  data: WizardFormData
  updateData: (d: Partial<WizardFormData>) => void
}

export function ContactDetailsStep({ data, updateData }: StepProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-indigo-50 p-6 rounded-[32px] flex items-start gap-4 border border-indigo-100 shadow-sm shadow-indigo-50/50">
        <div className="p-2 bg-indigo-600 rounded-xl text-white mt-1 shrink-0">
          <Shield size={16} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-indigo-900">ZeroBounce Intelligence Active</h4>
          <p className="text-xs text-indigo-700/80 font-medium leading-relaxed mt-1">
            Thorne will validate all email addresses in real-time. Verified profiles improve deliverability by up to 99%.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">First Name</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
            <input 
              type="text" 
              placeholder="First Name" 
              className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-[20px] text-sm focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all focus:bg-white" 
              value={data.firstName} 
              onChange={e => updateData({ firstName: e.target.value })} 
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Last Name" 
              className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-[20px] text-sm focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all focus:bg-white" 
              value={data.lastName} 
              onChange={e => updateData({ lastName: e.target.value })} 
            />
          </div>
        </div>

        <div className="col-span-2 space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Personal Email</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
            <input 
              type="email" 
              placeholder="john.doe@personal.me" 
              className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-[20px] text-sm focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all focus:bg-white" 
              value={data.pEmail}
              onChange={e => updateData({ pEmail: e.target.value })}
            />
          </div>
        </div>

        <div className="col-span-2 space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Work Email</label>
          <div className="relative">
            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
            <input 
              type="email" 
              placeholder="john.doe@company.com" 
              className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-[20px] text-sm focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all focus:bg-white" 
              value={data.wEmail}
              onChange={e => updateData({ wEmail: e.target.value })}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
