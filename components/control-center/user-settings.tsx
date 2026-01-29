"use client"

import { useState, useEffect } from "react"
import { Save, User, Mail, Building2, Briefcase, Loader2, CheckCircle } from "lucide-react"
import { BaseButton } from "@/components/ui/base-button"
import { BaseInput } from "@/components/ui/base-input"
import { createClient } from "@/lib/supabase/client"

export function UserSettings() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    company: "",
    job_title: "",
  })

  useEffect(() => {
    async function loadUserData() {
      const supabase = createClient()
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setIsLoading(false)
        return
      }
      
      setUserId(user.id)
      
      // Get user profile from users table
      const { data: userData } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single()
      
      if (userData) {
        setFormData({
          first_name: userData.first_name || "",
          last_name: userData.last_name || "",
          email: userData.email || user.email || "",
          company: userData.company || "",
          job_title: userData.job_title || "",
        })
      } else {
        setFormData(prev => ({ ...prev, email: user.email || "" }))
      }
      
      setIsLoading(false)
    }
    
    loadUserData()
  }, [])

  const handleSave = async () => {
    if (!userId) return
    
    setIsSaving(true)
    setSaveSuccess(false)
    
    const supabase = createClient()
    
    // Upsert users table (creates if not exists, updates if exists)
    const { error } = await supabase
      .from("users")
      .upsert({
        id: userId,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        company: formData.company,
        job_title: formData.job_title,
        updated_at: new Date().toISOString(),
      }, { onConflict: "id" })
    
    if (error) {
      console.error("[v0] Error saving user settings:", error)
    } else {
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    }
    
    setIsSaving(false)
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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
        <div>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">ACCOUNT DETAILS</h3>
          <p className="text-sm text-slate-500 mt-1">"Manage your personal digital signature within the Thorne Core."</p>
        </div>
        <BaseButton 
          variant="primary" 
          icon={isSaving ? <Loader2 size={18} className="animate-spin" /> : saveSuccess ? <CheckCircle size={18} /> : <Save size={18} />}
          onClick={handleSave}
          disabled={isSaving}
        >
          {saveSuccess ? "SAVED!" : "SAVE CHANGES"}
        </BaseButton>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">First Name</label>
          <BaseInput 
            value={formData.first_name} 
            onChange={(e) => handleChange("first_name", e.target.value)}
            placeholder="Enter first name"
            icon={<User size={16} />} 
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
          <BaseInput 
            value={formData.last_name} 
            onChange={(e) => handleChange("last_name", e.target.value)}
            placeholder="Enter last name"
            icon={<User size={16} />} 
          />
        </div>
        <div className="col-span-2 space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
          <BaseInput 
            type="email" 
            value={formData.email} 
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="Enter email address"
            icon={<Mail size={16} />} 
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Company</label>
          <BaseInput 
            value={formData.company} 
            onChange={(e) => handleChange("company", e.target.value)}
            placeholder="Enter company name"
            icon={<Building2 size={16} />} 
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Job Title</label>
          <BaseInput 
            value={formData.job_title} 
            onChange={(e) => handleChange("job_title", e.target.value)}
            placeholder="Enter job title"
            icon={<Briefcase size={16} />} 
          />
        </div>
      </div>

    </div>
  )
}

export default UserSettings
