"use client"

import { useState, useEffect } from "react"
import { X, Search, Users, Shield, ChevronRight, Activity, Trash2, Network, Plus, Building2, Code, Megaphone } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { createClient } from "@/lib/supabase/client"

// Role hierarchy and icons
const ROLES = [
  { id: "user", label: "User", icon: Users, color: "bg-slate-500" },
  { id: "manager", label: "Manager", icon: Building2, color: "bg-blue-500" },
  { id: "director", label: "Director", icon: Shield, color: "bg-violet-500" },
  { id: "vp", label: "VP", icon: Shield, color: "bg-emerald-500" },
  { id: "it", label: "IT", icon: Code, color: "bg-cyan-500" },
  { id: "marketing", label: "Marketing", icon: Megaphone, color: "bg-rose-500" },
] as const

type RoleType = "admin" | "vp" | "director" | "manager" | "user" | "it" | "marketing"

// Reporting rules based on hierarchy
const VALID_REPORTS_TO: Record<RoleType, RoleType[]> = {
  user: ["manager", "director", "vp", "admin"],
  manager: ["director", "vp", "admin"],
  director: ["vp", "admin"],
  vp: ["admin"],
  it: ["admin"],
  marketing: ["manager", "director", "vp", "admin"],
  admin: [],
}

// Feature access toggles
const FEATURES = [
  { id: "dashboard", label: "Dashboard", icon: "grid" },
  { id: "contacts", label: "Contacts", icon: "users" },
  { id: "ai_command", label: "AI Command", icon: "brain" },
  { id: "conversations", label: "Conversations", icon: "message" },
  { id: "analytics", label: "Analytics", icon: "chart" },
  { id: "academy", label: "Academy", icon: "book" },
  { id: "creative", label: "Creative", icon: "palette" },
]

interface TeamMember {
  id: string
  user_id: string
  email: string
  full_name: string | null
  role: RoleType
  reports_to: string | null
  features: string[]
  joined_at: string
}

interface AdminCenterProps {
  onClose: () => void
}

export function AdminCenter({ onClose }: AdminCenterProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRole, setSelectedRole] = useState<RoleType | "all">("all")
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    loadTeamMembers()
  }, [])

  async function loadTeamMembers() {
    setLoading(true)
    const { data } = await supabase
      .from("tenant_users")
      .select("*")
      .order("full_name", { ascending: true })

    if (data) {
      setTeamMembers(data.map(m => ({
        ...m,
        features: m.features || ["dashboard"]
      })))
    }
    setLoading(false)
  }

  async function updateMemberRole(memberId: string, newRole: RoleType) {
    await supabase
      .from("tenant_users")
      .update({ role: newRole, reports_to: null }) // Reset reports_to when role changes
      .eq("id", memberId)

    setTeamMembers(prev => prev.map(m => 
      m.id === memberId ? { ...m, role: newRole, reports_to: null } : m
    ))
    if (selectedMember?.id === memberId) {
      setSelectedMember(prev => prev ? { ...prev, role: newRole, reports_to: null } : null)
    }
  }

  async function updateReportsTo(memberId: string, reportsToId: string | null) {
    await supabase
      .from("tenant_users")
      .update({ reports_to: reportsToId })
      .eq("id", memberId)

    setTeamMembers(prev => prev.map(m => 
      m.id === memberId ? { ...m, reports_to: reportsToId } : m
    ))
    if (selectedMember?.id === memberId) {
      setSelectedMember(prev => prev ? { ...prev, reports_to: reportsToId } : null)
    }
  }

  async function toggleFeature(memberId: string, featureId: string) {
    const member = teamMembers.find(m => m.id === memberId)
    if (!member) return

    const newFeatures = member.features.includes(featureId)
      ? member.features.filter(f => f !== featureId)
      : [...member.features, featureId]

    await supabase
      .from("tenant_users")
      .update({ features: newFeatures })
      .eq("id", memberId)

    setTeamMembers(prev => prev.map(m => 
      m.id === memberId ? { ...m, features: newFeatures } : m
    ))
    if (selectedMember?.id === memberId) {
      setSelectedMember(prev => prev ? { ...prev, features: newFeatures } : null)
    }
  }

  async function deleteMember(memberId: string) {
    await supabase
      .from("tenant_users")
      .delete()
      .eq("id", memberId)

    setTeamMembers(prev => prev.filter(m => m.id !== memberId))
    setSelectedMember(null)
  }

  // Quick-add a new user with a specific role
  async function quickAddUser(role: RoleType) {
    const timestamp = Date.now()
    const email = `user-${timestamp}@thorne.ai`
    
    const { data, error } = await supabase
      .from("tenant_users")
      .insert({
        user_id: crypto.randomUUID(),
        email,
        full_name: null,
        role,
        features: ["dashboard"],
      })
      .select()
      .single()

    if (data && !error) {
      const newMember: TeamMember = {
        ...data,
        features: data.features || ["dashboard"]
      }
      setTeamMembers(prev => [...prev, newMember])
      setSelectedMember(newMember)
    }
  }

  // Get valid supervisors for a member based on their role
  function getValidSupervisors(member: TeamMember): TeamMember[] {
    const validRoles = VALID_REPORTS_TO[member.role]
    return teamMembers.filter(m => 
      m.id !== member.id && validRoles.includes(m.role)
    )
  }

  // Filter members by search and role
  const filteredMembers = teamMembers.filter(m => {
    const matchesSearch = !searchQuery || 
      m.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = selectedRole === "all" || m.role === selectedRole
    return matchesSearch && matchesRole
  })

  // Get role display info
  function getRoleInfo(role: RoleType) {
    const roleConfig = ROLES.find(r => r.id === role)
    return {
      label: role === "admin" ? "Admin" : roleConfig?.label || role,
      color: role === "admin" ? "bg-indigo-500" : roleConfig?.color || "bg-slate-500",
      textColor: role === "admin" ? "text-indigo-500" : 
        role === "vp" ? "text-emerald-500" :
        role === "director" ? "text-violet-500" :
        role === "manager" ? "text-blue-500" :
        role === "it" ? "text-cyan-500" :
        role === "marketing" ? "text-rose-500" : "text-slate-500"
    }
  }

  // Get supervisor name
  function getSupervisorName(reportsToId: string | null): string {
    if (!reportsToId) return "Root (Admin)"
    const supervisor = teamMembers.find(m => m.id === reportsToId)
    return supervisor?.full_name || supervisor?.email || "Unknown"
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-5xl max-h-[85vh] bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300">
        {/* Dark Header */}
        <div className="bg-slate-900 px-8 py-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">ADMIN CENTER</h2>
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] mt-1">
                Governance & Capability Management
              </p>
            </div>
            
            {/* Role Filter Tabs */}
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-slate-700 transition-all">
                <Shield size={14} />
                Audit Logs
              </button>
            </div>
          </div>

          {/* Quick Add User Buttons */}
          <div className="mt-6">
            <div className="flex items-center gap-3 mb-3">
              <Plus size={14} className="text-indigo-400" />
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.15em]">Add User</span>
            </div>
            <div className="flex items-center gap-2">
              {ROLES.map(role => (
                <button
                  key={role.id}
                  onClick={() => quickAddUser(role.id as RoleType)}
                  className="px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2 bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white group"
                >
                  <role.icon size={14} className="group-hover:text-indigo-400 transition-colors" />
                  {role.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Team Members List */}
          <div className="w-80 border-r border-slate-100 flex flex-col bg-slate-50/50">
            {/* Search */}
            <div className="p-4 border-b border-slate-100">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search team members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
                />
              </div>
            </div>

            {/* Members List */}
            <div className="flex-1 overflow-y-auto">
              {filteredMembers.map(member => {
                const roleInfo = getRoleInfo(member.role)
                return (
                  <button
                    key={member.id}
                    onClick={() => setSelectedMember(member)}
                    className={`w-full flex items-center gap-3 p-4 border-b border-slate-100 hover:bg-white transition-all text-left ${
                      selectedMember?.id === member.id ? "bg-white shadow-sm" : ""
                    }`}
                  >
                    <Avatar className={`h-10 w-10 ${roleInfo.color}`}>
                      <AvatarFallback className="text-white font-bold text-sm">
                        {(member.full_name?.[0] || member.email[0]).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {member.full_name || member.email.split("@")[0]}
                      </p>
                      <p className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${roleInfo.textColor}`}>
                        {member.role === "admin" && <Shield size={10} />}
                        {member.role === "it" && <Network size={10} />}
                        {member.role === "marketing" && <Activity size={10} />}
                        {roleInfo.label}
                      </p>
                    </div>
                    <ChevronRight size={16} className="text-slate-300" />
                  </button>
                )
              })}

              {filteredMembers.length === 0 && !loading && (
                <div className="p-8 text-center">
                  <p className="text-sm text-slate-500">No team members found</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Member Details or Empty State */}
          <div className="flex-1 overflow-y-auto p-8">
            {selectedMember ? (
              <div className="space-y-8">
                {/* Member Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className={`h-16 w-16 ${getRoleInfo(selectedMember.role).color}`}>
                      <AvatarFallback className="text-white font-bold text-2xl">
                        {(selectedMember.full_name?.[0] || selectedMember.email[0]).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                        {selectedMember.full_name || "New User Node"}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">{selectedMember.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteMember(selectedMember.id)}
                    className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {/* Role Selection */}
                <div className="flex flex-wrap gap-2">
                  {["admin", "vp", "director", "manager", "user", "it", "marketing"].map(role => (
                    <button
                      key={role}
                      onClick={() => updateMemberRole(selectedMember.id, role as RoleType)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${
                        selectedMember.role === role
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>

                {/* Reporting Chain Assignment */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-slate-400" />
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      Reporting Chain Assignment
                    </h4>
                  </div>

                  <div className="flex gap-4">
                    {/* Current Supervisor */}
                    <div className="flex-1 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Reporting To</p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                          <Shield size={18} className="text-indigo-600" />
                        </div>
                        <span className="text-sm font-bold text-slate-700">
                          {getSupervisorName(selectedMember.reports_to)}
                        </span>
                      </div>
                    </div>

                    {/* Assign New Supervisor */}
                    <div className="flex-1">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Assign New Supervisor
                      </p>
                      <select
                        value={selectedMember.reports_to || ""}
                        onChange={(e) => updateReportsTo(selectedMember.id, e.target.value || null)}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      >
                        <option value="">Assign to Admin (Root)</option>
                        {getValidSupervisors(selectedMember).map(sup => (
                          <option key={sup.id} value={sup.id}>
                            {sup.full_name || sup.email} ({sup.role})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 italic">
                    * Hierarchical rule: {selectedMember.full_name || "This user"} is a {selectedMember.role}. They report to a higher rank node.
                  </p>
                </div>

                {/* Accessibility Node Toggles */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Settings size={16} className="text-slate-400" />
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      Accessibility Node Toggles
                    </h4>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {FEATURES.map(feature => (
                      <div
                        key={feature.id}
                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                          selectedMember.features.includes(feature.id)
                            ? "bg-white border-indigo-200 shadow-sm"
                            : "bg-slate-50 border-slate-100"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            selectedMember.features.includes(feature.id)
                              ? "bg-indigo-100 text-indigo-600"
                              : "bg-slate-200 text-slate-400"
                          }`}>
                            <Settings size={14} />
                          </div>
                          <span className={`text-xs font-bold uppercase tracking-wider ${
                            selectedMember.features.includes(feature.id)
                              ? "text-slate-900"
                              : "text-slate-400"
                          }`}>
                            {feature.label}
                          </span>
                        </div>
                        <Switch
                          checked={selectedMember.features.includes(feature.id)}
                          onCheckedChange={() => toggleFeature(selectedMember.id, feature.id)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Empty State */
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                  <Activity size={40} className="text-slate-300" />
                </div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">
                  Enterprise Governance
                </h3>
                <p className="text-sm text-slate-500 max-w-sm mb-6">
                  Provision new team nodes or audit global access across management, IT, and marketing layers.
                </p>
                <button className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-2">
                  <Users size={16} />
                  Browse Global Team
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-all"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  )
}

// Need to import Settings for the feature icons
import { Settings } from "lucide-react"
