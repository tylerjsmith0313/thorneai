"use client"

import { useState, useEffect } from "react"
import { Package, Plus, X, Link, Upload, List, HelpCircle, Loader2, Trash2, Save, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"

interface Product {
  id: string
  name: string
  retail_price: number
  billing_interval: string
  classification: string
  pitch_context?: string
  is_deployed?: boolean
}

const classifications = ["SAAS", "SERVICE", "PHYSICAL", "SUBSCRIPTION", "CONSULTING"]
const billingIntervals = ["ONE-TIME", "MONTHLY", "ANNUAL"]

export function ProductsSettings() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  // Load products from Supabase
  useEffect(() => {
    async function loadProducts() {
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setIsLoading(false)
        return
      }
      
      setUserId(user.id)
      
      const { data: productsData } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
      
      if (productsData) {
        setProducts(productsData)
      }
      
      setIsLoading(false)
    }
    
    loadProducts()
  }, [])

  const handleDeleteProduct = async (productId: string) => {
    if (!userId) return
    
    const supabase = createClient()
    
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId)
      .eq("user_id", userId)
    
    if (!error) {
      setProducts(products.filter(p => p.id !== productId))
    } else {
      console.error("[v0] Error deleting product:", error)
    }
  }

  const formatPrice = (price: number, billingInterval: string) => {
    const formatted = `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    return billingInterval === "monthly" ? `${formatted} / mo` : billingInterval === "annual" ? `${formatted} / yr` : formatted
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Product Portfolio</h2>
          <p className="text-muted-foreground">Configure the offers AgyntSynq will present to leads.</p>
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
        {products.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Package size={48} className="mx-auto mb-4 opacity-50" />
            <p>No products added yet. Add your first product to get started.</p>
          </div>
        ) : (
          products.map((product) => (
            <div
              key={product.id}
              className="bg-secondary rounded-xl p-4 flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center">
                  <Package className="w-6 h-6 text-thorne-indigo" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{product.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    MSRP: {formatPrice(product.retail_price, product.billing_interval)} &bull; {product.classification}
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
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleDeleteProduct(product.id)}
                  className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <AddProductModal 
          userId={userId} 
          onClose={() => setShowAddModal(false)} 
          onProductAdded={(product) => setProducts([product, ...products])}
        />
      )}
    </div>
  )
}

function AddProductModal({ 
  userId, 
  onClose, 
  onProductAdded 
}: { 
  userId: string | null
  onClose: () => void 
  onProductAdded: (product: Product) => void
}) {
  const [classification, setClassification] = useState("SAAS")
  const [billingInterval, setBillingInterval] = useState("MONTHLY")
  const [name, setName] = useState("")
  const [pitchContext, setPitchContext] = useState("")
  const [retailPrice, setRetailPrice] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const handleSave = async () => {
    if (!userId || !name.trim()) return
    
    setIsSaving(true)
    setSaveSuccess(false)
    
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from("products")
      .insert({
        user_id: userId,
        name: name.trim(),
        pitch_context: pitchContext.trim() || null,
        classification: classification.toLowerCase(),
        retail_price: parseFloat(retailPrice) || 0,
        billing_interval: billingInterval.toLowerCase().replace("-", "_"),
        is_deployed: false,
      })
      .select()
      .single()
    
    if (error) {
      console.error("[v0] Error creating product:", error)
      setIsSaving(false)
      return
    }
    
    if (data) {
      onProductAdded(data)
      setSaveSuccess(true)
      setTimeout(() => {
        onClose()
      }, 500)
    }
    
    setIsSaving(false)
  }

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
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Consulting Mastermind 2024" 
                  className="bg-secondary border-none"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Pitch Context</label>
                <textarea
                  value={pitchContext}
                  onChange={(e) => setPitchContext(e.target.value)}
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

          {/* Pricing */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[10px] font-medium text-muted-foreground tracking-wider">PRICING & COST</h4>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">RETAIL PRICE</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input 
                    value={retailPrice}
                    onChange={(e) => setRetailPrice(e.target.value)}
                    placeholder="0.00" 
                    className="pl-7 bg-thorne-navy text-white border-none"
                  />
                </div>
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
          <button onClick={onClose} className="text-sm font-medium text-thorne-danger">DISCARD NODE</button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button 
              onClick={handleSave}
              disabled={isSaving || !name.trim()}
              className="bg-thorne-indigo hover:bg-thorne-indigo/90 text-white"
            >
              {isSaving ? (
                <Loader2 size={16} className="animate-spin mr-2" />
              ) : saveSuccess ? (
                <CheckCircle size={16} className="mr-2" />
              ) : (
                <Save size={16} className="mr-2" />
              )}
              {saveSuccess ? "Saved!" : "Deploy Offer"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
