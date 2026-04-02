"use client"

import { Building2, Globe, Users, MapPin } from "lucide-react"
import type { WizardFormData } from "../add-contact-wizard"

interface StepProps {
  data: WizardFormData
  updateData: (d: Partial<WizardFormData>) => void
}

export function CompanyInfoStep({ data, updateData }: StepProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-2 gap-6">
        <div className="col-span-2 space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Company Entity Name</label>
          <div className="relative">
            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Acme Global Inc." 
              className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-[20px] text-sm focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all" 
              value={data.company} 
              onChange={e => updateData({ company: e.target.value })} 
            />
          </div>
        </div>

        <div className="col-span-2 space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Corporate URL</label>
          <div className="relative">
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
            <input 
              type="text" 
              placeholder="https://www.acme.com" 
              className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-[20px] text-sm focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all" 
              value={data.companyUrl}
              onChange={e => updateData({ companyUrl: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Employee Count</label>
          <div className="relative">
            <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
            <input 
              type="text" 
              placeholder="e.g. 50-200" 
              className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-[20px] text-sm focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all" 
              value={data.employees}
              onChange={e => updateData({ employees: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Location Density</label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
            <input 
              type="text" 
              placeholder="e.g. 12 Global Offices" 
              className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-[20px] text-sm focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all" 
              value={data.locations}
              onChange={e => updateData({ locations: e.target.value })}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
