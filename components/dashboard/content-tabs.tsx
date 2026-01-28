"use client"

import { useState } from "react"
import { AICommandChat } from "./ai-command-chat"

const tabs = [
  "AI COMMAND",
  "CONVERSATIONS",
  "CALENDAR",
  "CONTACTS",
  "ACADEMY",
  "CREATIVE",
  "ANALYTICS",
]

export function ContentTabs() {
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
        {activeTab !== "AI COMMAND" && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">{activeTab} content coming soon...</p>
          </div>
        )}
      </div>
    </div>
  )
}
