"use client"

import { Sparkles, Zap, BrainCircuit, RefreshCw } from "lucide-react"

interface StepProps {
  loading: boolean
  campaignIdeas: string
}

export function StrategyStep({ loading, campaignIdeas }: StepProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-slate-900 rounded-[48px] p-10 text-white relative overflow-hidden min-h-[400px] shadow-2xl border border-white/10">
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/20 rounded-2xl border border-indigo-500/30">
              <Sparkles size={24} className="text-indigo-400" />
            </div>
            <div>
              <h4 className="text-lg font-bold tracking-tight">Thorne Intelligence Pulse</h4>
              <p className="text-xs text-indigo-300 font-medium mt-0.5">AI-Generated High-Conversion Strategy</p>
            </div>
          </div>
          {!loading && (
            <button className="p-3 hover:bg-white/10 rounded-2xl transition-all text-indigo-300">
              <RefreshCw size={20} />
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-6 animate-pulse mt-10">
            <div className="h-3 bg-white/5 rounded-full w-full" />
            <div className="h-3 bg-white/5 rounded-full w-[90%]" />
            <div className="h-3 bg-white/5 rounded-full w-[95%]" />
            <div className="h-3 bg-white/5 rounded-full w-[70%]" />
            <div className="mt-12 space-y-3">
              <div className="h-20 bg-white/5 rounded-3xl w-full" />
            </div>
          </div>
        ) : (
          <div className="relative z-10">
            <div className="prose prose-invert max-w-none">
              <p className="text-slate-300 leading-relaxed text-sm whitespace-pre-wrap font-medium">
                {campaignIdeas || "Generating personalized outreach strategy..."}
              </p>
            </div>
          </div>
        )}

        <BrainCircuit className="absolute right-[-40px] bottom-[-40px] opacity-[0.03] w-64 h-64 text-white pointer-events-none" />
        <Zap className="absolute left-[-20px] top-1/2 -translate-y-1/2 opacity-[0.02] w-48 h-48 text-white pointer-events-none" />
      </div>

      {!loading && (
        <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest animate-bounce">
          Scroll down to refine steps or regenerate
        </p>
      )}
    </div>
  )
}
