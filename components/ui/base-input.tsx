"use client"

import { cn } from "@/lib/utils"
import type { InputHTMLAttributes, ReactNode } from "react"

interface BaseInputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode
  variant?: "default" | "dark"
}

export function BaseInput({ icon, className, variant = "default", ...props }: BaseInputProps) {
  return (
    <div className="relative">
      {icon && (
        <div className={cn(
          "absolute left-4 top-1/2 -translate-y-1/2",
          variant === "dark" ? "text-slate-400" : "text-slate-400"
        )}>
          {icon}
        </div>
      )}
      <input
        className={cn(
          "w-full px-4 py-3 rounded-2xl text-sm font-medium outline-none transition-all",
          variant === "dark" 
            ? "bg-slate-900 border-none text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/30"
            : "bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 hover:border-slate-300",
          icon && "pl-11",
          className
        )}
        {...props}
      />
    </div>
  )
}

export default BaseInput
