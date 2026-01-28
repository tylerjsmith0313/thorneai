"use client"

import { Check, User, Zap, ShieldCheck } from "lucide-react"
import type { WizardFormData } from "../add-contact-wizard"

interface StepProps {
  data: WizardFormData
  updateData: (d: Partial<WizardFormData>) => void
}

export function FinalizeStep({ data, updateData }: StepProps) {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 text-center flex flex-col items-center">
      <div className="w-24 h-24 bg-emerald-50 rounded-[40px] flex items-center justify-center text-emerald-600 mb-2 border border-emerald-100 shadow-xl shadow-emerald-50 animate-bounce">
        <ShieldCheck size={48} />
      </div>
      
      <div className="space-y-2 max-w-sm">
        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Identity Verified</h3>
        <p className="text-sm text-slate-500 font-medium">Select your preferred automation mode for this lead.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-xl">
        <button 
          onClick={() => updateData({ mode: "manual" })} 
          className={`p-8 rounded-[40px] border-2 text-left transition-all relative overflow-hidden group ${
            data.mode === "manual" 
            ? "border-indigo-600 bg-indigo-50 shadow-2xl shadow-indigo-100" 
            : "border-slate-100 bg-slate-50 hover:border-slate-300"
          }`}
        >
          <div className="relative z-10 space-y-2">
            <div className={`p-2 w-fit rounded-xl ${data.mode === "manual" ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-500"}`}>
              <User size={20} />
            </div>
            <p className="font-bold text-lg text-slate-900">User Controlled</p>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Manual Approvals Required</p>
          </div>
          {data.mode === "manual" && <Check className="absolute top-6 right-6 text-indigo-600" size={24} />}
        </button>

        <button 
          onClick={() => updateData({ mode: "flow" })} 
          className={`p-8 rounded-[40px] border-2 text-left transition-all relative overflow-hidden group ${
            data.mode === "flow" 
            ? "border-indigo-600 bg-indigo-900 text-white shadow-2xl shadow-indigo-200" 
            : "border-slate-100 bg-slate-50 hover:border-slate-300"
          }`}
        >
          <div className="relative z-10 space-y-2">
            <div className={`p-2 w-fit rounded-xl ${data.mode === "flow" ? "bg-white text-indigo-900" : "bg-slate-200 text-slate-500"}`}>
              <Zap size={20} />
            </div>
            <p className={`font-bold text-lg ${data.mode === "flow" ? "text-white" : "text-slate-900"}`}>Set to Flow</p>
            <p className={`text-[10px] uppercase font-bold tracking-widest ${data.mode === "flow" ? "text-indigo-300" : "text-slate-400"}`}>Full Thorne AI Automation</p>
          </div>
          {data.mode === "flow" && <Check className="absolute top-6 right-6 text-white" size={24} />}
        </button>
      </div>
      
      <p className="text-xs text-slate-400 font-medium max-w-sm leading-relaxed mt-4">
        You can always switch modes later in the Contact slideout under 
        <span className="text-indigo-600 font-bold mx-1 hover:underline cursor-pointer">Automation Settings</span>.
      </p>
    </div>
  )
}
