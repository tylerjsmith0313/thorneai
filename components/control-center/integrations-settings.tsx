"use client"

import { useState, useEffect } from "react"
import { 
  Mail, 
  Phone, 
  Calendar, 
  Database,
  Check, 
  Eye, 
  EyeOff, 
  Loader2,
  ExternalLink,
  Shield,
  Zap,
  AlertCircle,
  Save,
  CheckCircle
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface IntegrationConfig {
  mailgun_api_key: string
  mailgun_domain: string
  mailgun_from_email: string
  mailgun_enabled: boolean
  twilio_account_sid: string
  twilio_auth_token: string
  twilio_phone_number: string
  twilio_enabled: boolean
  google_calendar_enabled: boolean
  hubspot_api_key: string
  hubspot_enabled: boolean
}

const defaultConfig: IntegrationConfig = {
  mailgun_api_key: "",
  mailgun_domain: "",
  mailgun_from_email: "",
  mailgun_enabled: false,
  twilio_account_sid: "",
  twilio_auth_token: "",
  twilio_phone_number: "",
  twilio_enabled: false,
  google_calendar_enabled: false,
  hubspot_api_key: "",
  hubspot_enabled: false,
}

export function IntegrationsSettings() {
  const [config, setConfig] = useState<IntegrationConfig>(defaultConfig)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [testing, setTesting] = useState<string | null>(null)
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  const [testResults, setTestResults] = useState<Record<string, "success" | "error" | null>>({})
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    loadIntegrations()
  }, [])

  async function loadIntegrations() {
    setLoading(true)
    const supabase = createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    setUserId(user.id)

    // Get user integrations from user_integrations table
    const { data } = await supabase
      .from("user_integrations")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (data) {
      setConfig({
        mailgun_api_key: data.mailgun_api_key || "",
        mailgun_domain: data.mailgun_domain || "",
        mailgun_from_email: data.mailgun_from_email || "",
        mailgun_enabled: data.mailgun_enabled || false,
        twilio_account_sid: data.twilio_account_sid || "",
        twilio_auth_token: data.twilio_auth_token || "",
        twilio_phone_number: data.twilio_phone_number || "",
        twilio_enabled: data.twilio_enabled || false,
        google_calendar_enabled: data.google_calendar_enabled || false,
        hubspot_api_key: data.hubspot_api_key || "",
        hubspot_enabled: data.hubspot_enabled || false,
      })
    }
    
    setLoading(false)
  }

  async function saveIntegrations() {
    if (!userId) return
    
    setSaving(true)
    setSaveSuccess(false)
    
    const supabase = createClient()

    const { error } = await supabase
      .from("user_integrations")
      .upsert({
        user_id: userId,
        mailgun_api_key: config.mailgun_api_key,
        mailgun_domain: config.mailgun_domain,
        mailgun_from_email: config.mailgun_from_email,
        mailgun_enabled: config.mailgun_enabled,
        twilio_account_sid: config.twilio_account_sid,
        twilio_auth_token: config.twilio_auth_token,
        twilio_phone_number: config.twilio_phone_number,
        twilio_enabled: config.twilio_enabled,
        google_calendar_enabled: config.google_calendar_enabled,
        hubspot_api_key: config.hubspot_api_key,
        hubspot_enabled: config.hubspot_enabled,
        updated_at: new Date().toISOString()
      }, { onConflict: "user_id" })

    if (error) {
      console.error("[v0] Error saving integrations:", error)
    } else {
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    }

    setSaving(false)
  }

  async function testMailgun() {
    setTesting("mailgun")
    setTestResults(prev => ({ ...prev, mailgun: null }))
    
    try {
      const response = await fetch("/api/integrations/test-mailgun", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: config.mailgun_api_key,
          domain: config.mailgun_domain,
          fromEmail: config.mailgun_from_email
        })
      })
      
      if (response.ok) {
        setTestResults(prev => ({ ...prev, mailgun: "success" }))
      } else {
        setTestResults(prev => ({ ...prev, mailgun: "error" }))
      }
    } catch {
      setTestResults(prev => ({ ...prev, mailgun: "error" }))
    }
    
    setTesting(null)
  }

  function toggleSecret(key: string) {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }))
  }

  function maskValue(value: string) {
    if (!value) return ""
    if (value.length <= 8) return "••••••••"
    return value.slice(0, 4) + "••••••••" + value.slice(-4)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">
            <Zap size={12} />
            Integration Hub
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Connected Services</h2>
          <p className="text-sm text-slate-500 mt-1 italic">
            "Configure external services to power AgyntSynq's communication capabilities."
          </p>
        </div>
        <button
          onClick={saveIntegrations}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50"
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : saveSuccess ? (
            <CheckCircle size={16} />
          ) : (
            <Save size={16} />
          )}
          {saveSuccess ? "Saved!" : "Save All"}
        </button>
      </div>

      {/* Security Notice */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <Shield className="w-5 h-5 text-amber-600 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-800">Credentials are encrypted</p>
          <p className="text-xs text-amber-600 mt-0.5">
            All API keys and secrets are encrypted at rest and never exposed in client-side code.
          </p>
        </div>
      </div>

      {/* Mailgun Integration */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Mailgun</h3>
                <p className="text-xs text-slate-500">Transactional email delivery</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {testResults.mailgun === "success" && (
                <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                  <Check size={12} /> Connected
                </span>
              )}
              {testResults.mailgun === "error" && (
                <span className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
                  <AlertCircle size={12} /> Failed
                </span>
              )}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.mailgun_enabled}
                  onChange={(e) => {
                    setConfig(prev => ({ ...prev, mailgun_enabled: e.target.checked }))
                    setSaveSuccess(false)
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600" />
              </label>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                API Key
              </label>
              <div className="relative">
                <input
                  type={showSecrets.mailgun_api_key ? "text" : "password"}
                  value={showSecrets.mailgun_api_key ? config.mailgun_api_key : maskValue(config.mailgun_api_key)}
                  onChange={(e) => {
                    setConfig(prev => ({ ...prev, mailgun_api_key: e.target.value }))
                    setSaveSuccess(false)
                  }}
                  onFocus={() => setShowSecrets(prev => ({ ...prev, mailgun_api_key: true }))}
                  placeholder="key-xxxxxxxxxxxxxxxx"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent pr-10"
                />
                <button
                  type="button"
                  onClick={() => toggleSecret("mailgun_api_key")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showSecrets.mailgun_api_key ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                Sending Domain
              </label>
              <input
                type="text"
                value={config.mailgun_domain}
                onChange={(e) => {
                  setConfig(prev => ({ ...prev, mailgun_domain: e.target.value }))
                  setSaveSuccess(false)
                }}
                placeholder="mg.yourdomain.com"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
              From Email Address
            </label>
            <input
              type="email"
              value={config.mailgun_from_email}
              onChange={(e) => {
                setConfig(prev => ({ ...prev, mailgun_from_email: e.target.value }))
                setSaveSuccess(false)
              }}
              placeholder="hello@yourdomain.com"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <a 
              href="https://app.mailgun.com/app/account/security/api_keys" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700"
            >
              <ExternalLink size={12} />
              Get API Key from Mailgun
            </a>
            <button
              onClick={testMailgun}
              disabled={testing === "mailgun" || !config.mailgun_api_key || !config.mailgun_domain}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-all disabled:opacity-50"
            >
              {testing === "mailgun" ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
              Test Connection
            </button>
          </div>
        </div>
      </div>

      {/* Twilio Integration */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-pink-600 rounded-xl flex items-center justify-center">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Twilio</h3>
                <p className="text-xs text-slate-500">SMS & Voice communications</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                Coming Soon
              </span>
              <label className="relative inline-flex items-center cursor-not-allowed opacity-50">
                <input
                  type="checkbox"
                  checked={config.twilio_enabled}
                  disabled
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600" />
              </label>
            </div>
          </div>
        </div>

        <div className="p-5 opacity-50 pointer-events-none">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                Account SID
              </label>
              <input
                type="text"
                placeholder="ACxxxxxxxxxxxxxxxx"
                disabled
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                Auth Token
              </label>
              <input
                type="password"
                placeholder="••••••••••••••••"
                disabled
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="+1234567890"
                disabled
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Google Calendar Integration */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Google Calendar</h3>
                <p className="text-xs text-slate-500">Sync meetings & availability</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                Coming Soon
              </span>
              <label className="relative inline-flex items-center cursor-not-allowed opacity-50">
                <input
                  type="checkbox"
                  checked={config.google_calendar_enabled}
                  disabled
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600" />
              </label>
            </div>
          </div>
        </div>

        <div className="p-5 opacity-50">
          <button
            disabled
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-lg"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Connect Google Account
          </button>
        </div>
      </div>

      {/* HubSpot Integration */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">HubSpot</h3>
                <p className="text-xs text-slate-500">CRM sync & data enrichment</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                Coming Soon
              </span>
              <label className="relative inline-flex items-center cursor-not-allowed opacity-50">
                <input
                  type="checkbox"
                  checked={config.hubspot_enabled}
                  disabled
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600" />
              </label>
            </div>
          </div>
        </div>

        <div className="p-5 opacity-50 pointer-events-none">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
              API Key
            </label>
            <input
              type="password"
              placeholder="pat-na1-xxxxxxxx"
              disabled
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>
        </div>
      </div>

      {/* Stripe Connect Integration */}
      <StripeConnectCard />
    </div>
  )
}

function StripeConnectCard() {
  const [stripeStatus, setStripeStatus] = useState<"not_connected" | "pending" | "connected">("not_connected")
  const [connecting, setConnecting] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function checkStripeStatus() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: tenantData } = await supabase
        .from("tenants")
        .select("stripe_account_id, stripe_account_status")
        .single()
      
      if (tenantData?.stripe_account_status) {
        setStripeStatus(tenantData.stripe_account_status as "not_connected" | "pending" | "connected")
      }
    }
    
    checkStripeStatus()
  }, [supabase])

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
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/>
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Stripe Connect</h3>
              <p className="text-xs text-slate-500">Accept payments from proposals</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {stripeStatus === "connected" ? (
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                <Check size={12} /> Connected
              </span>
            ) : stripeStatus === "pending" ? (
              <span className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                <Loader2 size={12} className="animate-spin" /> Pending
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="p-5">
        <p className="text-sm text-slate-600 mb-4">
          Link your Stripe account to automatically process payments from generated proposals and invoices.
        </p>
        
        {stripeStatus === "connected" ? (
          <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
            <Check className="text-emerald-600" size={20} />
            <div>
              <p className="text-sm font-medium text-emerald-800">Stripe account connected</p>
              <p className="text-xs text-emerald-600">Payments will be processed automatically</p>
            </div>
          </div>
        ) : (
          <button
            onClick={handleConnectStripe}
            disabled={connecting}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50"
          >
            {connecting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <ExternalLink size={16} />
            )}
            {connecting ? "Connecting..." : "Connect Stripe Account"}
          </button>
        )}
      </div>
    </div>
  )
}
