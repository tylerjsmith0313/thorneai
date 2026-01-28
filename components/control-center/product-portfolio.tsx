"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Plus, MoreVertical } from "lucide-react"
import { AddProductModal } from "./add-product-modal"

interface Product {
  id: number
  name: string
  price: string
  type: string
}

export function ProductPortfolio() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [products, setProducts] = useState<Product[]>([
    { id: 1, name: "SaaS Platform License", price: "4,999.00", type: "Physical Good" },
    { id: 2, name: "Enterprise Consulting", price: "12,500.00", type: "Service" },
    { id: 3, name: "Thorne Radar API", price: "850.00 / mo", type: "Subscription" },
  ])

  const handleAddProduct = (newProduct: { name: string; price: string; billingCycle: string; type: string }) => {
    const formatted: Product = {
      id: Date.now(),
      name: newProduct.name,
      price: newProduct.billingCycle === "monthly" ? `${newProduct.price} / mo` : newProduct.price,
      type: newProduct.type,
    }
    setProducts([...products, formatted])
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Product Portfolio</h3>
          <p className="text-sm text-slate-500 mt-1">Configure the offers Thorne will present to leads.</p>
        </div>
        <Button variant="secondary" className="bg-slate-900 text-white hover:bg-slate-800" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={18} className="mr-2" />
          Add Product
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} name={product.name} price={product.price} type={product.type} />
        ))}
      </div>

      {isAddModalOpen && <AddProductModal onClose={() => setIsAddModalOpen(false)} onSave={handleAddProduct} />}
    </div>
  )
}

function ProductCard({ name, price, type }: { name: string; price: string; type: string }) {
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
        <Button variant="outline" size="sm">
          Creative Studio
        </Button>
        <Button variant="secondary" size="sm">
          Edit Details
        </Button>
        <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
          <MoreVertical size={20} />
        </button>
      </div>
    </div>
  )
}
