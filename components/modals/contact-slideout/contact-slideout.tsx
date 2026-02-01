"use client"

import { useState } from "react"
import type { Contact } from "@/types"
import { SlideoutHeader } from "./slideout-header"
import { SlideoutTabs, type SlideoutTab } from "./slideout-tabs"
import { ActionFooter } from "./action-footer"
import { ProfileSection } from "@/components/modals/contact-detail/sections/profile-section"
import { ChatSection } from "@/components/modals/contact-detail/sections/chat-section"
import { OpportunitiesSection } from "@/components/modals/contact-detail/sections/opportunities-section"
import { ResearchSection } from "@/components/modals/contact-detail/sections/research-section"
import { SummarySection } from "@/components/modals/contact-detail/sections/summary-section"
import { HistorySection } from "@/components/modals/contact-detail/sections/history-section"

interface ContactSlideoutProps {
  contact: Contact
  onClose: () => void
}

export function ContactSlideout({ contact, onClose }: ContactSlideoutProps) {
  const [activeTab, setActiveTab] = useState<SlideoutTab>("Profile")
  const [isEngineOpen, setIsEngineOpen] = useState(false)

  const renderContent = () => {
    switch (activeTab) {
      case "Profile": return <ProfileSection contact={contact} />
      case "Chat": return <ChatSection contact={contact} />
      case "Opportunities": return <OpportunitiesSection contact={contact} />
      case "Research": return <ResearchSection contact={contact} />
      case "Summary": return <SummarySection contact={contact} />
      case "History": return <HistorySection contact={contact} />
      default: return null
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Overlay */}
        <div 
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" 
          onClick={onClose} 
        />
        
        {/* Panel */}
        <div className="bg-white w-full max-w-xl h-full shadow-2xl relative flex flex-col animate-in slide-in-from-right duration-500">
          <SlideoutHeader contact={contact} onClose={onClose} />
          
          <div className="flex-1 overflow-y-auto p-8 no-scrollbar space-y-8">
            <SlideoutTabs activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="min-h-[400px]">
              {renderContent()}
            </div>
          </div>

          <ActionFooter onOpenEngine={() => setIsEngineOpen(true)} />
        </div>
      </div>

      {/* Conversation Engine Modal would go here */}
      {isEngineOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsEngineOpen(false)} />
          <div className="bg-white w-full max-w-4xl h-[80vh] rounded-[48px] shadow-2xl relative p-8 overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Thorne Conversation Engine</h2>
              <button 
                onClick={() => setIsEngineOpen(false)}
                className="p-3 bg-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-colors"
              >
                Close
              </button>
            </div>
            <div className="flex items-center justify-center h-full text-slate-400">
              <p className="text-center">
                <span className="block text-6xl mb-4">AI</span>
                Conversation Engine for {contact.firstName} {contact.lastName}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
