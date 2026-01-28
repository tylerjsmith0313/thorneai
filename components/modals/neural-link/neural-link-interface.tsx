"use client"

import { useState, useEffect } from "react"
import {
  Terminal,
  Layers,
  History,
  Trash2,
  BrainCircuit,
  Sparkles,
  Zap,
  CheckCircle,
  ChevronRight,
  RefreshCw,
  Database,
} from "lucide-react"
import { BaseButton } from "@/components/ui/base-button"
import { neuralMemory, type KnowledgeNode } from "@/lib/services/neural-memory"

export function NeuralLinkInterface() {
  const [learnedNodes, setLearnedNodes] = useState<KnowledgeNode[]>([])
  const [workflowInput, setWorkflowInput] = useState("")
  const [workflowTitle, setWorkflowTitle] = useState("")
  const [isIngesting, setIsIngesting] = useState(false)

  useEffect(() => {
    setLearnedNodes(neuralMemory.getRecentSynapses(15))
  }, [])

  const handleClearMemory = () => {
    neuralMemory.clear()
    setLearnedNodes([])
  }

  const handleInjectWorkflow = async () => {
    if (!workflowInput.trim() || !workflowTitle.trim()) return

    setIsIngesting(true)
    // Simulate Neural Processing
    setTimeout(() => {
      const node = neuralMemory.record(
        `Workflow: ${workflowTitle}. Process: ${workflowInput}`,
        "workflow"
      )
      setLearnedNodes([node, ...learnedNodes])
      setWorkflowInput("")
      setWorkflowTitle("")
      setIsIngesting(false)
    }, 1200)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[600px] animate-in fade-in duration-500">
      {/* Learning Status & Workflow Injection */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl shrink-0">
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                <BrainCircuit size={20} className="text-indigo-400" />
              </div>
              <h4 className="font-bold text-lg tracking-tight uppercase">
                Neural Training
              </h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              Thorne continuously indexes your directives. Inject workflows
              below to create unique business logic.
            </p>
          </div>
          <Sparkles className="absolute right-[-40px] bottom-[-40px] w-64 h-64 text-white/5 rotate-12 pointer-events-none" />
        </div>

        {/* Workflow Injection Terminal */}
        <div className="flex-1 bg-slate-950 border border-slate-800 rounded-[40px] p-8 space-y-6 overflow-hidden flex flex-col shadow-2xl relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal size={14} className="text-indigo-400" />
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Process Ingestion
              </h5>
            </div>
            {isIngesting && (
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black text-emerald-600 uppercase">
                  Ingesting...
                </span>
              </div>
            )}
          </div>

          <div className="space-y-4 flex-1 flex flex-col">
            <input
              placeholder="Workflow Title (e.g. Q3 SaaS Flow)"
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-bold text-white focus:border-indigo-500 outline-none transition-all"
              value={workflowTitle}
              onChange={(e) => setWorkflowTitle(e.target.value)}
            />
            <textarea
              placeholder="Inject your work process example here... Thorne will learn how to automate this flow."
              className="flex-1 bg-white/5 border border-white/10 text-white p-4 text-xs font-mono placeholder:text-slate-700 leading-relaxed shadow-none rounded-[24px] outline-none focus:border-indigo-500 transition-all resize-none"
              value={workflowInput}
              onChange={(e) => setWorkflowInput(e.target.value)}
            />
            <BaseButton
              onClick={handleInjectWorkflow}
              disabled={
                !workflowInput.trim() || !workflowTitle.trim() || isIngesting
              }
              variant="primary"
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-500 border-none shadow-xl shadow-indigo-900/50 rounded-xl font-black uppercase text-[10px] tracking-widest py-4 w-full"
              icon={
                isIngesting ? (
                  <RefreshCw className="animate-spin" size={14} />
                ) : (
                  <Zap size={14} />
                )
              }
            >
              Inject Process Node
            </BaseButton>
          </div>

          <Layers
            size={100}
            className="absolute right-[-20px] bottom-[-20px] text-white/5 pointer-events-none"
          />
        </div>
      </div>

      {/* Synapse Feed (The Vector Store View) */}
      <div className="lg:col-span-8 bg-white border border-slate-200 rounded-[48px] flex flex-col overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shadow-sm border border-indigo-100">
              <History size={20} />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-[0.1em]">
                Neural Index (Active Synapses)
              </h4>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                Live Learning Feed -{" "}
                {learnedNodes.filter((n) => n.category === "workflow").length}{" "}
                Active Workflows
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleClearMemory}
              className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
              title="Wipe Neural Store"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 p-8 space-y-4 overflow-y-auto no-scrollbar bg-slate-50/20">
          {learnedNodes.length > 0 ? (
            learnedNodes.map((node) => (
              <div
                key={node.id}
                className="group p-5 bg-white border border-slate-100 rounded-[32px] hover:shadow-xl hover:border-indigo-100 transition-all flex items-start gap-5 animate-in slide-in-from-right-4"
              >
                <div
                  className={`p-3 rounded-2xl shrink-0 ${
                    node.category === "workflow"
                      ? "bg-slate-900 text-white"
                      : node.category === "preference"
                        ? "bg-rose-50 text-rose-500"
                        : node.category === "logic"
                          ? "bg-indigo-50 text-indigo-500"
                          : "bg-emerald-50 text-emerald-500"
                  }`}
                >
                  {node.category === "workflow" ? (
                    <Terminal size={18} />
                  ) : node.category === "preference" ? (
                    <Zap size={18} />
                  ) : node.category === "logic" ? (
                    <BrainCircuit size={18} />
                  ) : (
                    <CheckCircle size={18} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                      {new Date(node.timestamp).toLocaleTimeString()} -{" "}
                      {node.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <div className="w-1 h-1 bg-emerald-500 rounded-full" />
                      <span className="text-[8px] font-black text-emerald-600 uppercase">
                        Active
                      </span>
                    </div>
                  </div>
                  <p className="text-[13px] font-bold text-slate-800 leading-relaxed truncate group-hover:whitespace-normal">
                    {node.content.length > 150
                      ? `"${node.content.substring(0, 150)}..."`
                      : `"${node.content}"`}
                  </p>
                </div>
                <button className="p-2 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-indigo-600 transition-all">
                  <ChevronRight size={18} />
                </button>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
              <Database size={48} className="text-slate-200 mb-4" />
              <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">
                Neural store is empty. Send commands or inject workflows to
                begin.
              </p>
            </div>
          )}
        </div>

        <div className="p-8 border-t border-slate-100 bg-white">
          <div className="flex items-center gap-3">
            <Sparkles size={14} className="text-indigo-500" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Thorne leverages these workflow processes to personalize all
              automated sequences.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
