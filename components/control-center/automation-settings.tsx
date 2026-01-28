"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"

const responseTimes = [
  "5-10 MINUTES",
  "10-20 MINUTES",
  "20-60 MINUTES",
  "1-2 HOURS",
  "2-5 HOURS",
  "5-10 HOURS",
  "10-24 HOURS",
  "24-48 HOURS",
  "48-96 HOURS",
  "AI DETERMINED",
]

const personalities = [
  "Casual",
  "Professional",
  "Fun",
  "Enthusiastic",
  "Consultative",
  "Mimic Voice",
]

export function AutomationSettings() {
  const [autoAddResearch, setAutoAddResearch] = useState(true)
  const [firstEngage, setFirstEngage] = useState(false)
  const [nextStepNotifications, setNextStepNotifications] = useState(true)
  const [responseTime, setResponseTime] = useState("5-10 MINUTES")
  const [personality, setPersonality] = useState("Professional")

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-8">Automation Settings</h2>

      {/* Toggles */}
      <div className="space-y-4 mb-8">
        <ToggleCard
          title="Auto Add Research"
          description="Automatically enrich contacts when added to Research Center"
          checked={autoAddResearch}
          onCheckedChange={setAutoAddResearch}
        />
        <ToggleCard
          title="First Engage"
          description="Auto-initiate outreach flow when contact verification completes"
          checked={firstEngage}
          onCheckedChange={setFirstEngage}
        />
        <ToggleCard
          title="Next Step Notifications"
          description="Receive summaries and proposed next steps via AI Command Chat"
          checked={nextStepNotifications}
          onCheckedChange={setNextStepNotifications}
        />
      </div>

      {/* Response Cadence */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[10px] font-medium text-muted-foreground tracking-wider">
            GLOBAL RESPONSE CADENCE
          </h3>
          <span className="text-xs font-medium px-3 py-1 bg-thorne-indigo/10 text-thorne-indigo rounded-full">
            {responseTime}
          </span>
        </div>
        <p className="text-sm text-foreground mb-3">Text/Email Response Time</p>
        <div className="flex flex-wrap gap-2">
          {responseTimes.map((time) => (
            <button
              key={time}
              onClick={() => setResponseTime(time)}
              className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors ${
                responseTime === time
                  ? "bg-thorne-indigo text-white"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {time}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground italic mt-3">
          *This setting defines the baseline latency for Thorne&apos;s automated engagement nodes.*
        </p>
      </div>

      {/* Outreach Personality */}
      <div>
        <h3 className="text-[10px] font-medium text-muted-foreground tracking-wider mb-4">
          OUTREACH PERSONALITY
        </h3>
        <div className="flex flex-wrap gap-2">
          {personalities.map((p) => (
            <button
              key={p}
              onClick={() => setPersonality(p)}
              className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors ${
                personality === p
                  ? "bg-thorne-indigo text-white"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function ToggleCard({
  title,
  description,
  checked,
  onCheckedChange,
}: {
  title: string
  description: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <div className="bg-secondary rounded-xl p-4 flex items-center justify-between">
      <div>
        <h4 className="font-medium text-foreground">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}
