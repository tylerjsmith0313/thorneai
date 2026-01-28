"use client"

import React from "react"

import { Button } from "@/components/ui/button"
import {
  Layout,
  ImageIcon,
  Share2,
  Plus,
  MousePointer2,
  Layers,
  Type,
  Trash2,
  CheckCircle,
  X,
  Maximize2,
  Save,
  Undo2,
  Redo2,
  Palette,
} from "lucide-react"

interface CreativeStudioModalProps {
  onClose: () => void
}

export function CreativeStudioModal({ onClose }: CreativeStudioModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-2xl animate-in fade-in duration-500" onClick={onClose} />

      {/* Studio Window */}
      <div className="bg-white w-full h-full max-w-[95vw] max-h-[90vh] rounded-[48px] shadow-[0_0_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden relative flex flex-col animate-in zoom-in-95 duration-500 ring-1 ring-white/20">
        {/* Header */}
        <header className="px-10 py-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0 relative z-20 shadow-sm">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <Layout size={24} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Creative Studio</h3>
                <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-indigo-100">
                  Pro Editor
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mt-1.5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Thorne AI Generative Workspace
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl mr-4 border border-slate-200/50">
              <button className="p-2 text-slate-400 hover:text-indigo-600 transition-all">
                <Undo2 size={16} />
              </button>
              <button className="p-2 text-slate-400 hover:text-indigo-600 transition-all border-l border-slate-200 ml-1 pl-3">
                <Redo2 size={16} />
              </button>
            </div>
            <Button variant="outline" size="sm" className="rounded-xl font-black uppercase tracking-widest text-[10px] bg-transparent">
              <Save size={14} className="mr-2" />
              Save Node
            </Button>
            <Button size="sm" className="rounded-xl font-black uppercase tracking-widest text-[10px] px-6 shadow-indigo-200">
              <Share2 size={14} className="mr-2" />
              Deploy to API
            </Button>
            <div className="w-px h-8 bg-slate-100 mx-2" />
            <button
              onClick={onClose}
              className="p-3 bg-slate-50 rounded-full text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all border border-slate-100"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        {/* Main Workspace */}
        <div className="flex-1 overflow-hidden flex bg-slate-50/40">
          {/* Tool Sidebar */}
          <aside className="w-80 bg-white border-r border-slate-100 p-8 flex flex-col gap-10 overflow-y-auto relative z-10">
            <section className="space-y-4">
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-between">
                Canvas Layering
                <Plus size={12} className="text-indigo-500 cursor-pointer" />
              </h5>
              <div className="space-y-2">
                <LayerItem icon={<ImageIcon size={14} />} label="Hero Graphics" active />
                <LayerItem icon={<Type size={14} />} label="Conversion Copy" />
                <LayerItem icon={<MousePointer2 size={14} />} label="Action Buttons" />
              </div>
            </section>

            <section className="space-y-4">
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Palette</h5>
              <div className="grid grid-cols-2 gap-3">
                <AssetTool icon={<ImageIcon size={20} />} label="Images" />
                <AssetTool icon={<Type size={20} />} label="Text" />
                <AssetTool icon={<Layers size={20} />} label="Shapes" />
                <AssetTool icon={<Palette size={20} />} label="Themes" />
              </div>
            </section>

            {/* AI Insight Box */}
            <div className="mt-auto p-6 bg-indigo-900 rounded-[32px] text-white space-y-4 relative overflow-hidden shadow-2xl shadow-indigo-100/20">
              <div className="flex items-center gap-3 relative z-10">
                <div className="p-2 bg-indigo-500/50 rounded-xl">
                  <CheckCircle size={14} className="text-indigo-200" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-100">AI Design Core</span>
              </div>
              <p className="text-[11px] text-indigo-50 leading-relaxed relative z-10 italic font-medium">
                {'"I\'ve optimized the visual hierarchy. Increasing font weight on Section 2 for a projected 8% engagement lift."'}
              </p>
              <div className="absolute right-[-15px] bottom-[-15px] opacity-10 rotate-12 pointer-events-none">
                <Layout size={80} />
              </div>
            </div>
          </aside>

          {/* Canvas Container */}
          <main className="flex-1 relative flex flex-col items-center justify-center p-12 overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

            <div className="relative group w-full max-w-4xl h-full max-h-full flex items-center justify-center">
              <div className="w-full max-w-2xl bg-white shadow-[0_50px_100px_-30px_rgba(0,0,0,0.2)] rounded-[40px] aspect-[3/4] p-16 flex flex-col space-y-12 relative overflow-hidden animate-in zoom-in-95 duration-500 delay-100 ring-1 ring-slate-100">
                <div className="w-full h-56 bg-slate-50/50 rounded-3xl flex items-center justify-center text-slate-200 border border-slate-100 group-hover:border-indigo-100 transition-all relative overflow-hidden">
                  <ImageIcon size={64} className="opacity-50" />
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent" />
                </div>

                <div className="space-y-8 flex-1">
                  <div className="h-14 bg-slate-50/50 rounded-2xl w-3/4 border border-slate-100" />
                  <div className="space-y-4">
                    <div className="h-3 bg-slate-50 rounded-full w-full" />
                    <div className="h-3 bg-slate-50 rounded-full w-full" />
                    <div className="h-3 bg-slate-50 rounded-full w-2/3" />
                  </div>
                </div>

                <div className="flex justify-center pb-4">
                  <div className="h-16 w-64 bg-indigo-600 rounded-3xl shadow-2xl shadow-indigo-100 border-4 border-white active:scale-95 transition-all cursor-pointer" />
                </div>

                <div className="absolute inset-0 border-[6px] border-transparent group-hover:border-indigo-600/10 pointer-events-none transition-all rounded-[40px]" />

                <div className="absolute top-8 right-8 flex gap-3 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                  <button className="p-3 bg-white rounded-2xl shadow-xl text-slate-400 hover:text-indigo-600 transition-all border border-slate-100 active:scale-90">
                    <Maximize2 size={18} />
                  </button>
                  <button className="p-3 bg-white rounded-2xl shadow-xl text-slate-400 hover:text-rose-600 transition-all border border-slate-100 active:scale-90">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Tool Belt */}
              <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 flex items-center gap-6 bg-slate-900/90 backdrop-blur-2xl px-12 py-5 rounded-[28px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border border-white/10 animate-in slide-in-from-bottom-8 duration-500 z-30">
                <div className="flex items-center gap-3 border-r border-white/10 pr-6 mr-2">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Dimension</span>
                </div>
                <div className="flex gap-2">
                  {["Responsive", "Mobile", "Email", "Landing"].map((format) => (
                    <button
                      key={format}
                      className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                        format === "Responsive"
                          ? "bg-indigo-600 text-white shadow-lg"
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {format}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

function LayerItem({ icon, label, active = false }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <button
      className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all ${
        active
          ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm"
          : "bg-white border-slate-100 text-slate-500 hover:border-slate-200 hover:bg-slate-50"
      }`}
    >
      <div className={`p-1.5 rounded-lg ${active ? "bg-white text-indigo-600 shadow-sm" : "bg-slate-50"}`}>{icon}</div>
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
      {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600" />}
    </button>
  )
}

function AssetTool({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="flex flex-col items-center gap-2 p-5 bg-white border border-slate-100 rounded-[28px] hover:border-indigo-200 hover:shadow-xl hover:bg-indigo-50/30 transition-all text-slate-400 hover:text-indigo-600 group shadow-sm active:scale-95">
      <div className="p-3 rounded-2xl bg-slate-50 group-hover:bg-white transition-all shadow-sm">{icon}</div>
      <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
    </button>
  )
}
