"use client"

import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  subValue?: string
  icon: LucideIcon
  iconBg: string
  iconColor: string
  trend?: {
    value: string
    isPositive: boolean
  }
  metrics?: Array<{
    label: string
    value: string
    trend?: "up" | "down"
    trendValue?: string
    align?: "left" | "right"
  }>
  onClick: () => void
  accentColor?: string
}

export function StatCard({
  title,
  value,
  subValue,
  icon: Icon,
  iconBg,
  iconColor,
  trend,
  metrics,
  onClick,
}: StatCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-3xl shadow-sm border border-slate-200 p-7 cursor-pointer hover:shadow-xl hover:border-indigo-100 transition-all group overflow-hidden relative"
    >
      <div className="flex items-start justify-between mb-6">
        <div
          className={`p-3.5 ${iconBg} rounded-2xl transition-colors border border-transparent group-hover:border-opacity-10 group-hover:border-current`}
        >
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        {trend && (
          <div
            className={`flex items-center ${trend.isPositive ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"} px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-current border-opacity-10`}
          >
            {trend.isPositive ? "+" : "-"} {trend.value}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{title}</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-slate-900 tracking-tight">{value}</span>
          {subValue && <span className="text-sm text-slate-400 font-medium">{subValue}</span>}
        </div>
      </div>

      {metrics && (
        <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 gap-4">
          {metrics.map((m, i) => (
            <div key={i} className={m.align === "right" ? "text-right" : "text-left"}>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">{m.label}</p>
              <div className={`flex items-baseline gap-1.5 ${m.align === "right" ? "justify-end" : ""}`}>
                <p className="text-sm font-bold text-slate-800">{m.value}</p>
                {m.trendValue && (
                  <span className={`text-[10px] font-bold ${m.trend === "up" ? "text-emerald-500" : "text-rose-500"}`}>
                    {m.trend === "up" ? "+" : "-"} {m.trendValue}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div
        className={`absolute -right-6 -bottom-6 opacity-[0.03] pointer-events-none ${iconColor} rotate-12 transition-transform duration-500 group-hover:scale-110`}
      >
        <Icon className="w-40 h-40" />
      </div>
    </div>
  )
}
