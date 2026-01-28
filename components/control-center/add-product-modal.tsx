"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Package, DollarSign, Tag, Calendar } from "lucide-react"

interface AddProductModalProps {
  onClose: () => void
  onSave: (product: { name: string; price: string; billingCycle: string; type: string }) => void
}

export function AddProductModal({ onClose, onSave }: AddProductModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    billingCycle: "one-time",
    type: "Physical Good",
  })

  const handleSubmit = () => {
    if (formData.name && formData.price) {
      onSave(formData)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl animate-in fade-in duration-300" onClick={onClose} />

      <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Package size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Add Product</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Configure new offering</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 bg-slate-50 rounded-full text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Product Name</label>
            <div className="relative">
              <Tag size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Enterprise License"
                className="pl-11 h-14 rounded-2xl border-slate-200 bg-slate-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Price (USD)</label>
              <div className="relative">
                <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                  className="pl-11 h-14 rounded-2xl border-slate-200 bg-slate-50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Billing Cycle</label>
              <div className="relative">
                <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={formData.billingCycle}
                  onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
                  className="w-full pl-11 h-14 rounded-2xl border-slate-200 bg-slate-50 text-sm font-medium text-slate-700 appearance-none cursor-pointer"
                >
                  <option value="one-time">One-time</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Product Type</label>
            <div className="grid grid-cols-3 gap-3">
              {["Physical Good", "Service", "Subscription"].map((type) => (
                <button
                  key={type}
                  onClick={() => setFormData({ ...formData, type })}
                  className={`p-4 rounded-2xl border-2 text-xs font-bold transition-all ${
                    formData.type === type
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200"
                      : "bg-white border-slate-200 text-slate-600 hover:border-indigo-200"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-slate-100 flex items-center justify-end gap-4 bg-slate-50/50">
          <Button variant="outline" onClick={onClose} className="rounded-xl bg-transparent">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!formData.name || !formData.price} className="rounded-xl px-8">
            Add Product
          </Button>
        </div>
      </div>
    </div>
  )
}
