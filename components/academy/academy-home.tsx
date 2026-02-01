"use client"

import { useState } from "react"
import { Trophy, Play, ChevronDown, ChevronRight, Calendar, Clock, Sparkles, BookOpen, CheckCircle2, PlayCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AcademyHomeProps {
  onOpenCourse: (id: string) => void
}

export function AcademyHome({ onOpenCourse }: AcademyHomeProps) {
  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <EnrolledCard 
            title="Mastering the Flow Engine" 
            progress={65} 
            time="2h ago" 
            onClick={() => onOpenCourse("mastering-flow")} 
          />
          <EnrolledCard 
            title="Advanced Node Recapture" 
            progress={12} 
            time="1d ago" 
            onClick={() => onOpenCourse("node-recapture")} 
          />
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Certifications</h3>
          <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-black uppercase tracking-wider border border-indigo-100">3 Active</span>
        </div>
        <div className="space-y-3">
          <CertBadge title="Foundational Intel" date="JAN '24" />
          <CertBadge title="Outreach Strategist" date="FEB '24" />
        </div>
      </div>

      <CompletedCoursesSection onOpenCourse={onOpenCourse} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6 border-t border-slate-100">
        <SuggestedCourses onOpenCourse={onOpenCourse} />
        <LiveUpcomingCourses />
      </div>
    </div>
  )
}

function EnrolledCard({ title, progress, time, onClick }: { title: string; progress: number; time: string; onClick: () => void }) {
  return (
    <div onClick={onClick} className="bg-white p-10 rounded-[48px] border border-slate-100 hover:border-indigo-100 hover:shadow-2xl transition-all cursor-pointer group relative overflow-hidden">
      <div className="flex items-start gap-6 relative z-10">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-[22px] flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
          <Play size={24} fill="currentColor" className="ml-1" />
        </div>
        <div className="flex-1">
          <h4 className="text-xl font-black text-slate-900 tracking-tight mb-6">{title}</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest mb-2">
              <span className="text-slate-400">Completion</span>
              <span className="text-indigo-600">{progress}%</span>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 rounded-full transition-all duration-1000 ease-out" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-[10px] text-slate-400 font-bold italic pt-2">Resumed {time}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function CertBadge({ title, date }: { title: string; date: string }) {
  return (
    <div className="p-5 bg-emerald-50/40 border border-emerald-100/50 rounded-[24px] flex items-center justify-between group hover:bg-emerald-50 transition-all">
      <div className="flex items-center gap-5">
        <div className="w-12 h-12 bg-white rounded-xl text-emerald-600 shadow-sm border border-emerald-50 flex items-center justify-center">
          <Trophy size={18} />
        </div>
        <div>
          <h5 className="text-sm font-black text-slate-800 leading-tight">{title}</h5>
          <p className="text-[9px] text-emerald-600 font-black tracking-widest mt-1.5 uppercase">Earned {date}</p>
        </div>
      </div>
      <div className="p-1.5 bg-white rounded-full text-emerald-500 border border-emerald-100 shadow-sm">
        <CheckCircle2 size={18} />
      </div>
    </div>
  )
}

function SuggestedCourses({ onOpenCourse }: { onOpenCourse: (id: string) => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Sparkles size={16} className="text-indigo-500" />
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Suggested for You</h3>
      </div>
      <div className="space-y-3">
        <SuggestionCard title="Psychology of High-Value Rejection" meta="45M - ADVANCED" onClick={() => onOpenCourse("rejection")} />
        <SuggestionCard title="Scaling Enterprise Nodes" meta="1.2H - INTERMEDIATE" onClick={() => onOpenCourse("scaling")} />
      </div>
    </div>
  )
}

function SuggestionCard({ title, meta, onClick }: { title: string; meta: string; onClick: () => void }) {
  return (
    <div onClick={onClick} className="p-6 bg-white border border-slate-100 rounded-[32px] hover:border-indigo-100 hover:shadow-xl transition-all cursor-pointer flex items-center justify-between group">
      <div className="flex items-center gap-5">
        <div className="p-4 bg-slate-50 text-slate-400 rounded-2xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all shadow-sm">
          <BookOpen size={20} />
        </div>
        <div>
          <h5 className="text-sm font-black text-slate-900">{title}</h5>
          <p className="text-[10px] text-indigo-500 font-black tracking-widest mt-1">{meta}</p>
        </div>
      </div>
      <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-600" />
    </div>
  )
}

function LiveUpcomingCourses() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Calendar size={16} className="text-rose-500" />
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Upcoming Live</h3>
      </div>
      <div className="space-y-3">
        <LiveCard title="Thorne v3.3 Launch Deep Dive" date="TOMORROW, 2:00 PM EST" host="T. Thorne" />
        <LiveCard title="Tactical Gift Personalization" date="FRI, 11:00 AM EST" host="Sarah W." />
      </div>
    </div>
  )
}

function LiveCard({ title, date, host }: { title: string; date: string; host: string }) {
  return (
    <div className="p-6 bg-rose-50 border border-rose-100 rounded-[32px] relative overflow-hidden group hover:shadow-xl transition-all cursor-pointer">
      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 bg-rose-500 text-white rounded-full text-[8px] font-black uppercase tracking-widest animate-pulse">Live</span>
          <span className="text-[10px] text-rose-500 font-black tracking-widest">{date}</span>
        </div>
        <h5 className="text-sm font-black text-slate-900">{title}</h5>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-rose-200 border-2 border-white flex items-center justify-center text-[10px] font-black text-rose-700">{host[0]}</div>
          <p className="text-[10px] text-rose-400 font-bold uppercase tracking-widest">HOST: {host}</p>
        </div>
      </div>
      <Sparkles className="absolute right-[-20px] bottom-[-20px] w-32 h-32 text-rose-500/5 rotate-12" />
    </div>
  )
}

function CompletedCoursesSection({ onOpenCourse }: { onOpenCourse: (id: string) => void }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const completed = [
    { id: "1", title: "Intro to Intelligence Layers", date: "JAN 12" },
    { id: "2", title: "Setting Business Logic", date: "JAN 15" },
    { id: "3", title: "Mimic Voice Tuning", date: "FEB 03" },
  ]

  return (
    <div className="bg-slate-50/50 rounded-[40px] border border-slate-200 overflow-hidden transition-all shadow-inner">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-10 py-8 flex items-center justify-between hover:bg-white transition-all"
      >
        <div className="flex items-center gap-5">
          <div className="p-4 bg-emerald-100 text-emerald-600 rounded-[22px] shadow-sm"><CheckCircle2 size={24} /></div>
          <div className="text-left">
            <h4 className="text-base font-black text-slate-900 uppercase tracking-widest">Completed Mastery</h4>
            <p className="text-xs text-slate-400 font-bold uppercase mt-1 tracking-widest">3 COURSES VERIFIED</p>
          </div>
        </div>
        <ChevronDown size={24} className={`text-slate-400 transition-transform duration-500 ${isExpanded ? "rotate-180" : ""}`} />
      </button>

      {isExpanded && (
        <div className="px-10 pb-10 space-y-3 animate-in slide-in-from-top-4 duration-500">
          {completed.map(c => (
            <div key={c.id} onClick={() => onOpenCourse(c.id)} className="p-5 bg-white border border-slate-100 rounded-3xl flex items-center justify-between hover:border-indigo-200 transition-all cursor-pointer group shadow-sm">
              <h5 className="text-xs font-black text-slate-600 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{c.title}</h5>
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">{c.date}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
