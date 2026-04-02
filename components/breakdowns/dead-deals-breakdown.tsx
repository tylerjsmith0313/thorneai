"use client"

import { useState } from "react"
import { X, Calendar, Filter, FileX, Sparkles, AlertCircle, ChevronRight } from "lucide-react"
import type { Deal, DateFilterType } from "@/types"

interface DeadDealsBreakdownProps {
  deals: Deal[]
  onClose: () => void
}

export function DeadDealsBreakdown({ deals, onClose }: DeadDealsBreakdownProps) {
  const [filterType, setFilterType] = useState<DateFilterType>("year")
  const deadDeals = deals.filter((d) => d.status === "closed-lost")

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden relative flex flex-col animate-in fade-in zoom-in duration-300">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Dead Deals Analysis</h2>
            <p className="text-sm text-slate-500">Post-mortem of lost opportunities and recovery pathways.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2 overflow-x-auto">
          <Filter className="w-4 h-4 text-slate-400 ml-2 shrink-0" />
          {(["day", "month", "year", "custom"] as DateFilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all shrink-0 ${
                filterType === f
                  ? "bg-slate-800 text-white shadow-md"
                  : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300"
              }`}
            >
              {f}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2 text-xs font-medium text-slate-400 px-4">
            <Calendar className="w-3 h-3" />
            <span>Timeframe Selection</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 border-dashed">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-5 h-5 text-slate-400" />
              <h3 className="text-sm font-bold text-slate-700">Thorne AI Autopsy</h3>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed italic">
              {`"Losses in the ${filterType} window were primarily due to timeline misalignment. Thorne recommends moving these to a 'Recapture' sequence in 6 months for a high-touch check-in."`}
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Lost Opportunities</h3>
            {deadDeals.length === 0 ? (
              <div className="py-12 text-center bg-slate-50 rounded-2xl">
                <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No lost deals recorded.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {deadDeals.map((deal) => (
                  <div
                    key={deal.id}
                    className="p-4 bg-white border border-slate-100 rounded-xl flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 font-bold text-sm">
                        <FileX size={18} />
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-slate-900">{deal.clientName}</h5>
                        <p className="text-[10px] text-slate-400 font-medium">
                          Lost on {new Date(deal.actualCloseDate || deal.expectedCloseDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-bold text-rose-500">${deal.amount.toLocaleString()}</p>
                        <p className="text-[10px] text-slate-300 uppercase font-bold">Total Loss</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
