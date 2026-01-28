"use client"

import { useState } from "react"
import { X, Filter, UserPlus, Search, ChevronRight } from "lucide-react"
import type { Contact, DateFilterType } from "@/types"

interface ContactsAddedBreakdownProps {
  contacts: Contact[]
  onClose: () => void
}

export function ContactsAddedBreakdown({ contacts, onClose }: ContactsAddedBreakdownProps) {
  const [filterType, setFilterType] = useState<DateFilterType>("month")
  const [customRange, setCustomRange] = useState({ start: "", end: "" })

  const filteredContacts = contacts.filter((c) => {
    const d = new Date(c.addedDate)
    const now = new Date()

    if (filterType === "day") {
      return d.toDateString() === now.toDateString()
    }
    if (filterType === "month") {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }
    if (filterType === "year") {
      return d.getFullYear() === now.getFullYear()
    }
    if (filterType === "custom" && customRange.start && customRange.end) {
      const start = new Date(customRange.start)
      const end = new Date(customRange.end)
      return d >= start && d <= end
    }
    return true
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden relative flex flex-col animate-in fade-in zoom-in duration-300">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Contacts Added Breakdown</h2>
            <p className="text-sm text-slate-500">Track human-verified data entry and lead ingestion.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <div className="p-4 bg-slate-50 border-b border-slate-100 space-y-4">
          <div className="flex items-center gap-2 overflow-x-auto">
            <Filter className="w-4 h-4 text-slate-400 ml-2 shrink-0" />
            {(["day", "month", "year", "custom"] as DateFilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilterType(f)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all shrink-0 ${
                  filterType === f
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white text-slate-500 border border-slate-200 hover:border-blue-300"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {filterType === "custom" && (
            <div className="flex items-center gap-4 animate-in slide-in-from-top-2 duration-200 px-2">
              <input
                type="date"
                className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={customRange.start}
                onChange={(e) => setCustomRange((prev) => ({ ...prev, start: e.target.value }))}
              />
              <span className="text-slate-400 text-xs font-bold">TO</span>
              <input
                type="date"
                className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={customRange.end}
                onChange={(e) => setCustomRange((prev) => ({ ...prev, end: e.target.value }))}
              />
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl">
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Results</p>
              <h4 className="text-xl font-bold text-blue-900">{filteredContacts.length} Contacts</h4>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-2xl md:col-span-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Human Verified Growth</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-2 bg-slate-100 rounded-full flex-1">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: "65%" }} />
                </div>
                <span className="text-xs font-bold text-slate-600">65% Quality Score</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900">List of Added Contacts</h3>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter list..."
                  className="pl-8 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs outline-none focus:ring-1 focus:ring-blue-500 w-48"
                />
              </div>
            </div>

            {filteredContacts.length === 0 ? (
              <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <UserPlus className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No contacts found for this period.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {filteredContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="p-4 bg-white border border-slate-100 rounded-xl flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm">
                        {contact.firstName[0]}
                        {contact.lastName[0]}
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {contact.firstName} {contact.lastName}
                        </h5>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {contact.email} - {contact.company}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            contact.status === "Hot"
                              ? "bg-orange-50 text-orange-600"
                              : contact.status === "Withering"
                                ? "bg-amber-50 text-amber-600"
                                : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {contact.status}
                        </span>
                        <p className="text-[10px] text-slate-300 mt-1">{new Date(contact.addedDate).toLocaleDateString()}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-400" />
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
