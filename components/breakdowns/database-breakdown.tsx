"use client"

import { X, Database, Shield, Zap, Search, ChevronRight, HardDrive, Share2 } from "lucide-react"
import type { Contact } from "@/lib/mock-data"

interface DatabaseBreakdownProps {
  contacts: Contact[]
  onClose: () => void
}

export function DatabaseBreakdown({ contacts, onClose }: DatabaseBreakdownProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden relative flex flex-col animate-in fade-in zoom-in duration-300">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Database Intelligence</h2>
            <p className="text-sm text-slate-500">Managing {contacts.length} human-verified contact profiles.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-indigo-600 rounded-3xl text-white space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-200" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-100">Integrity Score</span>
              </div>
              <h4 className="text-3xl font-bold tracking-tight">91%</h4>
              <p className="text-xs text-indigo-100 leading-relaxed">
                Your data is highly enriched and verified via Thorne Radar.
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-slate-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Storage Location</span>
              </div>
              <p className="text-lg font-bold text-slate-900 mt-2">Local & Private</p>
              <div className="mt-4 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 w-full" />
              </div>
            </div>

            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-slate-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Sync Status</span>
              </div>
              <p className="text-lg font-bold text-slate-900 mt-2">Active Flow</p>
              <div className="flex items-center gap-2 mt-4 text-[10px] font-bold text-indigo-600">
                <Zap size={10} /> Real-time Updates Enabled
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Verified Master List</h3>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search database..."
                  className="pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500 w-64"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm">
                      {contact.firstName[0]}
                      {contact.lastName[0]}
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-slate-900">
                        {contact.firstName} {contact.lastName}
                      </h5>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {contact.email} - {contact.company}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      Verified {new Date(contact.addedDate).toLocaleDateString()}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
