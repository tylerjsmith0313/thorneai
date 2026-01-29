"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Sparkles,
  Terminal,
  ShieldCheck,
  ChevronRight,
  BrainCircuit,
  Settings2,
  Activity,
  RefreshCw,
  Lock,
  AlertCircle,
} from "lucide-react"

export function EngagementCadence() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [autonomy, setAutonomy] = useState(75)
  const [tone, setTone] = useState(40)

  const handleRegenerate = () => {
    setIsGenerating(true)
    setTimeout(() => setIsGenerating(false), 1500)
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500 max-w-5xl mx-auto pb-10">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">AI Engine Status: Active</span>
          </div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Neural Workflow Core</h3>
          <p className="text-sm text-slate-500 font-medium italic mt-2">
            {'"AgyntSynq designs the sequence; you provide the soul and the boundaries."'}
          </p>
        </div>
        <Button
          variant="secondary"
          className="bg-slate-900 text-white hover:bg-slate-800 rounded-2xl px-8 shadow-2xl shadow-indigo-100"
          onClick={handleRegenerate}
          disabled={isGenerating}
        >
          <RefreshCw size={16} className={`mr-2 ${isGenerating ? "animate-spin" : ""}`} />
          {isGenerating ? "Re-Syncing..." : "Regenerate Strategy"}
        </Button>
      </div>

      {/* Strategy Card */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10 blur-3xl opacity-50 -z-10" />
        <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[48px] p-10 shadow-2xl shadow-slate-200/50 relative overflow-hidden">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl">
                <BrainCircuit size={24} />
              </div>
              <div>
                <h4 className="text-base font-black text-slate-900 uppercase tracking-tight">Active Neural Flow Preview</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time engagement logic</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 shadow-sm">
              <Sparkles size={14} className="animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest">Optimized for Conversion</span>
            </div>
          </div>

          {/* Preview Steps */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 hidden md:block" />
            <PreviewNode step="01" label="Ghost Outreach" ch="Email/LinkedIn" delay="Instant" />
            <PreviewNode step="02" label="Soft Retouch" ch="SMS/Voice" delay="+48h" />
            <PreviewNode step="03" label="Direct Pivot" ch="Custom Video" delay="+5d" />
            <PreviewNode step="04" label="Recapture" ch="Physical Node" delay="+14d" />
          </div>

          <div className="mt-12 pt-8 border-t border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Metric label="Flow Efficiency" val="94%" />
              <div className="w-px h-8 bg-slate-100" />
              <Metric label="Decision Nodes" val="12 Active" />
              <div className="w-px h-8 bg-slate-100" />
              <Metric label="Human Intervention" val="< 5%" />
            </div>
            <button className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline group">
              Deep Audit Steps <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Control Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Guardrails */}
        <div className="bg-slate-50/50 border border-slate-200 rounded-[40px] p-10 space-y-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-indigo-500">
              <Settings2 size={20} />
            </div>
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Engagement Guardrails</h4>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Autonomy Level</label>
                <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
                  {autonomy}% Autopilot
                </span>
              </div>
              <input
                type="range"
                value={autonomy}
                onChange={(e) => setAutonomy(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[8px] font-black text-slate-300 uppercase tracking-widest">
                <span>Drafts Only</span>
                <span>Full Autopilot</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Strategic Nuance</label>
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
                  {tone < 50 ? "Consultative" : "Direct"}
                </span>
              </div>
              <input
                type="range"
                value={tone}
                onChange={(e) => setTone(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[8px] font-black text-slate-300 uppercase tracking-widest">
                <span>Consultative</span>
                <span>Aggressive</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <ControlToggle label="Multi-Source Data Ingestion" active />
              <ControlToggle label="Automatic Break-up Sequences" active />
              <ControlToggle label="Sentiment-Based Pivot Logic" active />
              <ControlToggle label="Competitor Comparison Engine" />
            </div>
          </div>
        </div>

        {/* Directives Terminal */}
        <div className="flex flex-col gap-6">
          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-[40px] p-10 flex flex-col shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/10 rounded-xl text-white">
                  <Terminal size={18} />
                </div>
                <h4 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Global Directives</h4>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">
                <ShieldCheck size={12} />
                Verified Node
              </div>
            </div>

            <div className="flex-1 relative z-10">
              <Textarea
                className="h-full bg-transparent border-none text-indigo-100 p-0 text-sm font-bold font-mono focus:ring-0 placeholder:text-slate-700 leading-relaxed shadow-none resize-none"
                placeholder="[SYSTEM DIRECTIVE]: If the lead mentions a competitor, AgyntSynq must pivot to the 'Frictionless Migration' knowledge node. Never mention pricing on the first SMS..."
              />
            </div>

            <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Neural Sync: 100%</span>
              </div>
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 border-none shadow-xl shadow-indigo-900/50 rounded-xl">
                Save Strategy
              </Button>
            </div>

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.05),transparent)] pointer-events-none" />
            <Activity size={180} className="absolute right-[-40px] bottom-[-40px] text-white/5 pointer-events-none" />
          </div>

          <div className="bg-white border border-slate-200 rounded-[32px] p-6 flex items-center justify-between shadow-sm group hover:border-indigo-100 transition-all cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                <Lock size={18} />
              </div>
              <div>
                <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Compliance Vault</h5>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Audit logs & DNC Registry</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-600 transition-all" />
          </div>
        </div>
      </div>

      {/* Safety Alert */}
      <div className="p-8 bg-amber-50/50 border-2 border-amber-100 rounded-[32px] flex items-start gap-5 group hover:bg-amber-50 transition-all">
        <div className="p-3 bg-white rounded-2xl shadow-sm text-amber-500 border border-amber-100 group-hover:scale-105 transition-transform">
          <AlertCircle size={24} />
        </div>
        <div className="space-y-1 flex-1">
          <h5 className="text-sm font-black text-amber-900 uppercase tracking-tight">Manual Intervention Protocol</h5>
          <p className="text-xs text-amber-700/80 font-medium leading-relaxed">
            AgyntSynq is programmed to hand over the thread to you if the lead expresses negative sentiment or requests a meeting outside
            of your configured availability nodes.
            <span className="font-black border-b-2 border-amber-200 ml-1 cursor-pointer hover:text-amber-900">Manage Thresholds</span>
          </p>
        </div>
        <div className="flex items-center h-full pt-1">
          <button className="px-5 py-2.5 bg-white border border-amber-200 rounded-xl text-[10px] font-black text-amber-600 uppercase tracking-widest shadow-sm hover:bg-amber-600 hover:text-white hover:border-transparent transition-all">
            Test logic
          </button>
        </div>
      </div>
    </div>
  )
}

function PreviewNode({ step, label, ch, delay }: { step: string; label: string; ch: string; delay: string }) {
  return (
    <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm flex flex-col gap-4 relative z-10 hover:border-indigo-100 hover:shadow-xl transition-all group/node">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-lg">
          {step}
        </span>
        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{delay}</span>
      </div>
      <div>
        <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest group-hover/node:text-indigo-600 transition-colors">
          {label}
        </h5>
        <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{ch}</p>
      </div>
      <div className="mt-2 pt-4 border-t border-slate-50">
        <div className="w-full h-1 bg-slate-50 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 w-1/2 group-hover/node:w-full transition-all duration-700" />
        </div>
      </div>
    </div>
  )
}

function Metric({ label, val }: { label: string; val: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">{label}</p>
      <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{val}</p>
    </div>
  )
}

function ControlToggle({ label, active = false }: { label: string; active?: boolean }) {
  const [isActive, setIsActive] = useState(active)
  return (
    <div
      onClick={() => setIsActive(!isActive)}
      className={`p-4 rounded-2xl border flex items-center justify-between transition-all cursor-pointer group ${
        isActive
          ? "bg-white border-indigo-100 text-slate-800 shadow-sm"
          : "bg-slate-50/50 border-transparent text-slate-400 opacity-60 hover:opacity-100 hover:bg-white"
      }`}
    >
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
      <div className={`w-8 h-4 rounded-full relative p-0.5 transition-colors duration-300 ${isActive ? "bg-indigo-600" : "bg-slate-300"}`}>
        <div
          className={`w-3 h-3 bg-white rounded-full absolute transition-all duration-300 shadow-sm ${isActive ? "left-[calc(100%-14px)]" : "left-0.5"}`}
        />
      </div>
    </div>
  )
}
