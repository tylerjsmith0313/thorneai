"use client"

import { useState } from "react"
import { AICommandChat } from "./ai-command-chat"
import { DevelopmentSection } from "./development-section"
import { ContactsTab } from "./contacts-tab"
import { ConversationsTab } from "./conversations-tab"
import { CalendarSection } from "./calendar-section"
import { AnalyticsSection } from "./analytics-section"
import { CreativeSuite } from "@/components/creative/creative-suite"
import type { Contact, Deal, Conversation } from "@/types"

const tabs = [
  "AI COMMAND",
  "CONVERSATIONS",
  "CALENDAR",
  "CONTACTS",
  "ACADEMY",
  "CREATIVE",
  "ANALYTICS",
]

interface ContentTabsProps {
  contacts?: Contact[]
  deals?: Deal[]
  conversations?: Conversation[]
}

export function ContentTabs({ contacts = [], deals = [], conversations = [] }: ContentTabsProps) {
  const [activeTab, setActiveTab] = useState("AI COMMAND")

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Tab Navigation */}
      <div className="border-b border-border px-4">
        <nav className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-thorne-indigo text-thorne-indigo"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === "AI COMMAND" && <AICommandChat />}
        {activeTab === "CONTACTS" && <ContactsTab contacts={contacts} />}
        {activeTab === "CONVERSATIONS" && <ConversationsTab conversations={conversations} />}
        {activeTab === "CALENDAR" && <CalendarSection />}
        {activeTab === "ACADEMY" && <DevelopmentSection />}
        {activeTab === "CREATIVE" && <CreativeSuite />}
        {activeTab === "ANALYTICS" && <AnalyticsSection />}
      </div>
    </div>
  )
}
