"use client"

import { User, Zap } from "lucide-react"

interface ModeToggleProps {
  mode: "user" | "flow"
  onModeChange: (mode: "user" | "flow") => void
}

export function ModeToggle({ mode, onModeChange }: ModeToggleProps) {
  return (
    <div className="flex items-center gap-1 p-1.5 bg-slate-100 rounded-full">
      <button
        onClick={() => onModeChange("user")}
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
          mode === "user"
            ? "bg-white text-slate-900 shadow-sm"
            : "text-slate-400 hover:text-slate-600"
        }`}
      >
        <User size={12} />
        Manual
      </button>
      <button
        onClick={() => onModeChange("flow")}
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
          mode === "flow"
            ? "bg-indigo-600 text-white shadow-sm"
            : "text-slate-400 hover:text-slate-600"
        }`}
      >
        <Zap size={12} />
        Flow
      </button>
    </div>
  )
}
