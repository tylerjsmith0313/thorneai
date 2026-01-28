"use client"

import { useState } from "react"
import { Package, Plus, MoreVertical, X, Link, Upload, List, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Product {
  id: string
  name: string
  price: string
  type: string
}

const initialProducts: Product[] = [
  { id: "1", name: "SaaS Platform License", price: "$4,999.00", type: "Physical Good" },
  { id: "2", name: "Enterprise Consulting", price: "$12,500.00", type: "Service" },
  { id: "3", name: "Thorne Radar API", price: "$850.00 / mo", type: "Subscription" },
]

const classifications = ["SAAS", "SERVICE", "PHYSICAL", "SUBSCRIPTION", "CONSULTING"]
const billingIntervals = ["ONE-TIME", "MONTHLY", "ANNUAL"]

export function ProductsSettings() {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [showAddModal, setShowAddModal] = useState(false)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Product Portfolio</h2>
          <p className="text-muted-foreground">Configure the offers Thorne will present to leads.</p>
        </div>
        <Button 
          onClick={() => setShowAddModal(true)}
          className="bg-thorne-navy hover:bg-thorne-navy/90 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Product List */}
      <div className="space-y-3">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-secondary rounded-xl p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center">
                <Package className="w-6 h-6 text-thorne-indigo" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">{product.name}</h4>
                <p className="text-sm text-muted-foreground">
                  MSRP: {product.price} &bull; {product.type}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                Creative Studio
              </Button>
              <Button size="sm" className="bg-thorne-indigo hover:bg-thorne-indigo/90 text-white">
                Edit Details
              </Button>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <AddProductModal onClose={() => setShowAddModal(false)} />
      )}
    </div>
  )
}

function AddProductModal({ onClose }: { onClose: () => void }) {
  const [classification, setClassification] = useState("SAAS")
  const [billingInterval, setBillingInterval] = useState("MONTHLY")

  return (
    <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-thorne-indigo/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-thorne-indigo" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">New Product Node</h3>
              <p className="text-xs text-thorne-indigo">NEURAL OFFER CONFIGURATION</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Identity */}
          <div>
            <h4 className="text-[10px] font-medium text-muted-foreground tracking-wider mb-3">IDENTITY</h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Official Name</label>
                <Input 
                  placeholder="e.g. Consulting Mastermind 2024" 
                  className="bg-secondary border-none"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Pitch Context</label>
                <textarea
                  placeholder="Define core value proposition for Thorne AI..."
                  className="w-full px-3 py-2 bg-secondary rounded-lg border-none outline-none text-sm min-h-[80px] resize-none"
                />
              </div>
            </div>
          </div>

          {/* Classification */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h4 className="text-[10px] font-medium text-muted-foreground tracking-wider">CLASSIFICATION</h4>
              <HelpCircle className="w-3 h-3 text-muted-foreground" />
            </div>
            <div className="flex flex-wrap gap-2">
              {classifications.map((c) => (
                <button
                  key={c}
                  onClick={() => setClassification(c)}
                  className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors ${
                    classification === c
                      ? "bg-thorne-indigo text-white"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Pricing & Cost */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[10px] font-medium text-muted-foreground tracking-wider">PRICING & COST</h4>
              <div className="flex items-center gap-4 text-xs">
                <span className="px-3 py-1 bg-secondary rounded">
                  <span className="text-muted-foreground">REVENUE</span>{" "}
                  <span className="font-medium text-foreground">$0.00</span>
                </span>
                <span className="px-3 py-1 bg-secondary rounded">
                  <span className="text-muted-foreground">COST</span>{" "}
                  <span className="font-medium text-thorne-danger">$0.00</span>
                </span>
                <span className="px-3 py-1 bg-secondary rounded">
                  <span className="text-muted-foreground">PROFIT</span>{" "}
                  <span className="font-medium text-thorne-success">$0.00</span>
                </span>
                <HelpCircle className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">RETAIL PRICE</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input 
                    placeholder="0.00" 
                    className="pl-7 bg-thorne-navy text-white border-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">VOLUME (USERS/STUDENTS)</label>
                <Input 
                  defaultValue="1" 
                  className="bg-thorne-navy text-white border-none"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">BILLING INTERVAL</label>
                <div className="flex gap-1">
                  {billingIntervals.map((interval) => (
                    <button
                      key={interval}
                      onClick={() => setBillingInterval(interval)}
                      className={`flex-1 px-2 py-2 text-[10px] font-medium rounded transition-colors ${
                        billingInterval === interval
                          ? "bg-thorne-indigo text-white"
                          : "bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {interval}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Cost & Adjustment Nodes */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[10px] font-medium text-muted-foreground tracking-wider">COST & ADJUSTMENT NODES</h4>
              <button className="text-xs text-thorne-indigo font-medium">+ Add New Line</button>
            </div>
            <div className="border border-dashed border-border rounded-xl p-8 text-center">
              <p className="text-sm text-muted-foreground">ADD ADJUSTMENT NODE (COGS, TAXES, ETC.)</p>
            </div>
          </div>

          {/* Intelligence Sources */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[10px] font-medium text-muted-foreground tracking-wider">INTELLIGENCE SOURCES</h4>
              <div className="flex gap-2">
                <button className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground">
                  <Link className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground">
                  <Upload className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground">
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-center text-sm text-muted-foreground italic">No intelligence nodes attached.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex items-center justify-between">
          <button className="text-sm font-medium text-thorne-danger">DISCARD NODE</button>
          <div className="flex gap-2">
            <Button variant="outline">Save Draft</Button>
            <Button className="bg-thorne-indigo hover:bg-thorne-indigo/90 text-white">
              Deploy Offer
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
