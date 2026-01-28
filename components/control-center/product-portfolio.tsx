"use client"

import { useState, useEffect } from "react"
import { ShoppingBag, Plus, EllipsisVertical as MoreVertical, Loader2, Trash2 } from "lucide-react"
import { BaseButton } from "@/components/ui/base-button"
import { AddProductModal } from "./add-product-modal"
import { createClient } from "@/lib/supabase/client"
import EllipsisVertical from "lucide-react" // Import EllipsisVertical

interface Product {
  id: string
  name: string
  retail_price: number
  billing_interval: string
  classification: string
  pitch_context?: string
  is_deployed?: boolean
}

export function ProductPortfolio() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
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

  const handleAddProduct = async (newProduct: { name: string; price: string; billingCycle: string; type: string; pitchContext?: string }) => {
    if (!userId) return
    
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from("products")
      .insert({
        user_id: userId,
        name: newProduct.name,
        retail_price: parseFloat(newProduct.price.replace(/[^0-9.]/g, "")) || 0,
        billing_interval: newProduct.billingCycle,
        classification: newProduct.type,
        pitch_context: newProduct.pitchContext,
        is_deployed: false,
      })
      .select()
      .single()
    
    if (error) {
      console.error("[v0] Error creating product:", error)
      return
    }
    
    if (data) {
      setProducts([data, ...products])
    }
  }

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
    const formatted = price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
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
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Product Portfolio</h3>
          <p className="text-sm text-slate-500 mt-1">Configure the offers Thorne will present to leads.</p>
        </div>
        <BaseButton variant="dark" icon={<Plus size={18} />} onClick={() => setIsAddModalOpen(true)}>
          Add Product
        </BaseButton>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {products.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <ShoppingBag size={48} className="mx-auto mb-4 opacity-50" />
            <p>No products added yet. Add your first product to get started.</p>
          </div>
        ) : (
          products.map((product) => (
            <ProductCard 
              key={product.id} 
              id={product.id}
              name={product.name} 
              price={formatPrice(product.retail_price, product.billing_interval)} 
              type={product.classification}
              onDelete={() => handleDeleteProduct(product.id)}
            />
          ))
        )}
      </div>

      {isAddModalOpen && <AddProductModal onClose={() => setIsAddModalOpen(false)} onSave={handleAddProduct} />}
    </div>
  )
}

interface ProductCardProps {
  id: string
  name: string
  price: string
  type: string
  onDelete: () => void
}

function ProductCard({ id, name, price, type, onDelete }: ProductCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  
  return (
    <div className="group p-8 bg-slate-50 border border-slate-200 rounded-[40px] hover:bg-white hover:shadow-2xl hover:border-indigo-100 transition-all flex items-center justify-between">
      <div className="flex items-center gap-6">
        <div className="w-16 h-16 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-indigo-600 shadow-sm group-hover:bg-indigo-600 group-hover:text-white group-hover:border-transparent transition-all">
          <ShoppingBag size={24} />
        </div>
        <div>
          <h4 className="font-bold text-slate-900 text-lg">{name}</h4>
          <p className="text-xs text-slate-500 font-medium">
            MSRP: ${price} - {type}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <BaseButton variant="outline" size="sm">
          Creative Studio
        </BaseButton>
        <BaseButton variant="secondary" size="sm">
          Edit Details
        </BaseButton>
        <div className="relative">
          <button 
            className="p-2 text-slate-300 hover:text-slate-600 transition-colors"
            onClick={() => setShowMenu(!showMenu)}
          >
            <EllipsisVertical size={20} />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-10">
              <button
                onClick={() => {
                  onDelete()
                  setShowMenu(false)
                }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductPortfolio
