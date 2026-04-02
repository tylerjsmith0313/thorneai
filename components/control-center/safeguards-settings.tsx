"use client"

import { useState, useEffect } from "react"
import { Shield, Zap, DollarSign, Save, Loader2, CheckCircle } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { createClient } from "@/lib/supabase/client"

export function SafeguardsSettings() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  
  const [settings, setSettings] = useState({
    dnc_enabled: true,
    automation_mode: "user" as "user" | "auto",
    max_gift_value: 50,
    monthly_burn_limit: 1000,
  })

  // Load settings on mount
  useEffect(() => {
    async function loadSettings() {
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setIsLoading(false)
        return
      }
      
      setUserId(user.id)
      
      // Get user settings
      const { data: userSettings } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .single()
      
      if (userSettings) {
        setSettings({
          dnc_enabled: userSettings.dnc_enabled ?? true,
          automation_mode: (userSettings.automation_mode as "user" | "auto") || "user",
          max_gift_value: userSettings.max_gift_value ?? 50,
          monthly_burn_limit: userSettings.monthly_burn_limit ?? 1000,
        })
      }
      
      setIsLoading(false)
    }
    
    loadSettings()
  }, [])

  const handleSave = async () => {
    if (!userId) return
    
    setIsSaving(true)
    setSaveSuccess(false)
    
    const supabase = createClient()
    
    // Upsert user settings
    const { error } = await supabase
      .from("user_settings")
      .upsert({
        user_id: userId,
        dnc_enabled: settings.dnc_enabled,
        automation_mode: settings.automation_mode,
        max_gift_value: settings.max_gift_value,
        monthly_burn_limit: settings.monthly_burn_limit,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" })
    
    if (error) {
      console.error("[v0] Error saving safeguards settings:", error)
    } else {
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    }
    
    setIsSaving(false)
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
          <h2 className="text-2xl font-bold text-foreground mb-2">Compliance & Safeguards</h2>
          <p className="text-muted-foreground">
            Set boundaries and approval requirements for automated actions.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : saveSuccess ? (
            <CheckCircle size={16} />
          ) : (
            <Save size={16} />
          )}
          {saveSuccess ? "Saved!" : "Save Changes"}
        </button>
      </div>

      {/* DNC Registry Toggle */}
      <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
          <Shield className="w-6 h-6 text-destructive" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-foreground">Scrub National DNC Registry</p>
          <p className="text-sm text-muted-foreground">
            Automatically check Do Not Call lists before any voice AI outreach.
          </p>
        </div>
        <Switch 
          checked={settings.dnc_enabled} 
          onCheckedChange={(checked) => {
            setSettings(prev => ({ ...prev, dnc_enabled: checked }))
            setSaveSuccess(false)
          }} 
        />
      </div>

      <div className="flex gap-4">
        {/* Automation Mode */}
        <div className="flex-1 bg-thorne-indigo/5 border border-thorne-indigo/20 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-thorne-indigo" />
            <span className="text-xs font-semibold tracking-wider text-thorne-indigo">
              GLOBAL AUTOMATION MODE
            </span>
          </div>
          <div className="space-y-2">
            <button
              onClick={() => {
                setSettings(prev => ({ ...prev, automation_mode: "user" }))
                setSaveSuccess(false)
              }}
              className={`w-full py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                settings.automation_mode === "user"
                  ? "bg-white border-2 border-thorne-indigo text-thorne-indigo"
                  : "bg-white/50 border border-border text-foreground hover:bg-white"
              }`}
            >
              User Controlled
            </button>
            <button
              onClick={() => {
                setSettings(prev => ({ ...prev, automation_mode: "auto" }))
                setSaveSuccess(false)
              }}
              className={`w-full py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                settings.automation_mode === "auto"
                  ? "bg-thorne-indigo text-white"
                  : "bg-thorne-indigo/80 text-white hover:bg-thorne-indigo"
              }`}
            >
              Set to Flow (Full Auto)
            </button>
          </div>
        </div>

        {/* Auto-Approve Budget */}
        <div className="w-80 bg-[#1a1a2e] rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-6">
            <DollarSign className="w-5 h-5 text-thorne-lavender" />
            <span className="text-xs font-semibold tracking-wider text-thorne-lavender">
              AUTO-APPROVE BUDGET
            </span>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold tracking-wider text-white/80">
                  MAX PER-GIFT VALUE
                </span>
                <span className="text-thorne-lavender font-semibold">
                  ${settings.max_gift_value.toFixed(2)}
                </span>
              </div>
              <Slider
                value={[settings.max_gift_value]}
                onValueChange={(val) => {
                  setSettings(prev => ({ ...prev, max_gift_value: val[0] }))
                  setSaveSuccess(false)
                }}
                max={200}
                step={5}
                className="[&_[data-slot=track]]:bg-white/20 [&_[data-slot=range]]:bg-thorne-indigo [&_[data-slot=thumb]]:bg-thorne-lavender [&_[data-slot=thumb]]:border-0"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold tracking-wider text-white/80">
                  MONTHLY BURN LIMIT
                </span>
                <span className="text-thorne-lavender font-semibold">
                  ${settings.monthly_burn_limit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <Slider
                value={[settings.monthly_burn_limit]}
                onValueChange={(val) => {
                  setSettings(prev => ({ ...prev, monthly_burn_limit: val[0] }))
                  setSaveSuccess(false)
                }}
                max={5000}
                step={100}
                className="[&_[data-slot=track]]:bg-white/20 [&_[data-slot=range]]:bg-thorne-indigo [&_[data-slot=thumb]]:bg-thorne-lavender [&_[data-slot=thumb]]:border-0"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
