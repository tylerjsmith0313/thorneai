"use client"

import { useState, useEffect, useCallback } from "react"
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
  Sparkles,
  Trash2
} from "lucide-react"
import { BaseButton } from "@/components/ui/base-button"
import { BookingLinkModal } from "@/components/modals/booking-link-modal"
import { NeuralDayAuditModal } from "@/components/modals/calendar/neural-day-audit-modal"
import { ActivityTrackerModal } from "@/components/modals/contact-detail/activity-tracker-modal"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { 
  getCalendarEvents, 
  createCalendarEvent, 
  updateCalendarEvent, 
  deleteCalendarEvent,
  type CalendarEvent 
} from "@/lib/data-service"

export function CalendarSection() {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [isActivityTrackerOpen, setIsActivityTrackerOpen] = useState(false)
  const [isDayAuditOpen, setIsDayAuditOpen] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(new Date().getDate())
  
  // Real data state
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  
  // Event modal state
  const [showEventModal, setShowEventModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventType: "meeting" as CalendarEvent["eventType"],
    startTime: "",
    durationMinutes: 30,
    location: "",
    meetingUrl: "",
    notes: "",
  })
  const [saving, setSaving] = useState(false)

  const loadEvents = useCallback(async () => {
    setLoading(true)
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59)
    const data = await getCalendarEvents(startOfMonth, endOfMonth)
    setEvents(data)
    setLoading(false)
  }, [currentDate])

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

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

  const goToToday = () => {
    const today = new Date()
    setCurrentDate(today)
    setSelectedDay(today.getDate())
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "zoom": return <Video size={14} />
      case "call": return <Phone size={14} />
      case "follow_up": return <Clock size={14} />
      case "task": return <Zap size={14} />
      case "reminder": return <Clock size={14} />
      default: return <Users size={14} />
    }
  }

  const getStatusBadge = (status: string, heatScore?: number) => {
    const heat = heatScore || 50
    const colors = {
      completed: "bg-emerald-50 text-emerald-600 border-emerald-100",
      scheduled: "bg-amber-50 text-amber-600 border-amber-100",
      cancelled: "bg-rose-50 text-rose-500 border-rose-100",
      rescheduled: "bg-blue-50 text-blue-600 border-blue-100",
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

  const getEventsForDay = (day: number) => {
    return events.filter(event => {
      const eventDate = new Date(event.startTime)
      return eventDate.getDate() === day && 
             eventDate.getMonth() === currentDate.getMonth() &&
             eventDate.getFullYear() === currentDate.getFullYear()
    })
  }

  const getDayEventsCount = (day: number) => {
    return getEventsForDay(day).length
  }

  const handleOpenNewEvent = () => {
    const selectedDate = new Date(year, currentDate.getMonth(), selectedDay)
    setSelectedEvent(null)
    setFormData({
      title: "",
      description: "",
      eventType: "meeting",
      startTime: `${selectedDate.toISOString().split("T")[0]}T09:00`,
      durationMinutes: 30,
      location: "",
      meetingUrl: "",
      notes: "",
    })
    setShowEventModal(true)
  }

  const handleEditEvent = (event: CalendarEvent) => {
    setSelectedEvent(event)
    const startDate = new Date(event.startTime)
    setFormData({
      title: event.title,
      description: event.description || "",
      eventType: event.eventType,
      startTime: startDate.toISOString().slice(0, 16),
      durationMinutes: event.durationMinutes,
      location: event.location || "",
      meetingUrl: event.meetingUrl || "",
      notes: event.notes || "",
    })
    setShowEventModal(true)
  }

  const handleSaveEvent = async () => {
    if (!formData.title || !formData.startTime) return

    setSaving(true)
    try {
      if (selectedEvent) {
        await updateCalendarEvent(selectedEvent.id, {
          title: formData.title,
          description: formData.description,
          eventType: formData.eventType,
          startTime: new Date(formData.startTime).toISOString(),
          durationMinutes: formData.durationMinutes,
          location: formData.location,
          meetingUrl: formData.meetingUrl,
          notes: formData.notes,
        })
      } else {
        await createCalendarEvent({
          userId: "",
          title: formData.title,
          description: formData.description,
          eventType: formData.eventType,
          startTime: new Date(formData.startTime).toISOString(),
          durationMinutes: formData.durationMinutes,
          location: formData.location,
          meetingUrl: formData.meetingUrl,
          notes: formData.notes,
          status: "scheduled",
        })
      }

      setShowEventModal(false)
      loadEvents()
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return
    setSaving(true)
    try {
      await deleteCalendarEvent(selectedEvent.id)
      setShowEventModal(false)
      loadEvents()
    } finally {
      setSaving(false)
    }
  }

  const handleMarkComplete = async (event: CalendarEvent) => {
    await updateCalendarEvent(event.id, { status: "completed" })
    loadEvents()
  }

  const selectedDayEvents = getEventsForDay(selectedDay)

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
          <p className="text-xs text-slate-500 mt-1 italic">
            {loading ? "Loading events..." : `${events.length} events this month`}
          </p>
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
            onClick={handleOpenNewEvent}
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
              <button 
                onClick={goToToday}
                className="px-3 py-1.5 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-slate-200 transition-all"
              >
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
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-slate-50/50 min-h-[80px] p-2" />
            ))}
            
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const isToday = day === new Date().getDate() && 
                              currentDate.getMonth() === new Date().getMonth() &&
                              currentDate.getFullYear() === new Date().getFullYear()
              const isSelected = day === selectedDay
              const eventCount = getDayEventsCount(day)
              const dayEvents = getEventsForDay(day)
              
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
                  
                  {eventCount > 0 && (
                    <div className="mt-1 space-y-0.5">
                      {dayEvents.slice(0, 2).map(event => (
                        <div 
                          key={event.id}
                          className={`text-[9px] px-1 py-0.5 rounded truncate ${
                            event.eventType === "zoom" ? "bg-blue-50 text-blue-600" :
                            event.eventType === "call" ? "bg-green-50 text-green-600" :
                            event.eventType === "meeting" ? "bg-indigo-50 text-indigo-600" :
                            "bg-amber-50 text-amber-600"
                          }`}
                        >
                          {event.title}
                        </div>
                      ))}
                      {eventCount > 2 && (
                        <div className="text-[9px] text-slate-400 px-1">+{eventCount - 2} more</div>
                      )}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Sidebar: Agenda */}
        <div className="lg:col-span-4 flex flex-col gap-4 min-h-0">
          <div className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 border border-indigo-100">
                  <Sparkles size={16} />
                </div>
                <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wider">
                  Agenda: {month} {selectedDay}
                </h4>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={handleOpenNewEvent}
                  className="p-1.5 text-slate-300 hover:text-indigo-600 transition-colors"
                >
                  <Plus size={14} />
                </button>
                <button className="p-1.5 text-slate-300 hover:text-indigo-600 transition-colors">
                  <Settings size={14} />
                </button>
              </div>
            </div>

            {/* Agenda Items */}
            <div className="flex-1 overflow-y-auto space-y-3 no-scrollbar min-h-0">
              {loading ? (
                <div className="text-center py-8 text-slate-400 text-sm">Loading...</div>
              ) : selectedDayEvents.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-slate-400 text-sm mb-3">No events scheduled</div>
                  <BaseButton 
                    variant="outline" 
                    size="sm" 
                    className="rounded-xl text-[10px] font-bold uppercase"
                    icon={<Plus size={14} />}
                    onClick={handleOpenNewEvent}
                  >
                    Add Event
                  </BaseButton>
                </div>
              ) : (
                selectedDayEvents.map((event) => (
                  <div 
                    key={event.id} 
                    className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl hover:bg-white hover:shadow-md hover:border-indigo-100 transition-all cursor-pointer"
                    onClick={() => handleEditEvent(event)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">
                        {new Date(event.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      {getStatusBadge(event.status, event.heatScore)}
                    </div>
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-xl shrink-0 ${
                        event.status === "completed" ? "bg-emerald-50 text-emerald-500 border border-emerald-100" :
                        event.status === "cancelled" ? "bg-slate-100 text-slate-400 border border-slate-200" :
                        "bg-white text-slate-500 border border-slate-100 shadow-sm"
                      }`}>
                        {getTypeIcon(event.eventType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="text-sm font-bold text-slate-800 truncate">{event.title}</h5>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock size={10} className="text-slate-300" />
                          <span className="text-[10px] text-slate-400">{event.durationMinutes}m</span>
                          {event.location && (
                            <>
                              <span className="w-1 h-1 bg-slate-200 rounded-full" />
                              <span className="text-[10px] text-slate-400 truncate">{event.location}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    {event.status === "scheduled" && (
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleMarkComplete(event); }}
                          className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-wider"
                        >
                          Mark Complete
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
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
            </div>
          </div>
        </div>
      </div>

      {/* Event Modal */}
      <Dialog open={showEventModal} onOpenChange={setShowEventModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{selectedEvent ? "Edit Event" : "New Event"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Event title"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="eventType">Type</Label>
                <Select value={formData.eventType} onValueChange={(v: any) => setFormData({ ...formData, eventType: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="call">Call</SelectItem>
                    <SelectItem value="zoom">Zoom</SelectItem>
                    <SelectItem value="task">Task</SelectItem>
                    <SelectItem value="reminder">Reminder</SelectItem>
                    <SelectItem value="follow_up">Follow Up</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Select value={String(formData.durationMinutes)} onValueChange={(v) => setFormData({ ...formData, durationMinutes: parseInt(v) })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 min</SelectItem>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="45">45 min</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startTime">Date & Time</Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Office, Conference Room, etc."
              />
            </div>

            {(formData.eventType === "zoom" || formData.eventType === "call") && (
              <div className="space-y-2">
                <Label htmlFor="meetingUrl">Meeting URL</Label>
                <Input
                  id="meetingUrl"
                  value={formData.meetingUrl}
                  onChange={(e) => setFormData({ ...formData, meetingUrl: e.target.value })}
                  placeholder="https://zoom.us/..."
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-between">
            {selectedEvent && (
              <Button 
                variant="outline" 
                onClick={handleDeleteEvent} 
                disabled={saving}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
              >
                <Trash2 size={16} className="mr-2" />
                Delete
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" onClick={() => setShowEventModal(false)} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={handleSaveEvent} disabled={saving}>
                {saving ? "Saving..." : selectedEvent ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Other Modals */}
      {isBookingModalOpen && <BookingLinkModal onClose={() => setIsBookingModalOpen(false)} />}
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
