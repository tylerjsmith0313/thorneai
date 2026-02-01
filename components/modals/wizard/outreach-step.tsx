"use client"

import { Mail, Smartphone, Linkedin, Gift, Send, MapPin } from "lucide-react"
import type { WizardFormData } from "../add-contact-wizard"

interface StepProps {
  data: WizardFormData
  updateData: (d: Partial<WizardFormData>) => void
}

export function OutreachStep({ data, updateData }: StepProps) {
  const channels = [
    { id: "LinkedIn", icon: Linkedin },
    { id: "Email", icon: Mail },
    { id: "SMS", icon: Smartphone },
    { id: "Physical Gift", icon: Gift },
    { id: "Post Card", icon: Send },
    { id: "Direct Visit", icon: MapPin },
  ]

  const toggleChannel = (ch: string) => {
    const updated = data.channels.includes(ch) 
      ? data.channels.filter(c => c !== ch) 
      : [...data.channels, ch]
    updateData({ channels: updated })
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-slate-900 ml-1">Choose Multi-Channel Outreach Nodes</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {channels.map(ch => (
            <button 
              key={ch.id}
              onClick={() => toggleChannel(ch.id)}
              className={`p-6 rounded-[32px] border flex flex-col items-center gap-3 transition-all ${
                data.channels.includes(ch.id) 
                ? "bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-100 scale-[1.05]" 
                : "bg-white text-slate-500 border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/30"
              }`}
            >
              <ch.icon size={24} />
              <span className="text-[11px] font-bold uppercase tracking-wider">{ch.id}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6 pt-6 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Automation Budget Limit</h4>
            <p className="text-xs text-slate-500 mt-0.5">Max spend Thorne can approve for gifts/mailers.</p>
          </div>
          <span className="text-2xl font-bold text-indigo-600 bg-indigo-50 px-5 py-2 rounded-2xl border border-indigo-100 shadow-sm">
            ${data.budget}
          </span>
        </div>
        <input 
          type="range" 
          className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
          min="10" 
          max="500" 
          step="5"
          value={data.budget} 
          onChange={e => updateData({ budget: parseInt(e.target.value) })} 
        />
        <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
          <span>Min: $10</span>
          <span>Max: $500</span>
        </div>
      </div>
    </div>
  )
}
