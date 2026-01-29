"use client"

import React from "react"

import { useState, useEffect, useCallback } from 'react'
import { 
  Shield, Zap, Check, ArrowRight, Building2, Smartphone, 
  Mail, Sparkles, Loader2, CheckCircle2, 
  ChevronRight, Users, Info, ShieldCheck, Lock
} from 'lucide-react'
import { BaseButton } from '@/components/ui/base-button'
import { 
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { createOnboardingCheckoutSession } from '@/app/actions/onboarding-checkout'
import { createClient } from '@/lib/supabase/client'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface OnboardingSequenceProps {
  onComplete: () => void
  userId?: string
}

type OnboardingStep = 'identity' | 'billing' | 'payment' | 'complete'
type PlanType = 'agynt-os' | 'agynt-sync'

export function OnboardingSequence({ onComplete, userId }: OnboardingSequenceProps) {
  const [step, setStep] = useState<OnboardingStep>('identity')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isCloning, setIsCloning] = useState(false)
  const [checkoutReady, setCheckoutReady] = useState(false)
  
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    company: '',
    plan: 'agynt-sync' as PlanType,
    userCount: 1,
  })

  const supabase = createClient()

  // Load user email if authenticated
  useEffect(() => {
    async function loadUserEmail() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        setFormData(prev => ({ ...prev, email: user.email || '' }))
      }
    }
    loadUserEmail()
  }, [supabase])

  const calculateTotal = () => {
    if (formData.plan === 'agynt-os') return 99
    
    const baseUsers = formData.userCount
    if (baseUsers <= 1) return 249
    if (baseUsers <= 5) return 495
    
    // Logic: $495 for first 5, then $295 per 5 users after
    const extraUsers = baseUsers - 5
    const extraBlocks = Math.ceil(extraUsers / 5)
    return 495 + (extraBlocks * 295)
  }

  const simulateSupabaseSchemaClone = async () => {
    setIsCloning(true)
    
    // Actually create tenant record in Supabase
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      // Update user with onboarding data
      await supabase.from('users').upsert({
        id: user.id,
        email: formData.email,
        company: formData.company,
        phone: formData.phone,
        subscription_plan: formData.plan,
        subscription_status: 'active',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' })
    }
    
    // Simulate schema provisioning delay
    setTimeout(() => {
      setIsCloning(false)
    }, 3500)
  }

  const fetchClientSecret = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    const result = await createOnboardingCheckoutSession({
      email: formData.email,
      company: formData.company,
      phone: formData.phone,
      plan: formData.plan,
      userCount: formData.userCount,
      userId: userId || user?.id || '',
    })
    return result.clientSecret!
  }, [formData, userId, supabase])

  const handleCheckoutComplete = useCallback(() => {
    setStep('complete')
    simulateSupabaseSchemaClone()
  }, [])

  const handleNext = () => {
    if (step === 'identity') setStep('billing')
    else if (step === 'billing') {
      setStep('payment')
      setCheckoutReady(true)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Polish */}
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none bg-[radial-gradient(circle_at_50%_50%,#4f46e5,transparent)]" />
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[120px]" />
      
      <div className="max-w-5xl w-full h-[850px] bg-white border border-slate-100 rounded-[64px] flex flex-col md:flex-row overflow-hidden shadow-2xl relative z-10">
        
        {/* Sidebar: Progress & Context */}
        <div className="md:w-[35%] border-r border-slate-50 flex flex-col p-12 space-y-12 bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100">
              <Shield size={24} />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight uppercase">AgyntSynq</h1>
              <p className="text-indigo-600 font-black text-[9px] uppercase tracking-[0.2em] mt-0.5">Neural Integration</p>
            </div>
          </div>

          <div className="flex-1 space-y-10">
            <ProgressStep active={step === 'identity'} complete={['billing', 'payment', 'complete'].includes(step)} label="Identity Node" num="01" />
            <ProgressStep active={step === 'billing'} complete={['payment', 'complete'].includes(step)} label="Settlement Plan" num="02" />
            <ProgressStep active={step === 'payment'} complete={step === 'complete'} label="Secure Authorization" num="03" />
            <ProgressStep active={step === 'complete'} complete={false} label="System Activation" num="04" />
          </div>

          <div className="p-8 bg-indigo-900 rounded-[40px] text-white relative overflow-hidden shadow-2xl">
             <div className="flex items-center gap-3 relative z-10 mb-4">
                <Sparkles size={16} className="text-indigo-300 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Neural Insight</span>
             </div>
             <p className="text-xs text-indigo-50 leading-relaxed italic font-medium relative z-10">
               "System initialization requires valid identity nodes to calibrate your business graph accurately."
             </p>
             <Shield size={120} className="absolute right-[-40px] bottom-[-40px] text-white/5 rotate-12" />
          </div>
        </div>

        {/* Main Content Workspace */}
        <div className="flex-1 p-16 overflow-y-auto no-scrollbar bg-white flex flex-col relative">
          
          {step === 'identity' && (
            <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-500 max-w-xl mx-auto w-full">
              <div className="space-y-3">
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none italic">Identity Registry</h2>
                <p className="text-slate-500 font-medium">Establish your unique signature within the AgyntSynq core.</p>
              </div>

              <div className="space-y-8">
                <AuthInput 
                  label="Company Email" 
                  icon={<Mail size={20} />} 
                  placeholder="name@company.com" 
                  value={formData.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, email: e.target.value})}
                />
                <AuthInput 
                  label="Cell Phone Signature" 
                  icon={<Smartphone size={20} />} 
                  placeholder="+1 (555) 000-0000" 
                  value={formData.phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, phone: e.target.value})}
                />
                <AuthInput 
                  label="Corporate Entity" 
                  icon={<Building2 size={20} />} 
                  placeholder="Acme Global Inc." 
                  value={formData.company}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, company: e.target.value})}
                />
              </div>

              <BaseButton 
                variant="dark" 
                fullWidth 
                size="lg" 
                onClick={handleNext} 
                className="py-7 rounded-[32px] font-black uppercase tracking-[0.2em] shadow-2xl"
                disabled={!formData.email || !formData.phone || !formData.company}
              >
                Continue to Billing
                <ArrowRight size={20} className="ml-2" />
              </BaseButton>
            </div>
          )}

          {step === 'billing' && (
            <div className="space-y-12 animate-in slide-in-from-right-8 duration-500 w-full">
              <div className="space-y-3 text-center">
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">Select Settlement</h2>
                <p className="text-slate-500 font-medium italic">"Calibrate your operational bandwidth and neural access."</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* AgyntOS Plan */}
                <button 
                  onClick={() => setFormData({...formData, plan: 'agynt-os'})}
                  className={`p-10 rounded-[56px] border-4 text-left transition-all duration-500 group relative overflow-hidden ${
                    formData.plan === 'agynt-os' ? 'border-indigo-600 bg-white shadow-2xl shadow-indigo-100 scale-[1.03]' : 'border-slate-50 bg-slate-50/50 hover:border-slate-200'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 shadow-lg transition-all ${
                    formData.plan === 'agynt-os' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'
                  }`}>
                    <Shield size={24} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">AgyntOS</h3>
                  <p className="text-sm font-medium text-slate-500 mt-2 mb-8 leading-relaxed">Core CRM, Calendar nodes, and contact intelligence repository.</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-slate-900">$99</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">/ MONTH</span>
                  </div>
                  {formData.plan === 'agynt-os' && <div className="absolute top-8 right-8 p-1.5 bg-indigo-600 text-white rounded-full"><Check size={16} /></div>}
                </button>

                {/* AgyntSync Plan */}
                <button 
                  onClick={() => setFormData({...formData, plan: 'agynt-sync'})}
                  className={`p-10 rounded-[56px] border-4 text-left transition-all duration-500 group relative overflow-hidden ${
                    formData.plan === 'agynt-sync' ? 'border-indigo-600 bg-slate-900 text-white shadow-2xl shadow-indigo-200 scale-[1.03]' : 'border-slate-50 bg-slate-50/50 hover:border-slate-200'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 shadow-lg transition-all ${
                    formData.plan === 'agynt-sync' ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-400'
                  }`}>
                    <Zap size={24} fill="currentColor" />
                  </div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-black uppercase tracking-tight">AgyntSync</h3>
                    <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-full text-[8px] font-black uppercase tracking-widest">Neural</span>
                  </div>
                  <p className="text-sm font-medium opacity-60 mt-2 mb-8 leading-relaxed">Thorne Neural Network automation, multi-channel flow, and strategic AI assistance.</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black">${calculateTotal()}</span>
                    <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">/ MONTH</span>
                  </div>
                  {formData.plan === 'agynt-sync' && <div className="absolute top-8 right-8 p-1.5 bg-indigo-600 text-white rounded-full"><Check size={16} /></div>}
                  <Zap size={100} className="absolute right-[-20px] bottom-[-20px] opacity-[0.03] rotate-12" />
                </button>
              </div>

              {formData.plan === 'agynt-sync' && (
                <div className="bg-slate-50 rounded-[40px] p-10 border border-slate-100 animate-in zoom-in-95 duration-500">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-md"><Users size={16} /></div>
                      <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">User Node Scale</h4>
                    </div>
                    <span className="text-2xl font-black text-indigo-600">{formData.userCount} Nodes</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="20" 
                    value={formData.userCount}
                    onChange={(e) => setFormData({...formData, userCount: parseInt(e.target.value)})}
                    className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between mt-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    <span>1 User ($249)</span>
                    <span>5 Users ($495)</span>
                    <span>Scaling (+$295/5)</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-8 border-t border-slate-100">
                <div className="flex items-center gap-2">
                   <Info size={16} className="text-indigo-400" />
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Prices in USD per billing cycle</p>
                </div>
                <BaseButton variant="dark" size="lg" className="rounded-full px-12" onClick={handleNext}>
                   Authorization Node <ArrowRight size={18} className="ml-2" />
                </BaseButton>
              </div>
            </div>
          )}

          {step === 'payment' && (
            <div className="space-y-8 animate-in slide-in-from-right-8 duration-500 w-full h-full flex flex-col">
              <div className="text-center space-y-4 shrink-0">
                 <div className="w-16 h-16 bg-[#635BFF] rounded-[20px] mx-auto flex items-center justify-center text-white shadow-2xl shadow-indigo-100">
                    <Lock size={28} />
                 </div>
                 <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">Secure Settlement</h2>
                 <p className="text-sm font-medium text-slate-400">Powered by Stripe</p>
              </div>

              <div className="flex-1 bg-slate-50 border border-slate-200 rounded-[32px] p-6 overflow-hidden">
                {checkoutReady && (
                  <EmbeddedCheckoutProvider
                    stripe={stripePromise}
                    options={{
                      fetchClientSecret,
                      onComplete: handleCheckoutComplete,
                    }}
                  >
                    <EmbeddedCheckout className="h-full" />
                  </EmbeddedCheckoutProvider>
                )}
              </div>
            </div>
          )}

          {step === 'complete' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-10 animate-in zoom-in duration-700 relative overflow-hidden">
               <div className="w-32 h-32 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-[0_0_100px_rgba(79,70,229,0.3)] relative z-10">
                  {isCloning ? <Loader2 size={64} className="animate-spin" /> : <CheckCircle2 size={64} className="animate-bounce" />}
               </div>
               
               <div className="space-y-5 relative z-10">
                  <h2 className="text-slate-900 text-5xl font-black tracking-tighter uppercase italic leading-none">System Activated</h2>
                  <p className="text-slate-500 text-lg font-medium max-w-sm mx-auto leading-relaxed">
                    {isCloning 
                      ? "Stand by. AgyntSynq is provisioning your dedicated instance..." 
                      : "Integration complete. Your neural environment is now operational."}
                  </p>
               </div>

               {isCloning ? (
                  <div className="w-full max-w-xs space-y-3">
                     <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 animate-pulse w-full" />
                     </div>
                     <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest animate-pulse">Syncing Database Nodes...</p>
                  </div>
               ) : (
                  <BaseButton 
                    variant="primary" 
                    size="lg" 
                    className="px-20 py-7 rounded-[32px] shadow-indigo-200 text-base uppercase tracking-[0.3em] font-black group" 
                    onClick={onComplete}
                  >
                    Enter Command Hub
                    <ChevronRight size={24} className="ml-2 group-hover:translate-x-2 transition-transform" />
                  </BaseButton>
               )}

               <Sparkles size={400} className="absolute inset-0 text-indigo-500/5 -z-0 pointer-events-none" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ProgressStep({ active, complete, label, num }: { active: boolean, complete: boolean, label: string, num: string }) {
  return (
    <div className={`flex items-center gap-5 transition-all duration-500 ${active ? 'translate-x-3' : complete ? 'opacity-50' : 'opacity-30'}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black border-2 transition-all ${
        active ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : complete ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-200 text-slate-300'
      }`}>
        {complete ? <Check size={18} /> : num}
      </div>
      <span className={`text-[11px] font-black uppercase tracking-widest ${active ? 'text-slate-900' : 'text-slate-400'}`}>{label}</span>
    </div>
  )
}

function AuthInput({ label, icon, ...props }: { label: string; icon: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative">
        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300">
          {icon}
        </div>
        <input 
          className="w-full bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 rounded-[28px] py-6 pl-16 pr-8 text-sm font-bold text-slate-900 outline-none transition-all shadow-inner"
          {...props}
        />
      </div>
    </div>
  )
}

export default OnboardingSequence
