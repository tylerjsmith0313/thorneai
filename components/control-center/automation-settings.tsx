"use client"

import { useState, useEffect } from "react"
import { Save, Loader2, CheckCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export function AutomationSettings() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  
  const [settings, setSettings] = useState({
    auto_add_research: true,
    first_engage: false,
    next_step_notifications: true,
    response_time: "5-10 Minutes",
    outreach_personality: "Professional",
  })

  const timeOptions = [
    "5-10 Minutes",
    "10-20 Minutes",
    "20-60 Minutes",
    "1-2 Hours",
    "2-5 Hours",
    "5-10 Hours",
    "10-24 Hours",
    "24-48 Hours",
    "48-96 Hours",
    "AI Determined",
  ]

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
          auto_add_research: userSettings.auto_add_research ?? true,
          first_engage: userSettings.first_engage ?? false,
          next_step_notifications: userSettings.next_step_notifications ?? true,
          response_time: userSettings.response_time || "5-10 Minutes",
          outreach_personality: userSettings.outreach_personality || "Professional",
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
        auto_add_research: settings.auto_add_research,
        first_engage: settings.first_engage,
        next_step_notifications: settings.next_step_notifications,
        response_time: settings.response_time,
        outreach_personality: settings.outreach_personality,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" })
    
    if (error) {
      console.error("[v0] Error saving automation settings:", error)
    } else {
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    }
    
    setIsSaving(false)
  }

  const handleToggle = (field: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [field]: !prev[field] }))
    setSaveSuccess(false)
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
        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Automation Settings</h3>
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

      <div className="space-y-4">
        <ToggleRow
          title="Auto Add Research"
          desc="Automatically enrich contacts when added to Research Center"
          active={settings.auto_add_research}
          onToggle={() => handleToggle("auto_add_research")}
        />
        <ToggleRow
          title="First Engage"
          desc="Auto-initiate outreach flow when contact verification completes"
          active={settings.first_engage}
          onToggle={() => handleToggle("first_engage")}
        />
        <ToggleRow
          title="Next Step Notifications"
          desc="Receive summaries and proposed next steps via AI Command Chat"
          active={settings.next_step_notifications}
          onToggle={() => handleToggle("next_step_notifications")}
        />
      </div>

      <div className="space-y-6 pt-6">
        <div className="flex items-center justify-between">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Response Cadence</h4>
          <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase border border-indigo-100">
            {settings.response_time}
          </span>
        </div>

        <div className="space-y-4">
          <label className="text-xs font-bold text-slate-700 ml-1">Text/Email Response Time</label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {timeOptions.map((option) => (
              <button
                key={option}
                onClick={() => {
                  setSettings(prev => ({ ...prev, response_time: option }))
                  setSaveSuccess(false)
                }}
                className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-tight border-2 transition-all ${
                  settings.response_time === option
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100 scale-[1.02]"
                    : "bg-white border-slate-100 text-slate-400 hover:border-indigo-100 hover:text-slate-600"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 italic font-medium ml-1">
            "This setting defines the baseline latency for Thorne&apos;s automated engagement nodes."
          </p>
        </div>
      </div>

      <div className="space-y-6 pt-6 border-t border-slate-50">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Outreach Personality</h4>
        <div className="flex flex-wrap gap-3">
          {["Casual", "Professional", "Fun", "Enthusiastic", "Consultative", "Mimic Voice"].map((p) => (
            <button
              key={p}
              onClick={() => {
                setSettings(prev => ({ ...prev, outreach_personality: p }))
                setSaveSuccess(false)
              }}
              className={`px-6 py-3 rounded-2xl text-xs font-bold border transition-all ${
                settings.outreach_personality === p
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100"
                  : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function ToggleRow({
  title,
  desc,
  active,
  onToggle,
}: {
  title: string
  desc: string
  active: boolean
  onToggle: () => void
}) {
  return (
    <div
      onClick={onToggle}
      className="p-6 bg-slate-50 rounded-[32px] border border-slate-200 flex items-center justify-between hover:bg-white transition-all group cursor-pointer"
    >
      <div>
        <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{title}</h4>
        <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
      </div>
      <div
        className={`w-14 h-7 rounded-full relative p-1.5 transition-colors duration-300 shadow-inner ${active ? "bg-indigo-600" : "bg-slate-300"}`}
      >
        <div
          className={`w-4 h-4 bg-white rounded-full absolute transition-all duration-300 shadow-sm ${active ? "left-[calc(100%-20px)]" : "left-1.5"}`}
        />
      </div>
    </div>
  )
}

export default AutomationSettings
