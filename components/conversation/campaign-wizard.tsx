"use client"

import { useState } from "react"
import { Shield, Mail, Smartphone, Linkedin, Package, Sparkles } from "lucide-react"
import { BaseButton } from "@/components/ui/base-button"
import type { Contact } from "@/types"

export interface CampaignConfig {
  channels: string[]
  budget: number
  aggressiveness: number
  products: string[]
  objective: string
}

interface CampaignWizardProps {
  contact: Contact
  onCancel: () => void
  onStart: (config: CampaignConfig) => void
}

export function CampaignWizard({ contact, onCancel, onStart }: CampaignWizardProps) {
  const [config, setConfig] = useState<CampaignConfig>({
    channels: ["Email"],
    budget: 100,
    aggressiveness: 45,
    products: ["SaaS License"],
    objective: "Initial Discovery",
  })

  const channels = [
    { id: "Email", icon: Mail },
    { id: "SMS", icon: Smartphone },
    { id: "LinkedIn", icon: Linkedin },
    { id: "Physical Gift", icon: Package },
  ]

  const toggleChannel = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      channels: prev.channels.includes(id)
        ? prev.channels.filter((c) => c !== id)
        : [...prev.channels, id],
    }))
  }

  return (
    <div className="flex-1 flex bg-white overflow-hidden animate-in slide-in-from-right-8 duration-500">
      <div className="flex-1 p-12 overflow-y-auto no-scrollbar space-y-12">
        <div className="space-y-2">
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">
            Configure Outreach
          </h3>
          <p className="text-slate-500 text-sm">
            Define the tactical parameters for Thorne to execute on this node.
          </p>
        </div>

        <div className="space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
              Mission Objective
            </label>
            <input
              className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500/20 focus:bg-white rounded-2xl p-4 text-sm font-bold outline-none transition-all shadow-sm"
              value={config.objective}
              onChange={(e) => setConfig({ ...config, objective: e.target.value })}
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
              Attack Vectors (Channels)
            </label>
            <div className="grid grid-cols-2 gap-3">
              {channels.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => toggleChannel(ch.id)}
                  className={`p-4 rounded-2xl border-2 flex items-center gap-3 transition-all ${
                    config.channels.includes(ch.id)
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-lg"
                      : "bg-white text-slate-500 border-slate-100 hover:border-indigo-200"
                  }`}
                >
                  <ch.icon size={18} />
                  <span className="text-xs font-bold">{ch.id}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                Flow Aggressiveness
              </label>
              <span
                className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                  config.aggressiveness > 70
                    ? "bg-rose-50 text-rose-600"
                    : "bg-indigo-50 text-indigo-600"
                }`}
              >
                {config.aggressiveness}% -{" "}
                {config.aggressiveness > 70
                  ? "Aggressive"
                  : config.aggressiveness > 30
                    ? "Consultative"
                    : "Subtle"}
              </span>
            </div>
            <input
              type="range"
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              value={config.aggressiveness}
              onChange={(e) =>
                setConfig({ ...config, aggressiveness: Number.parseInt(e.target.value) })
              }
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                Automation Budget Cap
              </label>
              <span className="text-lg font-black text-indigo-600">${config.budget}</span>
            </div>
            <input
              type="range"
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              min="10"
              max="1000"
              step="10"
              value={config.budget}
              onChange={(e) =>
                setConfig({ ...config, budget: Number.parseInt(e.target.value) })
              }
            />
          </div>
        </div>

        <div className="flex items-center gap-4 pt-6">
          <BaseButton variant="ghost" onClick={onCancel} className="px-10">
            Cancel
          </BaseButton>
          <BaseButton
            variant="primary"
            size="lg"
            className="flex-1 rounded-[24px]"
            icon={<Sparkles size={18} />}
            onClick={() => onStart(config)}
          >
            Initialize Campaign
          </BaseButton>
        </div>
      </div>

      <div className="w-96 bg-slate-900 p-12 text-white space-y-8 relative overflow-hidden">
        <div className="relative z-10 space-y-6">
          <div className="p-3 bg-indigo-500/20 rounded-2xl border border-indigo-500/30 w-fit">
            <Shield size={32} className="text-indigo-400" />
          </div>
          <h4 className="text-xl font-bold tracking-tight">{"Thorne's Strategic Forecast"}</h4>
          <div className="space-y-6">
            <ForecastItem
              label="Projected Reach"
              value="98.2%"
              detail="High confidence in email/SMS deliverability."
            />
            <ForecastItem
              label="Thorne handling probability"
              value="84%"
              detail="AI will manage responses unless 'High Risk' detected."
            />
            <ForecastItem
              label="Conversion velocity"
              value="Accelerated"
              detail="Multi-channel approach reduces response lag."
            />
          </div>
        </div>
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      </div>
    </div>
  )
}

function ForecastItem({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail: string
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
          {label}
        </span>
        <span className="text-sm font-bold">{value}</span>
      </div>
      <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{detail}</p>
    </div>
  )
}
