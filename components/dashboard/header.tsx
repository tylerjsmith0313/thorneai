"use client"

import React from "react"

import { Shield, Radar, Sparkles, Package, Search, Plus, Settings, User } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DashboardHeaderProps {
  onOpenSettings: () => void
}

export function DashboardHeader({ onOpenSettings }: DashboardHeaderProps) {
  return (
    <header className="bg-card border-b border-border px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-thorne-lavender/40 flex items-center justify-center">
            <Shield className="w-5 h-5 text-thorne-indigo" />
          </div>
          <div>
            <span className="font-bold text-thorne-navy">THORNE</span>
            <span className="text-[10px] text-thorne-indigo ml-1 tracking-wider">NEURAL CORE</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <NavButton icon={<Radar className="w-4 h-4" />} label="RADAR" />
          <NavButton icon={<Sparkles className="w-4 h-4" />} label="SCANNER" />
          <NavButton icon={<Package className="w-4 h-4" />} label="BULK" />
          <NavButton icon={<Search className="w-4 h-4" />} label="FINDER" />
          <Button className="bg-thorne-indigo hover:bg-thorne-indigo/90 text-white ml-2">
            <Plus className="w-4 h-4 mr-1" />
            ADD CONTACT
          </Button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenSettings}
            className="text-muted-foreground hover:text-foreground"
          >
            <Settings className="w-5 h-5" />
          </Button>
          <div className="w-9 h-9 rounded-full bg-thorne-indigo flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>
    </header>
  )
}

function NavButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors">
      {icon}
      {label}
    </button>
  )
}
