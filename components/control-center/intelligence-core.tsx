"use client"

import { Plus, Database, FileText, Link, Trash2 } from "lucide-react"

export function IntelligenceCore() {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">AI Intelligence Core</h3>
        <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">
          Global training nodes. These configurations apply across all contacts and campaigns to ensure consistent brand logic.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="p-10 bg-indigo-50 border-2 border-dashed border-indigo-200 rounded-[40px] flex flex-col items-center justify-center text-center gap-4 hover:bg-indigo-100/50 transition-all cursor-pointer group shadow-inner">
          <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
            <Plus size={28} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-indigo-900">Add Global Training Source</h4>
            <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest mt-1">Sync Knowledge Base</p>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Active Core Sources</h4>
          <SourceItem name="Brand Guidelines 2024.pdf" type="file" />
          <SourceItem name="Corporate Mission & Values" type="text" />
          <SourceItem name="https://thorne.ai/api-specs" type="link" />
        </div>
      </div>
    </div>
  )
}

function SourceItem({ name, type }: { name: string; type: string }) {
  return (
    <div className="p-5 bg-white border border-slate-200 rounded-3xl flex items-center justify-between hover:border-indigo-200 transition-all group">
      <div className="flex items-center gap-4">
        <div className="p-2.5 bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 rounded-xl transition-colors">
          {type === "file" ? <FileText size={16} /> : type === "link" ? <Link size={16} /> : <Database size={16} />}
        </div>
        <span className="text-xs font-bold text-slate-700">{name}</span>
      </div>
      <button className="p-2 text-slate-200 hover:text-rose-500 transition-colors">
        <Trash2 size={16} />
      </button>
    </div>
  )
}
