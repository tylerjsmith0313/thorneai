"use client"

import { useState, useEffect } from "react"
import { 
  X, Crown, Zap, Globe, ShieldCheck, CreditCard, 
  ArrowRight, Check, Sparkles,
  DollarSign, FileText, Percent, Info, Send,
  RefreshCw, Loader2
} from "lucide-react"
import { BaseButton } from "@/components/ui/base-button"
import { communicationManager } from "@/lib/services/communication-manager"
import { createClient } from "@/lib/supabase/client"
import type { Contact } from "@/types"

// Master email that has access to this wizard
const MASTER_EMAIL = "tyler@simplyflourish.space"

interface MasterProvisioningWizardProps {
  contact: Contact
  onClose: () => void
}

type ProvisioningStep = "tenant" | "packages" | "billing" | "dispatch" | "finalizing"
type ProductTier = "AgyntOS" | "AgyntSync" | "ThorneNeural"

export function MasterProvisioningWizard({ contact, onClose }: MasterProvisioningWizardProps) {
  const [step, setStep] = useState<ProvisioningStep>("tenant")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [formData, setFormData] = useState({
    subdomain: "",
    region: "US-East-1",
    selectedTiers: [] as ProductTier[],
    basePrice: 5000,
    discount: 0,
    includeTOS: true,
    includePrivacy: true,
    includeUserAgreement: true
  })

  // Check if current user is authorized (tyler@simplyflourish.space)
  useEffect(() => {
    async function checkAuthorization() {
      setIsCheckingAuth(true)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user?.email?.toLowerCase() === MASTER_EMAIL.toLowerCase()) {
        setIsAuthorized(true)
      } else {
        setIsAuthorized(false)
      }
      setIsCheckingAuth(false)
    }
    checkAuthorization()
  }, [])

  const productPackages = [
    { id: "AgyntOS" as ProductTier, name: "AgyntOS", icon: <Globe size={20} />, desc: "Core CRM, Calendar, Contacts, Analytics" },
    { id: "AgyntSync" as ProductTier, name: "AgyntSync", icon: <Zap size={20} />, desc: "First Engagement Automation & Basic Flow" },
    { id: "ThorneNeural" as ProductTier, name: "Thorne Neural Network", icon: <Crown size={20} />, desc: "Advanced AI Success Agent & Data Tech" }
  ]

  const handleNext = () => {
    if (step === "tenant") setStep("packages")
    else if (step === "packages") setStep("billing")
    else if (step === "billing") setStep("dispatch")
  }

  const toggleTier = (tier: ProductTier) => {
    setFormData(prev => ({
      ...prev,
      selectedTiers: prev.selectedTiers.includes(tier) 
        ? prev.selectedTiers.filter(t => t !== tier) 
        : [...prev.selectedTiers, tier]
    }))
  }

  const handleProvisionAndDispatch = async () => {
    setIsProcessing(true)
    
    const subject = `ACTION REQUIRED: Master Provisioning Node for ${contact.company}`
    const body = `Hi ${contact.firstName},

Tyler has initialized your Thorne Neural Network tenant. To complete the activation, please authorize the master agreements and complete the settlement via the secure link below.

Packages provisioned: ${formData.selectedTiers.join(", ")}

Review Documents: https://thorne.ai/provision/auth/${contact.id}
Secure Payment: https://checkout.stripe.com/pay/provision_${contact.id}

Best,
Thorne Command`

    setTimeout(async () => {
      await communicationManager.sendMessage(contact, body, subject)
      setStep("finalizing")
      setIsProcessing(false)
    }, 2500)
  }

  const subtotal = formData.basePrice
  const finalTotal = subtotal - (subtotal * (formData.discount / 100))

  // Show loading state while checking auth
  if (isCheckingAuth) {
    return (
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[#020617]/95 backdrop-blur-3xl" onClick={onClose} />
        <div className="bg-white w-full max-w-md rounded-[48px] shadow-2xl p-12 relative flex flex-col items-center justify-center">
          <Loader2 size={48} className="text-indigo-600 animate-spin mb-6" />
          <p className="text-slate-600 font-bold text-sm uppercase tracking-widest">Verifying Clearance...</p>
        </div>
      </div>
    )
  }

  // Show access denied if not authorized
  if (!isAuthorized) {
    return (
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[#020617]/95 backdrop-blur-3xl" onClick={onClose} />
        <div className="bg-white w-full max-w-md rounded-[48px] shadow-2xl p-12 relative flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center text-rose-500 mb-6">
            <ShieldCheck size={40} />
          </div>
          <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-4">Access Denied</h3>
          <p className="text-slate-500 font-medium mb-8">
            Master Provisioning requires Level 5 clearance. This interface is restricted to authorized commanders only.
          </p>
          <BaseButton variant="dark" size="lg" className="px-12 rounded-[32px]" onClick={onClose}>
            Return to Dashboard
          </BaseButton>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#020617]/95 backdrop-blur-3xl animate-in fade-in duration-500" onClick={onClose} />
      
      <div className="bg-white w-full max-w-5xl h-[85vh] rounded-[64px] shadow-[0_0_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden relative flex flex-col border border-white/20 animate-in zoom-in-95 duration-500">
        
        {/* Master Header */}
        <header className="p-10 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-[#0f172a] rounded-[28px] text-amber-500 flex items-center justify-center shadow-2xl shadow-slate-900/20 ring-4 ring-amber-500/5">
              <Crown size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none italic">Master Provisioning</h2>
              <div className="flex items-center gap-3 mt-3">
                 <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
                    {(["tenant", "packages", "billing", "dispatch"] as const).map((s, idx) => (
                      <div key={s} className={`w-3 h-3 rounded-full mx-1 ${
                        idx <= ["tenant", "packages", "billing", "dispatch"].indexOf(step) ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" : "bg-slate-300"
                      }`} />
                    ))}
                 </div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tyler Level 5 clearance</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-4 bg-slate-50 rounded-full text-slate-300 hover:text-rose-500 transition-all border border-slate-100">
            <X size={28} />
          </button>
        </header>

        {/* Content Workspace */}
        <div className="flex-1 overflow-y-auto p-12 no-scrollbar bg-slate-50/20">
          {step === "tenant" && (
            <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-500 max-w-2xl mx-auto">
              <div className="space-y-4">
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Set up New Tenant</h3>
                <p className="text-slate-500 font-medium">Assign a unique intelligence node within the Thorne cluster.</p>
              </div>

              <div className="space-y-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Instance Subdomain</label>
                    <div className="relative">
                       <input 
                        className="w-full bg-white border-2 border-slate-200 focus:border-amber-500 rounded-[28px] py-6 px-10 text-lg font-black outline-none transition-all shadow-sm"
                        placeholder="client-name"
                        value={formData.subdomain}
                        onChange={(e) => setFormData({...formData, subdomain: e.target.value})}
                       />
                       <span className="absolute right-10 top-1/2 -translate-y-1/2 text-slate-300 font-black text-lg">.thorne.ai</span>
                    </div>
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Deployment Region</label>
                    <div className="grid grid-cols-2 gap-4">
                       {["US-East-1", "EU-West-1", "AS-Tokyo", "UK-London"].map(r => (
                         <button 
                          key={r}
                          onClick={() => setFormData({...formData, region: r})}
                          className={`p-6 rounded-[32px] border-2 font-black text-xs uppercase tracking-widest transition-all ${
                            formData.region === r ? "bg-slate-900 border-slate-900 text-white shadow-xl" : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                          }`}
                         >
                           {r}
                         </button>
                       ))}
                    </div>
                 </div>
              </div>
            </div>
          )}

          {step === "packages" && (
            <div className="space-y-12 animate-in slide-in-from-right-8 duration-500">
               <div className="text-center space-y-4">
                  <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Account Product Packaging</h3>
                  <p className="text-slate-500 font-medium">Select components for {contact.company} activation.</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {productPackages.map(pkg => (
                    <button 
                      key={pkg.id}
                      onClick={() => toggleTier(pkg.id)}
                      className={`p-10 rounded-[56px] border-2 text-left transition-all group relative overflow-hidden flex flex-col ${
                        formData.selectedTiers.includes(pkg.id) 
                        ? "bg-slate-900 border-slate-900 text-white shadow-2xl scale-[1.03]" 
                        : "bg-white border-slate-100 text-slate-900 hover:border-amber-500"
                      }`}
                    >
                       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 shadow-lg ${
                         formData.selectedTiers.includes(pkg.id) ? "bg-amber-500 text-slate-900" : "bg-slate-100 text-slate-400"
                       }`}>
                          {pkg.icon}
                       </div>
                       <h4 className="text-xl font-black uppercase tracking-tight mb-4">{pkg.name}</h4>
                       <p className={`text-sm font-medium leading-relaxed ${formData.selectedTiers.includes(pkg.id) ? "text-slate-400" : "text-slate-500"}`}>{pkg.desc}</p>
                       
                       {formData.selectedTiers.includes(pkg.id) && (
                         <div className="absolute top-8 right-8 w-8 h-8 bg-amber-500 text-slate-900 rounded-full flex items-center justify-center">
                            <Check size={18} />
                         </div>
                       )}
                       <div className="absolute right-[-20px] bottom-[-20px] opacity-5 text-white pointer-events-none group-hover:scale-110 transition-transform">
                          {pkg.icon}
                       </div>
                    </button>
                  ))}
               </div>
            </div>
          )}

          {step === "billing" && (
            <div className="space-y-12 animate-in slide-in-from-right-8 duration-500 max-w-2xl mx-auto">
               <div className="space-y-4">
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Financial Node Configuration</h3>
                  <p className="text-slate-500 font-medium italic">&quot;Tyler override: Set direct pricing and discount signatures.&quot;</p>
               </div>

               <div className="bg-white border border-slate-100 rounded-[48px] p-10 shadow-sm space-y-10">
                  <div className="grid grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Base Price ($)</label>
                        <div className="relative">
                          <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                          <input 
                            type="number" 
                            className="w-full pl-14 pr-8 py-6 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-[28px] text-2xl font-black outline-none transition-all shadow-inner"
                            value={formData.basePrice}
                            onChange={(e) => setFormData({...formData, basePrice: Number.parseFloat(e.target.value) || 0})}
                          />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Discount Override (%)</label>
                        <div className="relative">
                          <Percent className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                          <input 
                            type="number" 
                            className="w-full pl-14 pr-8 py-6 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-[28px] text-2xl font-black outline-none transition-all shadow-inner"
                            value={formData.discount}
                            onChange={(e) => setFormData({...formData, discount: Number.parseFloat(e.target.value) || 0})}
                          />
                        </div>
                     </div>
                  </div>

                  <div className="p-8 bg-slate-900 rounded-[40px] text-white flex items-center justify-between shadow-2xl relative overflow-hidden">
                     <div className="relative z-10">
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Settlement Yield</p>
                        <h4 className="text-4xl font-black">${finalTotal.toLocaleString()}</h4>
                        <p className="text-[10px] text-slate-500 font-bold uppercase mt-3 tracking-[0.2em]">Stripe Checkout Node Ready</p>
                     </div>
                     <CreditCard size={100} className="absolute right-[-20px] bottom-[-20px] text-white/5 rotate-12 pointer-events-none" />
                  </div>
               </div>
            </div>
          )}

          {step === "dispatch" && (
            <div className="space-y-12 animate-in slide-in-from-right-8 duration-500 max-w-2xl mx-auto">
               <div className="space-y-4">
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Governance Pack Dispatch</h3>
                  <p className="text-slate-500 font-medium">Select agreements to be transmitted for digital signature.</p>
               </div>

               <div className="space-y-3">
                  <AgreementToggle label="Terms of Service (TOS)" active={formData.includeTOS} onToggle={() => setFormData({...formData, includeTOS: !formData.includeTOS})} />
                  <AgreementToggle label="Privacy & Data Governance" active={formData.includePrivacy} onToggle={() => setFormData({...formData, includePrivacy: !formData.includePrivacy})} />
                  <AgreementToggle label="Master User Agreement" active={formData.includeUserAgreement} onToggle={() => setFormData({...formData, includeUserAgreement: !formData.includeUserAgreement})} />
               </div>

               <div className="p-8 bg-indigo-50 border-2 border-indigo-200 border-dashed rounded-[40px] flex items-start gap-4">
                  <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg"><Info size={20} /></div>
                  <div>
                     <h5 className="text-sm font-black text-indigo-900 uppercase">Automated Transmittal</h5>
                     <p className="text-xs text-indigo-700/80 font-medium leading-relaxed mt-2 italic">&quot;Upon dispatch, Thorne will track recipient engagement with each document node and alert Tyler on signature completion.&quot;</p>
                  </div>
               </div>
            </div>
          )}

          {step === "finalizing" && (
             <div className="h-full flex flex-col items-center justify-center text-center space-y-10 animate-in zoom-in duration-700 relative overflow-hidden">
                <div className="w-32 h-32 bg-amber-500 rounded-full flex items-center justify-center text-slate-900 shadow-[0_0_100px_rgba(245,158,11,0.3)] animate-bounce relative z-10">
                   <ShieldCheck size={64} />
                </div>
                <div className="space-y-4 relative z-10">
                   <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none italic">Provisioning Dispatched</h3>
                   <p className="text-lg text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
                     Master node established. Agreements and Stripe settlement link transmitted to <span className="text-indigo-600 font-black">{contact.email}</span>.
                   </p>
                </div>
                <BaseButton variant="dark" size="lg" className="px-16 rounded-[32px] py-6 shadow-2xl relative z-10" onClick={onClose}>Finish Command</BaseButton>
                <Sparkles size={300} className="absolute inset-0 text-amber-500/5 -z-0 pointer-events-none" />
             </div>
          )}
        </div>

        {/* Master Footer */}
        {step !== "finalizing" && (
          <footer className="p-10 border-t border-slate-100 bg-white/80 backdrop-blur-md flex items-center justify-between shrink-0">
            <button className="text-slate-400 hover:text-rose-500 text-[10px] font-black uppercase tracking-widest transition-colors" onClick={onClose}>Abort Provisioning</button>
            <div className="flex gap-4">
               {step === "dispatch" ? (
                 <BaseButton 
                  variant="dark" 
                  size="lg" 
                  className="px-16 rounded-[32px] py-7 bg-[#0f172a] hover:bg-slate-800 text-white border-none shadow-2xl shadow-slate-900/40 font-black uppercase tracking-widest text-sm relative group overflow-hidden" 
                  icon={isProcessing ? <RefreshCw className="animate-spin" /> : <Send size={20} />}
                  onClick={handleProvisionAndDispatch}
                  disabled={isProcessing}
                >
                  <span className="relative z-10">Provision & Dispatch Package</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/10 to-amber-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                </BaseButton>
               ) : (
                 <BaseButton 
                  variant="primary" 
                  size="lg" 
                  className="px-16 rounded-[32px] py-7 bg-amber-500 hover:bg-amber-400 text-slate-900 border-none shadow-2xl shadow-amber-500/20 font-black uppercase tracking-widest text-sm" 
                  icon={<ArrowRight size={20} />}
                  onClick={handleNext}
                  disabled={step === "tenant" && !formData.subdomain}
                >
                  Confirm & Advance
                </BaseButton>
               )}
            </div>
          </footer>
        )}
      </div>
    </div>
  )
}

function AgreementToggle({ label, active, onToggle }: { label: string; active: boolean; onToggle: () => void }) {
  return (
    <button 
      onClick={onToggle}
      className={`w-full p-6 rounded-[32px] border-2 text-left flex items-center justify-between transition-all ${
        active ? "bg-indigo-50 border-indigo-600 text-indigo-700 shadow-sm" : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
      }`}
    >
      <div className="flex items-center gap-4">
         <div className={`p-2 rounded-xl ${active ? "bg-indigo-600 text-white" : "bg-slate-50"}`}><FileText size={18} /></div>
         <span className="text-sm font-black uppercase tracking-tight">{label}</span>
      </div>
      <div className={`w-10 h-6 rounded-full relative transition-all ${active ? "bg-indigo-600" : "bg-slate-200"}`}>
         <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${active ? "right-1" : "left-1"}`} />
      </div>
    </button>
  )
}
