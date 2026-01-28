"use client"

import { useState } from "react"
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Clock,
  Users,
  Video,
  Phone,
  Zap,
  Link as LinkIcon,
  Settings,
  Activity,
  Sparkles
} from "lucide-react"
import { BaseButton } from "@/components/ui/base-button"
import { BookingLinkModal } from "@/components/modals/booking-link-modal"
import { ScheduleActivityModal, type ScheduledActivity } from "@/components/modals/calendar/schedule-activity-modal"
import { NeuralDayAuditModal } from "@/components/modals/calendar/neural-day-audit-modal"
import { ActivityTrackerModal } from "@/components/modals/contact-detail/activity-tracker-modal"

interface AgendaItem {
  id: string
  title: string
  time: string
  duration: string
  type: "zoom" | "call" | "meeting"
  attendees: number
  status: "completed" | "scheduled" | "cancelled"
  heat: number
}

export function CalendarSection() {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [isActivityTrackerOpen, setIsActivityTrackerOpen] = useState(false)
  const [isDayAuditOpen, setIsDayAuditOpen] = useState(false)
  const [editActivity, setEditActivity] = useState<ScheduledActivity | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(new Date().getDate())

  const agendaItems: AgendaItem[] = [
    { id: "1", title: "Acme Corp Discovery", time: "10:00 AM", duration: "30M", type: "zoom", attendees: 3, status: "completed", heat: 92 },
    { id: "2", title: "Global Tech Follow-up", time: "01:30 PM", duration: "45M", type: "call", attendees: 2, status: "scheduled", heat: 75 },
    { id: "3", title: "Strategic Planning: Q3", time: "04:00 PM", duration: "60M", type: "meeting", attendees: 5, status: "cancelled", heat: 40 },
  ]

  const month = currentDate.toLocaleString("default", { month: "long" })
  const year = currentDate.getFullYear()

  const daysInMonth = new Date(year, currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(year, currentDate.getMonth(), 1).getDay()

  const prevMonth = () => {
    setCurrentDate(new Date(year, currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, currentDate.getMonth() + 1, 1))
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "zoom": return <Video size={14} />
      case "call": return <Phone size={14} />
      default: return <Users size={14} />
    }
  }

  const getStatusBadge = (status: string, heat: number) => {
    const colors = {
      completed: "bg-emerald-50 text-emerald-600 border-emerald-100",
      scheduled: "bg-amber-50 text-amber-600 border-amber-100",
      cancelled: "bg-rose-50 text-rose-500 border-rose-100",
    }
    return (
      <div className="flex flex-col items-end gap-1">
        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider border ${colors[status as keyof typeof colors] || colors.scheduled}`}>
          {status}
        </span>
        <span className={`text-[9px] font-bold ${heat >= 70 ? "text-emerald-500" : heat >= 50 ? "text-amber-500" : "text-rose-400"}`}>
          Heat: {heat}%
        </span>
      </div>
    )
  }

  const handleEditActivity = (item: AgendaItem) => {
    setEditActivity({
      id: item.id,
      title: item.title,
      date: new Date().toISOString().slice(0, 10),
      time: item.time,
      status: item.status,
      classification: item.type === "zoom" ? "meeting" : item.type === "call" ? "call" : "meeting",
      notes: "",
    })
    setIsScheduleModalOpen(true)
  }

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Neural Availability Hub</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Global Schedule</h3>
          <p className="text-xs text-slate-500 mt-1 italic">"Thorne is orchestrating 3 high-heat connections this month."</p>
        </div>
        <div className="flex items-center gap-3">
          <BaseButton 
            variant="outline" 
            size="sm" 
            className="rounded-xl font-bold text-[10px] uppercase tracking-wider bg-transparent border-slate-200"
            icon={<Activity size={14} />}
            onClick={() => setIsActivityTrackerOpen(true)}
          >
            Track Activity
          </BaseButton>
          <BaseButton 
            variant="outline" 
            size="sm" 
            className="rounded-xl font-bold text-[10px] uppercase tracking-wider bg-transparent border-slate-200"
            icon={<LinkIcon size={14} />}
            onClick={() => setIsBookingModalOpen(true)}
          >
            Booking Link
          </BaseButton>
          <BaseButton 
            variant="dark" 
            size="sm" 
            className="rounded-xl font-bold text-[10px] uppercase tracking-wider"
            icon={<Plus size={14} />}
            onClick={() => { setEditActivity(null); setIsScheduleModalOpen(true) }}
          >
            Schedule Activity
          </BaseButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Calendar Grid */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h4 className="text-xl font-black text-slate-800 tracking-tight">
                {month} {year}
              </h4>
              <button className="px-3 py-1.5 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-slate-200 transition-all">
                Today
              </button>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button onClick={prevMonth} className="p-2 hover:bg-white hover:text-indigo-600 rounded-lg transition-all">
                <ChevronLeft size={16} />
              </button>
              <button onClick={nextMonth} className="p-2 hover:bg-white hover:text-indigo-600 rounded-lg transition-all">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
              <div key={day} className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] text-center py-2">{day}</div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-px bg-slate-100 border border-slate-100 rounded-2xl overflow-hidden flex-1">
            {/* Empty cells for days before the first of the month */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-slate-50/50 min-h-[80px] p-2" />
            ))}
            
            {/* Actual days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth()
              const isSelected = day === selectedDay
              const hasEvents = day === 28 // Mock: day 28 has events
              
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`bg-white min-h-[80px] p-2 transition-all hover:bg-slate-50 text-left relative group ${
                    isSelected ? "ring-2 ring-indigo-500 ring-inset" : ""
                  }`}
                >
                  <span className={`text-xs font-bold inline-flex items-center justify-center w-6 h-6 ${
                    isToday ? "bg-indigo-600 text-white rounded-full" : "text-slate-500"
                  }`}>
                    {day}
                  </span>
                  
                  {hasEvents && (
                    <div className="flex items-center justify-center gap-0.5 mt-1">
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Sidebar: Agenda */}
        <div className="lg:col-span-4 flex flex-col gap-4 min-h-0">
          {/* Day Agenda Card */}
          <div className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 border border-indigo-100">
                  <Sparkles size={16} />
                </div>
                <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wider">Agenda: Day {selectedDay}</h4>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-1.5 text-slate-300 hover:text-indigo-600 transition-colors">
                  <Zap size={14} />
                </button>
                <button className="p-1.5 text-slate-300 hover:text-indigo-600 transition-colors">
                  <Settings size={14} />
                </button>
              </div>
            </div>

            {/* Agenda Items */}
            <div className="flex-1 overflow-y-auto space-y-3 no-scrollbar min-h-0">
              {agendaItems.map((item) => (
                <div 
                  key={item.id} 
                  className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl hover:bg-white hover:shadow-md hover:border-indigo-100 transition-all cursor-pointer"
                  onClick={() => handleEditActivity(item)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">{item.time}</span>
                    {getStatusBadge(item.status, item.heat)}
                  </div>
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl shrink-0 ${
                      item.status === "completed" ? "bg-emerald-50 text-emerald-500 border border-emerald-100" :
                      item.status === "cancelled" ? "bg-slate-100 text-slate-400 border border-slate-200" :
                      "bg-white text-slate-500 border border-slate-100 shadow-sm"
                    }`}>
                      {getTypeIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-sm font-bold text-slate-800 truncate">{item.title}</h5>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock size={10} className="text-slate-300" />
                        <span className="text-[10px] text-slate-400">{item.duration}</span>
                        <span className="w-1 h-1 bg-slate-200 rounded-full" />
                        <span className="text-[10px] text-slate-400">{item.attendees} Att.</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 space-y-2 mt-auto shrink-0">
              <BaseButton 
                variant="primary" 
                fullWidth 
                size="sm" 
                className="rounded-xl text-[10px] font-bold uppercase tracking-wider"
                icon={<Activity size={14} />}
                onClick={() => setIsDayAuditOpen(true)}
              >
                View Detailed Day Audit
              </BaseButton>
              <BaseButton 
                variant="outline" 
                fullWidth 
                size="sm" 
                className="rounded-xl text-[10px] font-bold uppercase tracking-wider bg-transparent border-slate-200"
                icon={<Settings size={14} />}
              >
                Agenda Settings
              </BaseButton>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {isBookingModalOpen && <BookingLinkModal onClose={() => setIsBookingModalOpen(false)} />}
      {isScheduleModalOpen && (
        <ScheduleActivityModal 
          onClose={() => { setIsScheduleModalOpen(false); setEditActivity(null) }}
          editActivity={editActivity}
          onSave={(activity) => {
            console.log("Saved activity:", activity)
          }}
        />
      )}
      {isActivityTrackerOpen && (
        <ActivityTrackerModal 
          onClose={() => setIsActivityTrackerOpen(false)}
          onSave={(activity) => {
            console.log("Tracked activity:", activity)
          }}
        />
      )}
      {isDayAuditOpen && (
        <NeuralDayAuditModal 
          onClose={() => setIsDayAuditOpen(false)}
          date={new Date(year, currentDate.getMonth(), selectedDay)}
        />
      )}
    </div>
  )
}
