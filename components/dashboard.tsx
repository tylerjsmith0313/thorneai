"use client"

import { useState } from "react"
import { MessageSquare } from "lucide-react"

// Dashboard components
import { DashboardHeader } from "./dashboard/header"
import { NeuralFeed } from "./dashboard/neural-feed"
import { ContentTabs } from "./dashboard/content-tabs"
import { ControlCenter } from "./control-center"

// Cards
import { IncomeCard } from "./cards/income-card"
import { OpportunitiesCard } from "./cards/opportunities-card"
import { WitheringCard } from "./cards/withering-card"
import { DeadDealsCard } from "./cards/dead-deals-card"
import { BreakUpsCard } from "./cards/break-ups-card"
import { ContactsAddedCard } from "./cards/contacts-added-card"
import { DatabaseCard } from "./cards/database-card"

// Breakdowns
import { IncomeBreakdown } from "./breakdowns/income-breakdown"
import { WitheringBreakdown } from "./breakdowns/withering-breakdown"
import { BreakUpsBreakdown } from "./breakdowns/break-ups-breakdown"
import { ContactsAddedBreakdown } from "./breakdowns/contacts-added-breakdown"
import { DatabaseBreakdown } from "./breakdowns/database-breakdown"
import { DeadDealsBreakdown } from "./breakdowns/dead-deals-breakdown"
import { ActiveConversationsBreakdown } from "./breakdowns/active-conversations-breakdown"

// Modals
import { RadarScan } from "./modals/radar-scan"
import { Scanner } from "./modals/scanner"
import { ContactFinder } from "./modals/contact-finder"
import { BulkUpload } from "./modals/bulk-upload"
import { AddContactWizard } from "./modals/add-contact-wizard"

// Data
import { mockDeals, mockContacts, mockConversations } from "@/lib/mock-data"

// Types
import type { Conversation } from "@/types"

export function Dashboard() {
  // Modal states
  const [showControlCenter, setShowControlCenter] = useState(false)
  const [showIncomeBreakdown, setShowIncomeBreakdown] = useState(false)
  const [showOpportunitiesBreakdown, setShowOpportunitiesBreakdown] = useState(false)
  const [showWitheringBreakdown, setShowWitheringBreakdown] = useState(false)
  const [showDeadDealsBreakdown, setShowDeadDealsBreakdown] = useState(false)
  const [showBreakUpsBreakdown, setShowBreakUpsBreakdown] = useState(false)
  const [showContactsBreakdown, setShowContactsBreakdown] = useState(false)
  const [showDatabaseBreakdown, setShowDatabaseBreakdown] = useState(false)
  const [showConversationsBreakdown, setShowConversationsBreakdown] = useState(false)
  const [showRadar, setShowRadar] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [showFinder, setShowFinder] = useState(false)
  const [showBulkUpload, setShowBulkUpload] = useState(false)
  const [showAddContact, setShowAddContact] = useState(false)

  const handleVerifyLead = (lead: unknown) => {
    console.log("[v0] Lead verified:", lead)
    setShowFinder(false)
  }

  const handleBulkIngest = (data: unknown[]) => {
    console.log("[v0] Bulk data ingested:", data)
    setShowBulkUpload(false)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <DashboardHeader
        onOpenSettings={() => setShowControlCenter(true)}
        onRadarClick={() => setShowRadar(true)}
        onScannerClick={() => setShowScanner(true)}
        onBulkClick={() => setShowBulkUpload(true)}
        onFinderClick={() => setShowFinder(true)}
        onAddContactClick={() => setShowAddContact(true)}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <NeuralFeed />

        {/* Primary Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <IncomeCard deals={mockDeals} onClick={() => setShowIncomeBreakdown(true)} />
          <OpportunitiesCard deals={mockDeals} onClick={() => setShowOpportunitiesBreakdown(true)} />
          <ContactsAddedCard contacts={mockContacts} onClick={() => setShowContactsBreakdown(true)} />
          <ConversationsCard conversations={mockConversations} onClick={() => setShowConversationsBreakdown(true)} />
        </div>

        {/* Secondary Status Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <WitheringCard contacts={mockContacts} onClick={() => setShowWitheringBreakdown(true)} />
          <BreakUpsCard contacts={mockContacts} onClick={() => setShowBreakUpsBreakdown(true)} />
          <DeadDealsCard deals={mockDeals} onClick={() => setShowDeadDealsBreakdown(true)} />
          <DatabaseCard contacts={mockContacts} onClick={() => setShowDatabaseBreakdown(true)} />
        </div>

        {/* Content Tabs */}
        <ContentTabs />
      </main>

      {/* Modals */}
      {showControlCenter && <ControlCenter onClose={() => setShowControlCenter(false)} />}
      {showIncomeBreakdown && <IncomeBreakdown deals={mockDeals} onClose={() => setShowIncomeBreakdown(false)} />}
      {showWitheringBreakdown && <WitheringBreakdown contacts={mockContacts} onClose={() => setShowWitheringBreakdown(false)} />}
      {showBreakUpsBreakdown && <BreakUpsBreakdown contacts={mockContacts} onClose={() => setShowBreakUpsBreakdown(false)} />}
      {showContactsBreakdown && <ContactsAddedBreakdown contacts={mockContacts} onClose={() => setShowContactsBreakdown(false)} />}
      {showDatabaseBreakdown && <DatabaseBreakdown contacts={mockContacts} onClose={() => setShowDatabaseBreakdown(false)} />}
      {showDeadDealsBreakdown && <DeadDealsBreakdown deals={mockDeals} onClose={() => setShowDeadDealsBreakdown(false)} />}
      {showConversationsBreakdown && <ActiveConversationsBreakdown conversations={mockConversations} onClose={() => setShowConversationsBreakdown(false)} />}
      {showRadar && <RadarScan onClose={() => setShowRadar(false)} />}
      {showScanner && <Scanner onClose={() => setShowScanner(false)} />}
      {showFinder && <ContactFinder onClose={() => setShowFinder(false)} onVerify={handleVerifyLead} />}
      {showBulkUpload && <BulkUpload onClose={() => setShowBulkUpload(false)} onIngest={handleBulkIngest} />}
      {showAddContact && <AddContactWizard onClose={() => setShowAddContact(false)} />}
    </div>
  )
}

// Conversations Card Component
function ConversationsCard({ conversations, onClick }: { conversations: Conversation[]; onClick: () => void }) {
  const ongoingCount = conversations.length
  const managedCount = conversations.filter((c) => c.status === "thorne_handling").length
  const actionCount = conversations.filter((c) => c.unreadCount > 0).length

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 cursor-pointer hover:shadow-lg hover:border-indigo-100 transition-all group overflow-hidden relative h-full flex flex-col justify-between"
    >
      <div className="flex items-start justify-between mb-2.5">
        <div className="p-2 bg-indigo-50 rounded-xl group-hover:bg-indigo-100 transition-colors border border-indigo-50">
          <MessageSquare className="w-4 h-4 text-indigo-600" />
        </div>
        <div className="flex items-center text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-indigo-100">
          AI ACTIVE
        </div>
      </div>

      <div className="space-y-0">
        <h3 className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em]">Conversations</h3>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black text-slate-900 tracking-tight">{ongoingCount}</span>
          <span className="text-[10px] font-bold text-slate-400">Ongoing</span>
        </div>
      </div>

      <div className="mt-3.5 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
        <div>
          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Managed</p>
          <p className="text-xs font-black text-slate-800">{managedCount}</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Action</p>
          <p className="text-xs font-black text-indigo-600">{actionCount}</p>
        </div>
      </div>

      <div className="absolute -right-4 -bottom-4 opacity-[0.03] pointer-events-none text-indigo-600 rotate-12 transition-transform duration-500 group-hover:scale-110">
        <MessageSquare className="w-24 h-24" />
      </div>
    </div>
  )
}
