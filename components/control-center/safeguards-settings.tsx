"use client"

import { useState } from "react"
import { Shield, Zap, DollarSign } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"

export function SafeguardsSettings() {
  const [dncEnabled, setDncEnabled] = useState(true)
  const [automationMode, setAutomationMode] = useState<"user" | "auto">("user")
  const [maxGiftValue, setMaxGiftValue] = useState([50])
  const [monthlyBurnLimit, setMonthlyBurnLimit] = useState([1000])

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-2">Compliance & Safeguards</h2>
      <p className="text-muted-foreground mb-8">
        Set boundaries and approval requirements for automated actions.
      </p>

      {/* DNC Registry Toggle */}
      <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
          <Shield className="w-6 h-6 text-destructive" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-foreground">Scrub National DNC Registry</p>
          <p className="text-sm text-muted-foreground">
            Automatically check Do Not Call lists before any voice AI outreach.
          </p>
        </div>
        <Switch checked={dncEnabled} onCheckedChange={setDncEnabled} />
      </div>

      <div className="flex gap-4">
        {/* Automation Mode */}
        <div className="flex-1 bg-thorne-indigo/5 border border-thorne-indigo/20 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-thorne-indigo" />
            <span className="text-xs font-semibold tracking-wider text-thorne-indigo">
              GLOBAL AUTOMATION MODE
            </span>
          </div>
          <div className="space-y-2">
            <button
              onClick={() => setAutomationMode("user")}
              className={`w-full py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                automationMode === "user"
                  ? "bg-white border-2 border-thorne-indigo text-thorne-indigo"
                  : "bg-white/50 border border-border text-foreground hover:bg-white"
              }`}
            >
              User Controlled
            </button>
            <button
              onClick={() => setAutomationMode("auto")}
              className={`w-full py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                automationMode === "auto"
                  ? "bg-thorne-indigo text-white"
                  : "bg-thorne-indigo/80 text-white hover:bg-thorne-indigo"
              }`}
            >
              Set to Flow (Full Auto)
            </button>
          </div>
        </div>

        {/* Auto-Approve Budget */}
        <div className="w-80 bg-[#1a1a2e] rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-6">
            <DollarSign className="w-5 h-5 text-thorne-lavender" />
            <span className="text-xs font-semibold tracking-wider text-thorne-lavender">
              AUTO-APPROVE BUDGET
            </span>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold tracking-wider text-white/80">
                  MAX PER-GIFT VALUE
                </span>
                <span className="text-thorne-lavender font-semibold">
                  ${maxGiftValue[0].toFixed(2)}
                </span>
              </div>
              <Slider
                value={maxGiftValue}
                onValueChange={setMaxGiftValue}
                max={200}
                step={5}
                className="[&_[data-slot=track]]:bg-white/20 [&_[data-slot=range]]:bg-thorne-indigo [&_[data-slot=thumb]]:bg-thorne-lavender [&_[data-slot=thumb]]:border-0"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold tracking-wider text-white/80">
                  MONTHLY BURN LIMIT
                </span>
                <span className="text-thorne-lavender font-semibold">
                  ${monthlyBurnLimit[0].toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <Slider
                value={monthlyBurnLimit}
                onValueChange={setMonthlyBurnLimit}
                max={5000}
                step={100}
                className="[&_[data-slot=track]]:bg-white/20 [&_[data-slot=range]]:bg-thorne-indigo [&_[data-slot=thumb]]:bg-thorne-lavender [&_[data-slot=thumb]]:border-0"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
