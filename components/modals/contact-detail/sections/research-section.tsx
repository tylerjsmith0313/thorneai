"use client"

import React from "react"

import { useState, useEffect } from "react"
import { ShieldCheck, Clock, ExternalLink, Plus, Trash2, Loader2, AlertCircle, Check, X, Globe, Linkedin, FileText, Mail, MessageSquare, Pencil } from "lucide-react"
import type { Contact } from "@/types"
import { getContactResearch, createContactResearch, updateContactResearch, deleteContactResearch, type ContactResearch } from "@/lib/data-service"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ResearchSectionProps {
  contact: Contact
}

const SOURCE_ICONS: Record<string, React.ReactNode> = {
  linkedin: <Linkedin size={14} className="text-blue-600" />,
  press_release: <FileText size={14} className="text-purple-600" />,
  email_verification: <Mail size={14} className="text-green-600" />,
  company_news: <Globe size={14} className="text-indigo-600" />,
  social_media: <MessageSquare size={14} className="text-pink-600" />,
  manual: <Pencil size={14} className="text-slate-600" />,
  api: <Globe size={14} className="text-cyan-600" />,
}

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  verified: { bg: "bg-emerald-50 border-emerald-100", text: "text-emerald-600", icon: <ShieldCheck size={14} className="text-emerald-500" /> },
  pending: { bg: "bg-amber-50 border-amber-100", text: "text-amber-600", icon: <Clock size={14} className="text-amber-500" /> },
  rejected: { bg: "bg-red-50 border-red-100", text: "text-red-600", icon: <X size={14} className="text-red-500" /> },
  needs_review: { bg: "bg-blue-50 border-blue-100", text: "text-blue-600", icon: <AlertCircle size={14} className="text-blue-500" /> },
}

export function ResearchSection({ contact }: ResearchSectionProps) {
  const [research, setResearch] = useState<ContactResearch[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState<ContactResearch | null>(null)
  const [saving, setSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    source: "",
    sourceType: "manual" as ContactResearch["sourceType"],
    status: "verified" as ContactResearch["status"],
    detail: "",
    sourceUrl: "",
  })

  const loadResearch = async () => {
    setLoading(true)
    const data = await getContactResearch(contact.id)
    setResearch(data)
    setLoading(false)
  }

  useEffect(() => {
    loadResearch()
  }, [contact.id])

  const handleOpenNew = () => {
    setEditItem(null)
    setFormData({
      source: "",
      sourceType: "manual",
      status: "verified",
      detail: "",
      sourceUrl: "",
    })
    setShowModal(true)
  }

  const handleEdit = (item: ContactResearch) => {
    setEditItem(item)
    setFormData({
      source: item.source,
      sourceType: item.sourceType,
      status: item.status,
      detail: item.detail || "",
      sourceUrl: item.sourceUrl || "",
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!formData.source) return
    
    setSaving(true)
    try {
      if (editItem) {
        await updateContactResearch(editItem.id, {
          source: formData.source,
          sourceType: formData.sourceType,
          status: formData.status,
          detail: formData.detail,
          sourceUrl: formData.sourceUrl,
        })
      } else {
        await createContactResearch({
          contactId: contact.id,
          source: formData.source,
          sourceType: formData.sourceType,
          status: formData.status,
          detail: formData.detail,
          sourceUrl: formData.sourceUrl,
        })
      }
      setShowModal(false)
      loadResearch()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    await deleteContactResearch(id)
    loadResearch()
  }

  const handleVerify = async (item: ContactResearch) => {
    await updateContactResearch(item.id, { status: "verified" })
    loadResearch()
  }

  const verifiedCount = research.filter(r => r.status === "verified").length

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-slate-900">Research Log</h4>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {verifiedCount} Source{verifiedCount !== 1 ? "s" : ""} Verified
          </span>
          <button
            onClick={handleOpenNew}
            className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
        </div>
      ) : research.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="text-slate-400 mb-3">No research data yet</div>
          <Button onClick={handleOpenNew} variant="outline" size="sm">
            <Plus size={14} className="mr-2" />
            Add Research
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {research.map((item) => (
            <ResearchCard 
              key={item.id}
              item={item}
              onEdit={() => handleEdit(item)}
              onDelete={() => handleDelete(item.id)}
              onVerify={() => handleVerify(item)}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editItem ? "Edit Research" : "Add Research"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Source Name</Label>
              <Input
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                placeholder="e.g., LinkedIn Profile, Press Release"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Source Type</Label>
                <Select value={formData.sourceType} onValueChange={(v: any) => setFormData({ ...formData, sourceType: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="press_release">Press Release</SelectItem>
                    <SelectItem value="email_verification">Email Verification</SelectItem>
                    <SelectItem value="company_news">Company News</SelectItem>
                    <SelectItem value="social_media">Social Media</SelectItem>
                    <SelectItem value="manual">Manual Entry</SelectItem>
                    <SelectItem value="api">API</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(v: any) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="needs_review">Needs Review</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Source URL (optional)</Label>
              <Input
                value={formData.sourceUrl}
                onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label>Details</Label>
              <Textarea
                value={formData.detail}
                onChange={(e) => setFormData({ ...formData, detail: e.target.value })}
                placeholder="What did you learn from this source?"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowModal(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !formData.source}>
              {saving ? "Saving..." : editItem ? "Update" : "Add"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ResearchCard({ 
  item, 
  onEdit, 
  onDelete,
  onVerify 
}: { 
  item: ContactResearch
  onEdit: () => void
  onDelete: () => void
  onVerify: () => void
}) {
  const statusStyle = STATUS_STYLES[item.status] || STATUS_STYLES.pending
  
  return (
    <div className={`p-5 border rounded-2xl space-y-3 ${statusStyle.bg}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {SOURCE_ICONS[item.sourceType] || SOURCE_ICONS.manual}
          <span className="text-xs font-bold text-slate-700">{item.source}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${statusStyle.text}`}>
            {item.status.replace("_", " ")}
          </span>
          {item.sourceUrl && (
            <a 
              href={item.sourceUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-indigo-600 transition-colors"
            >
              <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>
      
      {item.detail && (
        <p className="text-xs text-slate-600 leading-relaxed">{item.detail}</p>
      )}
      
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-slate-400 font-medium italic">
          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "Recently added"}
        </p>
        <div className="flex items-center gap-1">
          {item.status !== "verified" && (
            <button
              onClick={onVerify}
              className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
              title="Mark as verified"
            >
              <Check size={12} />
            </button>
          )}
          <button
            onClick={onEdit}
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            <Pencil size={12} />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  )
}
