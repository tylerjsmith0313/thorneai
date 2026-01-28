"use client"

import { Sparkles } from "lucide-react"

interface ThorneInsightBoxProps {
  insight: string
}

export function ThorneInsightBox({ insight }: ThorneInsightBoxProps) {
  return (
    <div className="p-6 bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-[32px] flex items-start gap-4">
      <div className="p-3 bg-indigo-600 rounded-2xl text-white shrink-0 shadow-lg shadow-indigo-200">
        <Sparkles size={20} />
      </div>
      <div>
        <h5 className="text-[10px] font-black text-indigo-900 uppercase tracking-widest mb-2">Thorne AI Insight</h5>
        <p className="text-xs text-indigo-700 leading-relaxed font-medium italic">
          {insight}
        </p>
      </div>
    </div>
  )
}
