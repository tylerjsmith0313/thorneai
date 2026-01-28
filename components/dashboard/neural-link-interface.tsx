"use client"

import { Upload, Link, MessageSquare, FileText, Database, ShieldCheck, Zap } from "lucide-react"
import { BaseButton } from "@/components/ui/base-button"
import { BaseInput } from "@/components/ui/base-input"
import { ChatBubble } from "@/components/conversation/chat-bubble"

export function NeuralLinkInterface() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[550px] animate-in fade-in duration-500">
      {/* Training & Knowledge Side */}
      <div className="flex flex-col gap-6">
        <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-xl">
                <Database size={20} className="text-indigo-400" />
              </div>
              <h4 className="font-bold text-lg tracking-tight">Thorne Training Core</h4>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed font-medium">
              Upload documents, paste URLs, or sync social nodes to teach Thorne about your
              brand voice and business logic.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <BaseButton
                variant="dark"
                className="bg-white/5 border border-white/10 hover:bg-white/10"
                icon={<Upload size={14} />}
              >
                Upload File
              </BaseButton>
              <BaseButton
                variant="dark"
                className="bg-white/5 border border-white/10 hover:bg-white/10"
                icon={<Link size={14} />}
              >
                Add Link
              </BaseButton>
            </div>
          </div>
          <Database className="absolute right-[-40px] bottom-[-40px] w-64 h-64 text-white/5 rotate-12 pointer-events-none" />
        </div>

        <div className="flex-1 bg-slate-50 border border-slate-200 rounded-[32px] p-6 space-y-4 overflow-y-auto no-scrollbar">
          <div className="flex items-center justify-between mb-2">
            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Active Knowledge Nodes
            </h5>
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
              8 Nodes Linked
            </span>
          </div>
          <KnowledgeNode name="Brand Guidelines 2024.pdf" date="2h ago" type="file" />
          <KnowledgeNode name="https://thorne.ai/values" date="1d ago" type="link" />
          <KnowledgeNode name="LinkedIn Profile Sync" date="Initial" type="social" />
        </div>
      </div>

      {/* Coaching Chat Side */}
      <div className="bg-white border border-slate-200 rounded-[40px] flex flex-col overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Zap size={16} />
            </div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Coach Thorne
            </h4>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase border border-emerald-100">
            <ShieldCheck size={12} /> Sync Active
          </div>
        </div>
        <div className="flex-1 p-6 space-y-4 overflow-y-auto no-scrollbar bg-slate-50/30">
          <ChatBubble
            role="thorne"
            content="How should I respond to skepticism about our enterprise pricing?"
            timestamp="Now"
          />
          <ChatBubble
            role="user"
            content="Always emphasize the 'Zero-Friction' deployment and the 30-day ROI guarantee."
            timestamp="1 min ago"
          />
        </div>
        <div className="p-6 border-t border-slate-100">
          <BaseInput
            placeholder="Give Thorne coaching instructions..."
            icon={<MessageSquare size={16} />}
          />
        </div>
      </div>
    </div>
  )
}

function KnowledgeNode({
  name,
  date,
  type,
}: {
  name: string
  date: string
  type: string
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl group hover:border-indigo-200 transition-all cursor-pointer">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 rounded-lg transition-colors">
          {type === "file" ? (
            <FileText size={14} />
          ) : type === "link" ? (
            <Link size={14} />
          ) : (
            <Database size={14} />
          )}
        </div>
        <div>
          <p className="text-xs font-bold text-slate-700">{name}</p>
          <p className="text-[10px] text-slate-400 font-medium">Synced {date}</p>
        </div>
      </div>
      <BaseButton variant="ghost" size="xs" className="opacity-0 group-hover:opacity-100">
        Edit
      </BaseButton>
    </div>
  )
}
