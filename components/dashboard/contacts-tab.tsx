"use client"

import { useState } from "react"
import { Search, Filter, MoreVertical, Mail, Phone, Building2, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { Contact } from "@/types"

interface ContactsTabProps {
  contacts: Contact[]
}

const statusColors: Record<string, string> = {
  New: "bg-blue-100 text-blue-700",
  Hot: "bg-orange-100 text-orange-700",
  Withering: "bg-amber-100 text-amber-700",
  Dead: "bg-slate-200 text-slate-600",
  "Needs Update": "bg-purple-100 text-purple-700",
  Retouch: "bg-cyan-100 text-cyan-700",
  Recapture: "bg-emerald-100 text-emerald-700",
}

export function ContactsTab({ contacts }: ContactsTabProps) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      search === "" ||
      `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      contact.email.toLowerCase().includes(search.toLowerCase()) ||
      contact.company.toLowerCase().includes(search.toLowerCase())

    const matchesStatus = !statusFilter || contact.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const statuses = Array.from(new Set(contacts.map((c) => c.status)))

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={statusFilter === null ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(null)}
            className={statusFilter === null ? "" : "bg-transparent"}
          >
            All ({contacts.length})
          </Button>
          {statuses.map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className={statusFilter === status ? "" : "bg-transparent"}
            >
              {status} ({contacts.filter((c) => c.status === status).length})
            </Button>
          ))}
        </div>
      </div>

      {/* Contact List */}
      {filteredContacts.length === 0 ? (
        <div className="text-center py-12">
          <User className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">No contacts found</p>
          <p className="text-slate-400 text-sm mt-1">
            {search ? "Try a different search term" : "Add your first contact to get started"}
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                    {contact.firstName[0]}
                    {contact.lastName[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900">
                        {contact.firstName} {contact.lastName}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusColors[contact.status]}`}>
                        {contact.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {contact.company}
                      </span>
                      {contact.jobTitle && (
                        <span className="text-slate-400">{contact.jobTitle}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600">
                    <Mail className="w-4 h-4" />
                  </Button>
                  {contact.phone && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600">
                      <Phone className="w-4 h-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>Added {new Date(contact.addedDate).toLocaleDateString()}</span>
                {contact.lastContactDate && (
                  <span>Last contact: {new Date(contact.lastContactDate).toLocaleDateString()}</span>
                )}
                {contact.engagementScore !== undefined && (
                  <span className="flex items-center gap-1">
                    <span className="text-indigo-600 font-bold">{contact.engagementScore}%</span> engagement
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
