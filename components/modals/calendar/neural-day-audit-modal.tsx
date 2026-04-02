"use client"

import { X, Activity, Video, Phone, Zap, Check } from "lucide-react"
import { BaseButton } from "@/components/ui/base-button"

interface NeuralDayAuditModalProps {
  onClose: () => void
  date: Date
  activities?: DayActivity[]
}

interface DayActivity {
  id: string
  title: string
  time: string
  type: "zoom" | "call" | "meeting"
  status: "completed" | "scheduled" | "cancelled"
  heat: number
}

export function NeuralDayAuditModal({ onClose, date, activities = [] }: NeuralDayAuditModalProps) {
  const dayNumber = date.getDate()
  
  // Mock data if no activities provided
  const defaultActivities: DayActivity[] = [
    { id: "1", title: "Acme Corp Discovery", time: "10:00 AM", type: "zoom", status: "completed", heat: 92 },
    { id: "2", title: "Global Tech Follow-up", time: "01:30 PM", type: "call", status: "scheduled", heat: 75 },
    { id: "3", title: "Strategic Planning: Q3", time: "04:00 PM", type: "meeting", status: "cancelled", heat: 40 },
  ]

  const displayActivities = activities.length > 0 ? activities : defaultActivities

  const completedCount = displayActivities.filter(a => a.status === "completed").length
  const totalCount = displayActivities.length
  const flowEfficiency = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  const avgHeat = Math.round(displayActivities.reduce((sum, a) => sum + a.heat, 0) / displayActivities.length)

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "zoom": return <Video size={16} />
      case "call": return <Phone size={16} />
      default: return <Zap size={16} />
    }
  }

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "completed": return "bg-emerald-50 text-emerald-600 border-emerald-100"
      case "scheduled": return "bg-amber-50 text-amber-600 border-amber-100"
      case "cancelled": return "bg-rose-50 text-rose-500 border-rose-100"
      default: return "bg-slate-50 text-slate-500 border-slate-100"
    }
  }

  const getHeatColor = (heat: number) => {
    if (heat >= 80) return "text-emerald-500"
    if (heat >= 60) return "text-amber-500"
    return "text-rose-500"
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="bg-white w-full max-w-lg rounded-[48px] shadow-2xl overflow-hidden relative flex flex-col animate-in zoom-in-95 duration-300 border border-white/20 max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-emerald-500/20 rounded-[22px] flex items-center justify-center border border-emerald-500/30">
                <Activity size={28} className="text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight uppercase">Neural Day Audit</h2>
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mt-1 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  Day {dayNumber} • Performance Telemetry
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-3 bg-white/10 rounded-full text-white/60 hover:text-white hover:bg-white/20 transition-all">
              <X size={20} />
            </button>
          </div>
          <Activity className="absolute -right-8 -bottom-8 w-32 h-32 text-white/5" />
        </div>

        {/* Metrics */}
        <div className="p-6 grid grid-cols-3 gap-4 border-b border-slate-100">
          <div className="bg-indigo-50 rounded-2xl p-4 text-center border border-indigo-100">
            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Flow Efficiency</p>
            <p className="text-2xl font-black text-indigo-600">{flowEfficiency}%</p>
            <p className="text-[9px] text-slate-400 mt-1">Completed vs Total Nodes</p>
          </div>
          <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Engagement</p>
            <p className="text-2xl font-black text-slate-700">{totalCount}</p>
            <p className="text-[9px] text-slate-400 mt-1">Executed Neural Slots</p>
          </div>
          <div className="bg-emerald-50 rounded-2xl p-4 text-center border border-emerald-100">
            <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">Conversion Heat</p>
            <p className="text-2xl font-black text-emerald-600">{avgHeat}%</p>
            <p className="text-[9px] text-slate-400 mt-1">Average Response Intent</p>
          </div>
        </div>

        {/* Thorne Tactical Insight */}
        <div className="p-6 border-b border-slate-100">
          <div className="bg-slate-900 rounded-3xl p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-indigo-500/20 rounded-xl flex items-center justify-center border border-indigo-500/30">
                <Zap size={16} className="text-indigo-400" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-wider">Thorne Tactical Insight</h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              "Day {dayNumber} showed high velocity in Initial Discovery nodes. However, your &apos;Deep Work&apos; blocks were 
              interrupted by 3 manual overrides. To optimize flow, Thorne recommends locking temporal nodes for at least 90m cycles."
            </p>
          </div>
        </div>

        {/* Node Execution Log */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 no-scrollbar">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Node Execution Log</h4>
          
          {displayActivities.map((activity) => (
            <div key={activity.id} className="bg-white border border-slate-100 rounded-2xl p-4 hover:shadow-lg hover:border-indigo-100 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    activity.status === "completed" ? "bg-emerald-50 text-emerald-500 border border-emerald-100" :
                    activity.status === "cancelled" ? "bg-rose-50 text-rose-400 border border-rose-100" :
                    "bg-amber-50 text-amber-500 border border-amber-100"
                  }`}>
                    {getTypeIcon(activity.type)}
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-800">{activity.title}</h5>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-slate-400">{activity.time}</span>
                      <span className="w-1 h-1 bg-slate-200 rounded-full" />
                      <span className="text-[10px] text-indigo-500 font-bold uppercase">{activity.type}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${getStatusStyles(activity.status)}`}>
                    {activity.status}
                  </span>
                  <p className={`text-[10px] font-bold mt-1 ${getHeatColor(activity.heat)}`}>
                    Heat: {activity.heat}%
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 shrink-0">
          <BaseButton 
            variant="dark" 
            fullWidth 
            size="lg" 
            className="rounded-2xl" 
            icon={<Check size={18} />}
            onClick={onClose}
          >
            Close Audit
          </BaseButton>
        </div>
      </div>
    </div>
  )
}
