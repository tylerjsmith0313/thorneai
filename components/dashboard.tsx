"use client"

import { useState } from "react"
import { DashboardHeader } from "./dashboard/header"
import { NeuralFeed } from "./dashboard/neural-feed"
import { ContentTabs } from "./dashboard/content-tabs"
import { ControlCenter } from "./control-center"

// Cards
import { IncomeCard } from "./cards/income-card"
import { OpportunitiesCard } from "./cards/opportunities-card"
import { WitheringCard } from "./cards/withering-card"
import { DeadDealsCard } from "./cards/dead-deals-card"

// Breakdowns
import { IncomeBreakdown } from "./breakdowns/income-breakdown"
import { WitheringBreakdown } from "./breakdowns/withering-breakdown"

// Modals
import { RadarScan } from "./modals/radar-scan"
import { Scanner } from "./modals/scanner"

// Data
import { mockDeals, mockContacts } from "@/lib/mock-data"

// Additional cards for second row
import { Users, HeartCrack, Database } from "lucide-react"

export function Dashboard() {
  const [showControlCenter, setShowControlCenter] = useState(false)
  const [showIncomeBreakdown, setShowIncomeBreakdown] = useState(false)
  const [showOpportunitiesBreakdown, setShowOpportunitiesBreakdown] = useState(false)
  const [showWitheringBreakdown, setShowWitheringBreakdown] = useState(false)
  const [showDeadDealsBreakdown, setShowDeadDealsBreakdown] = useState(false)
  const [showRadar, setShowRadar] = useState(false)
  const [showScanner, setShowScanner] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader 
        onOpenSettings={() => setShowControlCenter(true)} 
        onRadarClick={() => setShowRadar(true)}
        onScannerClick={() => setShowScanner(true)}
      />
      
      <main className="max-w-7xl mx-auto px-4 py-6">
        <NeuralFeed />
        
        {/* Primary Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <IncomeCard deals={mockDeals} onClick={() => setShowIncomeBreakdown(true)} />
          <OpportunitiesCard deals={mockDeals} onClick={() => setShowOpportunitiesBreakdown(true)} />
          <ContactsCard />
          <ConversationsCard />
        </div>

        {/* Secondary Status Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <WitheringCard contacts={mockContacts} onClick={() => setShowWitheringBreakdown(true)} />
          <BreakUpsCard />
          <DeadDealsCard deals={mockDeals} onClick={() => setShowDeadDealsBreakdown(true)} />
          <DBHealthCard />
        </div>

        <ContentTabs />
      </main>

      {/* Modals */}
      {showControlCenter && (
        <ControlCenter onClose={() => setShowControlCenter(false)} />
      )}
      
      {showIncomeBreakdown && (
        <IncomeBreakdown deals={mockDeals} onClose={() => setShowIncomeBreakdown(false)} />
      )}

      {showWitheringBreakdown && (
        <WitheringBreakdown contacts={mockContacts} onClose={() => setShowWitheringBreakdown(false)} />
      )}

      {showRadar && (
        <RadarScan onClose={() => setShowRadar(false)} />
      )}

      {showScanner && (
        <Scanner onClose={() => setShowScanner(false)} />
      )}
    </div>
  )
}

// Additional helper cards to fill out the grid
function ContactsCard() {
  return (
    <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 p-4 cursor-pointer hover:shadow-lg hover:border-blue-100 transition-all group overflow-hidden relative h-full flex flex-col justify-between">
      <div className="flex items-start justify-between mb-2.5">
        <div className="p-2 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors border border-blue-50">
          <Users className="w-4 h-4 text-blue-600" />
        </div>
        <div className="flex items-center text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-100">
          +18%
        </div>
      </div>

      <div className="space-y-0">
        <h3 className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em]">Contacts</h3>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black text-slate-900 tracking-tight">0</span>
          <span className="text-[10px] font-bold text-slate-400">THIS MONTH</span>
        </div>
      </div>

      <div className="mt-3.5 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
        <div>
          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Total DB</p>
          <p className="text-xs font-black text-slate-800">11</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Growth</p>
          <p className="text-xs font-black text-slate-800">STEADY</p>
        </div>
      </div>

      <div className="absolute -right-4 -bottom-4 opacity-[0.03] pointer-events-none text-blue-600 rotate-12 transition-transform duration-500 group-hover:scale-110">
        <Users className="w-24 h-24" />
      </div>
    </div>
  )
}

function ConversationsCard() {
  return (
    <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 p-4 cursor-pointer hover:shadow-lg hover:border-indigo-100 transition-all group overflow-hidden relative h-full flex flex-col justify-between">
      <div className="flex items-start justify-between mb-2.5">
        <div className="p-2 bg-indigo-50 rounded-xl group-hover:bg-indigo-100 transition-colors border border-indigo-50">
          <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <div className="flex items-center text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-indigo-100">
          AI ACTIVE
        </div>
      </div>

      <div className="space-y-0">
        <h3 className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em]">Conversations</h3>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black text-slate-900 tracking-tight">4</span>
          <span className="text-[10px] font-bold text-slate-400">Ongoing</span>
        </div>
      </div>

      <div className="mt-3.5 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
        <div>
          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Managed</p>
          <p className="text-xs font-black text-slate-800">1</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Action</p>
          <p className="text-xs font-black text-indigo-600">2</p>
        </div>
      </div>
    </div>
  )
}

function BreakUpsCard() {
  return (
    <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 p-4 cursor-pointer hover:shadow-lg hover:border-rose-100 transition-all group overflow-hidden relative h-full flex flex-col justify-between">
      <div className="flex items-start justify-between mb-2.5">
        <div className="p-2 bg-rose-50 rounded-xl group-hover:bg-rose-100 transition-colors border border-rose-50">
          <HeartCrack className="w-4 h-4 text-rose-600" />
        </div>
        <div className="flex items-center text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest">
          SILENCE
        </div>
      </div>

      <div className="space-y-0">
        <h3 className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em]">Break Ups</h3>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black text-slate-900 tracking-tight">2</span>
          <span className="text-[10px] font-bold text-slate-400">Contacts</span>
        </div>
      </div>

      <div className="mt-3.5 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
        <div>
          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Last Msg</p>
          <p className="text-xs font-black text-slate-800">14D+ AVG</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Risk</p>
          <p className="text-xs font-black text-rose-500 uppercase">HIGH</p>
        </div>
      </div>

      <div className="absolute -right-4 -bottom-4 opacity-[0.03] pointer-events-none text-rose-600 rotate-12 transition-transform duration-500 group-hover:scale-110">
        <HeartCrack className="w-24 h-24" />
      </div>
    </div>
  )
}

function DBHealthCard() {
  return (
    <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 p-4 cursor-pointer hover:shadow-lg hover:border-emerald-100 transition-all group overflow-hidden relative h-full flex flex-col justify-between">
      <div className="flex items-start justify-between mb-2.5">
        <div className="p-2 bg-emerald-50 rounded-xl group-hover:bg-emerald-100 transition-colors border border-emerald-50">
          <Database className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="flex items-center text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest">
          VERIFIED
        </div>
      </div>

      <div className="space-y-0">
        <h3 className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em]">DB Health</h3>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black text-slate-900 tracking-tight">11</span>
          <span className="text-[10px] font-bold text-slate-400">Nodes</span>
        </div>
      </div>

      <div className="mt-3.5 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
        <div>
          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Enriched</p>
          <p className="text-xs font-black text-slate-800">91%</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Storage</p>
          <p className="text-xs font-black text-emerald-600 uppercase">SECURE</p>
        </div>
      </div>

      <div className="absolute -right-4 -bottom-4 opacity-[0.03] pointer-events-none text-emerald-600 rotate-12 transition-transform duration-500 group-hover:scale-110">
        <Database className="w-24 h-24" />
      </div>
    </div>
  )
}
