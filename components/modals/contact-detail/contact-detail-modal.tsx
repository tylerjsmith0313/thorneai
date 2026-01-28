"use client"

import React from "react"

import { useState } from "react"
import { X, User, FileText, Search, Target, MessageSquare, History } from "lucide-react"
import type { Contact } from "@/types"
import { ProfileSection } from "./sections/profile-section"
import { SummarySection } from "./sections/summary-section"
import { ResearchSection } from "./sections/research-section"
import { OpportunitiesSection } from "./sections/opportunities-section"
import { ChatSection } from "./sections/chat-section"
import { HistorySection } from "./sections/history-section"
import { StatusBadge } from "@/components/ui/status-badge"

interface ContactDetailModalProps {
  contact: Contact
  onClose: () => void
}

type TabType = "profile" | "summary" | "research" | "opportunities" | "chat" | "history"

const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: "profile", label: "Profile", icon: <User size={16} /> },
  { id: "summary", label: "Summary", icon: <FileText size={16} /> },
  { id: "research", label: "Research", icon: <Search size={16} /> },
  { id: "opportunities", label: "Opportunities", icon: <Target size={16} /> },
  { id: "chat", label: "Chat", icon: <MessageSquare size={16} /> },
  { id: "history", label: "History", icon: <History size={16} /> },
]

export function ContactDetailModal({ contact, onClose }: ContactDetailModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("profile")

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileSection contact={contact} />
      case "summary":
        return <SummarySection contact={contact} />
      case "research":
        return <ResearchSection contact={contact} />
      case "opportunities":
        return <OpportunitiesSection contact={contact} />
      case "chat":
        return <ChatSection contact={contact} />
      case "history":
        return <HistorySection contact={contact} />
      default:
        return <ProfileSection contact={contact} />
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="bg-white w-full max-w-4xl h-[85vh] rounded-[48px] shadow-2xl overflow-hidden relative flex flex-col animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-[24px] text-white flex items-center justify-center text-xl font-black shadow-xl shadow-indigo-200">
              {contact.firstName?.[0]}{contact.lastName?.[0]}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  {contact.firstName} {contact.lastName}
                </h2>
                <StatusBadge status={contact.status} />
              </div>
              <p className="text-sm text-slate-500 font-medium mt-1">
                {contact.jobTitle} at {contact.company}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-4 bg-slate-50 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-8 pt-4 bg-white border-b border-slate-100 shrink-0">
          <div className="flex gap-1 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-t-2xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-slate-50 text-indigo-600 border-t border-l border-r border-slate-200"
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50/50"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/30 no-scrollbar">
          {renderTabContent()}
        </div>
      </div>
    </div>
  )
}
