"use client"

import type { ReactNode } from "react"

interface SectionHeaderProps {
  title: string
  description?: string
  icon?: ReactNode
}

export function SectionHeader({ title, description, icon }: SectionHeaderProps) {
  return (
    <div className="flex items-start gap-4">
      {icon && (
        <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
          {icon}
        </div>
      )}
      <div>
        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{title}</h2>
        {description && (
          <p className="text-sm text-slate-500 mt-1 font-medium">{description}</p>
        )}
      </div>
    </div>
  )
}
