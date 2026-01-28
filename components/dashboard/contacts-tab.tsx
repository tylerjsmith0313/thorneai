"use client"

import { useState } from "react"
import { Search, Filter, Plus, MoreHorizontal, Building2, MapPin } from "lucide-react"
import type { Contact } from "@/types"
import { ContactSlideout } from "@/components/modals/contact-slideout/contact-slideout"
import { AddContactWizard } from "@/components/modals/add-contact-wizard"

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

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      search === "" ||
      `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      contact.email.toLowerCase().includes(search.toLowerCase()) ||
      contact.company.toLowerCase().includes(search.toLowerCase())
    return matchesSearch
  })

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
            onClick={() => setShowAddContact(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-all"
          >
            <Plus className="w-4 h-4" />
            New Lead
          </button>
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
              onClick={() => setSelectedContact(contact)}
              className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-lg hover:border-indigo-200 transition-all cursor-pointer group"
            >
              {/* Avatar and Status */}
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600 font-bold text-lg group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  {contact.firstName[0]}{contact.lastName[0]}
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
    </div>
  )
}
