"use client"

import { useState } from "react"
import { Search, Filter, Plus, MoreHorizontal, Building2, MapPin, Upload, Merge, X, Check, Loader2, CheckSquare, Square } from "lucide-react"
import type { Contact } from "@/types"
import { ContactSlideout } from "@/components/modals/contact-slideout/contact-slideout"
import { AddContactWizard } from "@/components/modals/add-contact-wizard"
import { BulkUploadModal } from "@/components/modals/bulk-upload-modal"

interface ContactsTabProps {
  contacts: Contact[]
}

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  Hot: { label: "HOT", color: "bg-rose-50 text-rose-600 border-rose-100", dot: "bg-rose-500" },
  New: { label: "NEW", color: "bg-sky-50 text-sky-600 border-sky-100", dot: "bg-sky-500" },
  Withering: { label: "WITHERING", color: "bg-amber-50 text-amber-600 border-amber-100", dot: "bg-amber-500" },
  Recapture: { label: "RECAPTURE", color: "bg-violet-50 text-violet-600 border-violet-100", dot: "bg-violet-500" },
  Dead: { label: "DEAD", color: "bg-slate-100 text-slate-500 border-slate-200", dot: "bg-slate-400" },
  "Needs Update": { label: "NEEDS UPDATE", color: "bg-yellow-50 text-yellow-600 border-yellow-100", dot: "bg-yellow-500" },
  Retouch: { label: "RETOUCH", color: "bg-teal-50 text-teal-600 border-teal-100", dot: "bg-teal-500" },
}

export function ContactsTab({ contacts }: ContactsTabProps) {
  const [search, setSearch] = useState("")
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [showAddContact, setShowAddContact] = useState(false)
  const [showBulkUpload, setShowBulkUpload] = useState(false)
  
  // Merge state
  const [mergeMode, setMergeMode] = useState(false)
  const [selectedForMerge, setSelectedForMerge] = useState<Set<string>>(new Set())
  const [showMergeModal, setShowMergeModal] = useState(false)
  const [targetContactId, setTargetContactId] = useState<string | null>(null)
  const [merging, setMerging] = useState(false)

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      search === "" ||
      `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      contact.email.toLowerCase().includes(search.toLowerCase()) ||
      contact.company.toLowerCase().includes(search.toLowerCase())
    return matchesSearch
  })

  const toggleMergeSelect = (contactId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedForMerge(prev => {
      const next = new Set(prev)
      if (next.has(contactId)) {
        next.delete(contactId)
      } else {
        next.add(contactId)
      }
      return next
    })
  }

  const cancelMerge = () => {
    setMergeMode(false)
    setSelectedForMerge(new Set())
    setShowMergeModal(false)
    setTargetContactId(null)
  }

  const startMerge = () => {
    if (selectedForMerge.size >= 2) {
      setShowMergeModal(true)
    }
  }

  const executeMerge = async () => {
    if (!targetContactId || selectedForMerge.size < 2) return
    setMerging(true)

    try {
      const sourceIds = Array.from(selectedForMerge).filter(id => id !== targetContactId)
      const res = await fetch("/api/contacts/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetContactId,
          sourceContactIds: sourceIds,
        }),
      })

      if (res.ok) {
        // Refresh page to show updated contacts
        window.location.reload()
      } else {
        console.error("Merge failed")
      }
    } catch (error) {
      console.error("Merge error:", error)
    } finally {
      setMerging(false)
    }
  }

  const selectedContacts = contacts.filter(c => selectedForMerge.has(c.id))

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status] || statusConfig.New
    return (
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${config.color}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
        {config.label}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Verified Database</h2>
          <p className="text-sm text-slate-500 mt-0.5">Human-verified leads and engagement nodes.</p>
        </div>
        <div className="flex items-center gap-3">
          {mergeMode ? (
            <>
              <span className="text-sm text-slate-600">
                {selectedForMerge.size} selected
              </span>
              <button
                onClick={startMerge}
                disabled={selectedForMerge.size < 2}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Merge className="w-4 h-4" />
                Merge Selected
              </button>
              <button
                onClick={cancelMerge}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-all"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </>
          ) : (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm w-56 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
              <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all">
                <Filter className="w-4 h-4" />
              </button>
              <button
                onClick={() => setMergeMode(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all"
              >
                <Merge className="w-4 h-4" />
                Merge
              </button>
              <button
                onClick={() => setShowBulkUpload(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all"
              >
                <Upload className="w-4 h-4" />
                Bulk Upload
              </button>
              <button
                onClick={() => setShowAddContact(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-all"
              >
                <Plus className="w-4 h-4" />
                New Lead
              </button>
            </>
          )}
        </div>
      </div>

      {/* Contact Grid */}
      {filteredContacts.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Search className="w-6 h-6 text-slate-400" />
          </div>
          <p className="text-slate-600 font-medium">No contacts found</p>
          <p className="text-slate-400 text-sm mt-1">
            {search ? "Try a different search term" : "Add your first contact to get started"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => mergeMode ? toggleMergeSelect(contact.id, { stopPropagation: () => {} } as React.MouseEvent) : setSelectedContact(contact)}
              className={`bg-white border rounded-2xl p-5 hover:shadow-lg transition-all cursor-pointer group ${
                mergeMode && selectedForMerge.has(contact.id)
                  ? "border-indigo-400 ring-2 ring-indigo-100"
                  : "border-slate-200 hover:border-indigo-200"
              }`}
            >
              {/* Avatar and Status */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {mergeMode && (
                    <button
                      onClick={(e) => toggleMergeSelect(contact.id, e)}
                      className="w-6 h-6 flex items-center justify-center"
                    >
                      {selectedForMerge.has(contact.id) ? (
                        <CheckSquare className="w-5 h-5 text-indigo-600" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-300 group-hover:text-slate-400" />
                      )}
                    </button>
                  )}
                  <div className={`w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600 font-bold text-lg group-hover:bg-indigo-600 group-hover:text-white transition-all ${
                    mergeMode && selectedForMerge.has(contact.id) ? "bg-indigo-600 text-white" : ""
                  }`}>
                    {contact.firstName[0]}{contact.lastName[0]}
                  </div>
                </div>
                {getStatusBadge(contact.status)}
              </div>

              {/* Name and Details */}
              <div className="space-y-2 mb-5">
                <h4 className="text-base font-bold text-slate-900">{contact.firstName} {contact.lastName}</h4>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Building2 size={12} className="text-slate-300" />
                    {contact.company || "No company"}
                  </p>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    <MapPin size={12} className="text-slate-300" />
                    {contact.source || "New York, NY"}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Last Contact</p>
                  <p className="text-xs font-bold text-slate-700 mt-0.5">
                    {contact.lastContactDate 
                      ? new Date(contact.lastContactDate).toLocaleDateString("en-CA")
                      : "Never"}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                  className="p-1.5 text-slate-300 hover:text-slate-600 transition-colors rounded-lg hover:bg-slate-100"
                >
                  <MoreHorizontal size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Contact Slideout */}
      {selectedContact && (
        <ContactSlideout
          contact={selectedContact}
          onClose={() => setSelectedContact(null)}
        />
      )}

{/* Add Contact Modal */}
      {showAddContact && (
        <AddContactWizard
          onClose={() => setShowAddContact(false)}
          onComplete={() => setShowAddContact(false)}
        />
      )}

      {/* Bulk Upload Modal */}
      <BulkUploadModal
        isOpen={showBulkUpload}
        onClose={() => setShowBulkUpload(false)}
        onComplete={() => setShowBulkUpload(false)}
      />

      {/* Merge Modal */}
      {showMergeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <Merge className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Merge Contacts</h3>
                    <p className="text-xs text-slate-500">Select which contact to keep as the primary</p>
                  </div>
                </div>
                <button
                  onClick={cancelMerge}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-slate-600 mb-4">
                Select the primary contact. All data from other contacts will be merged into this one, 
                and the other contacts will be deleted.
              </p>
              
              <div className="space-y-2">
                {selectedContacts.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => setTargetContactId(contact.id)}
                    className={`w-full p-4 rounded-xl border text-left transition-all flex items-center gap-4 ${
                      targetContactId === contact.id
                        ? "border-indigo-400 bg-indigo-50 ring-2 ring-indigo-100"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                      targetContactId === contact.id
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}>
                      {contact.firstName[0]}{contact.lastName[0]}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900">
                        {contact.firstName} {contact.lastName}
                      </div>
                      <div className="text-xs text-slate-500">{contact.email}</div>
                      {contact.company && (
                        <div className="text-xs text-slate-400">{contact.company}</div>
                      )}
                    </div>
                    {targetContactId === contact.id && (
                      <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {targetContactId && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                  <p className="text-xs text-amber-700">
                    <strong>Note:</strong> {selectedContacts.filter(c => c.id !== targetContactId).length} contact(s) will be merged and deleted. 
                    All their conversations, activities, and deals will be transferred to the primary contact.
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 flex gap-3">
              <button
                onClick={cancelMerge}
                className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={executeMerge}
                disabled={!targetContactId || merging}
                className="flex-1 px-4 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {merging ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Merging...
                  </>
                ) : (
                  <>
                    <Merge className="w-4 h-4" />
                    Merge Contacts
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
