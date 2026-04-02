"use client"

import { useState } from "react"
import { X, Calendar, DollarSign, MessageSquare, Phone, Mail, Gift, Save, Sparkles } from "lucide-react"
import { BaseButton } from "@/components/ui/base-button"

interface ActivityTrackerModalProps {
  onClose: () => void
  onSave: (activity: { type: string; timestamp: string; result: string; investment: number }) => void
}

export function ActivityTrackerModal({ onClose, onSave }: ActivityTrackerModalProps) {
  const [type, setType] = useState("Human")
  const [selectedLabel, setSelectedLabel] = useState("Email")
  const [timestamp, setTimestamp] = useState(new Date().toISOString().slice(0, 16))
  const [result, setResult] = useState("")
  const [hasInvestment, setHasInvestment] = useState(false)
  const [amount, setAmount] = useState("")

  const activityTypes = [
    { label: "Email", value: "Human", icon: <Mail size={14} /> },
    { label: "Call", value: "Human", icon: <Phone size={14} /> },
    { label: "Meeting", value: "Human", icon: <MessageSquare size={14} /> },
    { label: "Gift", value: "Gift", icon: <Gift size={14} /> },
  ]

  const handleSave = () => {
    onSave({
      type: selectedLabel,
      timestamp,
      result,
      investment: hasInvestment ? Number.parseFloat(amount) : 0
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="bg-white w-full max-w-xl rounded-[48px] shadow-2xl overflow-hidden relative flex flex-col animate-in zoom-in-95 duration-300 border border-white/20">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-indigo-600 rounded-[22px] text-white flex items-center justify-center shadow-xl shadow-indigo-100">
              <Sparkles size={28} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-none">Activity Tracker</h2>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-2">Log manual interaction telemetry</p>
            </div>
          </div>
          <button onClick={onClose} className="p-4 bg-slate-50 rounded-full text-slate-300 hover:text-rose-500 transition-all border border-slate-100">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-8 no-scrollbar">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Activity Node Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {activityTypes.map((t) => (
                <button
                  key={t.label}
                  onClick={() => { setType(t.value); setSelectedLabel(t.label) }}
                  className={`flex flex-col items-center gap-3 p-4 rounded-3xl border-2 transition-all ${
                    selectedLabel === t.label
                    ? "bg-indigo-50 border-indigo-600 text-indigo-600 shadow-md" 
                    : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                  }`}
                >
                  <div className={`p-2 rounded-xl ${selectedLabel === t.label ? "bg-indigo-600 text-white" : "bg-slate-50"}`}>
                    {t.icon}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Temporal Data (When)</label>
            <div className="relative group">
              <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="datetime-local"
                value={timestamp}
                onChange={(e) => setTimestamp(e.target.value)}
                className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500/10 focus:bg-white rounded-[28px] py-5 pl-16 pr-8 text-sm font-bold outline-none transition-all shadow-inner"
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Outcome Logic (Result)</label>
            <textarea
              placeholder="Describe the interaction result..."
              value={result}
              onChange={(e) => setResult(e.target.value)}
              className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500/10 focus:bg-white rounded-[32px] p-8 text-sm font-bold outline-none transition-all shadow-inner min-h-[120px] resize-none"
            />
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Financial Investment</label>
              <button 
                onClick={() => setHasInvestment(!hasInvestment)}
                className={`w-12 h-6 rounded-full relative transition-colors ${hasInvestment ? "bg-indigo-600" : "bg-slate-200"}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${hasInvestment ? "right-1" : "left-1"}`} />
              </button>
            </div>
            
            {hasInvestment && (
              <div className="relative group animate-in slide-in-from-top-2">
                <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-500/10 focus:bg-white rounded-[28px] py-5 pl-16 pr-8 text-sm font-bold outline-none transition-all shadow-inner"
                />
              </div>
            )}
          </div>
        </div>

        <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
          <BaseButton variant="ghost" onClick={onClose} className="font-black text-[10px] uppercase tracking-widest px-8">Discard</BaseButton>
          <BaseButton 
            variant="primary" 
            size="lg" 
            className="px-12 rounded-[24px] shadow-indigo-200" 
            icon={<Save size={18} />}
            onClick={handleSave}
            disabled={!result}
          >
            Save Interaction
          </BaseButton>
        </div>
      </div>
    </div>
  )
}
