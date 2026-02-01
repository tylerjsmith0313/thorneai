"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Target, Plus, FileText, Calendar, Trash2, Pencil, Loader2, DollarSign, TrendingUp, Flame, Snowflake, Thermometer, X, Check, Percent, Package } from "lucide-react"
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
import { Switch } from "@/components/ui/switch"
import { createClient } from "@/lib/supabase/client"

interface Product {
  id: string
  name: string
  retail_price: number
  billing_interval: string
  classification: string
}

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

  const [products, setProducts] = useState<Product[]>([])
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    value: 0,
    stage: "discovery" as Opportunity["stage"],
    probability: 50,
    expectedCloseDate: "",
    notes: "",
    heatStatus: "warm" as Opportunity["heatStatus"],
    productId: "",
    isRecurring: false,
    discountType: "none" as "none" | "percentage" | "fixed",
    discountValue: 0,
  })

  const loadOpportunities = async () => {
    setLoading(true)
    const data = await getOpportunities(contact.id)
    setOpportunities(data)
    setLoading(false)
  }

  const loadProducts = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    
    const { data } = await supabase
      .from("products")
      .select("id, name, retail_price, billing_interval, classification")
      .eq("user_id", user.id)
      .order("name")
    
    if (data) setProducts(data)
  }

  useEffect(() => {
    loadOpportunities()
    loadProducts()
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
      productId: "",
      isRecurring: false,
      discountType: "none",
      discountValue: 0,
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
      productId: "",
      isRecurring: false,
      discountType: "none",
      discountValue: 0,
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

  const calculateFinalValue = () => {
    let finalValue = formData.value
    if (formData.discountType === "percentage") {
      finalValue = formData.value * (1 - formData.discountValue / 100)
    } else if (formData.discountType === "fixed") {
      finalValue = Math.max(0, formData.value - formData.discountValue)
    }
    return finalValue
  }

  const handleProductSelect = (productId: string) => {
    const product = products.find(p => p.id === productId)
    if (product) {
      setFormData({
        ...formData,
        productId,
        value: product.retail_price,
        isRecurring: product.billing_interval === "monthly" || product.billing_interval === "annual",
        title: formData.title || product.name,
      })
    }
  }

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
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 flex items-center justify-between border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center">
                  <Target size={28} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">
                    {editItem ? "EDIT OPPORTUNITY" : "NEW OPPORTUNITY"}
                  </h2>
                  <p className="text-xs font-bold text-indigo-600 tracking-wide">
                    NODE: {contact.name?.toUpperCase()} @ {contact.company?.toUpperCase() || "UNKNOWN"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Opportunity Title */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Opportunity Title
                </label>
                <input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Enterprise License Expansion"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* Product Selection */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Link to Product
                </label>
                <Select value={formData.productId} onValueChange={handleProductSelect}>
                  <SelectTrigger className="w-full bg-slate-50 border-slate-200 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Package size={14} className="text-slate-400" />
                      <SelectValue placeholder="Select a product (optional)" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{product.name}</span>
                          <span className="text-slate-400 ml-4">
                            ${product.retail_price.toLocaleString()} / {product.billing_interval}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Deal Value & Expected Close */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Deal Value
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                    <input
                      type="number"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Expected Close
                  </label>
                  <div className="relative">
                    <Calendar size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="date"
                      value={formData.expectedCloseDate}
                      onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                </div>
              </div>

              {/* Recurring Revenue Toggle */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">RECURRING REVENUE</h4>
                  <p className="text-xs text-indigo-600 font-medium">MARK AS MONTHLY SUBSCRIPTION</p>
                </div>
                <Switch
                  checked={formData.isRecurring}
                  onCheckedChange={(checked) => setFormData({ ...formData, isRecurring: checked })}
                />
              </div>

              {/* Discount Section */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Discount
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFormData({ ...formData, discountType: "none", discountValue: 0 })}
                    className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide transition-colors ${
                      formData.discountType === "none"
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                  >
                    None
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, discountType: "percentage" })}
                    className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide transition-colors ${
                      formData.discountType === "percentage"
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                  >
                    Percentage
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, discountType: "fixed" })}
                    className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide transition-colors ${
                      formData.discountType === "fixed"
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                  >
                    Fixed
                  </button>
                </div>
                
                {formData.discountType !== "none" && (
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                      {formData.discountType === "percentage" ? "%" : "$"}
                    </span>
                    <input
                      type="number"
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
                      placeholder="0"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                )}

                {formData.discountType !== "none" && formData.discountValue > 0 && (
                  <div className="flex items-center justify-between text-sm p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                    <span className="text-emerald-700 font-medium">Final Deal Value:</span>
                    <span className="text-emerald-700 font-bold">${calculateFinalValue().toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Stage & Heat Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Stage
                  </label>
                  <Select value={formData.stage} onValueChange={(v: any) => setFormData({ ...formData, stage: v })}>
                    <SelectTrigger className="bg-slate-50 border-slate-200 rounded-xl">
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
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Heat Status
                  </label>
                  <Select value={formData.heatStatus} onValueChange={(v: any) => setFormData({ ...formData, heatStatus: v })}>
                    <SelectTrigger className="bg-slate-50 border-slate-200 rounded-xl">
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

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Internal notes..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setShowModal(false)}
                className="text-sm font-bold text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors"
              >
                Discard
              </button>
              <Button
                onClick={handleSave}
                disabled={saving || !formData.title}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8 py-3 font-bold"
              >
                {saving ? (
                  <Loader2 size={16} className="animate-spin mr-2" />
                ) : (
                  <Check size={16} className="mr-2" />
                )}
                {editItem ? "Update Opportunity" : "Create Opportunity"}
              </Button>
            </div>
          </div>
        </div>
      )}

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
