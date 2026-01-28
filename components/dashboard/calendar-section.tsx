"use client"

import { useState } from "react"
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Sparkles, 
  Clock, 
  Users, 
  Video, 
  Link as LinkIcon,
  MoreVertical
} from "lucide-react"
import { BaseButton } from "@/components/ui/base-button"
import { BookingLinkModal } from "@/components/modals/booking-link-modal"

export function CalendarSection() {
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false)
  const [currentDate] = useState(new Date())

  const meetings = [
    { id: 1, title: "Acme Corp Discovery", time: "10:00 AM", duration: "30m", type: "Zoom", attendees: 3, status: "confirmed" },
    { id: 2, title: "Global Tech Follow-up", time: "1:30 PM", duration: "45m", type: "Phone", attendees: 2, status: "pending" },
    { id: 3, title: "Strategic Planning: Q3", time: "4:00 PM", duration: "60m", type: "Internal", attendees: 5, status: "confirmed" },
  ]

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 border border-indigo-100 shadow-sm">
            <CalendarIcon size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Calendar Hub</h3>
            <p className="text-sm text-slate-500 font-medium">Manage your availability and neural booking nodes.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <BaseButton 
             variant="secondary" 
             size="sm" 
             className="rounded-xl font-black uppercase tracking-widest text-[10px]"
             icon={<Sparkles size={14} />}
             onClick={() => setIsLinkModalOpen(true)}
           >
             Generate Thorne Booking Link
           </BaseButton>
           <BaseButton variant="dark" size="sm" icon={<Plus size={16} />}>New Event</BaseButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        {/* Calendar Grid */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-[40px] p-8 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-10">
            <h4 className="text-xl font-black text-slate-800 tracking-tight">
              {currentDate.toLocaleString("default", { month: "long" })} {currentDate.getFullYear()}
            </h4>
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/50">
              <button className="p-2 hover:bg-white hover:text-indigo-600 rounded-xl transition-all"><ChevronLeft size={18} /></button>
              <button className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-indigo-600">Today</button>
              <button className="p-2 hover:bg-white hover:text-indigo-600 rounded-xl transition-all"><ChevronRight size={18} /></button>
            </div>
          </div>

          <div className="grid grid-cols-7 mb-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
              <div key={day} className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-px bg-slate-100 border border-slate-100 rounded-3xl overflow-hidden flex-1 shadow-inner">
            {Array.from({ length: 35 }).map((_, i) => {
              const day = i - 3
              const isCurrentMonth = day > 0 && day <= 31
              const isToday = day === new Date().getDate()
              
              return (
                <div key={i} className={`bg-white min-h-[100px] p-3 transition-colors hover:bg-slate-50 relative group ${!isCurrentMonth ? "opacity-30" : ""}`}>
                  <span className={`text-xs font-bold ${isToday ? "bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center -ml-1 -mt-1" : "text-slate-400"}`}>
                    {day > 0 && day <= 31 ? day : day <= 0 ? 30 + day : day - 31}
                  </span>
                  
                  {isToday && (
                    <div className="mt-2 space-y-1">
                      <div className="px-2 py-1 bg-indigo-50 border border-indigo-100 rounded-lg text-[8px] font-bold text-indigo-600 truncate">10:00 AM Discovery</div>
                      <div className="px-2 py-1 bg-emerald-50 border border-emerald-100 rounded-lg text-[8px] font-bold text-emerald-600 truncate">1:30 PM Follow-up</div>
                    </div>
                  )}
                  
                  <div className="absolute inset-0 border-2 border-indigo-600/0 group-hover:border-indigo-600/5 pointer-events-none transition-all" />
                </div>
              )
            })}
          </div>
        </div>

        {/* Sidebar: Agenda & Tools */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-slate-900 rounded-[40px] p-8 text-white space-y-6 shadow-2xl relative overflow-hidden shrink-0">
             <div className="flex items-center gap-3 relative z-10">
                <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                  <Clock size={20} className="text-indigo-400" />
                </div>
                <h4 className="font-bold text-lg tracking-tight">Active Availability</h4>
             </div>
             <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Focus Mode</span>
                   <div className="w-10 h-5 bg-indigo-600 rounded-full relative p-1 cursor-pointer">
                      <div className="w-3 h-3 bg-white rounded-full absolute right-1" />
                   </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed italic">
                  Thorne is currently prioritizing Morning blocks for High-Heat leads based on your Q2 directives.
                </p>
             </div>
             <Sparkles className="absolute right-[-20px] bottom-[-20px] w-48 h-48 text-white/5 pointer-events-none rotate-12" />
          </div>

          <div className="flex-1 bg-white border border-slate-200 rounded-[40px] p-8 shadow-sm flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Today&apos;s Agenda</h4>
              <button className="p-2 text-slate-300 hover:text-indigo-600 transition-colors"><MoreVertical size={18} /></button>
            </div>
            
            <div className="space-y-4 overflow-y-auto no-scrollbar">
              {meetings.map(meeting => (
                <div key={meeting.id} className="p-5 bg-slate-50/50 border border-slate-100 rounded-[28px] hover:bg-white hover:shadow-xl hover:border-indigo-100 transition-all cursor-pointer group">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-2 rounded-xl transition-all ${meeting.status === "confirmed" ? "bg-indigo-600 text-white" : "bg-white text-slate-400 border border-slate-100 shadow-sm"}`}>
                      {meeting.type === "Zoom" ? <Video size={14} /> : <Users size={14} />}
                    </div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{meeting.time}</span>
                  </div>
                  <h5 className="text-sm font-black text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">{meeting.title}</h5>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{meeting.duration}</span>
                    <div className="w-1 h-1 bg-slate-200 rounded-full" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{meeting.attendees} Attendees</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-auto pt-6 border-t border-slate-100">
               <BaseButton variant="outline" fullWidth size="sm" className="rounded-xl border-slate-100 text-slate-500 font-black text-[10px] uppercase tracking-widest bg-transparent" icon={<LinkIcon size={14} />}>
                 View Public Page
               </BaseButton>
            </div>
          </div>
        </div>
      </div>

      {isLinkModalOpen && <BookingLinkModal onClose={() => setIsLinkModalOpen(false)} />}
    </div>
  )
}
