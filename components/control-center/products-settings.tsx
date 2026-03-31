"use client"

import { useState, useEffect } from "react"
import { Package, Plus, Loader2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { AddProductModal } from "./add-product-modal"

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
      {showAddModal && userId && (
        <AddProductModal 
          userId={userId} 
          onClose={() => setShowAddModal(false)} 
          onProductAdded={(product) => setProducts([product, ...products])}
        />
      )}
    </div>
  )
}
