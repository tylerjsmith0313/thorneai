"use client"

import { cn } from "@/lib/utils"
import type { InputHTMLAttributes, ReactNode } from "react"

interface BaseInputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode
}

export function BaseInput({ icon, className, ...props }: BaseInputProps) {
  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </div>
      )}
      <input
        className={cn(
          "w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all",
          "focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100",
          "hover:border-slate-300",
          icon && "pl-11",
          className
        )}
        {...props}
      />
    </div>
  )
}

export default BaseInput
