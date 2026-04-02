"use client"

import { useState, useEffect } from "react"
import { Save, Loader2, CheckCircle, Bot, Sparkles, Target, Building2, User, FileText, Lightbulb } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Textarea } from "@/components/ui/textarea"

interface AgyntSettings {
  // AI Identity
  ai_name: string
  ai_description: string
  ai_instructions: string
  // Business Context
  business_description: string
  // Goals
  ai_goals: string
  business_goals: string
  personal_goals: string
  // Automation Settings
  auto_add_research: boolean
  first_engage: boolean
  next_step_notifications: boolean
  response_time: string
  outreach_personality: string
}

export function AutomationSettings() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  
  const [settings, setSettings] = useState<AgyntSettings>({
    // AI Identity
    ai_name: "AgyntSynq",
    ai_description: "",
    ai_instructions: "",
    // Business Context
    business_description: "",
    // Goals
    ai_goals: "",
    business_goals: "",
    personal_goals: "",
    // Automation Settings
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
          // AI Identity
          ai_name: userSettings.ai_name || "AgyntSynq",
          ai_description: userSettings.ai_description || "",
          ai_instructions: userSettings.ai_instructions || "",
          // Business Context
          business_description: userSettings.business_description || "",
          // Goals
          ai_goals: userSettings.ai_goals || "",
          business_goals: userSettings.business_goals || "",
          personal_goals: userSettings.personal_goals || "",
          // Automation Settings
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
        // AI Identity
        ai_name: settings.ai_name,
        ai_description: settings.ai_description,
        ai_instructions: settings.ai_instructions,
        // Business Context
        business_description: settings.business_description,
        // Goals
        ai_goals: settings.ai_goals,
        business_goals: settings.business_goals,
        personal_goals: settings.personal_goals,
        // Automation Settings
        auto_add_research: settings.auto_add_research,
        first_engage: settings.first_engage,
        next_step_notifications: settings.next_step_notifications,
        response_time: settings.response_time,
        outreach_personality: settings.outreach_personality,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" })
    
    if (error) {
      console.error("[v0] Error saving Agynt settings:", error)
    } else {
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    }
    
    setIsSaving(false)
  }

  const handleToggle = (field: keyof AgyntSettings) => {
    setSettings(prev => ({ ...prev, [field]: !prev[field] }))
    setSaveSuccess(false)
  }

  const handleTextChange = (field: keyof AgyntSettings, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }))
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
        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Agynt Settings</h3>
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

      {/* AI Identity Section */}
      <div className="space-y-6 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl border border-indigo-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600 rounded-xl">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Agynt Identity</h4>
            <p className="text-xs text-slate-500">Customize your AI assistant&apos;s name and personality</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Sparkles size={14} className="text-indigo-500" />
              AI Name
            </label>
            <input
              type="text"
              value={settings.ai_name}
              onChange={(e) => handleTextChange("ai_name", e.target.value)}
              placeholder="AgyntSynq"
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <p className="text-[10px] text-slate-400 italic ml-1">
              This is how your AI assistant will introduce itself in conversations
            </p>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <FileText size={14} className="text-indigo-500" />
              AI Description
            </label>
            <Textarea
              value={settings.ai_description}
              onChange={(e) => handleTextChange("ai_description", e.target.value)}
              placeholder="Describe your AI assistant's role and personality. E.g., 'A friendly and professional sales assistant that specializes in helping businesses grow through meaningful connections.'"
              className="w-full min-h-[100px] px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
            <p className="text-[10px] text-slate-400 italic ml-1">
              A brief description of your AI&apos;s role and personality traits
            </p>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Lightbulb size={14} className="text-amber-500" />
              AI Instructions
            </label>
            <Textarea
              value={settings.ai_instructions}
              onChange={(e) => handleTextChange("ai_instructions", e.target.value)}
              placeholder="Provide specific instructions for how the AI should behave. E.g., 'Always be professional but warm. Focus on understanding the prospect's needs before pitching. Never be pushy or aggressive. Use the prospect's name when appropriate.'"
              className="w-full min-h-[150px] px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
            <p className="text-[10px] text-slate-400 italic ml-1">
              Detailed instructions for how your AI should communicate and behave
            </p>
          </div>
        </div>
      </div>

      {/* Business Context Section */}
      <div className="space-y-6 p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl border border-emerald-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-600 rounded-xl">
            <Building2 size={20} className="text-white" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Business Context</h4>
            <p className="text-xs text-slate-500">Help your AI understand your business to communicate more effectively</p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Building2 size={14} className="text-emerald-500" />
            Business Description
          </label>
          <Textarea
            value={settings.business_description}
            onChange={(e) => handleTextChange("business_description", e.target.value)}
            placeholder="Describe your business, products/services, target market, and value proposition. E.g., 'We are a B2B SaaS company that provides CRM solutions for small to medium businesses. Our main product helps sales teams automate their outreach while maintaining personalization.'"
            className="w-full min-h-[150px] px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
          />
          <p className="text-[10px] text-slate-400 italic ml-1">
            This helps the AI understand your business context for relevant conversations
          </p>
        </div>
      </div>

      {/* Goals Section */}
      <div className="space-y-6 p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl border border-purple-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-600 rounded-xl">
            <Target size={20} className="text-white" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Goals &amp; Objectives</h4>
            <p className="text-xs text-slate-500">Define goals for your AI and your overall business objectives</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Sparkles size={14} className="text-indigo-500" />
              AI Goals
            </label>
            <Textarea
              value={settings.ai_goals}
              onChange={(e) => handleTextChange("ai_goals", e.target.value)}
              placeholder="What do you want the AI to achieve? E.g., 'Book more discovery calls, qualify leads effectively, maintain a 40% response rate, nurture cold leads back to warm status.'"
              className="w-full min-h-[100px] px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
            <p className="text-[10px] text-slate-400 italic ml-1">
              Specific objectives for your AI assistant to focus on
            </p>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Building2 size={14} className="text-emerald-500" />
              Business Goals
            </label>
            <Textarea
              value={settings.business_goals}
              onChange={(e) => handleTextChange("business_goals", e.target.value)}
              placeholder="What are your business goals? E.g., 'Increase revenue by 30% this quarter, expand into 3 new markets, build a team of 10 sales reps, achieve $1M ARR.'"
              className="w-full min-h-[100px] px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
            <p className="text-[10px] text-slate-400 italic ml-1">
              Your overall business objectives that the AI should support
            </p>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <User size={14} className="text-purple-500" />
              Personal Development Goals
            </label>
            <Textarea
              value={settings.personal_goals}
              onChange={(e) => handleTextChange("personal_goals", e.target.value)}
              placeholder="What are your personal development goals? E.g., 'Improve my sales skills, learn to delegate more effectively, build better work-life balance, become a better leader.'"
              className="w-full min-h-[100px] px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
            <p className="text-[10px] text-slate-400 italic ml-1">
              Personal growth objectives that the AI can help support
            </p>
          </div>
        </div>
      </div>

      {/* Automation Behavior Section */}
      <div className="space-y-6 p-6 bg-gradient-to-br from-orange-50 to-amber-50 rounded-3xl border border-orange-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-orange-600 rounded-xl">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Agynt Behavior</h4>
            <p className="text-xs text-slate-500">Configure how your AI assistant automates tasks</p>
          </div>
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
      </div>

      {/* Response Cadence Section */}
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
            &quot;This setting defines the baseline latency for {settings.ai_name || "AgyntSynq"}&apos;s automated engagement nodes.&quot;
          </p>
        </div>
      </div>

      {/* Outreach Personality Section */}
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

      {/* Bottom Save Button */}
      <div className="flex justify-end pt-6 border-t border-slate-100">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : saveSuccess ? (
            <CheckCircle size={16} />
          ) : (
            <Save size={16} />
          )}
          {saveSuccess ? "Saved!" : "Save All Settings"}
        </button>
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
      className="p-5 bg-white rounded-2xl border border-slate-200 flex items-center justify-between hover:border-orange-200 transition-all group cursor-pointer"
    >
      <div>
        <h4 className="text-sm font-bold text-slate-900 group-hover:text-orange-600 transition-colors">{title}</h4>
        <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
      </div>
      <div
        className={`w-14 h-7 rounded-full relative p-1.5 transition-colors duration-300 shadow-inner ${active ? "bg-orange-500" : "bg-slate-300"}`}
      >
        <div
          className={`w-4 h-4 bg-white rounded-full absolute transition-all duration-300 shadow-sm ${active ? "left-[calc(100%-20px)]" : "left-1.5"}`}
        />
      </div>
    </div>
  )
}

export default AutomationSettings
