"use client"

import { useState } from "react"
import { Search, FileText, Video, Link, Book, Download, ExternalLink, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"

export function AcademyResources() {
  const [filter, setFilter] = useState<"all" | "video" | "document" | "link" | "article">("all")

  const resources = [
    { id: 1, type: "video" as const, title: "Node Calibration Masterclass", duration: "52m", date: "Mar 2024" },
    { id: 2, type: "document" as const, title: "Thorne Brand Guidelines v3", size: "12MB PDF", date: "Feb 2024" },
    { id: 3, type: "article" as const, title: "The Psychology of Outreach", readTime: "8m read", date: "Mar 2024" },
    { id: 4, type: "link" as const, title: "External Radar API Specs", target: "Docs Portal", date: "Jan 2024" },
    { id: 5, type: "document" as const, title: "Gift Personalization Matrix", size: "1.4MB XLSX", date: "Mar 2024" },
    { id: 6, type: "video" as const, title: "Handling Q2 Objections", duration: "18m", date: "Apr 2024" },
  ]

  const filtered = resources.filter(r => filter === "all" || r.type === filter)

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 w-full relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search library..." className="pl-10" />
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shrink-0">
          {(["all", "video", "document", "link", "article"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                filter === f ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(res => (
          <ResourceCard key={res.id} resource={res} />
        ))}
      </div>
    </div>
  )
}

function ResourceCard({ resource }: { resource: { id: number; type: "video" | "document" | "link" | "article"; title: string; date: string; duration?: string; size?: string; readTime?: string; target?: string } }) {
  const getIcon = () => {
    switch (resource.type) {
      case "video": return <Video size={20} className="text-rose-500" />
      case "document": return <FileText size={20} className="text-blue-500" />
      case "link": return <Link size={20} className="text-emerald-500" />
      case "article": return <Book size={20} className="text-amber-500" />
      default: return <FileText size={20} />
    }
  }

  const getSubtext = () => {
    return resource.duration || resource.size || resource.readTime || resource.target
  }

  return (
    <div className="bg-white p-6 rounded-[32px] border border-slate-200 hover:shadow-2xl hover:border-indigo-100 transition-all group flex flex-col cursor-pointer">
      <div className="flex items-center justify-between mb-6">
        <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-indigo-50 transition-all shadow-sm">
          {getIcon()}
        </div>
        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{resource.date}</span>
      </div>
      
      <h4 className="text-sm font-black text-slate-900 tracking-tight leading-tight mb-2">
        {resource.title}
      </h4>
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-6">
        {resource.type} - {getSubtext()}
      </p>

      <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
        <button className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:translate-x-1 transition-transform">
          {resource.type === "video" ? "Play Video" : 
           resource.type === "document" ? "Download" : "View Link"}
          <ChevronRight size={12} />
        </button>
        {resource.type === "document" ? <Download size={16} className="text-slate-300" /> : <ExternalLink size={16} className="text-slate-300" />}
      </div>
    </div>
  )
}
