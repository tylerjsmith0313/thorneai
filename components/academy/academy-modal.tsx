"use client"

import { useState } from "react"
import { X, GraduationCap } from "lucide-react"
import { AcademyHome } from "./academy-home"
import { AcademyResources } from "./academy-resources"
import { AcademyCourseOutline } from "./academy-course-outline"
import { AcademyCatalogue } from "./academy-catalogue"

interface AcademyModalProps {
  onClose: () => void
}

type AcademyView = "home" | "catalogue" | "resources" | "course-outline"

export function AcademyModal({ onClose }: AcademyModalProps) {
  const [activeView, setActiveView] = useState<AcademyView>("home")
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)

  const handleOpenCourse = (courseId: string) => {
    setSelectedCourseId(courseId)
    setActiveView("course-outline")
  }

  const renderContent = () => {
    switch (activeView) {
      case "home":
        return <AcademyHome onOpenCourse={handleOpenCourse} />
      case "catalogue":
        return <AcademyCatalogue onOpenCourse={handleOpenCourse} />
      case "resources":
        return <AcademyResources />
      case "course-outline":
        return <AcademyCourseOutline 
                  courseId={selectedCourseId || ""} 
                  onBack={() => setActiveView("home")} 
                />
      default:
        return <AcademyHome onOpenCourse={handleOpenCourse} />
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-8">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="bg-white w-full max-w-6xl h-[90vh] rounded-[56px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.25)] overflow-hidden relative flex flex-col animate-in zoom-in-95 duration-300">
        
        <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-indigo-600 rounded-[20px] text-white flex items-center justify-center shadow-xl shadow-indigo-100">
              <GraduationCap size={28} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-none">Flourish Academy</h2>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Mastery Level: Customer IV</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <nav className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/50">
              <button 
                onClick={() => setActiveView("home")}
                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeView === "home" || activeView === "course-outline" ? "bg-white text-indigo-600 shadow-sm border border-slate-200/50" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Learning Hub
              </button>
              <button 
                onClick={() => setActiveView("catalogue")}
                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeView === "catalogue" ? "bg-white text-indigo-600 shadow-sm border border-slate-200/50" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Academy Catalogue
              </button>
              <button 
                onClick={() => setActiveView("resources")}
                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeView === "resources" ? "bg-white text-indigo-600 shadow-sm border border-slate-200/50" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Resources
              </button>
            </nav>
            <button 
              onClick={onClose} 
              className="p-4 bg-slate-50 rounded-full text-slate-300 hover:text-rose-500 transition-all border border-slate-100"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50/20 p-10">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}
