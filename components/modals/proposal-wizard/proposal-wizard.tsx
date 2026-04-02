"use client"

import { useState } from "react"
import { X, FileText, Palette, Eye, Sparkles, Percent, DollarSign, Receipt, Trash2, Plus, Sun, Moon, Check, Send, ShieldCheck, Loader2 } from "lucide-react"
import { BaseButton } from "@/components/ui/base-button"
import type { Contact } from "@/types"

interface ProposalWizardProps {
  contact: Contact
  opportunity: {
    name: string
    amount: number
  }
  onClose: () => void
  onDeploy?: (paymentLink: string) => void
}

// Portfolio nodes (products) available
const PORTFOLIO_NODES = [
  { id: "saas-license", name: "SaaS Platform License", price: 15000 },
  { id: "enterprise-consulting", name: "Enterprise Consulting", price: 12500 },
  { id: "thorne-radar-api", name: "Thorne Radar API", price: 850 },
  { id: "digital-audit", name: "Digital Audit Node", price: 2400 },
]

const BRAND_COLORS = [
  { id: "indigo", value: "#6366f1", label: "Indigo" },
  { id: "emerald", value: "#10b981", label: "Emerald" },
  { id: "amber", value: "#f59e0b", label: "Amber" },
  { id: "rose", value: "#f43f5e", label: "Rose" },
  { id: "slate", value: "#1e293b", label: "Slate" },
]

const CORNER_OPTIONS = [
  { id: "none", value: "0px", label: "0" },
  { id: "sm", value: "16px", label: "16px" },
  { id: "md", value: "32px", label: "32px" },
  { id: "lg", value: "48px", label: "48px" },
  { id: "full", value: "9999px", label: "Full" },
]

const BILLING_CYCLES = [
  { id: "monthly", label: "Monthly" },
  { id: "6-mo", label: "6-Mo" },
  { id: "1-year", label: "1-Year" },
  { id: "single", label: "Single" },
]

export function ProposalWizard({ contact, opportunity, onClose, onDeploy }: ProposalWizardProps) {
  const [activeTab, setActiveTab] = useState<"config" | "editor" | "review">("config")
  
  // Config state
  const [coverLetter, setCoverLetter] = useState("")
  const [selectedProducts, setSelectedProducts] = useState<string[]>(["saas-license"])
  const [billingCycle, setBillingCycle] = useState("single")
  const [discount, setDiscount] = useState(0)
  const [surcharge, setSurcharge] = useState(0)
  const [taxRate, setTaxRate] = useState(0)
  const [isGeneratingLetter, setIsGeneratingLetter] = useState(false)
  
  // Editor state
  const [brandColor, setBrandColor] = useState("indigo")
  const [cornerRadius, setCornerRadius] = useState("lg")
  const [theme, setTheme] = useState<"light" | "dark">("light")
  
  // Deploy state
  const [isDeploying, setIsDeploying] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [deployError, setDeployError] = useState<string | null>(null)
  
  // Calculate totals
  const selectedProductsData = PORTFOLIO_NODES.filter(p => selectedProducts.includes(p.id))
  const grossSubtotal = selectedProductsData.reduce((sum, p) => sum + p.price, 0)
  const discountAmount = grossSubtotal * (discount / 100)
  const surchargeAmount = grossSubtotal * (surcharge / 100)
  const subtotalAfterModifiers = grossSubtotal - discountAmount + surchargeAmount
  const taxAmount = subtotalAfterModifiers * (taxRate / 100)
  const totalInvestment = subtotalAfterModifiers + taxAmount
  
  const selectedBrandColor = BRAND_COLORS.find(c => c.id === brandColor)?.value || "#6366f1"
  const selectedCornerRadius = CORNER_OPTIONS.find(c => c.id === cornerRadius)?.value || "48px"
  
  // Generate proposal ID
  const proposalId = `THN-${Math.floor(1000 + Math.random() * 9000)}`
  
  const handleGenerateCoverLetter = async () => {
    setIsGeneratingLetter(true)
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2000))
    setCoverLetter(`Dear ${contact.firstName},

Thank you for your interest in our solutions. Based on our conversations, I've prepared this customized proposal specifically for ${contact.company}.

This strategic solution brief outlines our recommended approach to help you achieve your business objectives. The investment nodes selected are tailored to address your specific requirements and will deliver measurable value to your organization.

I'm confident this partnership will drive significant results for your team.

Best regards,
Your Account Executive`)
    setIsGeneratingLetter(false)
  }
  
  const handleDeploy = async () => {
    if (!termsAccepted) {
      setShowTermsModal(true)
      return
    }
    
    setIsDeploying(true)
    setDeployError(null)
    
    try {
      // Create the proposal in Stripe via server action
      const response = await fetch("/api/proposals/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact: {
            id: contact.id,
            firstName: contact.firstName,
            lastName: contact.lastName,
            email: contact.email,
            company: contact.company,
          },
          products: selectedProductsData,
          totalAmount: Math.round(totalInvestment * 100), // Convert to cents
          billingCycle,
          proposalId,
          coverLetter,
        }),
      })
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || "Failed to deploy proposal")
      }
      
      // Success - call onDeploy with payment link
      if (onDeploy && result.paymentLink) {
        onDeploy(result.paymentLink)
      }
      
      onClose()
    } catch (error: any) {
      setDeployError(error.message)
    } finally {
      setIsDeploying(false)
    }
  }
  
  const handleAuthorize = () => {
    setShowTermsModal(true)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-slate-900 rounded-[32px] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-700">
              <FileText size={22} className="text-slate-400" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-tight">PROPOSAL WIZARD</h2>
              <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                CLIENT: {contact.company?.toUpperCase()}
              </p>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex items-center bg-slate-800 rounded-full p-1">
            {[
              { id: "config", label: "Config" },
              { id: "editor", label: "Editor" },
              { id: "review", label: "Review" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all ${
                  activeTab === tab.id
                    ? "bg-white text-slate-900"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-all"
          >
            <X size={18} className="text-slate-400" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === "config" && (
            <div className="grid grid-cols-2 gap-8">
              {/* Left: AI Narrative */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-white">AI NARRATIVE LAYER</h3>
                  <BaseButton
                    variant="primary"
                    size="sm"
                    className="bg-emerald-500 hover:bg-emerald-600 rounded-full px-4"
                    icon={<Sparkles size={14} />}
                    onClick={handleGenerateCoverLetter}
                    disabled={isGeneratingLetter}
                  >
                    {isGeneratingLetter ? "Generating..." : "Generate with Gemini"}
                  </BaseButton>
                </div>
                
                <div className="relative">
                  <textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Thorne can draft your cover letter... click the button above."
                    className="w-full h-[320px] bg-slate-800 border border-slate-700 rounded-3xl p-6 text-slate-300 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder:text-slate-600"
                  />
                </div>
              </div>
              
              {/* Right: Products & Config */}
              <div className="space-y-6">
                {/* Portfolio Nodes */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                        <FileText size={14} className="text-indigo-400" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Portfolio Nodes</span>
                    </div>
                    <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-bold">
                      {selectedProducts.length} Active
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {PORTFOLIO_NODES.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => {
                          if (selectedProducts.includes(product.id)) {
                            setSelectedProducts(selectedProducts.filter(p => p !== product.id))
                          } else {
                            setSelectedProducts([...selectedProducts, product.id])
                          }
                        }}
                        className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                          selectedProducts.includes(product.id)
                            ? "bg-indigo-500/10 border-indigo-500/30"
                            : "bg-slate-800/50 border-slate-700 hover:border-slate-600"
                        }`}
                      >
                        <span className={`text-sm font-medium ${selectedProducts.includes(product.id) ? "text-indigo-300" : "text-slate-400"}`}>
                          {product.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 text-sm">${product.price.toLocaleString()}</span>
                          <Plus size={14} className={selectedProducts.includes(product.id) ? "text-indigo-400 rotate-45" : "text-slate-500"} />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Proposal Modifiers */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                      <FileText size={14} className="text-indigo-400" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Proposal Modifiers</span>
                  </div>
                  
                  <div className="flex gap-3">
                    {[
                      { id: "discount", label: "Discount", icon: Percent, value: discount, setter: setDiscount, color: "emerald" },
                      { id: "surcharge", label: "Surcharge", icon: DollarSign, value: surcharge, setter: setSurcharge, color: "amber" },
                      { id: "taxation", label: "Taxation", icon: Receipt, value: taxRate, setter: setTaxRate, color: "slate" },
                    ].map((modifier) => (
                      <div key={modifier.id} className="flex-1">
                        <button
                          className={`w-full p-4 rounded-2xl border transition-all ${
                            modifier.value > 0
                              ? `bg-${modifier.color}-500/10 border-${modifier.color}-500/30`
                              : "bg-slate-800/50 border-slate-700 hover:border-slate-600"
                          }`}
                        >
                          <modifier.icon size={18} className={modifier.value > 0 ? `text-${modifier.color}-400` : "text-slate-500"} />
                          <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">{modifier.label}</p>
                        </button>
                        <input
                          type="number"
                          value={modifier.value}
                          onChange={(e) => modifier.setter(Number(e.target.value))}
                          className="w-full mt-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-center text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                          min="0"
                          max="100"
                          placeholder="0%"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Live Configuration */}
                <div className="p-5 bg-slate-800/50 border border-slate-700 rounded-3xl space-y-4">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Live Configuration</span>
                  
                  <div>
                    <p className="text-[10px] font-bold text-indigo-400 uppercase">Product</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm font-bold text-white">{selectedProductsData[0]?.name || "Select a product"}</p>
                      <button className="text-slate-500 hover:text-red-400 transition-all">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Billing Cycle</p>
                    <div className="flex gap-2 mt-2">
                      {BILLING_CYCLES.map((cycle) => (
                        <button
                          key={cycle.id}
                          onClick={() => setBillingCycle(cycle.id)}
                          className={`px-4 py-2 rounded-full text-[11px] font-bold uppercase transition-all ${
                            billingCycle === cycle.id
                              ? "bg-indigo-500 text-white"
                              : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                          }`}
                        >
                          {cycle.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-700">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Adjusted Price</p>
                    <p className="text-2xl font-black text-white">${totalInvestment.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === "editor" && (
            <div className="grid grid-cols-2 gap-8">
              {/* Left: Style Options */}
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-black text-white mb-2">VISUAL STUDIO LAYER</h3>
                  <p className="text-slate-400 text-sm">Customize the aesthetic parameters of your proposal node.</p>
                </div>
                
                <div className="p-8 bg-slate-800/50 border border-slate-700 rounded-[32px] space-y-8">
                  {/* Brand Color */}
                  <div className="space-y-4">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Brand Signature (Color)</p>
                    <div className="flex gap-3">
                      {BRAND_COLORS.map((color) => (
                        <button
                          key={color.id}
                          onClick={() => setBrandColor(color.id)}
                          className={`w-12 h-12 rounded-xl transition-all ${
                            brandColor === color.id ? "ring-2 ring-white ring-offset-2 ring-offset-slate-800" : ""
                          }`}
                          style={{ backgroundColor: color.value }}
                        />
                      ))}
                    </div>
                  </div>
                  
                  {/* Corner Radius */}
                  <div className="space-y-4">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Corner Radius (Geometry)</p>
                    <div className="flex gap-3">
                      {CORNER_OPTIONS.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => setCornerRadius(option.id)}
                          className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-[11px] font-bold transition-all ${
                            cornerRadius === option.id
                              ? "bg-indigo-500 border-indigo-500 text-white"
                              : "border-slate-600 text-slate-400 hover:border-slate-500"
                          }`}
                          style={{ borderRadius: option.value === "9999px" ? "50%" : option.value }}
                        >
                          {option.id === "full" ? "" : option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Theme */}
                  <div className="space-y-4">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Luminance (Theme)</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setTheme("light")}
                        className={`flex-1 p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                          theme === "light"
                            ? "bg-indigo-500/10 border-indigo-500 text-indigo-400"
                            : "border-slate-600 text-slate-400 hover:border-slate-500"
                        }`}
                      >
                        <Sun size={20} />
                        <span className="text-[11px] font-bold uppercase">Light Mode</span>
                      </button>
                      <button
                        onClick={() => setTheme("dark")}
                        className={`flex-1 p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                          theme === "dark"
                            ? "bg-indigo-500/10 border-indigo-500 text-indigo-400"
                            : "border-slate-600 text-slate-400 hover:border-slate-500"
                        }`}
                      >
                        <Moon size={20} />
                        <span className="text-[11px] font-bold uppercase">Dark Mode</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right: Preview */}
              <div className="flex items-center justify-center">
                <div 
                  className="w-64 bg-white shadow-2xl overflow-hidden"
                  style={{ borderRadius: selectedCornerRadius }}
                >
                  <div className="p-6 space-y-4">
                    <div 
                      className="w-10 h-10 flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: selectedBrandColor, borderRadius: `calc(${selectedCornerRadius} / 3)` }}
                    >
                      {contact.firstName?.[0]}
                    </div>
                    <div className="h-3 bg-slate-200 rounded-full w-3/4" />
                    <div className="h-2 bg-slate-100 rounded-full w-1/2" />
                    <div className="h-2 bg-slate-100 rounded-full w-2/3" />
                    <button
                      className="w-full py-3 text-white text-xs font-bold"
                      style={{ backgroundColor: selectedBrandColor, borderRadius: `calc(${selectedCornerRadius} / 2)` }}
                    >
                      Preview Button
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === "review" && (
            <div className="flex items-center justify-center min-h-[500px]">
              {/* Proposal Preview Card */}
              <div 
                className={`w-full max-w-lg shadow-2xl overflow-hidden ${theme === "dark" ? "bg-slate-800" : "bg-white"}`}
                style={{ borderRadius: selectedCornerRadius }}
              >
                <div className="p-8 space-y-6 relative">
                  {/* Watermark */}
                  <div className="absolute top-4 right-4 text-[10px] text-slate-400 uppercase">
                    <p>Proposal ID</p>
                    <p className="font-bold">{proposalId}</p>
                  </div>
                  
                  {/* Avatar */}
                  <div 
                    className="w-14 h-14 flex items-center justify-center text-white text-xl font-bold"
                    style={{ backgroundColor: selectedBrandColor, borderRadius: `calc(${selectedCornerRadius} / 3)` }}
                  >
                    {contact.firstName?.[0]}
                  </div>
                  
                  {/* Title */}
                  <div>
                    <h2 className={`text-2xl font-black ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                      STRATEGIC SOLUTION BRIEF
                    </h2>
                    <p className={`text-sm ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                      Prepared exclusively for <span className="text-indigo-500 underline">{contact.firstName} {contact.lastName}</span> at {contact.company}
                    </p>
                  </div>
                  
                  {/* Cover Letter Preview */}
                  {coverLetter && (
                    <div className={`text-sm italic ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                      {coverLetter.substring(0, 100)}...
                    </div>
                  )}
                  {!coverLetter && (
                    <p className={`text-sm italic ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`}>
                      No cover letter drafted.
                    </p>
                  )}
                  
                  {/* Investment Nodes */}
                  <div className="space-y-3">
                    <p className={`text-[10px] font-bold uppercase tracking-widest ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`}>
                      Investment Nodes
                    </p>
                    
                    <div className={`border rounded-2xl overflow-hidden ${theme === "dark" ? "border-slate-700" : "border-slate-200"}`}>
                      {selectedProductsData.map((product, i) => (
                        <div 
                          key={product.id}
                          className={`flex items-center justify-between p-4 ${
                            i !== selectedProductsData.length - 1 
                              ? `border-b ${theme === "dark" ? "border-slate-700" : "border-slate-100"}` 
                              : ""
                          }`}
                        >
                          <span className={`text-sm ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>
                            {product.name}
                          </span>
                          <div className="flex items-center gap-4">
                            <span className={`text-[10px] uppercase ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`}>
                              {billingCycle}
                            </span>
                            <span className={`font-bold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                              ${product.price.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Total */}
                    <div 
                      className="flex items-center justify-between p-4 text-white"
                      style={{ backgroundColor: selectedBrandColor, borderRadius: `calc(${selectedCornerRadius} / 2)` }}
                    >
                      <span className="text-[11px] font-bold uppercase">Total Commitment</span>
                      <span className="text-2xl font-black">${totalInvestment.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  {/* Authorization */}
                  <div className="pt-6 border-t border-slate-200 text-center space-y-4">
                    <p className={`text-[10px] font-bold uppercase tracking-widest ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`}>
                      Client Authorization Signature
                    </p>
                    
                    <button
                      onClick={handleAuthorize}
                      className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-[11px] font-bold uppercase transition-all ${
                        termsAccepted
                          ? "bg-emerald-500 text-white"
                          : theme === "dark"
                            ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {termsAccepted ? <Check size={14} /> : <ShieldCheck size={14} />}
                      {termsAccepted ? "Terms Accepted" : "Authorize Neural Contract"}
                    </button>
                    
                    <p className={`text-[9px] ${theme === "dark" ? "text-slate-500" : "text-slate-400"} max-w-xs mx-auto`}>
                      By authorizing this node, you agree to the automated terms of service and subsequent Stripe Node deployment.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-8 py-5 border-t border-slate-800 flex items-center justify-between">
          <div className="text-slate-400">
            <p className="text-[10px] uppercase">Gross Subtotal</p>
            <p className="text-sm font-bold text-slate-300">${grossSubtotal.toLocaleString()}</p>
          </div>
          
          <div className="text-right">
            <p className="text-[10px] uppercase text-slate-400">Total Investment</p>
            <p className="text-2xl font-black text-indigo-400">${totalInvestment.toLocaleString()}</p>
          </div>
          
          <BaseButton
            variant="primary"
            size="lg"
            className="bg-indigo-500 hover:bg-indigo-600 rounded-2xl px-8"
            icon={isDeploying ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            onClick={handleDeploy}
            disabled={isDeploying || selectedProducts.length === 0}
          >
            {isDeploying ? "Deploying..." : "Deploy Proposal Node"}
          </BaseButton>
        </div>
        
        {deployError && (
          <div className="px-8 pb-4">
            <p className="text-red-400 text-sm">{deployError}</p>
          </div>
        )}
      </div>
      
      {/* Terms Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowTermsModal(false)} />
          <div className="relative bg-white rounded-3xl p-8 max-w-md w-full mx-4 space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck size={28} className="text-indigo-600" />
              </div>
              <h3 className="text-xl font-black text-slate-900">Terms of Service</h3>
              <p className="text-sm text-slate-500 mt-2">
                Please review and accept the terms to proceed with the proposal.
              </p>
            </div>
            
            <div className="bg-slate-50 rounded-2xl p-4 max-h-48 overflow-y-auto text-sm text-slate-600">
              <p className="font-bold mb-2">Terms of Service Agreement</p>
              <p className="mb-2">
                By accepting this proposal, you agree to the following terms:
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Payment is due upon acceptance</li>
                <li>Services will be delivered as described in the proposal</li>
                <li>All sales are final unless otherwise specified</li>
                <li>Your data will be handled according to our Privacy Policy</li>
              </ul>
              <p className="mt-4 font-bold">Privacy Policy</p>
              <p>
                We collect and process your information in accordance with applicable data protection laws.
              </p>
            </div>
            
            <div className="flex gap-3">
              <BaseButton
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={() => setShowTermsModal(false)}
              >
                Cancel
              </BaseButton>
              <BaseButton
                variant="primary"
                className="flex-1 bg-indigo-500 hover:bg-indigo-600 rounded-xl"
                onClick={() => {
                  setTermsAccepted(true)
                  setShowTermsModal(false)
                }}
              >
                Accept Terms
              </BaseButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
