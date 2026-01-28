"use client"

import { useState, useRef } from "react"
import {
  X,
  ShoppingBag,
  DollarSign,
  Calculator,
  Link as LinkIcon,
  Upload,
  AlignLeft,
  Trash2,
  BarChart3,
  Activity,
  Sparkles,
  HelpCircle,
  Users,
  Info,
} from "lucide-react"
import { BaseButton } from "@/components/ui/base-button"
import { BaseInput } from "@/components/ui/base-input"
import { BaseTextArea } from "@/components/ui/base-textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface AdjustmentNode {
  id: string
  type: "COGS" | "Discount" | "Taxes" | "Shipping" | "Custom Fee"
  label: string
  amount: string
  frequency: "fixed" | "per-unit"
}

interface IntelNode {
  id: string
  type: "Link" | "File" | "Text"
  label: string
  content: string
}

interface AddProductModalProps {
  onClose: () => void
  onSave: (product: {
    name: string
    price: string
    billingCycle: string
    type: string
  }) => void
}

export function AddProductModal({ onClose, onSave }: AddProductModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showComplexBreakdown, setShowComplexBreakdown] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    volume: "1",
    type: "SaaS",
    billingCycle: "monthly",
    description: "",
    adjustments: [] as AdjustmentNode[],
    intelNodes: [] as IntelNode[],
  })

  const productTypes = [
    { label: "SaaS", val: "SaaS" },
    { label: "Service", val: "Service" },
    { label: "Physical", val: "Physical Good" },
    { label: "Subscription", val: "Subscription" },
    { label: "Consulting", val: "Consulting" },
  ]

  const adjustmentTypes = ["COGS", "Discount", "Taxes", "Shipping", "Custom Fee"] as const

  const addAdjustment = () => {
    const newNode: AdjustmentNode = {
      id: Math.random().toString(36).substr(2, 9),
      type: "COGS",
      label: "",
      amount: "",
      frequency: "fixed",
    }
    setFormData({ ...formData, adjustments: [...formData.adjustments, newNode] })
  }

  const removeAdjustment = (id: string) => {
    setFormData({
      ...formData,
      adjustments: formData.adjustments.filter((a) => a.id !== id),
    })
  }

  const updateAdjustment = (id: string, updates: Partial<AdjustmentNode>) => {
    setFormData({
      ...formData,
      adjustments: formData.adjustments.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    })
  }

  const addIntelNode = (type: "Link" | "File" | "Text") => {
    const newNode: IntelNode = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      label: type === "Link" ? "New Link Source" : type === "File" ? "Uploaded Document" : "Manual Instruction",
      content: "",
    }
    setFormData({ ...formData, intelNodes: [...formData.intelNodes, newNode] })
  }

  const removeIntelNode = (id: string) => {
    setFormData({
      ...formData,
      intelNodes: formData.intelNodes.filter((n) => n.id !== id),
    })
  }

  const handleSave = () => {
    onSave(formData)
    onClose()
  }

  const calculations = () => {
    const retailPrice = Number.parseFloat(formData.price) || 0
    const volume = Number.parseFloat(formData.volume) || 0
    const grossRevenue = retailPrice * volume

    let totalFixedCosts = 0
    let totalVariableCosts = 0
    let totalDiscounts = 0

    for (const adj of formData.adjustments) {
      const amt = Number.parseFloat(adj.amount) || 0
      if (adj.type === "Discount") {
        totalDiscounts += adj.frequency === "per-unit" ? amt * volume : amt
      } else {
        if (adj.frequency === "per-unit") {
          totalVariableCosts += amt * volume
        } else {
          totalFixedCosts += amt
        }
      }
    }

    const netRevenue = grossRevenue - totalDiscounts
    const totalCosts = totalFixedCosts + totalVariableCosts
    const estimatedProfit = netRevenue - totalCosts
    const margin = netRevenue > 0 ? (estimatedProfit / netRevenue) * 100 : 0

    const cycleMultiplier = formData.billingCycle === "monthly" ? 12 : 1
    const annualProfit = estimatedProfit * cycleMultiplier

    return {
      retailBase: retailPrice.toFixed(2),
      volume: volume.toFixed(0),
      grossRevenue: grossRevenue.toFixed(2),
      netRevenue: netRevenue.toFixed(2),
      totalCost: totalCosts.toFixed(2),
      profit: estimatedProfit.toFixed(2),
      margin: margin.toFixed(1),
      annualProfit: annualProfit.toFixed(2),
      totalFixedCosts: totalFixedCosts.toFixed(2),
      totalVariableCosts: totalVariableCosts.toFixed(2),
    }
  }

  const stats = calculations()

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />

      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[32px] shadow-2xl overflow-hidden relative flex flex-col animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-900 rounded-xl text-white flex items-center justify-center shadow-lg">
              <ShoppingBag size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">New Product Node</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                Neural Offer Configuration
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-300 hover:text-slate-600 transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10">
          <div className="space-y-6">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Identity</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 ml-1">Official Name</label>
                <BaseInput
                  placeholder="e.g. Consulting Mastermind 2024"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 ml-1">Pitch Context</label>
                <BaseTextArea
                  placeholder="Define core value proposition for Thorne AI..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="min-h-[80px]"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Classification</h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info size={14} className="text-slate-300 hover:text-indigo-500 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Consulting/Training models leverage volume-based math for scaling projections.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {productTypes.map((t) => (
                <button
                  key={t.val}
                  onClick={() => setFormData({ ...formData, type: t.val })}
                  className={`py-3 px-2 rounded-xl border text-center transition-all ${
                    formData.type === t.val
                      ? "bg-indigo-50 border-indigo-600 text-indigo-600 shadow-sm"
                      : "bg-white border-slate-100 text-slate-400 hover:border-slate-300 hover:text-slate-600"
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-widest">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pricing & Cost</h3>

              <div className="flex items-center bg-slate-100/80 p-1 rounded-xl border border-slate-200">
                <div className="px-3 py-1.5 bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col items-center min-w-[80px]">
                  <span className="text-[8px] font-bold text-slate-400 uppercase">Revenue</span>
                  <span className="text-[10px] font-bold text-slate-900">${stats.netRevenue}</span>
                </div>
                <div className="px-3 py-1.5 flex flex-col items-center min-w-[80px]">
                  <span className="text-[8px] font-bold text-slate-400 uppercase">Cost</span>
                  <span className="text-[10px] font-bold text-rose-500">${stats.totalCost}</span>
                </div>
                <button
                  onClick={() => setShowComplexBreakdown(!showComplexBreakdown)}
                  className={`px-3 py-1.5 flex items-center gap-1.5 rounded-lg transition-all group ${
                    showComplexBreakdown
                      ? "bg-indigo-600 text-white shadow-md border border-indigo-700"
                      : "hover:bg-indigo-50 text-indigo-600"
                  }`}
                >
                  <div className="flex flex-col items-center min-w-[70px]">
                    <span
                      className={`text-[8px] font-bold uppercase ${showComplexBreakdown ? "text-indigo-200" : "text-indigo-400"}`}
                    >
                      Profit
                    </span>
                    <span className="text-[10px] font-bold">${stats.profit}</span>
                  </div>
                  <HelpCircle size={12} className={showComplexBreakdown ? "text-indigo-300" : "text-indigo-400"} />
                </button>
              </div>
            </div>

            {showComplexBreakdown && (
              <div className="bg-slate-900 rounded-[24px] p-6 text-white space-y-6 animate-in slide-in-from-top-4 duration-300 border border-slate-800 shadow-2xl relative overflow-hidden">
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-2">
                    <BarChart3 size={16} className="text-indigo-400" />
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-indigo-100">
                      Intelligence Hub Breakdown
                    </h4>
                  </div>
                  <Sparkles size={14} className="text-indigo-500 animate-pulse" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Cycle Yield</p>
                    <p className="text-sm font-bold text-indigo-300">${stats.profit}</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Annual Profit</p>
                    <p className="text-sm font-bold text-emerald-400">${stats.annualProfit}</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Margin</p>
                    <p className="text-sm font-bold text-white">{stats.margin}%</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Leverage</p>
                    <p className="text-sm font-bold text-indigo-300">
                      {formData.type === "Consulting" ? "3.8x" : formData.type === "SaaS" ? "12.2x" : "5.1x"}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-white/5 relative z-10">
                  <h5 className="text-[9px] font-bold text-indigo-300 uppercase tracking-widest">Financial Math Log</h5>
                  <div className="text-[10px] text-slate-300 space-y-1 font-mono">
                    <p>
                      Revenue: ${stats.retailBase} x {stats.volume} (Units/Users) = ${stats.grossRevenue}
                    </p>
                    <p>Fixed Costs: -${stats.totalFixedCosts}</p>
                    <p>Variable Costs: -${stats.totalVariableCosts} (Per Unit Sum)</p>
                    <p className="text-emerald-400 border-t border-white/10 pt-1 font-bold">
                      Net Profit per Cycle: ${stats.profit}
                    </p>
                  </div>
                </div>

                <Activity
                  size={100}
                  className="absolute right-[-20px] bottom-[-20px] text-indigo-500/10 pointer-events-none"
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Retail Price</label>
                <BaseInput
                  type="number"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  icon={<DollarSign size={14} />}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Volume (Users/Students)</label>
                <BaseInput
                  type="number"
                  placeholder="1"
                  value={formData.volume}
                  onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                  icon={<Users size={14} />}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Billing Interval</label>
                <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100 shadow-sm">
                  {["one-time", "monthly", "annual"].map((cycle) => (
                    <button
                      key={cycle}
                      onClick={() => setFormData({ ...formData, billingCycle: cycle })}
                      className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${
                        formData.billingCycle === cycle
                          ? "bg-white shadow-sm text-indigo-600 border border-slate-200/50"
                          : "text-slate-400"
                      }`}
                    >
                      {cycle}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Cost & Adjustment Nodes</label>
                <button onClick={addAdjustment} className="text-[10px] font-bold text-indigo-600 hover:underline">
                  + Add New Line
                </button>
              </div>

              {formData.adjustments.length === 0 && (
                <button
                  onClick={addAdjustment}
                  className="w-full py-10 border-2 border-dashed border-slate-100 rounded-[24px] flex flex-col items-center justify-center text-slate-300 hover:border-indigo-100 hover:text-indigo-400 transition-all bg-slate-50/30"
                >
                  <Calculator size={20} className="mb-2 opacity-30" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    Add adjustment node (COGS, Taxes, etc.)
                  </span>
                </button>
              )}

              {formData.adjustments.map((adj) => (
                <div key={adj.id} className="flex gap-2 animate-in fade-in duration-200 items-center">
                  <select
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-bold outline-none focus:border-indigo-300 shadow-sm min-w-[100px]"
                    value={adj.type}
                    onChange={(e) =>
                      updateAdjustment(adj.id, { type: e.target.value as AdjustmentNode["type"] })
                    }
                  >
                    {adjustmentTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <input
                    placeholder="Describe adjustment (e.g. Hosting, Support...)"
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none focus:bg-white focus:border-indigo-300 shadow-sm"
                    value={adj.label}
                    onChange={(e) => updateAdjustment(adj.id, { label: e.target.value })}
                  />
                  <select
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[9px] font-bold outline-none shadow-sm"
                    value={adj.frequency}
                    onChange={(e) =>
                      updateAdjustment(adj.id, { frequency: e.target.value as AdjustmentNode["frequency"] })
                    }
                  >
                    <option value="fixed">Fixed</option>
                    <option value="per-unit">Per Unit</option>
                  </select>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-24 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:bg-white focus:border-indigo-300 shadow-sm"
                    value={adj.amount}
                    onChange={(e) => updateAdjustment(adj.id, { amount: e.target.value })}
                  />
                  <button
                    onClick={() => removeAdjustment(adj.id)}
                    className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Intelligence Sources</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => addIntelNode("Link")}
                  className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  <LinkIcon size={14} />
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors"
                >
                  <Upload size={14} />
                </button>
                <button
                  onClick={() => addIntelNode("Text")}
                  className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-400 hover:text-amber-600 transition-colors"
                >
                  <AlignLeft size={14} />
                </button>
                <input
                  type="file"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={() => addIntelNode("File")}
                />
              </div>
            </div>

            {formData.intelNodes.length === 0 && (
              <div className="py-8 text-center text-slate-300">
                <p className="text-[10px] font-bold uppercase tracking-widest">No intelligence sources added</p>
              </div>
            )}

            {formData.intelNodes.map((node) => (
              <div
                key={node.id}
                className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {node.type === "Link" && <LinkIcon size={14} className="text-indigo-500" />}
                  {node.type === "File" && <Upload size={14} className="text-emerald-500" />}
                  {node.type === "Text" && <AlignLeft size={14} className="text-amber-500" />}
                  <span className="text-xs font-medium text-slate-700">{node.label}</span>
                </div>
                <button
                  onClick={() => removeIntelNode(node.id)}
                  className="p-1 text-slate-300 hover:text-rose-500 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-3 bg-white shrink-0">
          <BaseButton variant="outline" onClick={onClose}>
            Cancel
          </BaseButton>
          <BaseButton variant="primary" onClick={handleSave}>
            Save Product
          </BaseButton>
        </div>
      </div>
    </div>
  )
}

export default AddProductModal
