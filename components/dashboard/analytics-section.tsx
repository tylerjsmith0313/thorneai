"use client"

import React from "react"

import { BarChart3, DollarSign, Calculator, Target, ChevronRight } from "lucide-react"
import { BaseButton } from "@/components/ui/base-button"

export function AnalyticsSection() {
  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 rounded-[48px] p-10 text-white space-y-8 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <h4 className="text-2xl font-bold tracking-tight">Business P&L Deep Dive</h4>
            <p className="text-sm text-slate-400 font-medium">
              Real-time mapping of outreach costs vs. earned commission.
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-2 gap-8 py-4 border-y border-white/10">
            <div>
              <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mb-1">
                Gross Revenue
              </p>
              <p className="text-3xl font-bold">$124,500</p>
            </div>
            <div>
              <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mb-1">
                Outreach CAC
              </p>
              <p className="text-3xl font-bold text-emerald-400">$2,410</p>
            </div>
          </div>

          <div className="relative z-10">
            <BaseButton
              variant="primary"
              className="bg-indigo-600 border-none shadow-none hover:bg-indigo-500 w-full"
            >
              Build Custom Pay Structure
            </BaseButton>
          </div>
          <BarChart3 className="absolute right-[-40px] bottom-[-40px] w-64 h-64 text-white/5 pointer-events-none" />
        </div>

        <div className="space-y-6">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
            Tactical ROI Calculators
          </h4>
          <div className="grid grid-cols-1 gap-4">
            <CalcCard
              icon={<DollarSign size={20} />}
              title="Commission Forecaster"
              desc="Project future earnings based on current pipeline velocity."
            />
            <CalcCard
              icon={<Calculator size={20} />}
              title="Budget Modeler"
              desc="Personal vs. Professional burn rate and tax estimates."
            />
            <CalcCard
              icon={<Target size={20} />}
              title="Conversion Audit"
              desc="Deep-dive into channel performance (SMS vs Email vs Gift)."
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function CalcCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode
  title: string
  desc: string
}) {
  return (
    <div className="p-6 bg-slate-50 border border-slate-200 rounded-[32px] flex items-center justify-between hover:bg-white hover:shadow-xl hover:border-indigo-100 transition-all group cursor-pointer">
      <div className="flex items-center gap-5">
        <div className="p-3 bg-white rounded-2xl border border-slate-100 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all shadow-sm">
          {icon}
        </div>
        <div>
          <h5 className="text-sm font-bold text-slate-900">{title}</h5>
          <p className="text-xs text-slate-500 font-medium">{desc}</p>
        </div>
      </div>
      <ChevronRight
        size={18}
        className="text-slate-300 group-hover:text-indigo-400 transition-all"
      />
    </div>
  )
}
