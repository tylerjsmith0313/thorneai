"use client"

import { useState } from "react"
import { X, Calendar, Filter, HeartCrack, Sparkles, Send, RefreshCw, UserMinus, ChevronRight } from "lucide-react"
import type { Contact, DateFilterType } from "@/types"

interface BreakUpsBreakdownProps {
  contacts: Contact[]
  onClose: () => void
}

export function BreakUpsBreakdown({ contacts, onClose }: BreakUpsBreakdownProps) {
  const [filterType, setFilterType] = useState<DateFilterType>("month")
  const [mendingScript] = useState<string>(
    "A quick 'Hey, checking in on that project we discussed' often re-opens the door. Use a low-pressure 'thought of you' nudge with a helpful resource link."
  )

  const retouchContacts = contacts.filter((c) => c.status === "Retouch")

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden relative flex flex-col animate-in fade-in zoom-in duration-300">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Break Ups (Last Contact)</h2>
            <p className="text-sm text-slate-500">Mend relationships with non-responders and lost momentum.</p>
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
                  ? "bg-rose-600 text-white shadow-md"
                  : "bg-white text-slate-500 border border-slate-200 hover:border-rose-300"
              }`}
            >
              {f}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2 text-xs font-medium text-slate-400 px-4">
            <Calendar className="w-3 h-3" />
            <span>Timeframe Window</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* AI Re-engagement Strategy */}
          <div className="bg-gradient-to-br from-rose-600 to-pink-700 rounded-2xl p-6 text-white relative overflow-hidden shadow-xl">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-rose-200" />
              <h3 className="text-sm font-bold text-rose-50">{"Thorne's Mending Strategy"}</h3>
            </div>
            <div className="space-y-4">
              <p className="text-sm leading-relaxed text-rose-50 font-medium">{mendingScript}</p>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider">
                  <Send className="w-3 h-3" /> Start Mending Flow
                </button>
                <button className="flex items-center gap-2 bg-black/10 hover:bg-black/20 transition-colors px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider">
                  <RefreshCw className="w-3 h-3" /> Regenerate Script
                </button>
              </div>
            </div>
            <HeartCrack className="absolute right-[-20px] bottom-[-20px] opacity-10 pointer-events-none w-32 h-32" />
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Contacts Requiring Retouch</h3>
            {retouchContacts.length === 0 ? (
              <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <UserMinus className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No "Break Ups" currently recorded.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {retouchContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="p-4 bg-white border border-slate-100 rounded-xl flex items-center justify-between hover:border-rose-200 transition-all cursor-pointer group shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 font-bold text-sm">
                        {contact.firstName[0]}
                        {contact.lastName[0]}
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-slate-900">
                          {contact.firstName} {contact.lastName}
                        </h5>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {contact.company} - Silence for {Math.floor(Math.random() * 30) + 7} days
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="inline-flex items-center text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full uppercase">
                          Relationship at Risk
                        </span>
                        <p className="text-[10px] text-slate-300 mt-1">Status: Retouch</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-rose-500" />
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
