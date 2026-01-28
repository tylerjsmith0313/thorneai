"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles, Layout, BrainCircuit, Palette, Wand2 } from "lucide-react"
import { CreativeStudioModal } from "./creative-studio-modal"
import { CreativeConsultationModal } from "./creative-consultation-modal"

export function CreativeSuite() {
  const [isStudioOpen, setIsStudioOpen] = useState(false)
  const [isConsultationOpen, setIsConsultationOpen] = useState(false)

  return (
    <div className="h-full flex flex-col items-center justify-center space-y-12 py-12 animate-in fade-in duration-500">
      <div className="text-center space-y-2 max-w-xl">
        <h3 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Creative Intelligence</h3>
        <p className="text-slate-500 font-medium">
          Generate high-conversion assets or consult Thorne for strategic design guidance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
        {/* Ask Thorne Card */}
        <div
          onClick={() => setIsConsultationOpen(true)}
          className="group relative bg-slate-900 rounded-[56px] p-10 text-white cursor-pointer hover:scale-[1.02] transition-all duration-500 shadow-2xl border border-white/10 overflow-hidden"
        >
          <div className="relative z-10 space-y-6">
            <div className="w-16 h-16 bg-indigo-500/20 rounded-3xl flex items-center justify-center text-indigo-400 border border-indigo-500/30 group-hover:scale-110 transition-transform duration-500">
              <BrainCircuit size={32} />
            </div>
            <div>
              <h4 className="text-2xl font-black tracking-tight">Ask Thorne for Help</h4>
              <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                Consult Thorne on brand voice, color psychology, or conversion optimization strategies.
              </p>
            </div>
            <Button className="bg-white text-indigo-900 border-none group-hover:bg-indigo-50">
              <Sparkles size={18} className="mr-2" />
              Start Consultation
            </Button>
          </div>
          <Sparkles className="absolute right-[-20px] bottom-[-20px] w-48 h-48 text-white/5 rotate-12 pointer-events-none group-hover:scale-110 transition-transform duration-700" />
        </div>

        {/* Open Creative Studio Card */}
        <div
          onClick={() => setIsStudioOpen(true)}
          className="group relative bg-white rounded-[56px] p-10 text-slate-900 cursor-pointer hover:scale-[1.02] transition-all duration-500 shadow-2xl border border-slate-100 overflow-hidden"
        >
          <div className="relative z-10 space-y-6">
            <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-indigo-100 group-hover:scale-110 transition-transform duration-500">
              <Palette size={32} />
            </div>
            <div>
              <h4 className="text-2xl font-black tracking-tight">Open Creative Studio</h4>
              <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                Launch the full asset editor to build emails, landing pages, and multi-channel marketing nodes.
              </p>
            </div>
            <Button variant="secondary" className="bg-slate-900 text-white hover:bg-slate-800">
              <Layout size={18} className="mr-2" />
              Launch Workspace
            </Button>
          </div>
          <Wand2 className="absolute right-[-20px] bottom-[-20px] w-48 h-48 text-indigo-600/5 rotate-12 pointer-events-none group-hover:scale-110 transition-transform duration-700" />
        </div>
      </div>

      {/* Modals */}
      {isStudioOpen && <CreativeStudioModal onClose={() => setIsStudioOpen(false)} />}
      {isConsultationOpen && <CreativeConsultationModal onClose={() => setIsConsultationOpen(false)} />}
    </div>
  )
}
