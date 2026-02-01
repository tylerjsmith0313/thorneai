"use client"

import { useState } from "react"
import { X, Calendar, Clock, Check, AlignLeft } from "lucide-react"
import { BaseButton } from "@/components/ui/base-button"

interface ScheduleActivityModalProps {
  onClose: () => void
  onSave?: (activity: ScheduledActivity) => void
  editActivity?: ScheduledActivity | null
}

export interface ScheduledActivity {
  id?: string
  title: string
  date: string
  time: string
  status: "scheduled" | "completed" | "cancelled" | "rescheduled"
  classification: "meeting" | "call" | "deep_work" | "task" | "event"
  notes: string
}

export function ScheduleActivityModal({ onClose, onSave, editActivity }: ScheduleActivityModalProps) {
  const [title, setTitle] = useState(editActivity?.title || "")
  const [date, setDate] = useState(editActivity?.date || new Date().toISOString().slice(0, 10))
  const [time, setTime] = useState(editActivity?.time || "09:00")
  const [status, setStatus] = useState<ScheduledActivity["status"]>(editActivity?.status || "scheduled")
  const [classification, setClassification] = useState<ScheduledActivity["classification"]>(editActivity?.classification || "meeting")
  const [notes, setNotes] = useState(editActivity?.notes || "")

  const isEditMode = !!editActivity

  const statuses = [
    { id: "scheduled", label: "Scheduled" },
    { id: "completed", label: "Completed" },
    { id: "cancelled", label: "Cancelled" },
    { id: "rescheduled", label: "Rescheduled" },
  ] as const

  const classifications = [
    { id: "meeting", label: "Meeting" },
    { id: "call", label: "Call" },
    { id: "deep_work", label: "Deep Work" },
    { id: "task", label: "Task" },
    { id: "event", label: "Event" },
  ] as const

  const handleSave = () => {
    if (onSave) {
      onSave({
        id: editActivity?.id || crypto.randomUUID(),
        title,
        date,
        time,
        status,
        classification,
        notes,
      })
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="bg-white w-full max-w-lg rounded-[48px] shadow-2xl overflow-hidden relative flex flex-col animate-in zoom-in-95 duration-300 border border-white/20 max-h-[90vh]">
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-slate-100 rounded-[22px] text-slate-600 flex items-center justify-center border border-slate-200">
              <Calendar size={28} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-none">
                {isEditMode ? "Edit Activity" : "Schedule Activity"}
              </h2>
              <p className="text-[10px] font-extrabold text-emerald-500 uppercase tracking-widest mt-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Neural Slot Reservation
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isEditMode && (
              <button className="p-4 bg-rose-50 rounded-full text-rose-400 hover:text-rose-600 hover:bg-rose-100 transition-all border border-rose-100">
                <X size={20} />
              </button>
            )}
            <button onClick={onClose} className="p-4 bg-slate-50 rounded-full text-slate-300 hover:text-slate-500 transition-all border border-slate-100">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">
          {/* Activity Title */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Activity Title</label>
            <input
              type="text"
              placeholder="e.g. Q4 Growth Review"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500/20 focus:bg-white rounded-2xl py-4 px-6 text-sm font-medium outline-none transition-all"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Temporal Node (Date)</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500/20 focus:bg-white rounded-2xl py-4 pl-12 pr-4 text-sm font-medium outline-none transition-all"
                />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Precision Time</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500/20 focus:bg-white rounded-2xl py-4 pl-12 pr-4 text-sm font-medium outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Execution Status */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Execution Status</label>
            <div className="grid grid-cols-2 gap-3">
              {statuses.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStatus(s.id)}
                  className={`px-4 py-3 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                    status === s.id
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                      : "bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-100"
                  }`}
                >
                  {status === s.id && <Check size={14} />}
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Classification */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Classification</label>
            <div className="flex flex-wrap gap-2">
              {classifications.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setClassification(c.id)}
                  className={`px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${
                    classification === c.id
                      ? "bg-slate-900 text-white"
                      : "bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-100"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Additional Context */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Additional Context</label>
            <div className="relative">
              <AlignLeft className="absolute left-4 top-4 text-slate-300 w-4 h-4" />
              <textarea
                placeholder="Notes regarding this session..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500/20 focus:bg-white rounded-2xl py-4 pl-12 pr-4 text-sm font-medium outline-none transition-all min-h-[100px] resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
          <BaseButton variant="ghost" onClick={onClose} className="font-black text-[10px] uppercase tracking-widest px-6">
            Discard
          </BaseButton>
          <BaseButton 
            variant="primary" 
            size="lg" 
            className="px-10 rounded-2xl shadow-indigo-200" 
            icon={<Check size={18} />}
            onClick={handleSave}
            disabled={!title}
          >
            {isEditMode ? "Update Node" : "Schedule Activity"}
          </BaseButton>
        </div>
      </div>
    </div>
  )
}
