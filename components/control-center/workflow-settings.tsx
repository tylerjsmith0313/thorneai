"use client"

import { useState } from "react"
import { Activity, Plus, GitBranch, CheckCircle, RefreshCw, ArrowRight, Zap, BarChart3, Target, Clock, DollarSign, TrendingUp } from "lucide-react"
import { BaseButton } from "@/components/ui/base-button"

interface WorkflowNode {
  id: string
  title: string
  subtitle: string
  step: number
}

const WORKFLOW_STEPS: WorkflowNode[] = [
  { id: "1", title: "INGEST", subtitle: "SIGNAL", step: 1 },
  { id: "2", title: "MAP", subtitle: "CONTEXT", step: 2 },
  { id: "3", title: "DISPATCH", subtitle: "OUTREACH", step: 3 },
  { id: "4", title: "AUDIT", subtitle: "YIELD", step: 4 },
]

interface DocumentationNode {
  id: string
  title: string
  status: "completed" | "in-progress" | "pending"
  integrity: number
}

export function WorkflowSettings() {
  const [flowHealth] = useState(69)
  const [isSyncing, setIsSyncing] = useState(false)
  const [docs, setDocs] = useState<DocumentationNode[]>([
    { id: "1", title: "Mastering the Flow Engine", status: "completed", integrity: 100 }
  ])

  const metrics = {
    ingestion: "12/D",
    conversion: "65.2%",
    closeRate: "42.8%",
    profitability: "$127,700"
  }

  const handleSync = () => {
    setIsSyncing(true)
    setTimeout(() => setIsSyncing(false), 2000)
  }

  const addDocumentationNode = () => {
    const newDoc: DocumentationNode = {
      id: Math.random().toString(36).substr(2, 9),
      title: "New Documentation Node",
      status: "pending",
      integrity: 0
    }
    setDocs([...docs, newDoc])
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
            Operational Flow: Synchronized
          </span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">NEURAL WORKFLOW MASTERY</h2>
        <p className="text-sm text-slate-500 italic mt-1">
          "Thorne determines execution sequences based on Professional Documentation."
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="flex gap-6">
        {/* Left: Health & Metrics */}
        <div className="flex-1">
          {/* Global Health Card */}
          <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Global Health</h4>
                <div className="flex items-center gap-3">
                  <span className="text-6xl font-black text-slate-900">{flowHealth}%</span>
                  <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-bold rounded-full border border-amber-100">
                    FLOW EFFICIENCY
                  </span>
                </div>
              </div>
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
                <Activity className="w-7 h-7 text-slate-400" />
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden mb-4">
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${flowHealth}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              <span className="text-rose-500">Critical Risk</span>
              <span className="text-emerald-500">Optimal Core</span>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Zap size={12} className="text-slate-400" />
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Ingestion</span>
                </div>
                <p className="text-lg font-black text-slate-900">{metrics.ingestion}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingUp size={12} className="text-slate-400" />
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Conversion</span>
                </div>
                <p className="text-lg font-black text-slate-900">{metrics.conversion}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Target size={12} className="text-emerald-500" />
                  <span className="text-[9px] font-bold text-emerald-500 uppercase">Close Rate</span>
                </div>
                <p className="text-lg font-black text-slate-900">{metrics.closeRate}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <DollarSign size={12} className="text-slate-400" />
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Profitability</span>
                </div>
                <p className="text-lg font-black text-slate-900">{metrics.profitability}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Documentation */}
        <div className="w-72">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Professional Documentation</h4>
            <BaseButton
              variant="primary"
              size="sm"
              icon={<Plus size={14} />}
              onClick={addDocumentationNode}
              className="rounded-xl"
            >
              Add Node
            </BaseButton>
          </div>

          <div className="space-y-3">
            {docs.map((doc) => (
              <div 
                key={doc.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                    <GitBranch className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm font-bold text-slate-900 truncate">{doc.title}</h5>
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                      {doc.status === "completed" ? "Completed Course" : doc.status === "in-progress" ? "In Progress" : "Pending"}
                    </p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-50">
                  <div className="flex items-center justify-between text-[9px] text-slate-400">
                    <span>Integrity: {doc.integrity}%</span>
                    {doc.status === "completed" && (
                      <CheckCircle size={12} className="text-emerald-500" />
                    )}
                  </div>
                  <div className="h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${doc.integrity}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Sequence Preview */}
      <div className="bg-slate-900 rounded-[32px] p-8 relative overflow-hidden">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700">
            <GitBranch className="w-5 h-5 text-indigo-400" />
          </div>
          <h3 className="text-sm font-black text-white uppercase tracking-widest">Active Sequence Preview</h3>
        </div>

        {/* Workflow Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {WORKFLOW_STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-2">
                  <span className="text-xs font-bold text-indigo-400 border border-indigo-500/30 rounded-lg px-2 py-0.5">
                    {step.step}
                  </span>
                </div>
                <span className="text-xs font-black text-white tracking-wide">{step.title}</span>
                <span className="text-[9px] text-slate-500 uppercase tracking-widest">{step.subtitle}</span>
              </div>
              {index < WORKFLOW_STEPS.length - 1 && (
                <ArrowRight className="w-5 h-5 text-slate-700 mx-2" />
              )}
            </div>
          ))}
        </div>

        {/* AI Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-indigo-400 animate-pulse" />
            <span className="text-xs text-slate-400">AI Determining Next Optimal Step...</span>
          </div>
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} />
            {isSyncing ? "Syncing..." : "Real-Time Sync"}
          </button>
        </div>

        {/* Background decoration */}
        <BarChart3 size={200} className="absolute -right-10 -bottom-10 text-slate-800/50 pointer-events-none" />
      </div>
    </div>
  )
}
