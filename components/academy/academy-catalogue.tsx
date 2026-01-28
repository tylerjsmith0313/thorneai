"use client"

import { useState } from "react"
import { Search, Play, Clock, BarChart3, ChevronRight, Star } from "lucide-react"
import { Input } from "@/components/ui/input"

interface AcademyCatalogueProps {
  onOpenCourse?: (id: string) => void
}

export function AcademyCatalogue({ onOpenCourse }: AcademyCatalogueProps) {
  const [filter, setFilter] = useState<"all" | "beginner" | "intermediate" | "advanced">("all")
  const [searchQuery, setSearchQuery] = useState("")

  const courses = [
    { id: "1", title: "Intro to Intelligence Layers", level: "beginner" as const, duration: "45m", rating: 4.9, enrolled: 1240 },
    { id: "2", title: "Mastering the Flow Engine", level: "intermediate" as const, duration: "2.5h", rating: 4.8, enrolled: 890 },
    { id: "3", title: "Advanced Node Recapture", level: "advanced" as const, duration: "1.8h", rating: 4.7, enrolled: 456 },
    { id: "4", title: "Psychology of High-Value Rejection", level: "advanced" as const, duration: "1h", rating: 4.9, enrolled: 670 },
    { id: "5", title: "Multi-Channel Outreach Tactics", level: "intermediate" as const, duration: "1.2h", rating: 4.6, enrolled: 1100 },
    { id: "6", title: "Gift Strategy Fundamentals", level: "beginner" as const, duration: "30m", rating: 4.8, enrolled: 2300 },
  ]

  const filtered = courses.filter(c => {
    const matchesLevel = filter === "all" || c.level === filter
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesLevel && matchesSearch
  })

  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner": return "bg-emerald-50 text-emerald-600 border-emerald-100"
      case "intermediate": return "bg-amber-50 text-amber-600 border-amber-100"
      case "advanced": return "bg-rose-50 text-rose-600 border-rose-100"
      default: return "bg-slate-50 text-slate-600 border-slate-100"
    }
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 w-full relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search courses..." 
            className="pl-10" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shrink-0">
          {(["all", "beginner", "intermediate", "advanced"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                filter === f ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(course => (
          <div 
            key={course.id}
            onClick={() => onOpenCourse?.(course.id)}
            className="bg-white p-6 rounded-[32px] border border-slate-200 hover:shadow-2xl hover:border-indigo-100 transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                <Play size={20} fill="currentColor" />
              </div>
              <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getLevelColor(course.level)}`}>
                {course.level}
              </span>
            </div>

            <h4 className="text-sm font-black text-slate-900 tracking-tight leading-tight mb-3">
              {course.title}
            </h4>

            <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-6">
              <span className="flex items-center gap-1"><Clock size={12} />{course.duration}</span>
              <span className="flex items-center gap-1"><Star size={12} className="text-amber-500" />{course.rating}</span>
            </div>

            <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-bold">{course.enrolled.toLocaleString()} enrolled</span>
              <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
