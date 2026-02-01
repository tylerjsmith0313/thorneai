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
import { OpportunitiesBreakdown } from "./breakdowns/opportunities-breakdown"
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
import { AdminCenter } from "./modals/admin-center/admin-center"
import { NeuralLink } from "./neural-link/neural-link"
import { AnalyticsDashboard } from "./analytics/analytics-dashboard"

// Types
import type { Contact, Deal, Conversation } from "@/types"

interface DashboardProps {
  contacts: Contact[]
  deals: Deal[]
  conversations: Conversation[]
  onRefresh?: () => void
}

export function Dashboard({ contacts, deals, conversations, onRefresh }: DashboardProps) {
  // Modal states
  const [showControlCenter, setShowControlCenter] = useState(false)
  const [showAdminCenter, setShowAdminCenter] = useState(false)
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
  const [showNeuralLink, setShowNeuralLink] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)

  const handleVerifyLead = (lead: unknown) => {
    console.log("[v0] Lead verified:", lead)
    setShowFinder(false)
    onRefresh?.()
  }

  const handleBulkIngest = (data: unknown[]) => {
    console.log("[v0] Bulk data ingested:", data)
    setShowBulkUpload(false)
    onRefresh?.()
  }

  const handleContactAdded = () => {
    onRefresh?.()
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <DashboardHeader
        onOpenSettings={() => setShowControlCenter(true)}
        onOpenAdminCenter={() => setShowAdminCenter(true)}
        onRadarClick={() => setShowRadar(true)}
        onScannerClick={() => setShowScanner(true)}
        onBulkClick={() => setShowBulkUpload(true)}
        onFinderClick={() => setShowFinder(true)}
        onAddContactClick={() => setShowAddContact(true)}
        onNeuralLinkClick={() => setShowNeuralLink(true)}
        onAnalyticsClick={() => setShowAnalytics(true)}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <NeuralFeed />

        {/* Primary Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <IncomeCard deals={deals} onClick={() => setShowIncomeBreakdown(true)} />
          <OpportunitiesCard deals={deals} onClick={() => setShowOpportunitiesBreakdown(true)} />
          <ContactsAddedCard contacts={contacts} onClick={() => setShowContactsBreakdown(true)} />
          <ConversationsCard conversations={conversations} onClick={() => setShowConversationsBreakdown(true)} />
        </div>

        {/* Secondary Status Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <WitheringCard contacts={contacts} onClick={() => setShowWitheringBreakdown(true)} />
          <BreakUpsCard contacts={contacts} onClick={() => setShowBreakUpsBreakdown(true)} />
          <DeadDealsCard deals={deals} onClick={() => setShowDeadDealsBreakdown(true)} />
          <DatabaseCard contacts={contacts} onClick={() => setShowDatabaseBreakdown(true)} />
        </div>

        {/* Content Tabs */}
        <ContentTabs contacts={contacts} deals={deals} conversations={conversations} />
      </main>

      {/* Modals */}
      {showControlCenter && <ControlCenter onClose={() => setShowControlCenter(false)} />}
      {showAdminCenter && <AdminCenter onClose={() => setShowAdminCenter(false)} />}
      {showIncomeBreakdown && <IncomeBreakdown deals={deals} onClose={() => setShowIncomeBreakdown(false)} />}
      {showOpportunitiesBreakdown && <OpportunitiesBreakdown deals={deals} onClose={() => setShowOpportunitiesBreakdown(false)} />}
      {showWitheringBreakdown && <WitheringBreakdown contacts={contacts} onClose={() => setShowWitheringBreakdown(false)} />}
      {showBreakUpsBreakdown && <BreakUpsBreakdown contacts={contacts} onClose={() => setShowBreakUpsBreakdown(false)} />}
      {showContactsBreakdown && <ContactsAddedBreakdown contacts={contacts} onClose={() => setShowContactsBreakdown(false)} />}
      {showDatabaseBreakdown && <DatabaseBreakdown contacts={contacts} onClose={() => setShowDatabaseBreakdown(false)} />}
      {showDeadDealsBreakdown && <DeadDealsBreakdown deals={deals} onClose={() => setShowDeadDealsBreakdown(false)} />}
      {showConversationsBreakdown && <ActiveConversationsBreakdown conversations={conversations} onClose={() => setShowConversationsBreakdown(false)} />}
      {showRadar && <RadarScan onClose={() => setShowRadar(false)} />}
      {showScanner && <Scanner onClose={() => setShowScanner(false)} />}
      {showFinder && <ContactFinder onClose={() => setShowFinder(false)} onVerify={handleVerifyLead} />}
      {showBulkUpload && <BulkUpload onClose={() => setShowBulkUpload(false)} onIngest={handleBulkIngest} />}
      {showAddContact && <AddContactWizard onClose={() => setShowAddContact(false)} onSuccess={handleContactAdded} />}
      {showNeuralLink && <NeuralLink onClose={() => setShowNeuralLink(false)} />}
      {showAnalytics && <AnalyticsDashboard onClose={() => setShowAnalytics(false)} />}
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
