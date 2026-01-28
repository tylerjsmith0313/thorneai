"use client"

import { useState } from "react"
import { ArrowLeft, Play, CheckCircle2, Lock, Clock, BookOpen, Sparkles, PlayCircle, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AcademyCourseOutlineProps {
  courseId: string
  onBack: () => void
}

export function AcademyCourseOutline({ courseId, onBack }: AcademyCourseOutlineProps) {
  const [activeLesson, setActiveLesson] = useState(1)

  const curriculum = [
    { id: 1, title: "Introduction to Intelligence Layers", duration: "12m", status: "completed" as const },
    { id: 2, title: "Configuring the Flow Engine", duration: "18m", status: "active" as const },
    { id: 3, title: "Multi-Channel Tactics & Nuance", duration: "24m", status: "locked" as const },
    { id: 4, title: "Handling Critical Rejections with AI", duration: "15m", status: "locked" as const },
    { id: 5, title: "Advanced Node Scaling", duration: "21m", status: "locked" as const },
  ]

  return (
    <div className="animate-in fade-in slide-in-from-right-8 duration-500 space-y-8">
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center gap-3 text-slate-400 hover:text-indigo-600 transition-colors font-black text-[10px] uppercase tracking-widest group"
        >
          <div className="p-2.5 bg-white border border-slate-100 rounded-xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all shadow-sm">
            <ArrowLeft size={16} />
          </div>
          Back to Hub
        </button>
        <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase border border-emerald-100 shadow-sm">
          <Trophy size={14} />
          Certified Module
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
          <div className="aspect-video bg-slate-900 rounded-[40px] relative overflow-hidden group shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
            <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1200')] bg-cover bg-center" />
            <div className="absolute inset-0 flex items-center justify-center">
              <button className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-[0_0_50px_rgba(79,70,229,0.5)] hover:scale-110 transition-all">
                <Play size={28} fill="currentColor" className="ml-1" />
              </button>
            </div>
            <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-1.5 w-48 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 w-1/3" />
                </div>
                <span className="text-white text-[10px] font-black">06:12 / 18:45</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-indigo-100">Module 02</span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Configuring the Flow Engine</h2>
            </div>
            <p className="text-slate-500 leading-relaxed font-medium">
              In this lesson, we dive deep into the neural settings of Thorne's Flow engine. Learn how to calibrate aggressiveness vs. consultative tone based on contact demeanor data.
            </p>
            <div className="flex gap-3 pt-4">
              <Button className="gap-2"><CheckCircle2 size={18} />Complete Lesson</Button>
              <Button variant="outline" className="gap-2 bg-transparent"><BookOpen size={18} />Download Resources</Button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 rounded-[40px] p-8 space-y-8 sticky top-6 shadow-sm">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Course Outline</h3>
                <span className="text-[10px] font-black text-indigo-600">2/5 Done</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-2/5" />
              </div>
            </div>

            <div className="space-y-3">
              {curriculum.map((lesson) => (
                <button 
                  key={lesson.id}
                  disabled={lesson.status === "locked"}
                  onClick={() => setActiveLesson(lesson.id)}
                  className={`w-full p-5 rounded-[28px] border text-left flex items-center justify-between transition-all ${
                    activeLesson === lesson.id 
                    ? "bg-white border-indigo-200 shadow-xl shadow-slate-200/50 scale-[1.02]" 
                    : lesson.status === "locked" 
                      ? "bg-slate-50/50 border-transparent opacity-50 cursor-not-allowed"
                      : "bg-white border-slate-100 hover:border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-xl flex items-center justify-center ${
                      lesson.status === "completed" ? "bg-emerald-50 text-emerald-600" :
                      lesson.status === "active" ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-400"
                    }`}>
                      {lesson.status === "completed" ? <CheckCircle2 size={14} /> :
                       lesson.status === "locked" ? <Lock size={14} /> : <PlayCircle size={14} />}
                    </div>
                    <div>
                      <h4 className={`text-[11px] font-black leading-tight ${activeLesson === lesson.id ? "text-slate-900" : "text-slate-600"}`}>
                        {lesson.title}
                      </h4>
                      <p className="text-[9px] text-slate-400 font-bold mt-1 flex items-center gap-1 uppercase">
                        <Clock size={10} /> {lesson.duration}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="pt-6 border-t border-slate-100 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-900 rounded-xl text-white shadow-lg">
                  <Sparkles size={16} />
                </div>
                <h4 className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Academy Pulse</h4>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed font-medium italic">
                "Users who master Flow calibration see a significant boost in recapturing withering nodes."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
