"use client"

import { useState } from "react"
import { ShieldAlert, Zap, DollarSign } from "lucide-react"

export function ComplianceSafeguards() {
  const [dncEnabled, setDncEnabled] = useState(true)
  const [automationMode, setAutomationMode] = useState<"user" | "auto">("auto")
  const [maxGiftValue, setMaxGiftValue] = useState(50)
  const [monthlyBurnLimit, setMonthlyBurnLimit] = useState(1000)

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
      <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Compliance & Safeguards</h3>

      <div className="grid grid-cols-1 gap-6">
        <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-200 flex items-center justify-between group hover:bg-white transition-all">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-white rounded-2xl border border-slate-100 text-rose-500 group-hover:bg-rose-50 group-hover:border-rose-100 transition-all shadow-sm">
              <ShieldAlert size={24} />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">Scrub National DNC Registry</h4>
              <p className="text-sm text-slate-500 mt-1">Automatically check Do Not Call lists before any voice AI outreach.</p>
            </div>
          </div>
          <Toggle active={dncEnabled} onChange={setDncEnabled} />
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div className="p-8 bg-indigo-50 rounded-[40px] border border-indigo-100 space-y-6">
            <div className="flex items-center gap-3">
              <Zap size={20} className="text-indigo-600" />
              <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-widest">Global Automation Mode</h4>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setAutomationMode("user")}
                className={`w-full py-4 rounded-2xl text-xs font-bold transition-all ${
                  automationMode === "user"
                    ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100"
                    : "bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50"
                }`}
              >
                User Controlled
              </button>
              <button
                onClick={() => setAutomationMode("auto")}
                className={`w-full py-4 rounded-2xl text-xs font-bold transition-all ${
                  automationMode === "auto"
                    ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100"
                    : "bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50"
                }`}
              >
                Set to Flow (Full Auto)
              </button>
            </div>
          </div>

          <div className="p-8 bg-slate-900 rounded-[40px] text-white space-y-8 shadow-2xl">
            <div className="flex items-center gap-3">
              <DollarSign size={20} className="text-indigo-400" />
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Auto-Approve Budget</h4>
            </div>
            <div className="space-y-8">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
                  <span>Max Per-Gift Value</span>
                  <span className="text-indigo-400 text-base">${maxGiftValue.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={200}
                  value={maxGiftValue}
                  onChange={(e) => setMaxGiftValue(Number(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
                  <span>Monthly Burn Limit</span>
                  <span className="text-indigo-400 text-base">${monthlyBurnLimit.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={5000}
                  value={monthlyBurnLimit}
                  onChange={(e) => setMonthlyBurnLimit(Number(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Toggle({ active, onChange }: { active: boolean; onChange: (value: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!active)}
      className={`w-14 h-7 rounded-full relative p-1 cursor-pointer transition-colors ${active ? "bg-indigo-600" : "bg-slate-300"}`}
    >
      <div className={`w-5 h-5 bg-white rounded-full absolute transition-all shadow-sm ${active ? "right-1" : "left-1"}`} />
    </button>
  )
}
