"use client"

import { cn } from "@/lib/utils"
import type { ButtonHTMLAttributes, ReactNode } from "react"

interface BaseButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "dark" | "ghost"
  size?: "sm" | "md" | "lg"
  icon?: ReactNode
  children?: ReactNode
  fullWidth?: boolean
}

export function BaseButton({
  variant = "primary",
  size = "md",
  icon,
  children,
  className,
  disabled,
  fullWidth,
  ...props
}: BaseButtonProps) {
  const baseStyles = "inline-flex items-center justify-center gap-2 font-bold uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed"
  
  const variantStyles = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 border border-indigo-600 shadow-lg shadow-indigo-100",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200",
    outline: "bg-transparent text-slate-600 hover:bg-slate-50 border border-slate-200",
    dark: "bg-slate-900 text-white hover:bg-slate-800 border border-slate-900 shadow-lg",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 border border-transparent",
  }
  
  const sizeStyles = {
    sm: "px-4 py-2 text-[10px] rounded-xl",
    md: "px-6 py-3 text-[11px] rounded-2xl",
    lg: "px-8 py-4 text-xs rounded-2xl",
  }

  return (
    <button
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], fullWidth && "w-full", className)}
      disabled={disabled}
      {...props}
    >
      {icon}
      {children}
    </button>
  )
}

export default BaseButton
