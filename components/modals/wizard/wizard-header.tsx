"use client"

import { X, User } from "lucide-react"

interface WizardHeaderProps {
  stepNumber: number
  totalSteps: number
  stepLabel: string
  onClose: () => void
}

export function WizardHeader({ stepNumber, totalSteps, stepLabel, onClose }: WizardHeaderProps) {
  return (
    <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-100">
          <User size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Add Contact Wizard</h2>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-md">
              Step {stepNumber} of {totalSteps}
            </span>
            <span className="text-xs text-slate-400 font-medium">• {stepLabel}</span>
          </div>
        </div>
      </div>
      <button 
        onClick={onClose} 
        className="p-3 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-900"
      >
        <X size={24} />
      </button>
    </div>
  )
}
