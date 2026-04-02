"use client"

import { useState } from "react"
import { X, Sparkles, Filter, Calendar, CheckCircle2, XCircle, Clock } from "lucide-react"
import type { Deal } from "@/types"

type OpportunityFilter = "all" | "open" | "won" | "lost"

interface OpportunitiesBreakdownProps {
  deals: Deal[]
  onClose: () => void
}

export function OpportunitiesBreakdown({ deals, onClose }: OpportunitiesBreakdownProps) {
  const [filter, setFilter] = useState<OpportunityFilter>("all")

  const filteredDeals = deals.filter((d) => {
    if (filter === "all") return true
    if (filter === "open") return d.status === "open"
    if (filter === "won") return d.status === "closed-won"
    if (filter === "lost") return d.status === "closed-lost"
    return true
  })

  const totalValue = filteredDeals.reduce((sum, d) => sum + d.amount, 0)

  // Generate AI analysis based on real data
  const generateAnalysis = () => {
    const wonDeals = deals.filter((d) => d.status === "closed-won")
    const openDeals = deals.filter((d) => d.status === "open")
    const lostDeals = deals.filter((d) => d.status === "closed-lost")

    const wonValue = wonDeals.reduce((sum, d) => sum + d.amount, 0)
    const openValue = openDeals.reduce((sum, d) => sum + d.amount, 0)

    if (deals.length === 0) {
      return "No deals in your pipeline yet. Start adding opportunities to track your sales funnel."
    }

    const winRate = deals.length > 0 ? Math.round((wonDeals.length / deals.length) * 100) : 0

    return `The pipeline shows ${winRate}% win rate with $${wonValue.toLocaleString()} in successfully closed revenue. The current open pipeline stands at $${openValue.toLocaleString()} across ${openDeals.length} active opportunities. ${lostDeals.length > 0 ? `${lostDeals.length} deals were lost, indicating areas for improvement in qualification or follow-up.` : "No lost deals - maintain this momentum!"}`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden relative flex flex-col animate-in fade-in zoom-in duration-300">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Opportunities Pipeline</h2>
            <p className="text-sm text-slate-500">Manage and analyze your sales funnel.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2 overflow-x-auto">
          <Filter className="w-4 h-4 text-slate-400 ml-2" />
          {(["all", "open", "won", "lost"] as OpportunityFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                filter === f
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-white text-slate-500 border border-slate-200 hover:border-indigo-300"
              }`}
            >
              {f}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2 text-xs font-medium text-slate-400 px-4">
            <Calendar className="w-3 h-3" />
            <span>Jan 1 - Dec 31, {new Date().getFullYear()}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white border border-slate-200 rounded-2xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Deal Count</p>
              <h4 className="text-xl font-bold text-slate-900">{filteredDeals.length}</h4>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-2xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Value</p>
              <h4 className="text-xl font-bold text-slate-900">${totalValue.toLocaleString()}</h4>
            </div>
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Status View</p>
              <h4 className="text-xl font-bold text-emerald-900 capitalize">{filter}</h4>
            </div>
          </div>

          {/* AI Tactical Analysis */}
          <div className="bg-indigo-900 rounded-2xl p-6 text-white relative overflow-hidden shadow-xl">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-indigo-300" />
              <h3 className="text-sm font-bold text-indigo-100">AI Pipeline Pulse</h3>
            </div>
            <p className="text-sm leading-relaxed text-indigo-50 font-medium">{generateAnalysis()}</p>
            <div className="absolute right-[-20px] bottom-[-20px] opacity-10 pointer-events-none">
              <Sparkles className="w-32 h-32" />
            </div>
          </div>

          {/* List */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center">Relevant Deals</h3>
            {filteredDeals.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <p>No deals found for this filter.</p>
              </div>
            ) : (
              filteredDeals.map((deal) => (
                <div
                  key={deal.id}
                  className="p-4 bg-white border border-slate-100 rounded-xl flex items-center justify-between hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-2 rounded-lg ${
                        deal.status === "closed-won"
                          ? "bg-emerald-50 text-emerald-600"
                          : deal.status === "closed-lost"
                            ? "bg-rose-50 text-rose-600"
                            : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      {deal.status === "closed-won" ? (
                        <CheckCircle2 size={18} />
                      ) : deal.status === "closed-lost" ? (
                        <XCircle size={18} />
                      ) : (
                        <Clock size={18} />
                      )}
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-slate-900">{deal.clientName}</h5>
                      <p className="text-xs text-slate-400">
                        Created {new Date(deal.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">${deal.amount.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{deal.status}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
