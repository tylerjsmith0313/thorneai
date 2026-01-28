"use client"

import { useState } from "react"
import { Gift, Phone, Mail, MessageSquare, History, Edit3, User, Building2, Eye, PlusCircle, ChevronRight } from "lucide-react"
import type { Activity, Contact } from "@/types"
import { HistoryDetailView } from "../history-detail-view"
import { ActivityTrackerModal } from "../activity-tracker-modal"
import { BaseButton } from "@/components/ui/base-button"

interface HistorySectionProps {
  contact: Contact
}

export function HistorySection({ contact }: HistorySectionProps) {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [isTrackerOpen, setIsTrackerOpen] = useState(false)

  const [activities, setActivities] = useState<Activity[]>([
    { 
      id: "a5", 
      type: "Update", 
      title: "Email Address Changed", 
      detail: `Updated from old.email@test.com to ${contact.email}`,
      date: "Today, 10:45 AM",
      newValue: contact.email,
      oldValue: "old.email@test.com",
      icon: "Mail"
    },
    { 
      id: "a6", 
      type: "Update", 
      title: "Company Updated", 
      detail: `Node shifted from Independent to ${contact.company}`,
      date: "Yesterday, 3:12 PM",
      icon: "Building2"
    },
    { 
      id: "a1", 
      type: "Gift", 
      title: "Physical Gift Sent", 
      detail: "Handwritten card + Coffee sampler set.", 
      date: "Mar 14, 2024"
    },
    { 
      id: "a2", 
      type: "Thorne", 
      title: "Voice AI Call", 
      detail: "Automated follow-up regarding proposal status.", 
      date: "Mar 12, 2024"
    },
    { 
      id: "a3", 
      type: "Human", 
      title: "Personal Email", 
      detail: "Initial outreach sent by John (User).", 
      date: "Mar 10, 2024"
    }
  ])

  const handleAddActivity = (newAct: { type: string; timestamp: string; result: string }) => {
    const activity: Activity = {
      id: Date.now().toString(),
      type: newAct.type,
      title: `${newAct.type} Logged`,
      detail: newAct.result,
      date: new Date(newAct.timestamp).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
    }
    setActivities([activity, ...activities])
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History size={16} className="text-slate-400" />
          <h4 className="text-sm font-bold text-slate-900">Interaction Timeline & Change Log</h4>
        </div>
        <BaseButton 
          variant="secondary" 
          size="sm" 
          className="rounded-xl px-4 py-2 font-black uppercase tracking-widest text-[10px]"
          icon={<PlusCircle size={14} />}
          onClick={() => setIsTrackerOpen(true)}
        >
          Track
        </BaseButton>
      </div>

      <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-slate-100">
        {activities.map((act) => (
          <HistoryItem 
            key={act.id} 
            activity={act} 
            onViewDetails={() => setSelectedActivity(act)}
          />
        ))}
      </div>

      {selectedActivity && (
        <HistoryDetailView 
          activity={selectedActivity} 
          contact={contact} 
          onClose={() => setSelectedActivity(null)} 
        />
      )}

      {isTrackerOpen && (
        <ActivityTrackerModal 
          onClose={() => setIsTrackerOpen(false)} 
          onSave={handleAddActivity}
        />
      )}
    </div>
  )
}

function HistoryItem({ activity, onViewDetails }: { activity: Activity; onViewDetails: () => void }) {
  const getIcon = () => {
    if (activity.icon === "Mail") return <Mail size={12} />
    if (activity.icon === "Building2") return <Building2 size={12} />
    
    switch (activity.type) {
      case "Gift": return <Gift size={12} />
      case "Thorne": return <Phone size={12} />
      case "Human": return <User size={12} />
      case "Update": return <Edit3 size={12} />
      default: return <MessageSquare size={12} />
    }
  }

  return (
    <div className="relative pl-12 group">
      <div className={`absolute left-0 p-2.5 rounded-xl border border-white shadow-md z-10 transition-transform group-hover:scale-110 ${
        activity.type === "Thorne" ? "bg-indigo-600 text-white" : 
        activity.type === "Gift" ? "bg-rose-500 text-white" : 
        activity.type === "Update" ? "bg-emerald-500 text-white" :
        "bg-white text-slate-500"
      }`}>
        {getIcon()}
      </div>

      <button 
        onClick={onViewDetails}
        className="absolute left-[38px] top-[14px] w-6 h-6 bg-white border border-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-100 shadow-sm z-20 opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100"
        title="View Granular Node Data"
      >
        <Eye size={10} />
      </button>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <h5 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{activity.title}</h5>
          <span className="text-[10px] font-bold text-slate-400 uppercase">{activity.date}</span>
        </div>
        <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100/50 group-hover:bg-indigo-50/30 group-hover:border-indigo-100/30 transition-all">
          <p className="text-[11px] text-slate-500 leading-relaxed">{activity.detail}</p>
          {activity.oldValue && (
            <div className="mt-2 flex items-center gap-2 text-[10px] font-medium">
               <span className="text-rose-400 line-through">{activity.oldValue}</span>
               <ChevronRight size={10} className="text-slate-300" />
               <span className="text-emerald-600 font-bold">{activity.newValue}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
