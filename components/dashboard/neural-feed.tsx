"use client"

import { Grid3X3, ChevronUp } from "lucide-react"

export function NeuralFeed() {
  return (
    <div className="bg-card rounded-xl border border-border p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-thorne-indigo/10 flex items-center justify-center">
            <Grid3X3 className="w-5 h-5 text-thorne-indigo" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">NEURAL FEED</h2>
            <p className="text-xs text-muted-foreground">LIVE BUSINESS DIAGNOSTICS AND CONVERSION TELEMETRY.</p>
          </div>
        </div>
        <button className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  )
}
