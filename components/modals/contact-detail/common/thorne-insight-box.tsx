"use client"

import { Zap } from "lucide-react"
import { BaseButton } from "@/components/ui/base-button"

interface AgyntInsightBoxProps {
  insight: string
  showAction?: boolean
}

export function ThorneInsightBox({ insight, showAction = false }: AgyntInsightBoxProps) {
  return (
    <div className="bg-indigo-900 rounded-[32px] p-8 text-white space-y-4 relative overflow-hidden shadow-2xl shadow-indigo-100">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-500/50 rounded-xl">
          <Zap size={16} className="text-indigo-200" />
        </div>
        <h4 className="text-sm font-bold tracking-tight">AgyntSynq AI Intelligence</h4>
      </div>
      <p className="text-sm text-indigo-100 leading-relaxed font-medium">
        {insight}
      </p>
      {showAction && (
        <div className="pt-2">
          <BaseButton 
            variant="primary" 
            size="sm" 
            className="bg-white text-indigo-600 hover:bg-indigo-50 border-none shadow-none"
          >
            Launch AgyntSynq Research
          </BaseButton>
        </div>
      )}
      
      {/* Decorative background icon */}
      <Zap className="absolute right-[-20px] bottom-[-20px] w-32 h-32 text-white/5 pointer-events-none" />
    </div>
  )
}
