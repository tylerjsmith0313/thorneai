"use client"

import { useState } from "react"
import { X, Calendar, Clock, Video, MapPin } from "lucide-react"
import { BaseButton } from "@/components/ui/base-button"

interface MeetingSchedulerProps {
  contact: { firstName?: string; lastName?: string; email?: string }
  onClose: () => void
}

export function MeetingScheduler({ contact, onClose }: MeetingSchedulerProps) {
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [meetingType, setMeetingType] = useState<"video" | "in-person">("video")

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden relative flex flex-col animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl text-white flex items-center justify-center">
              <Calendar size={24} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Schedule Meeting</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">with {contact.firstName} {contact.lastName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-50 rounded-full text-slate-300 hover:text-rose-500 transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="flex gap-3">
            <button
              onClick={() => setMeetingType("video")}
              className={`flex-1 p-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-2 ${
                meetingType === "video" 
                  ? "bg-indigo-50 border-indigo-600 text-indigo-600" 
                  : "bg-white border-slate-100 text-slate-400"
              }`}
            >
              <Video size={18} />
              <span className="text-xs font-bold uppercase tracking-widest">Video Call</span>
            </button>
            <button
              onClick={() => setMeetingType("in-person")}
              className={`flex-1 p-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-2 ${
                meetingType === "in-person" 
                  ? "bg-indigo-50 border-indigo-600 text-indigo-600" 
                  : "bg-white border-slate-100 text-slate-400"
              }`}
            >
              <MapPin size={18} />
              <span className="text-xs font-bold uppercase tracking-widest">In Person</span>
            </button>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Select Date</label>
            <div className="relative">
              <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500/20 focus:bg-white rounded-2xl py-4 pl-14 pr-6 text-sm font-bold outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Select Time</label>
            <div className="relative">
              <Clock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500/20 focus:bg-white rounded-2xl py-4 pl-14 pr-6 text-sm font-bold outline-none transition-all"
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
          <BaseButton variant="ghost" onClick={onClose} className="flex-1">
            Cancel
          </BaseButton>
          <BaseButton variant="primary" className="flex-1" disabled={!date || !time}>
            Confirm Meeting
          </BaseButton>
        </div>
      </div>
    </div>
  )
}
