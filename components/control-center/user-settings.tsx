"use client"

import { useState, useEffect } from "react"
import { Save, User, Mail, Building2, Briefcase, CreditCard, Shield, Zap, ArrowRight, Check } from "lucide-react"
import { BaseButton } from "@/components/ui/base-button"
import { BaseInput } from "@/components/ui/base-input"
import { createClient } from "@/lib/supabase/client"

export function UserSettings() {
  const [stripeStatus, setStripeStatus] = useState<"not_connected" | "pending" | "connected">("not_connected")
  const [connecting, setConnecting] = useState(false)

  useEffect(() => {
    // Check Stripe connection status
    async function checkStripeStatus() {
      const supabase = createClient()
      const { data } = await supabase
        .from("tenants")
        .select("stripe_account_id, stripe_account_status")
        .single()
      
      if (data?.stripe_account_status) {
        setStripeStatus(data.stripe_account_status as any)
      }
    }
    checkStripeStatus()
  }, [])

  async function handleConnectStripe() {
    setConnecting(true)
    try {
      const response = await fetch("/api/stripe/connect", { method: "POST" })
      const { url } = await response.json()
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error("Failed to connect Stripe:", error)
    }
    setConnecting(false)
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">ACCOUNT DETAILS</h3>
          <p className="text-sm text-slate-500 mt-1">"Manage your personal digital signature within the Thorne Core."</p>
        </div>
        <BaseButton variant="primary" icon={<Save size={18} />}>SAVE CHANGES</BaseButton>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">First Name</label>
          <BaseInput defaultValue="Thorne" icon={<User size={16} />} />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
          <BaseInput defaultValue="AI" icon={<User size={16} />} />
        </div>
        <div className="col-span-2 space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
          <BaseInput type="email" defaultValue="commander@thorne.ai" icon={<Mail size={16} />} />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Company</label>
          <BaseInput defaultValue="Thorne Intelligence" icon={<Building2 size={16} />} />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Job Title</label>
          <BaseInput defaultValue="Chief Revenue Officer" icon={<Briefcase size={16} />} />
        </div>
      </div>

      {/* Connected Financial Nodes Section */}
      <div className="pt-8 border-t border-slate-100">
        <div className="mb-6">
          <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">Connected Financial Nodes</h4>
          <p className="text-sm text-slate-500 mt-1">Configure payment gateways for automated proposal settlement.</p>
        </div>

        {/* Stripe Connect Card */}
        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <div>
                <h5 className="text-base font-black text-slate-900 uppercase tracking-tight">Stripe Connect</h5>
                <p className="text-sm text-slate-500 mt-1 max-w-sm">
                  Link your Stripe account to automatically process payments from generated proposals.
                </p>
              </div>
            </div>
            
            {stripeStatus === "connected" ? (
              <div className="flex items-center gap-2 px-5 py-3 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">
                <Check size={18} />
                <span className="text-sm font-bold">Connected</span>
              </div>
            ) : (
              <BaseButton 
                variant="primary" 
                onClick={handleConnectStripe}
                disabled={connecting}
                className="px-6 py-3 rounded-2xl"
              >
                {connecting ? "Connecting..." : "LINK STRIPE"}
                <ArrowRight size={16} className="ml-2" />
              </BaseButton>
            )}
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex gap-4 mt-4">
          <div className="flex-1 flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-2xl">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Security</p>
              <p className="text-sm font-bold text-slate-700">PCI-DSS Compliant Node</p>
            </div>
          </div>
          <div className="flex-1 flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-2xl">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Automation</p>
              <p className="text-sm font-bold text-slate-700">Auto-Invoicing Enabled</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserSettings
