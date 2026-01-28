"use client"

import React from "react"

import { useState, useEffect } from "react"
import { 
  Mail, Phone, Globe, Building2, MapPin, Linkedin, Twitter, Instagram, Facebook, Youtube, Share2,
  Smartphone, Gift, Send, Sparkles, RefreshCw, ChevronDown, ChevronUp, Pencil, Check, BrainCircuit, Zap, AlertCircle, User, Users
} from "lucide-react"
import type { Contact } from "@/types"
import { ThorneInsightBox } from "../common/thorne-insight-box"
import { BaseButton } from "@/components/ui/base-button"
import { createClient } from "@/lib/supabase/client"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface TenantUser {
  id: string
  user_id: string
  email: string
  full_name: string | null
  role: "admin" | "user" | "manager" | "director" | "vp" | "it" | "marketing"
  tenant_id: string | null
}

// Extract domain from email address
function extractDomain(email: string | null | undefined): string | null {
  if (!email) return null
  const parts = email.split("@")
  return parts.length === 2 ? parts[1].toLowerCase() : null
}

interface ProfileSectionProps {
  contact: Contact
}

const outreachChannels = [
  { id: "LinkedIn", icon: Linkedin, requiresAddress: false },
  { id: "Email", icon: Mail, requiresAddress: false },
  { id: "SMS", icon: Smartphone, requiresAddress: false },
  { id: "Physical Gift", icon: Gift, requiresAddress: true },
  { id: "Post Card", icon: Send, requiresAddress: true },
  { id: "Direct Visit", icon: MapPin, requiresAddress: true },
]

export function ProfileSection({ contact }: ProfileSectionProps) {
  const [isEditingChannels, setIsEditingChannels] = useState(false)
  const [selectedChannels, setSelectedChannels] = useState<string[]>(["Email", "LinkedIn"])
  const [budget, setBudget] = useState(100)
  const [showStrategy, setShowStrategy] = useState(false)
  const [strategyLoading, setStrategyLoading] = useState(false)
  const [strategy, setStrategy] = useState<string | null>(null)
  
  // User assignment state
  const [teamUsers, setTeamUsers] = useState<TenantUser[]>([])
  const [assignedTo, setAssignedTo] = useState<string | null>((contact as any).assigned_to || null)
  const [showAssignDropdown, setShowAssignDropdown] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(false)
  
  const supabase = createClient()

  // Load team users filtered by contact's company email domain
  useEffect(() => {
    async function loadTeamUsers() {
      setLoadingUsers(true)
      
      // Extract domain from contact's email
      const contactDomain = extractDomain(contact.email)
      
      if (contactDomain) {
        // First, find the tenant that has this domain
        const { data: tenant } = await supabase
          .from("tenants")
          .select("id")
          .eq("domain", contactDomain)
          .single()
        
        if (tenant) {
          // Get users assigned to this tenant
          const { data } = await supabase
            .from("tenant_users")
            .select("id, user_id, email, full_name, role, tenant_id")
            .eq("tenant_id", tenant.id)
            .order("full_name", { ascending: true })
          
          if (data) {
            setTeamUsers(data)
            setLoadingUsers(false)
            return
          }
        }
      }
      
      // Fallback: load all users if no domain match found
      const { data } = await supabase
        .from("tenant_users")
        .select("id, user_id, email, full_name, role, tenant_id")
        .order("full_name", { ascending: true })
      
      if (data) {
        setTeamUsers(data)
      }
      setLoadingUsers(false)
    }
    loadTeamUsers()
  }, [contact.email])

  // Handle assignment change
  async function handleAssignUser(userId: string | null) {
    setAssignedTo(userId)
    setShowAssignDropdown(false)
    
    // Update in database
    await supabase
      .from("contacts")
      .update({ assigned_to: userId })
      .eq("id", contact.id)
  }

  // Check if contact has an address (supports both UI type and DB type)
  const hasAddress = Boolean(
    contact.streetAddress || 
    contact.address || 
    (contact as any).street_address
  )
  
  // Get the assigned user details
  const assignedUser = teamUsers.find(u => u.user_id === assignedTo)

  const toggleChannel = (ch: string) => {
    const channel = outreachChannels.find(c => c.id === ch)
    
    // Prevent selecting physical channels if no address
    if (channel?.requiresAddress && !hasAddress) {
      return
    }
    
    setSelectedChannels(prev => 
      prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch]
    )
  }

  const generateStrategy = async () => {
    setStrategyLoading(true)
    setShowStrategy(true)
    // Simulate AI generation
    await new Promise(r => setTimeout(r, 2000))
    
    const availableChannels = selectedChannels.filter(ch => {
      const channel = outreachChannels.find(c => c.id === ch)
      return !channel?.requiresAddress || hasAddress
    })
    
    setStrategy(`Based on ${contact.firstName}'s profile at ${contact.company || "their company"}:

1. **Initial Contact via ${availableChannels[0] || "Email"}**
   Start with a personalized message referencing their recent activity.

2. **Value-First Approach**
   Share industry insights relevant to their role as ${contact.jobTitle || "a decision maker"}.

3. **Multi-Touch Sequence**
   Plan ${availableChannels.length} touchpoints across ${availableChannels.join(", ")} over 3 weeks.

${hasAddress ? `4. **Physical Touchpoint**
   With address on file, consider a thoughtful gift after the third touchpoint ($${budget} budget).` : `4. **Note: Physical Channels Unavailable**
   Add a mailing address to enable gifts, postcards, and visits.`}

5. **Timing Optimization**
   Best outreach windows: Tuesday-Thursday, 9-11 AM local time.`)
    setStrategyLoading(false)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <ThorneInsightBox 
        insight={`"This contact is showing 'Hot' signals through LinkedIn activity. Suggested next step: ${hasAddress ? "Send a personalized physical gift based on their interests." : "Consider a LinkedIn message or email outreach."}"`} 
      />

      {/* Verified Information */}
      <div className="bg-white border border-slate-200 rounded-[32px] p-6 space-y-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Verified Information</h4>
          <button className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-white hover:text-indigo-600 transition-all">
            Edit
          </button>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-5">
          <InfoItem label="Email" value={contact.email || "Not set"} icon={<Mail size={14} />} />
          <InfoItem label="Phone" value={contact.phone || "Not set"} icon={<Phone size={14} />} />
          <InfoItem label="Company" value={contact.company || "Not set"} icon={<Building2 size={14} />} />
          <InfoItem label="Job Title" value={contact.jobTitle || "Not set"} icon={<Globe size={14} />} />
        </div>

        {/* Assigned To Section */}
        <div className="pt-5 border-t border-slate-100">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Assigned To</h4>
          <div className="relative">
            <button
              onClick={() => setShowAssignDropdown(!showAssignDropdown)}
              className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all"
            >
              <div className="flex items-center gap-3">
                {assignedUser ? (
                  <>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs font-bold">
                        {assignedUser.full_name?.[0] || assignedUser.email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="text-[12px] font-semibold text-slate-800">
                        {assignedUser.full_name || assignedUser.email}
                      </p>
                      <p className="text-[10px] text-slate-500">{assignedUser.role}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center">
                      <User size={14} className="text-slate-400" />
                    </div>
                    <span className="text-[12px] text-slate-500">Unassigned</span>
                  </>
                )}
              </div>
              <ChevronDown size={16} className={`text-slate-400 transition-transform ${showAssignDropdown ? "rotate-180" : ""}`} />
            </button>

            {showAssignDropdown && (
              <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                <div className="p-2 border-b border-slate-100">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <Users size={12} />
                      Team Members
                    </div>
                    {extractDomain(contact.email) && (
                      <span className="text-[9px] font-medium text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">
                        @{extractDomain(contact.email)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="max-h-[200px] overflow-y-auto">
                  {/* Unassign option */}
                  <button
                    onClick={() => handleAssignUser(null)}
                    className={`w-full flex items-center gap-3 p-3 hover:bg-slate-50 transition-all ${!assignedTo ? "bg-indigo-50" : ""}`}
                  >
                    <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center">
                      <User size={14} className="text-slate-400" />
                    </div>
                    <span className="text-[12px] text-slate-600">Unassigned</span>
                    {!assignedTo && <Check size={14} className="ml-auto text-indigo-600" />}
                  </button>
                  
                  {/* Team users */}
                  {teamUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleAssignUser(user.user_id)}
                      className={`w-full flex items-center gap-3 p-3 hover:bg-slate-50 transition-all ${assignedTo === user.user_id ? "bg-indigo-50" : ""}`}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs font-bold">
                          {user.full_name?.[0] || user.email[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left flex-1">
                        <p className="text-[12px] font-medium text-slate-800">
                          {user.full_name || user.email}
                        </p>
                        <p className="text-[10px] text-slate-500">{user.email}</p>
                      </div>
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        user.role === "admin" ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-600"
                      }`}>
                        {user.role}
                      </span>
                      {assignedTo === user.user_id && <Check size={14} className="text-indigo-600" />}
                    </button>
                  ))}
                  
                  {teamUsers.length === 0 && !loadingUsers && (
                    <div className="p-4 text-center text-[11px] text-slate-500">
                      {extractDomain(contact.email) 
                        ? `No team members assigned to @${extractDomain(contact.email)}. Add users in Admin Center.`
                        : "No team members found. Add users in Admin Center."}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Address Section */}
        <div className="pt-5 border-t border-slate-100">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Address</h4>
          {hasAddress ? (
            <div className="flex items-start gap-3">
              <MapPin size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
              <p className="text-[12px] font-medium text-slate-700">
                {contact.streetAddress || contact.address || (contact as any).street_address}
                {contact.city && `, ${contact.city}`}
                {contact.state && `, ${contact.state}`}
                {contact.zipCode && ` ${contact.zipCode}`}
                {contact.country && `, ${contact.country}`}
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
              <AlertCircle size={14} className="text-amber-500 flex-shrink-0" />
              <p className="text-[11px] text-amber-700">
                No address on file. Add an address to enable direct mail, gifts, and visits.
              </p>
            </div>
          )}
        </div>

        {/* Social Media */}
        <div className="pt-5 border-t border-slate-100">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Social Media</h4>
          <div className="grid grid-cols-3 gap-3">
            <SocialIcon icon={<Linkedin size={16} className="text-blue-600" />} label="LinkedIn" />
            <SocialIcon icon={<Twitter size={16} className="text-slate-900" />} label="Twitter" />
            <SocialIcon icon={<Instagram size={16} className="text-pink-600" />} label="Instagram" />
            <SocialIcon icon={<Facebook size={16} className="text-indigo-600" />} label="Facebook" />
            <SocialIcon icon={<Youtube size={16} className="text-rose-600" />} label="Youtube" />
            <SocialIcon icon={<Share2 size={16} className="text-slate-800" />} label="TikTok" />
          </div>
        </div>
      </div>

      {/* Outreach Channels - Editable */}
      <div className="bg-white border border-slate-200 rounded-[32px] p-6 space-y-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Outreach Channels</h4>
          <button 
            onClick={() => setIsEditingChannels(!isEditingChannels)}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 ${
              isEditingChannels 
                ? "bg-indigo-600 text-white" 
                : "bg-slate-50 border border-slate-200 text-slate-500 hover:bg-white hover:text-indigo-600"
            }`}
          >
            {isEditingChannels ? <Check size={12} /> : <Pencil size={12} />}
            {isEditingChannels ? "Done" : "Edit"}
          </button>
        </div>

        {!hasAddress && (
          <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-100 rounded-xl">
            <AlertCircle size={14} className="text-slate-400 flex-shrink-0" />
            <p className="text-[10px] text-slate-500">
              Physical channels (gifts, postcards, visits) disabled - no address on file
            </p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          {outreachChannels.map(ch => {
            const isDisabled = ch.requiresAddress && !hasAddress
            const isSelected = selectedChannels.includes(ch.id)
            
            return (
              <button
                key={ch.id}
                onClick={() => isEditingChannels && toggleChannel(ch.id)}
                disabled={!isEditingChannels || isDisabled}
                title={isDisabled ? "Add address to enable this channel" : undefined}
                className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all relative ${
                  isDisabled
                    ? "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed opacity-50"
                    : isSelected
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-lg"
                      : isEditingChannels
                        ? "bg-white text-slate-400 border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/30 cursor-pointer"
                        : "bg-slate-50 text-slate-300 border-slate-100"
                }`}
              >
                <ch.icon size={18} />
                <span className="text-[9px] font-bold uppercase tracking-wider">{ch.id}</span>
                {isDisabled && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center">
                    <AlertCircle size={10} className="text-white" />
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Budget Slider */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Budget Limit</span>
            <span className="text-lg font-bold text-indigo-600">${budget}</span>
          </div>
          <input 
            type="range" 
            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
            min="10" 
            max="500" 
            step="5"
            value={budget} 
            onChange={e => setBudget(parseInt(e.target.value))}
            disabled={!isEditingChannels}
          />
          <div className="flex justify-between text-[9px] font-bold text-slate-300 uppercase tracking-widest">
            <span>$10</span>
            <span>$500</span>
          </div>
        </div>
      </div>

      {/* AI Strategy Section */}
      <div className="bg-slate-900 rounded-[32px] p-6 text-white relative overflow-hidden shadow-xl">
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
              <Sparkles size={18} className="text-indigo-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold tracking-tight">Thorne AI Strategy</h4>
              <p className="text-[10px] text-indigo-300 font-medium">Personalized outreach plan</p>
            </div>
          </div>
          <button 
            onClick={() => setShowStrategy(!showStrategy)}
            className="p-2 hover:bg-white/10 rounded-xl transition-all text-slate-400"
          >
            {showStrategy ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>

        {!showStrategy && !strategy && (
          <BaseButton 
            variant="primary" 
            className="w-full mt-2"
            onClick={generateStrategy}
          >
            <Sparkles size={16} className="mr-2" />
            Generate Strategy
          </BaseButton>
        )}

        {showStrategy && (
          <div className="relative z-10 animate-in slide-in-from-top-4 duration-300">
            {strategyLoading ? (
              <div className="space-y-3 animate-pulse py-4">
                <div className="h-2 bg-white/10 rounded-full w-full" />
                <div className="h-2 bg-white/10 rounded-full w-[90%]" />
                <div className="h-2 bg-white/10 rounded-full w-[95%]" />
                <div className="h-2 bg-white/10 rounded-full w-[70%]" />
              </div>
            ) : (
              <>
                <div className="prose prose-invert max-w-none">
                  <p className="text-slate-300 leading-relaxed text-xs whitespace-pre-wrap font-medium">
                    {strategy}
                  </p>
                </div>
                <div className="flex gap-2 mt-4">
                  <button 
                    onClick={generateStrategy}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-lg text-[10px] font-bold text-indigo-300 hover:bg-white/20 transition-all"
                  >
                    <RefreshCw size={12} /> Regenerate
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        <BrainCircuit className="absolute right-[-20px] bottom-[-20px] opacity-[0.03] w-32 h-32 text-white pointer-events-none" />
        <Zap className="absolute left-[-10px] top-1/2 -translate-y-1/2 opacity-[0.02] w-24 h-24 text-white pointer-events-none" />
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <BaseButton variant="secondary" className="py-3 rounded-[20px] font-black text-[10px] uppercase tracking-widest w-full">
          Download VCF
        </BaseButton>
        <BaseButton variant="outline" className="py-3 rounded-[20px] font-black text-[10px] uppercase tracking-widest w-full">
          Share Node
        </BaseButton>
      </div>
    </div>
  )
}

function InfoItem({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="space-y-1 group cursor-pointer">
      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.1em]">{label}</p>
      <p className="text-[12px] font-semibold text-slate-800 flex items-center gap-2 transition-colors group-hover:text-indigo-600">
        <span className="text-slate-300 group-hover:text-indigo-400 transition-colors">{icon}</span>
        {value}
      </p>
    </div>
  )
}

function SocialIcon({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="p-3 bg-slate-50 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-100 transition-all group">
      {icon}
      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider group-hover:text-slate-700">{label}</span>
    </button>
  )
}
