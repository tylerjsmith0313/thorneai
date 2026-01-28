"use client"

import { Save, User, Mail, Building2, Phone, Briefcase } from "lucide-react"
import { BaseButton } from "@/components/ui/base-button"
import { BaseInput } from "@/components/ui/base-input"

export function UserSettings() {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Account Details</h3>
          <p className="text-sm text-slate-500 mt-1">Manage your identity within the Thorne ecosystem.</p>
        </div>
        <BaseButton variant="primary" icon={<Save size={18} />}>Save Changes</BaseButton>
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
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Office Phone</label>
          <BaseInput type="tel" placeholder="+1 (555) 000-0000" icon={<Phone size={16} />} />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Cell Phone</label>
          <BaseInput type="tel" placeholder="+1 (555) 000-0000" icon={<Phone size={16} />} />
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
    </div>
  )
}

export default UserSettings
