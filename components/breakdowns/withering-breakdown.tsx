"use client"

import React, { useState, useEffect } from 'react'
import { X, Calendar, Filter, Wind, Sparkles, MessageCircle, RefreshCw, AlertCircle, ChevronRight } from 'lucide-react'
import type { Contact, DateFilterType } from '@/types.ts'

interface WitheringBreakdownProps {
  contacts: Contact[]
  onClose: () => void
}

export function WitheringBreakdown({ contacts, onClose }: WitheringBreakdownProps) {
  const [filterType, setFilterType] = useState<DateFilterType>('month')
  const [strategy, setStrategy] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const witheringContacts = contacts.filter(c => c.status === 'Withering')

  useEffect(() => {
    setLoading(true)
    // Simulate AI strategy generation
    const timer = setTimeout(() => {
      setStrategy("Initiate a low-friction multi-channel 'Retouch' sequence with personalized context. Send a value-driven follow-up through LinkedIn and SMS to break the silence.")
      setLoading(false)
    }, 1200)
    return () => clearTimeout(timer)
  }, [witheringContacts.length])

  const getDaysSinceContact = (dateStr: string) => {
    const diffTime = Math.abs(new Date().getTime() - new Date(dateStr).getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden relative flex flex-col animate-in fade-in zoom-in duration-300">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Withering Leads</h2>
            <p className="text-sm text-slate-500">Non-responders and leads losing commitment.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2 overflow-x-auto">
          <Filter className="w-4 h-4 text-slate-400 ml-2 shrink-0" />
          {(['day', 'month', 'year', 'custom'] as DateFilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all shrink-0 ${
                filterType === f 
                ? 'bg-amber-600 text-white shadow-md' 
                : 'bg-white text-slate-500 border border-slate-200 hover:border-amber-300'
              }`}
            >
              {f}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2 text-xs font-medium text-slate-400 px-4">
            <Calendar className="w-3 h-3" />
            <span>Range Selection</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* AI Re-engagement Strategy */}
          <div className="bg-gradient-to-br from-amber-600 to-orange-700 rounded-2xl p-6 text-white relative overflow-hidden shadow-xl">
             <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-amber-200" />
              <h3 className="text-sm font-bold text-amber-50">{"Thorne's Recapture Strategy"}</h3>
            </div>
            {loading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-2 bg-amber-400/50 rounded w-full" />
                <div className="h-2 bg-amber-400/50 rounded w-4/5" />
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm leading-relaxed text-amber-50 font-medium">
                  {strategy}
                </p>
                <button className="flex items-center gap-2 bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider">
                  <RefreshCw className="w-3 h-3" /> Execute Flow
                </button>
              </div>
            )}
            <Wind className="absolute right-[-20px] bottom-[-20px] opacity-10 pointer-events-none w-32 h-32" />
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 mb-2">High Risk Contacts</h3>
            {witheringContacts.length === 0 ? (
              <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400">All leads are currently engaged!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {witheringContacts.map(contact => (
                  <div key={contact.id} className="p-4 bg-white border border-slate-100 rounded-xl flex items-center justify-between hover:border-amber-200 transition-all cursor-pointer group shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 font-bold text-sm">
                        {contact.firstName[0]}{contact.lastName[0]}
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-slate-900">{contact.firstName} {contact.lastName}</h5>
                        <p className="text-[10px] text-slate-400 font-medium">{contact.company} • Last contact {contact.lastContactDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="inline-flex items-center text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full uppercase">
                           {getDaysSinceContact(contact.lastContactDate)} Days Idle
                        </span>
                        <div className="flex gap-1 mt-2 justify-end">
                           <button className="p-1.5 hover:bg-slate-100 rounded-md text-slate-400 hover:text-indigo-600 transition-colors">
                              <MessageCircle size={14} />
                           </button>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-amber-500" />
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
