"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  LayoutDashboard,
  CalendarDays,
  Settings,
  Sparkles,
  CreditCard,
  LogOut,
  ChevronRight,
  Search,
  Bell,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EventCard, type Event } from "@/components/event-card"
import { createClient } from "@/lib/supabase/client"

type NavItem = "dashboard" | "events" | "settings"

interface User {
  id: string
  email: string
  username: string
  avatarUrl?: string | null
}

interface CalendarDashboardProps {
  user: User
}

const mockEvents: Event[] = [
  {
    id: "1",
    title: "Coffee with Mark",
    date: "Tomorrow",
    time: "2:00 PM",
    status: "scheduled",
    attendees: ["Mark", "You"],
  },
  {
    id: "2",
    title: "Q4 Planning Session",
    date: "Dec 15",
    time: "10:00 AM",
    status: "draft",
    attendees: ["Sarah", "James", "Alex", "Emma"],
  },
  {
    id: "3",
    title: "Investor Call",
    date: "Dec 16",
    time: "3:30 PM",
    status: "scheduled",
    attendees: ["Michael Chen"],
  },
  {
    id: "4",
    title: "Team Standup",
    date: "Dec 14",
    time: "9:00 AM",
    status: "cancelled",
    attendees: ["Team"],
  },
  {
    id: "5",
    title: "Product Review",
    date: "Dec 18",
    time: "11:00 AM",
    status: "draft",
    attendees: ["Design Team", "Engineering"],
  },
  {
    id: "6",
    title: "Client Presentation",
    date: "Dec 20",
    time: "2:00 PM",
    status: "scheduled",
    attendees: ["Acme Corp"],
  },
]

export function CalendarDashboard({ user }: CalendarDashboardProps) {
  const router = useRouter()
  const [activeNav, setActiveNav] = useState<NavItem>("dashboard")
  const [quickInput, setQuickInput] = useState("")
  const [events, setEvents] = useState<Event[]>(mockEvents)

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  const handleQuickCreate = () => {
    if (!quickInput.trim()) return
    
    const newEvent: Event = {
      id: Date.now().toString(),
      title: quickInput,
      date: "Parsing...",
      time: "TBD",
      status: "draft",
    }
    setEvents([newEvent, ...events])
    setQuickInput("")
  }

  const navItems = [
    { id: "dashboard" as NavItem, label: "Dashboard", icon: LayoutDashboard },
    { id: "events" as NavItem, label: "Events", icon: CalendarDays },
    { id: "settings" as NavItem, label: "Settings", icon: Settings },
  ]

  return (
    <div className="flex h-screen bg-slate-50/50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200/60 flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
              <CalendarDays className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-semibold text-slate-900 text-[15px]">Chronos</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeNav === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className={`w-[18px] h-[18px] ${isActive ? "text-indigo-500" : "text-slate-400"}`} />
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-100">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                <Avatar className="w-9 h-9">
                  <AvatarImage src={user.avatarUrl ?? ""} alt={user.username} />
                  <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-indigo-600 text-white text-sm">
                    {getInitials(user.username)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-slate-900">{user.username}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" />
                Account Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard className="w-4 h-4 mr-2" />
                Manage Billing
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600 focus:text-red-600"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-slate-200/60 flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="search"
                placeholder="Search events..."
                className="w-64 pl-9 h-9 bg-slate-50 border-slate-200 focus:bg-white"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-[18px] h-[18px] text-slate-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full" />
            </Button>
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5">
              <Plus className="w-4 h-4" />
              New Event
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-5xl mx-auto px-8 py-10">
            {/* Hero / Quick Create */}
            <section className="mb-10">
              <h1 className="text-2xl font-semibold text-slate-900 mb-2">
                {getGreeting()}, {user.username}
              </h1>
              <p className="text-slate-500 mb-6">
                You have {events.filter(e => e.status === "scheduled").length} events scheduled this week.
              </p>

              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-indigo-500">
                  <Sparkles className="w-5 h-5" />
                </div>
                <Input
                  value={quickInput}
                  onChange={(e) => setQuickInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleQuickCreate()}
                  placeholder="Try: 'Coffee with Mark tomorrow at 2 PM'"
                  className="h-14 pl-12 pr-28 text-[15px] bg-white border-slate-200 shadow-sm focus:border-indigo-300 focus:ring-indigo-200"
                />
                <Button
                  onClick={handleQuickCreate}
                  disabled={!quickInput.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Create
                </Button>
              </div>
              <p className="text-xs text-slate-400 mt-2 ml-1">
                Use natural language to quickly create events
              </p>
            </section>

            {/* Events Grid */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-slate-900">
                  Upcoming Events
                </h2>
                <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900">
                  View All
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onEdit={(e) => console.log("Edit:", e)}
                    onDelete={(e) => setEvents(events.filter(ev => ev.id !== e.id))}
                    onDuplicate={(e) => {
                      const duplicate = { ...e, id: Date.now().toString(), title: `${e.title} (Copy)` }
                      setEvents([duplicate, ...events])
                    }}
                  />
                ))}
              </div>
            </section>

            {/* Billing CTA */}
            <section className="mt-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl p-6 flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold text-lg">
                  Upgrade to Pro
                </h3>
                <p className="text-indigo-100 text-sm mt-1">
                  Unlock AI scheduling, team calendars, and advanced analytics.
                </p>
              </div>
              <Button
                variant="secondary"
                className="bg-white text-indigo-600 hover:bg-indigo-50"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Manage Billing
              </Button>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
