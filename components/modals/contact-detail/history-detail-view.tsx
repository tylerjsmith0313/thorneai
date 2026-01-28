"use client"

import { X, Play, MessageSquare, ExternalLink, Sparkles, BrainCircuit, Headphones, History, Globe, FileText, ChevronRight } from "lucide-react"
import type { Activity, Contact } from "@/types"
import { BaseButton } from "@/components/ui/base-button"

interface HistoryDetailViewProps {
  activity: Activity
  contact: Contact
  onClose: () => void
}

export function HistoryDetailView({ activity, contact, onClose }: HistoryDetailViewProps) {
  const renderContent = () => {
    switch (activity.type) {
      case "Thorne":
        return (
          <div className="space-y-8">
            <div className="bg-slate-900 rounded-[32px] p-8 text-white space-y-6 relative overflow-hidden">
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                    <Headphones size={20} className="text-indigo-400" />
                  </div>
                  <h4 className="text-sm font-bold tracking-tight">Call Recording: {activity.date}</h4>
                </div>
                <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest bg-indigo-500/10 px-2 py-1 rounded-md">8m 12s</span>
              </div>
              
              <div className="flex items-end gap-1 h-12 relative z-10 px-2">
                {[0.4, 0.7, 0.5, 0.9, 0.3, 0.6, 0.8, 0.4, 0.2, 0.7, 0.5, 0.9, 0.6, 0.4, 0.8, 0.3, 0.5, 0.7, 0.4, 0.6].map((h, i) => (
                  <div key={i} className="flex-1 bg-indigo-400/40 rounded-full" style={{ height: `${h * 100}%` }} />
                ))}
              </div>

              <div className="flex items-center gap-4 relative z-10">
                <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-indigo-900 shadow-xl hover:scale-105 active:scale-95 transition-all">
                  <Play size={20} fill="currentColor" className="ml-1" />
                </button>
                <div className="flex-1 h-1 bg-white/10 rounded-full relative">
                  <div className="absolute top-0 left-0 h-full w-1/3 bg-indigo-500 rounded-full" />
                </div>
                <span className="text-[10px] font-black text-slate-400">02:14</span>
              </div>
              <BrainCircuit className="absolute right-[-20px] bottom-[-20px] w-48 h-48 text-white/5 pointer-events-none" />
            </div>

            <div className="space-y-4">
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Thorne AI Transcription Snippet</h5>
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-[32px] space-y-4">
                <p className="text-xs text-slate-700 leading-relaxed">
                  <span className="font-bold text-indigo-600 mr-2">Thorne:</span> &quot;I noticed your team is scaling their outreach nodes. Would you be interested in a Zero-Friction migration audit?&quot;
                </p>
                <p className="text-xs text-slate-700 leading-relaxed italic">
                  <span className="font-bold text-slate-900 mr-2">{contact.firstName}:</span> &quot;We are looking at it for Q3. Send me the documentation on DNC compliance...&quot;
                </p>
              </div>
            </div>
          </div>
        )

      case "Human":
        return (
          <div className="space-y-8">
            <div className="p-8 bg-white border border-slate-200 rounded-[40px] shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                <div>
                  <h4 className="text-lg font-bold text-slate-900 tracking-tight">Personal Email Outreach</h4>
                  <p className="text-xs text-slate-400 mt-1">From: Customer (User) - Sent Mar 10</p>
                </div>
                <BaseButton variant="secondary" size="sm" icon={<ExternalLink size={12} />}>View Thread</BaseButton>
              </div>
              <div className="space-y-4">
                <p className="text-sm text-slate-600 font-bold uppercase tracking-widest text-[9px]">Subject: Strategic Implementation for {contact.company}</p>
                <div className="prose prose-slate prose-sm max-w-none text-slate-700 leading-relaxed font-medium">
                  <p>Hi {contact.firstName},</p>
                  <p>It was great catching up at the conference last week. Our conversation about enterprise DNC scrubbing really stuck with me.</p>
                  <p>I&apos;ve pulled together some initial nodes on how Thorne handles high-velocity ingestion while maintaining 100% compliance.</p>
                  <p>Best,<br />Thorne Customer</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-[32px] flex items-start gap-4">
               <div className="p-2 bg-indigo-600 rounded-xl text-white mt-1">
                 <Sparkles size={16} />
               </div>
               <div>
                  <h5 className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">Thorne Analysis</h5>
                  <p className="text-xs text-indigo-700 leading-relaxed mt-1 font-medium italic">
                    &quot;This outreach was successful in opening the Compliance knowledge node. Subsequent engagement increased by 22%.&quot;
                  </p>
               </div>
            </div>
          </div>
        )

      case "Update":
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-[32px] space-y-4">
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Previous State</h5>
                <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                   <p className="text-xs font-bold text-rose-500 break-all">{activity.oldValue || "Node Independent"}</p>
                </div>
              </div>
              <div className="p-6 bg-emerald-50/50 border border-emerald-100 rounded-[32px] space-y-4 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white p-1.5 rounded-full shadow-lg">
                   <ChevronRight size={14} className="rotate-90 md:rotate-0" />
                </div>
                <h5 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Verified State</h5>
                <div className="p-4 bg-white rounded-2xl border border-emerald-100 shadow-sm">
                   <p className="text-xs font-bold text-emerald-700 break-all">{activity.newValue || activity.detail}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                 <Globe size={16} className="text-slate-400" />
                 <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Source Verification Log</h5>
              </div>
              <div className="space-y-2">
                <SourceLogItem source="LinkedIn API Sync" date="TODAY, 10:45 AM" status="Verified" />
                <SourceLogItem source="ZeroBounce Node Audit" date="TODAY, 10:44 AM" status="Flagged" />
                <SourceLogItem source="Manual Override" date="YESTERDAY, 3:12 PM" status="Complete" />
              </div>
            </div>
          </div>
        )

      default:
        return (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 border-2 border-dashed border-slate-200">
               <FileText size={32} />
            </div>
            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Detailed telemetry for this node is being provisioned.</p>
          </div>
        )
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="bg-white w-full max-w-3xl h-[75vh] rounded-[48px] shadow-2xl overflow-hidden relative flex flex-col animate-in zoom-in-95 duration-300 border border-white/20">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-indigo-600 rounded-[22px] text-white flex items-center justify-center shadow-xl shadow-indigo-100">
              <History size={28} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-none">{activity.title}</h2>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Granular Telemetry Active</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-4 bg-slate-50 rounded-full text-slate-300 hover:text-rose-500 transition-all border border-slate-100">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 no-scrollbar bg-white">
          {renderContent()}
        </div>

        <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
           <BaseButton variant="ghost" size="sm" onClick={onClose} className="font-black text-[10px] uppercase tracking-widest">Back to Timeline</BaseButton>
           <div className="flex gap-3">
              <BaseButton variant="outline" size="sm" icon={<MessageSquare size={14} />}>Add Note</BaseButton>
              <BaseButton variant="dark" size="sm" icon={<ExternalLink size={14} />}>Open Conversation Engine</BaseButton>
           </div>
        </div>
      </div>
    </div>
  )
}

function SourceLogItem({ source, date, status }: { source: string; date: string; status: string }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-indigo-100 transition-all cursor-pointer group shadow-sm">
      <div className="flex items-center gap-4">
         <div className={`w-2 h-2 rounded-full ${status === "Verified" ? "bg-emerald-500" : status === "Flagged" ? "bg-rose-500" : "bg-indigo-500"}`} />
         <span className="text-[11px] font-bold text-slate-700">{source}</span>
      </div>
      <div className="text-right">
         <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{date}</p>
      </div>
    </div>
  )
}
