"use client"

import React from "react"

import { useState } from "react"
import { Search, MessageSquare, Mail, MessageCircle, Linkedin, Phone, Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { Conversation } from "@/types"

interface ConversationsTabProps {
  conversations: Conversation[]
}

const channelIcons: Record<string, React.ReactNode> = {
  Email: <Mail className="w-4 h-4" />,
  SMS: <MessageCircle className="w-4 h-4" />,
  LinkedIn: <Linkedin className="w-4 h-4" />,
  WhatsApp: <MessageCircle className="w-4 h-4" />,
  Phone: <Phone className="w-4 h-4" />,
}

const statusColors: Record<string, string> = {
  awaiting_reply: "bg-amber-100 text-amber-700",
  responded: "bg-emerald-100 text-emerald-700",
  thorne_handling: "bg-indigo-100 text-indigo-700",
}

const statusLabels: Record<string, string> = {
  awaiting_reply: "Awaiting Reply",
  responded: "Responded",
  thorne_handling: "AI Handling",
}

export function ConversationsTab({ conversations }: ConversationsTabProps) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)

  const filteredConversations = conversations.filter((convo) => {
    const matchesSearch =
      search === "" ||
      convo.contactName.toLowerCase().includes(search.toLowerCase()) ||
      convo.lastMessage.toLowerCase().includes(search.toLowerCase())

    const matchesStatus = !statusFilter || convo.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={statusFilter === null ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(null)}
            className={statusFilter === null ? "" : "bg-transparent"}
          >
            All
          </Button>
          <Button
            variant={statusFilter === "awaiting_reply" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("awaiting_reply")}
            className={statusFilter === "awaiting_reply" ? "" : "bg-transparent"}
          >
            Awaiting
          </Button>
          <Button
            variant={statusFilter === "thorne_handling" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("thorne_handling")}
            className={statusFilter === "thorne_handling" ? "" : "bg-transparent"}
          >
            AI Handling
          </Button>
        </div>
      </div>

      {/* Conversation List */}
      {filteredConversations.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">No conversations found</p>
          <p className="text-slate-400 text-sm mt-1">Start a conversation with a contact</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredConversations.map((convo) => (
            <div
              key={convo.id}
              className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                    {channelIcons[convo.channel] || <MessageSquare className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-900">{convo.contactName}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusColors[convo.status]}`}>
                        {convo.status === "thorne_handling" && <Sparkles className="w-3 h-3 inline mr-1" />}
                        {statusLabels[convo.status]}
                      </span>
                      {convo.unreadCount > 0 && (
                        <span className="w-5 h-5 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                          {convo.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 mt-1 truncate">{convo.lastMessage}</p>
                  </div>
                </div>
                <div className="text-xs text-slate-400 whitespace-nowrap">
                  {formatTime(convo.lastActive)}
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  {channelIcons[convo.channel]}
                  {convo.channel}
                </span>
                <Button variant="ghost" size="sm" className="h-7 text-indigo-600 hover:text-indigo-700">
                  Open Chat
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
