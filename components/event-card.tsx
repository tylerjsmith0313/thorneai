"use client"

import { Calendar, Clock, MoreHorizontal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type EventStatus = "draft" | "scheduled" | "cancelled"

export interface Event {
  id: string
  title: string
  date: string
  time: string
  status: EventStatus
  attendees?: string[]
}

interface EventCardProps {
  event: Event
  onEdit?: (event: Event) => void
  onDelete?: (event: Event) => void
  onDuplicate?: (event: Event) => void
}

const statusConfig: Record<EventStatus, { label: string; className: string }> = {
  draft: {
    label: "Draft",
    className: "bg-slate-100 text-slate-600 hover:bg-slate-100",
  },
  scheduled: {
    label: "Scheduled",
    className: "bg-indigo-50 text-indigo-600 hover:bg-indigo-50",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-50 text-red-600 hover:bg-red-50",
  },
}

export function EventCard({ event, onEdit, onDelete, onDuplicate }: EventCardProps) {
  const status = statusConfig[event.status]

  return (
    <div className="group relative bg-white rounded-xl border border-slate-200/60 p-5 transition-all hover:shadow-md hover:border-indigo-200/60">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-slate-900 truncate text-[15px]">
            {event.title}
          </h3>
          
          <div className="mt-3 flex items-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {event.date}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {event.time}
            </span>
          </div>

          {event.attendees && event.attendees.length > 0 && (
            <div className="mt-3 flex items-center gap-1">
              <div className="flex -space-x-2">
                {event.attendees.slice(0, 3).map((attendee, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 border-2 border-white flex items-center justify-center text-[10px] font-medium text-white"
                  >
                    {attendee.charAt(0).toUpperCase()}
                  </div>
                ))}
              </div>
              {event.attendees.length > 3 && (
                <span className="text-xs text-slate-400 ml-1">
                  +{event.attendees.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className={status.className}>
            {status.label}
          </Badge>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="w-4 h-4 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => onEdit?.(event)}>
                Edit Event
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate?.(event)}>
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete?.(event)}
                className="text-red-600 focus:text-red-600"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
