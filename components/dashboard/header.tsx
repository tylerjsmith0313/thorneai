"use client"

import React from "react"

import { Shield, Map, Scan, Upload, Search, Plus, Settings, UserCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DashboardHeaderProps {
  onOpenSettings: () => void
  onRadarClick?: () => void
  onScannerClick?: () => void
  onBulkClick?: () => void
  onFinderClick?: () => void
  onAddContactClick?: () => void
}

export function DashboardHeader({ 
  onOpenSettings,
  onRadarClick,
  onScannerClick,
  onBulkClick,
  onFinderClick,
  onAddContactClick
}: DashboardHeaderProps) {
  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-40 px-6 py-2.5 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: Branding */}
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100 shrink-0 transition-transform group-hover:scale-105">
            <Shield className="w-5 h-5" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-base font-black text-slate-900 leading-none uppercase tracking-tight">Thorne</h1>
            <p className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.3em] mt-1.5">Neural Core</p>
          </div>
        </div>

        {/* Right: Tools & Profile */}
        <div className="flex items-center gap-4">
          {/* Main Action Toolbelt */}
          <nav className="flex items-center bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/30 shadow-inner">
            <ToolIconButton 
              icon={<Map className="w-4 h-4" />} 
              label="Radar" 
              onClick={onRadarClick} 
              color="text-indigo-500"
            />
            <ToolIconButton 
              icon={<Scan className="w-4 h-4" />} 
              label="Scanner" 
              onClick={onScannerClick} 
              color="text-emerald-500"
            />
<ToolIconButton 
              icon={<Upload className="w-4 h-4" />} 
              label="Bulk" 
              onClick={onBulkClick} 
              color="text-rose-500"
            />
            <ToolIconButton 
              icon={<Search className="w-4 h-4" />} 
              label="Finder" 
              onClick={onFinderClick} 
              color="text-blue-500"
            />
            
            <div className="w-px h-5 bg-slate-300 mx-2.5 self-center opacity-30" />
            
            <Button 
              onClick={onAddContactClick}
              className="px-4 py-2 text-[10px] shadow-md uppercase font-black tracking-widest rounded-xl bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus size={14} className="mr-1" />
              Add Contact
            </Button>
          </nav>

          <div className="w-px h-8 bg-slate-100 mx-1 shrink-0" />

          {/* Settings & User */}
          <div className="flex items-center gap-3">
            <button 
              onClick={onOpenSettings}
              title="Control Center"
              className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 hover:bg-white hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
            >
              <Settings className="w-4 h-4" />
            </button>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shrink-0 cursor-pointer hover:bg-indigo-100 transition-all hover:shadow-md">
              <UserCircle className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

function ToolIconButton({ icon, label, onClick, color }: { icon: React.ReactNode, label: string, onClick?: () => void, color: string }) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-white transition-all group"
      title={label}
    >
      <span className={`${color} group-hover:scale-110 transition-transform`}>{icon}</span>
      <span className="text-[10px] font-black uppercase tracking-widest hidden xl:inline">{label}</span>
    </button>
  )
}
