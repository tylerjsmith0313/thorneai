// History Section Component - Rebuilt Jan 2026
"use client"

import { useState, useEffect, useCallback } from "react"
import { Gift, Phone, Mail, MessageSquare, History, Edit3, User, Eye, PlusCircle, ChevronRight, Loader2, Calendar, Video, Clock } from "lucide-react"
import type { Activity, Contact } from "@/types"
import { HistoryDetailView } from "../history-detail-view"
import { ActivityTrackerModal } from "../activity-tracker-modal"
import { BaseButton } from "@/components/ui/base-button"
import { createClient } from "@/lib/supabase/client"

// Contact Activity types - defined locally to avoid module resolution issues
interface ContactActivity {
  id: string
  contactId: string
  activityType: 'call' | 'email' | 'meeting' | 'zoom' | 'sms' | 'note' | 'gift' | 'task' | 'status_change' | 'profile_update'
  title: string
  description?: string
  outcome?: string
  performedAt?: string
  metadata?: {
    oldValue?: string
    newValue?: string
    [key: string]: any
  }
  createdAt?: string
}

function transformContactActivity(row: any): ContactActivity {
  return {
    id: row.id,
    contactId: row.contact_id,
    activityType: row.type,
    title: row.title,
    description: row.detail,
    outcome: row.new_value,
    performedAt: row.created_at,
    metadata: {
      oldValue: row.old_value,
      newValue: row.new_value,
    },
    createdAt: row.created_at,
  }
}

async function getContactActivities(contactId: string): Promise<ContactActivity[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .eq("contact_id", contactId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching contact activities:", error)
    return []
  }

  return (data || []).map(transformContactActivity)
}

async function createContactActivity(activity: {
  contactId: string
  activityType: ContactActivity['activityType']
  title: string
  description?: string
  outcome?: string
  performedAt?: string
  metadata?: ContactActivity['metadata']
}): Promise<ContactActivity | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    console.error("No authenticated user")
    return null
  }

  const { data, error } = await supabase
    .from("activities")
    .insert({
      user_id: user.id,
      contact_id: activity.contactId,
      type: activity.activityType,
      title: activity.title,
      detail: activity.description,
      old_value: activity.metadata?.oldValue,
      new_value: activity.outcome || activity.metadata?.newValue,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating contact activity:", error)
    return null
  }

  return data ? transformContactActivity(data) : null
}

interface HistorySectionProps {
  contact: Contact
}

export function HistorySection({ contact }: HistorySectionProps) {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [isTrackerOpen, setIsTrackerOpen] = useState(false)
  const [activities, setActivities] = useState<ContactActivity[]>([])
  const [loading, setLoading] = useState(true)

  const loadActivities = useCallback(async () => {
    setLoading(true)
    const data = await getContactActivities(contact.id)
    setActivities(data)
    setLoading(false)
  }, [contact.id])

  useEffect(() => {
    loadActivities()
  }, [loadActivities])

  const handleAddActivity = async (newAct: { type: string; timestamp: string; result: string }) => {
    await createContactActivity({
      contactId: contact.id,
      activityType: newAct.type.toLowerCase().replace(/ /g, "_") as ContactActivity['activityType'],
      title: `${newAct.type} Logged`,
      description: newAct.result,
      performedAt: new Date(newAct.timestamp).toISOString(),
    })
    
    loadActivities()
  }

  const transformToActivity = (ca: ContactActivity): Activity => ({
    id: ca.id,
    type: ca.activityType,
    title: ca.title,
    detail: ca.description || undefined,
    date: ca.performedAt ? new Date(ca.performedAt).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Recently",
    oldValue: ca.metadata?.oldValue,
    newValue: ca.metadata?.newValue,
  })

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History size={16} className="text-slate-400" />
          <h4 className="text-sm font-bold text-slate-900">Interaction Timeline</h4>
          <span className="text-xs text-slate-400 ml-2">
            {activities.length} activit{activities.length === 1 ? "y" : "ies"}
          </span>
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

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100">
          <History size={32} className="text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500 mb-4">No activity logged yet</p>
          <BaseButton 
            variant="primary" 
            size="sm"
            icon={<PlusCircle size={14} />}
            onClick={() => setIsTrackerOpen(true)}
          >
            Log Activity
          </BaseButton>
        </div>
      ) : (
        <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-slate-100">
          {activities.map((act) => (
            <HistoryItem 
              key={act.id} 
              activity={act} 
              onViewDetails={() => setSelectedActivity(transformToActivity(act))}
            />
          ))}
        </div>
      )}

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

function HistoryItem({ activity, onViewDetails }: { activity: ContactActivity; onViewDetails: () => void }) {
  const getIcon = () => {
    switch (activity.activityType) {
      case "gift": return <Gift size={12} />
      case "call": return <Phone size={12} />
      case "email": return <Mail size={12} />
      case "meeting": return <Calendar size={12} />
      case "zoom": return <Video size={12} />
      case "sms": return <MessageSquare size={12} />
      case "note": return <Edit3 size={12} />
      case "task": return <Clock size={12} />
      default: return <User size={12} />
    }
  }

  const getColor = () => {
    switch (activity.activityType) {
      case "gift": return "bg-rose-500 text-white"
      case "call": return "bg-indigo-600 text-white"
      case "email": return "bg-blue-500 text-white"
      case "meeting": return "bg-emerald-500 text-white"
      case "zoom": return "bg-blue-600 text-white"
      case "sms": return "bg-purple-500 text-white"
      case "note": return "bg-amber-500 text-white"
      default: return "bg-white text-slate-500 border border-slate-200"
    }
  }

  const formattedDate = activity.performedAt 
    ? new Date(activity.performedAt).toLocaleString([], { 
        month: "short", 
        day: "numeric", 
        hour: "2-digit", 
        minute: "2-digit" 
      }) 
    : "Recently"

  return (
    <div className="relative pl-12 group">
      <div className={`absolute left-0 p-2.5 rounded-xl border border-white shadow-md z-10 transition-transform group-hover:scale-110 ${getColor()}`}>
        {getIcon()}
      </div>

      <button 
        onClick={onViewDetails}
        className="absolute left-[38px] top-[14px] w-6 h-6 bg-white border border-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-100 shadow-sm z-20 opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100"
        title="View Details"
      >
        <Eye size={10} />
      </button>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <h5 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{activity.title}</h5>
          <span className="text-[10px] font-bold text-slate-400 uppercase">{formattedDate}</span>
        </div>
        <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100/50 group-hover:bg-indigo-50/30 group-hover:border-indigo-100/30 transition-all">
          <p className="text-[11px] text-slate-500 leading-relaxed">
            {activity.description || `${activity.activityType} activity logged`}
          </p>
          {activity.metadata?.oldValue && activity.metadata?.newValue && (
            <div className="mt-2 flex items-center gap-2 text-[10px] font-medium">
               <span className="text-rose-400 line-through">{activity.metadata.oldValue}</span>
               <ChevronRight size={10} className="text-slate-300" />
               <span className="text-emerald-600 font-bold">{activity.metadata.newValue}</span>
            </div>
          )}
          {activity.outcome && (
            <div className="mt-2 pt-2 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Outcome: </span>
              <span className="text-[10px] text-slate-600">{activity.outcome}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
