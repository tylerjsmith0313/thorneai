"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Settings,
  Users,
  CreditCard,
  Shield,
  Building2,
  Mail,
  UserPlus,
  Trash2,
  Crown,
  ArrowLeft,
  Check,
  X,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { SUBSCRIPTION_PLANS, formatPrice, getPlanById } from "@/lib/subscription-products"
import { createBillingPortalSession, updateSubscriptionSeats } from "@/app/actions/stripe"

interface TenantUser {
  id: string
  email: string
  full_name: string | null
  role: "admin" | "user"
  is_owner: boolean
  joined_at: string
  last_active_at: string | null
}

interface Tenant {
  id: string
  name: string
  slug: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  subscription_status: string
  plan: string
  seat_count: number
  max_seats: number
  settings: Record<string, any>
}

interface Invitation {
  id: string
  email: string
  role: "admin" | "user"
  expires_at: string
  created_at: string
}

export function AdminSettingsClient() {
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [users, setUsers] = useState<TenantUser[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("organization")
  
  // Invite modal state
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<"admin" | "user">("user")
  const [inviting, setInviting] = useState(false)
  
  // Settings state
  const [tenantName, setTenantName] = useState("")
  const [savingSettings, setSavingSettings] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    
    // Load tenant
    const { data: tenantData } = await supabase
      .from("tenants")
      .select("*")
      .limit(1)
      .single()
    
    if (tenantData) {
      setTenant(tenantData)
      setTenantName(tenantData.name)
    }

    // Load users
    const { data: usersData } = await supabase
      .from("tenant_users")
      .select("*")
      .order("is_owner", { ascending: false })
      .order("role", { ascending: true })
      .order("joined_at", { ascending: true })
    
    if (usersData) {
      setUsers(usersData)
    }

    // Load pending invitations
    const { data: invitesData } = await supabase
      .from("invitations")
      .select("*")
      .is("accepted_at", null)
      .order("created_at", { ascending: false })
    
    if (invitesData) {
      setInvitations(invitesData)
    }

    setLoading(false)
  }

  async function handleSaveOrganization() {
    if (!tenant) return
    setSavingSettings(true)
    
    await supabase
      .from("tenants")
      .update({ name: tenantName, updated_at: new Date().toISOString() })
      .eq("id", tenant.id)
    
    setTenant({ ...tenant, name: tenantName })
    setSavingSettings(false)
  }

  async function handleInviteUser() {
    if (!tenant || !inviteEmail.trim()) return
    setInviting(true)

    // Check seat limit
    const totalUsers = users.length + invitations.length
    if (totalUsers >= tenant.max_seats) {
      alert("You've reached your seat limit. Please upgrade your plan to add more users.")
      setInviting(false)
      return
    }

    const { error } = await supabase.from("invitations").insert({
      tenant_id: tenant.id,
      email: inviteEmail.toLowerCase().trim(),
      role: inviteRole,
      invited_by: "00000000-0000-0000-0000-000000000000", // Preview user
    })

    if (error) {
      console.error("[v0] Failed to create invitation:", error)
      alert("Failed to send invitation. The email may already be invited.")
    } else {
      setShowInviteModal(false)
      setInviteEmail("")
      setInviteRole("user")
      loadData()
    }
    setInviting(false)
  }

  async function handleRevokeInvitation(invitationId: string) {
    await supabase.from("invitations").delete().eq("id", invitationId)
    setInvitations(invitations.filter((i) => i.id !== invitationId))
  }

  async function handleUpdateUserRole(userId: string, newRole: "admin" | "user") {
    await supabase
      .from("tenant_users")
      .update({ role: newRole })
      .eq("id", userId)
    
    setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)))
  }

  async function handleRemoveUser(userId: string) {
    if (!confirm("Are you sure you want to remove this user?")) return
    
    await supabase.from("tenant_users").delete().eq("id", userId)
    setUsers(users.filter((u) => u.id !== userId))
  }

  async function handleManageBilling() {
    if (!tenant?.stripe_customer_id) return
    
    const result = await createBillingPortalSession(
      tenant.stripe_customer_id,
      window.location.href
    )
    
    if (result.url) {
      window.location.href = result.url
    }
  }

  const plan = tenant ? getPlanById(tenant.plan) : null
  const usedSeats = users.length
  const pendingSeats = invitations.length

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft size={16} />
                Back to Dashboard
              </Button>
            </Link>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-violet-100 flex items-center justify-center">
                <Settings className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-slate-900">Admin Settings</h1>
                <p className="text-sm text-slate-500">{tenant?.name || "Organization"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border border-slate-200 p-1">
            <TabsTrigger value="organization" className="gap-2">
              <Building2 size={16} />
              Organization
            </TabsTrigger>
            <TabsTrigger value="team" className="gap-2">
              <Users size={16} />
              Team Members
            </TabsTrigger>
            <TabsTrigger value="permissions" className="gap-2">
              <Shield size={16} />
              Permissions
            </TabsTrigger>
            <TabsTrigger value="billing" className="gap-2">
              <CreditCard size={16} />
              Billing
            </TabsTrigger>
          </TabsList>

          {/* Organization Tab */}
          <TabsContent value="organization" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Organization Details</CardTitle>
                <CardDescription>
                  Manage your organization's basic information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="org-name">Organization Name</Label>
                    <Input
                      id="org-name"
                      value={tenantName}
                      onChange={(e) => setTenantName(e.target.value)}
                      placeholder="Your Company Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Organization Slug</Label>
                    <Input value={tenant?.slug || ""} disabled className="bg-slate-50" />
                    <p className="text-xs text-slate-500">
                      Used in URLs and cannot be changed
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleSaveOrganization}
                  disabled={savingSettings || tenantName === tenant?.name}
                >
                  {savingSettings ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Members Tab */}
          <TabsContent value="team" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>
                    {usedSeats} of {tenant?.max_seats} seats used
                    {pendingSeats > 0 && ` (${pendingSeats} pending)`}
                  </CardDescription>
                </div>
                <Button onClick={() => setShowInviteModal(true)} className="gap-2">
                  <UserPlus size={16} />
                  Invite Member
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-violet-100 text-violet-700">
                            {user.full_name?.[0] || user.email[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-900">
                              {user.full_name || user.email}
                            </span>
                            {user.is_owner && (
                              <Badge variant="secondary" className="gap-1 text-amber-700 bg-amber-50">
                                <Crown size={12} />
                                Owner
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {!user.is_owner && (
                          <>
                            <Select
                              value={user.role}
                              onValueChange={(v) => handleUpdateUserRole(user.id, v as "admin" | "user")}
                            >
                              <SelectTrigger className="w-28">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="user">User</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleRemoveUser(user.id)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </>
                        )}
                        {user.is_owner && (
                          <Badge className="bg-violet-100 text-violet-700">Admin</Badge>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Pending Invitations */}
                  {invitations.length > 0 && (
                    <div className="pt-4 border-t border-slate-200 mt-4">
                      <h4 className="text-sm font-medium text-slate-700 mb-3">
                        Pending Invitations
                      </h4>
                      {invitations.map((invite) => (
                        <div
                          key={invite.id}
                          className="flex items-center justify-between p-4 bg-amber-50 rounded-lg mb-2"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-amber-100 text-amber-700">
                                <Mail size={16} />
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <span className="font-medium text-slate-900">
                                {invite.email}
                              </span>
                              <p className="text-sm text-amber-600">
                                Invitation pending - expires{" "}
                                {new Date(invite.expires_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">{invite.role}</Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleRevokeInvitation(invite.id)}
                            >
                              <X size={16} />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Permissions Tab */}
          <TabsContent value="permissions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Visibility Settings</CardTitle>
                <CardDescription>
                  Control what data users can see and access
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <div>
                    <p className="font-medium text-slate-900">
                      Users can see all contacts
                    </p>
                    <p className="text-sm text-slate-500">
                      Allow users to view contacts assigned to other team members
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <div>
                    <p className="font-medium text-slate-900">
                      Users can see all deals
                    </p>
                    <p className="text-sm text-slate-500">
                      Allow users to view deals created by other team members
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <div>
                    <p className="font-medium text-slate-900">
                      Users can export data
                    </p>
                    <p className="text-sm text-slate-500">
                      Allow users to export contacts and deals to CSV
                    </p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-slate-900">
                      Users can delete records
                    </p>
                    <p className="text-sm text-slate-500">
                      Allow users to delete contacts and deals they own
                    </p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Role Permissions</CardTitle>
                <CardDescription>
                  Overview of what each role can do
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-4 bg-violet-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="h-5 w-5 text-violet-600" />
                      <h4 className="font-semibold text-violet-900">Admin</h4>
                    </div>
                    <ul className="space-y-2 text-sm text-violet-800">
                      <li className="flex items-center gap-2">
                        <Check size={14} /> Manage organization settings
                      </li>
                      <li className="flex items-center gap-2">
                        <Check size={14} /> Invite and remove team members
                      </li>
                      <li className="flex items-center gap-2">
                        <Check size={14} /> Change user roles
                      </li>
                      <li className="flex items-center gap-2">
                        <Check size={14} /> Manage billing and subscription
                      </li>
                      <li className="flex items-center gap-2">
                        <Check size={14} /> Access all data
                      </li>
                      <li className="flex items-center gap-2">
                        <Check size={14} /> Configure integrations
                      </li>
                    </ul>
                  </div>
                  <div className="p-4 bg-slate-100 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="h-5 w-5 text-slate-600" />
                      <h4 className="font-semibold text-slate-900">User</h4>
                    </div>
                    <ul className="space-y-2 text-sm text-slate-700">
                      <li className="flex items-center gap-2">
                        <Check size={14} /> View assigned contacts
                      </li>
                      <li className="flex items-center gap-2">
                        <Check size={14} /> Create and manage own deals
                      </li>
                      <li className="flex items-center gap-2">
                        <Check size={14} /> Use Thorne AI assistant
                      </li>
                      <li className="flex items-center gap-2">
                        <Check size={14} /> Send messages and emails
                      </li>
                      <li className="flex items-center gap-2">
                        <X size={14} className="text-red-500" /> Cannot manage team
                      </li>
                      <li className="flex items-center gap-2">
                        <X size={14} className="text-red-500" /> Cannot access billing
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>
                  Manage your subscription and billing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-start justify-between p-6 bg-gradient-to-r from-violet-50 to-indigo-50 rounded-xl">
                  <div>
                    <Badge className="mb-2 bg-violet-600">{plan?.name || "Starter"}</Badge>
                    <h3 className="text-2xl font-bold text-slate-900">
                      {formatPrice((plan?.pricePerSeatCents || 0) * (tenant?.seat_count || 1))}
                      <span className="text-base font-normal text-slate-500">/month</span>
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
                      {formatPrice(plan?.pricePerSeatCents || 0)} per seat x {tenant?.seat_count || 1} seats
                    </p>
                    <div className="mt-4 flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={
                          tenant?.subscription_status === "active"
                            ? "text-emerald-600 border-emerald-200 bg-emerald-50"
                            : "text-amber-600 border-amber-200 bg-amber-50"
                        }
                      >
                        {tenant?.subscription_status || "trialing"}
                      </Badge>
                    </div>
                  </div>
                  <Button onClick={handleManageBilling} variant="outline">
                    Manage Billing
                  </Button>
                </div>

                <div className="mt-6">
                  <h4 className="font-medium text-slate-900 mb-3">Plan Features</h4>
                  <ul className="grid md:grid-cols-2 gap-2">
                    {plan?.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-slate-600">
                        <Check size={16} className="text-emerald-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Available Plans</CardTitle>
                <CardDescription>
                  Upgrade or downgrade your subscription
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {SUBSCRIPTION_PLANS.map((p) => (
                    <div
                      key={p.id}
                      className={`p-4 rounded-lg border-2 ${
                        p.id === tenant?.plan
                          ? "border-violet-500 bg-violet-50"
                          : "border-slate-200"
                      }`}
                    >
                      <h4 className="font-semibold text-slate-900">{p.name}</h4>
                      <p className="text-2xl font-bold mt-1">
                        {formatPrice(p.pricePerSeatCents)}
                        <span className="text-sm font-normal text-slate-500">
                          /seat/mo
                        </span>
                      </p>
                      <p className="text-sm text-slate-500 mt-1">
                        Up to {p.maxSeats} seats
                      </p>
                      {p.id === tenant?.plan ? (
                        <Badge className="mt-3 bg-violet-600">Current Plan</Badge>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3 w-full bg-transparent"
                          onClick={handleManageBilling}
                        >
                          {(p.pricePerSeatCents > (plan?.pricePerSeatCents || 0))
                            ? "Upgrade"
                            : "Downgrade"}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Invite Modal */}
      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an invitation to join your organization
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email Address</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-role">Role</Label>
              <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as "admin" | "user")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User - Can manage their assigned contacts</SelectItem>
                  <SelectItem value="admin">Admin - Full access to all settings</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {usedSeats + pendingSeats >= (tenant?.max_seats || 0) && (
              <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                You've reached your seat limit. Upgrade your plan to invite more team members.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleInviteUser}
              disabled={inviting || !inviteEmail.trim() || usedSeats + pendingSeats >= (tenant?.max_seats || 0)}
            >
              {inviting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
