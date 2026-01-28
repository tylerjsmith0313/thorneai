"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Target, Plus, FileText, Calendar, Trash2, Pencil, Loader2, DollarSign, TrendingUp, Flame, Snowflake, Thermometer } from "lucide-react"
import { BaseButton } from "@/components/ui/base-button"
import { MeetingScheduler } from "../common/meeting-scheduler"
import { ProposalWizard } from "@/components/modals/proposal-wizard/proposal-wizard"
import type { Contact } from "@/types"
import { getOpportunities, createOpportunity, updateOpportunity, deleteOpportunity, type Opportunity } from "@/lib/data-service"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface OpportunitiesSectionProps {
  contact: Contact
}

const STAGE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  discovery: { bg: "bg-blue-50 border-blue-100", text: "text-blue-600", label: "Discovery" },
  qualification: { bg: "bg-indigo-50 border-indigo-100", text: "text-indigo-600", label: "Qualification" },
  proposal: { bg: "bg-purple-50 border-purple-100", text: "text-purple-600", label: "Proposal" },
  negotiation: { bg: "bg-amber-50 border-amber-100", text: "text-amber-600", label: "Negotiation" },
  closed_won: { bg: "bg-emerald-50 border-emerald-100", text: "text-emerald-600", label: "Won" },
  closed_lost: { bg: "bg-red-50 border-red-100", text: "text-red-600", label: "Lost" },
}

const HEAT_ICONS: Record<string, React.ReactNode> = {
  hot: <Flame size={14} className="text-orange-500" />,
  warm: <Thermometer size={14} className="text-amber-500" />,
  cold: <Snowflake size={14} className="text-blue-500" />,
}

export function OpportunitiesSection({ contact }: OpportunitiesSectionProps) {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState<Opportunity | null>(null)
  const [saving, setSaving] = useState(false)
  
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false)
  const [isProposalWizardOpen, setIsProposalWizardOpen] = useState(false)
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    value: 0,
    stage: "discovery" as Opportunity["stage"],
    probability: 50,
    expectedCloseDate: "",
    notes: "",
    heatStatus: "warm" as Opportunity["heatStatus"],
  })

  const loadOpportunities = async () => {
    setLoading(true)
    const data = await getOpportunities(contact.id)
    setOpportunities(data)
    setLoading(false)
  }

  useEffect(() => {
    loadOpportunities()
  }, [contact.id])

  const handleOpenNew = () => {
    setEditItem(null)
    setFormData({
      title: "",
      description: "",
      value: 0,
      stage: "discovery",
      probability: 50,
      expectedCloseDate: "",
      notes: "",
      heatStatus: "warm",
    })
    setShowModal(true)
  }

  const handleEdit = (item: Opportunity) => {
    setEditItem(item)
    setFormData({
      title: item.title,
      description: item.description || "",
      value: item.value,
      stage: item.stage,
      probability: item.probability,
      expectedCloseDate: item.expectedCloseDate || "",
      notes: item.notes || "",
      heatStatus: item.heatStatus,
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!formData.title) return

    setSaving(true)
    try {
      if (editItem) {
        await updateOpportunity(editItem.id, {
          title: formData.title,
          description: formData.description,
          value: formData.value,
          stage: formData.stage,
          probability: formData.probability,
          expectedCloseDate: formData.expectedCloseDate || undefined,
          notes: formData.notes,
          heatStatus: formData.heatStatus,
        })
      } else {
        await createOpportunity({
          userId: "",
          contactId: contact.id,
          title: formData.title,
          description: formData.description,
          value: formData.value,
          currency: "USD",
          stage: formData.stage,
          probability: formData.probability,
          expectedCloseDate: formData.expectedCloseDate || undefined,
          notes: formData.notes,
          heatStatus: formData.heatStatus,
        })
      }
      setShowModal(false)
      loadOpportunities()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    await deleteOpportunity(id)
    loadOpportunities()
  }

  const handleStageChange = async (opp: Opportunity, newStage: Opportunity["stage"]) => {
    await updateOpportunity(opp.id, { stage: newStage })
    loadOpportunities()
  }

  const totalValue = opportunities.reduce((sum, o) => sum + o.value, 0)
  const activeOpps = opportunities.filter(o => !o.stage.startsWith("closed_"))

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Active Opportunities</h4>
          {activeOpps.length > 0 && (
            <p className="text-xs text-slate-500 ml-1 mt-1">
              {activeOpps.length} open - ${totalValue.toLocaleString()} pipeline
            </p>
          )}
        </div>
        <BaseButton 
          variant="secondary" 
          size="sm" 
          className="rounded-xl px-3 py-1.5" 
          icon={<Plus size={14} />}
          onClick={handleOpenNew}
        >
          Add Opportunity
        </BaseButton>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
        </div>
      ) : opportunities.length === 0 ? (
        <div className="p-8 bg-white border border-slate-200 rounded-[40px] text-center">
          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Target size={24} className="text-slate-400" />
          </div>
          <p className="text-slate-500 mb-4">No opportunities yet</p>
          <BaseButton variant="primary" size="sm" onClick={handleOpenNew} icon={<Plus size={14} />}>
            Create Opportunity
          </BaseButton>
        </div>
      ) : (
        <div className="space-y-4">
          {opportunities.map((opp) => {
            const stageStyle = STAGE_STYLES[opp.stage] || STAGE_STYLES.discovery
            
            return (
              <div 
                key={opp.id}
                className="p-6 bg-white border border-slate-200 rounded-[32px] space-y-4 shadow-sm hover:shadow-lg transition-all group overflow-hidden relative"
              >
                <div className="flex items-start justify-between relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-[18px] flex items-center justify-center shadow-sm border border-indigo-100/50">
                      <Target size={22} />
                    </div>
                    <div>
                      <h5 className="text-base font-black text-slate-900 tracking-tight">{opp.title}</h5>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                          ${opp.value.toLocaleString()}
                        </span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full" />
                        <span className="text-[10px] text-slate-400">{opp.probability}% probability</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      {HEAT_ICONS[opp.heatStatus]}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border tracking-wider ${stageStyle.bg} ${stageStyle.text}`}>
                      {stageStyle.label}
                    </span>
                  </div>
                </div>

                {opp.description && (
                  <p className="text-xs text-slate-500 leading-relaxed">{opp.description}</p>
                )}

                {opp.expectedCloseDate && (
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Calendar size={12} />
                    Expected close: {new Date(opp.expectedCloseDate).toLocaleDateString()}
                  </div>
                )}

                {/* Stage Pipeline */}
                <div className="flex gap-1 pt-2">
                  {Object.entries(STAGE_STYLES).filter(([key]) => !key.startsWith("closed_")).map(([stage, style]) => (
                    <button
                      key={stage}
                      onClick={() => handleStageChange(opp, stage as Opportunity["stage"])}
                      className={`flex-1 h-2 rounded-full transition-all ${
                        opp.stage === stage ? style.bg.replace("50", "500") : "bg-slate-100"
                      }`}
                      title={style.label}
                    />
                  ))}
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-50 relative z-10">
                  <BaseButton 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 rounded-2xl py-3 border-slate-100 text-slate-600" 
                    icon={<FileText size={14} />}
                    onClick={() => { setSelectedOpportunity(opp); setIsProposalWizardOpen(true); }}
                  >
                    Send Proposal
                  </BaseButton>
                  <BaseButton 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 rounded-2xl py-3 border-slate-100 text-slate-600" 
                    icon={<Calendar size={14} />}
                    onClick={() => { setSelectedOpportunity(opp); setIsSchedulerOpen(true); }}
                  >
                    Book Meeting
                  </BaseButton>
                  <button
                    onClick={() => handleEdit(opp)}
                    className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(opp.id)}
                    className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <Target size={100} className="absolute -right-6 -bottom-6 text-indigo-500/5 pointer-events-none" />
              </div>
            )
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editItem ? "Edit Opportunity" : "New Opportunity"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., SaaS Implementation"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Value ($)</Label>
                <Input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                  placeholder="15000"
                />
              </div>

              <div className="space-y-2">
                <Label>Probability (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.probability}
                  onChange={(e) => setFormData({ ...formData, probability: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Stage</Label>
                <Select value={formData.stage} onValueChange={(v: any) => setFormData({ ...formData, stage: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="discovery">Discovery</SelectItem>
                    <SelectItem value="qualification">Qualification</SelectItem>
                    <SelectItem value="proposal">Proposal</SelectItem>
                    <SelectItem value="negotiation">Negotiation</SelectItem>
                    <SelectItem value="closed_won">Closed Won</SelectItem>
                    <SelectItem value="closed_lost">Closed Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Heat Status</Label>
                <Select value={formData.heatStatus} onValueChange={(v: any) => setFormData({ ...formData, heatStatus: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hot">Hot</SelectItem>
                    <SelectItem value="warm">Warm</SelectItem>
                    <SelectItem value="cold">Cold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Expected Close Date</Label>
              <Input
                type="date"
                value={formData.expectedCloseDate}
                onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the opportunity"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Internal notes..."
                rows={2}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowModal(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !formData.title}>
              {saving ? "Saving..." : editItem ? "Update" : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {isSchedulerOpen && (
        <MeetingScheduler 
          contact={contact} 
          onClose={() => setIsSchedulerOpen(false)} 
        />
      )}

      {isProposalWizardOpen && (
        <ProposalWizard
          contact={contact}
          onClose={() => setIsProposalWizardOpen(false)}
        />
      )}
    </div>
  )
}
