"use client"

import { useState } from "react"

export function AutomationSettings() {
  const [autoAddResearch, setAutoAddResearch] = useState(true)
  const [firstEngage, setFirstEngage] = useState(false)
  const [nextStepNotifications, setNextStepNotifications] = useState(true)
  const [responseTime, setResponseTime] = useState("5-10 Minutes")
  const [personality, setPersonality] = useState("Professional")

  const timeOptions = [
    "5-10 Minutes",
    "10-20 Minutes",
    "20-60 Minutes",
    "1-2 Hours",
    "2-5 Hours",
    "5-10 Hours",
    "10-24 Hours",
    "24-48 Hours",
    "48-96 Hours",
    "AI Determined",
  ]

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
      <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Automation Settings</h3>

      <div className="space-y-4">
        <ToggleRow
          title="Auto Add Research"
          desc="Automatically enrich contacts when added to Research Center"
          active={autoAddResearch}
          onToggle={() => setAutoAddResearch(!autoAddResearch)}
        />
        <ToggleRow
          title="First Engage"
          desc="Auto-initiate outreach flow when contact verification completes"
          active={firstEngage}
          onToggle={() => setFirstEngage(!firstEngage)}
        />
        <ToggleRow
          title="Next Step Notifications"
          desc="Receive summaries and proposed next steps via AI Command Chat"
          active={nextStepNotifications}
          onToggle={() => setNextStepNotifications(!nextStepNotifications)}
        />
      </div>

      <div className="space-y-6 pt-6">
        <div className="flex items-center justify-between">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Response Cadence</h4>
          <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase border border-indigo-100">
            {responseTime}
          </span>
        </div>

        <div className="space-y-4">
          <label className="text-xs font-bold text-slate-700 ml-1">Text/Email Response Time</label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {timeOptions.map((option) => (
              <button
                key={option}
                onClick={() => setResponseTime(option)}
                className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-tight border-2 transition-all ${
                  responseTime === option
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100 scale-[1.02]"
                    : "bg-white border-slate-100 text-slate-400 hover:border-indigo-100 hover:text-slate-600"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 italic font-medium ml-1">
            "This setting defines the baseline latency for Thorne&apos;s automated engagement nodes."
          </p>
        </div>
      </div>

      <div className="space-y-6 pt-6 border-t border-slate-50">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Outreach Personality</h4>
        <div className="flex flex-wrap gap-3">
          {["Casual", "Professional", "Fun", "Enthusiastic", "Consultative", "Mimic Voice"].map((p) => (
            <button
              key={p}
              onClick={() => setPersonality(p)}
              className={`px-6 py-3 rounded-2xl text-xs font-bold border transition-all ${
                personality === p
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100"
                  : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
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

function ToggleRow({
  title,
  desc,
  active,
  onToggle,
}: {
  title: string
  desc: string
  active: boolean
  onToggle: () => void
}) {
  return (
    <div
      onClick={onToggle}
      className="p-6 bg-slate-50 rounded-[32px] border border-slate-200 flex items-center justify-between hover:bg-white transition-all group cursor-pointer"
    >
      <div>
        <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{title}</h4>
        <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
      </div>
      <div
        className={`w-14 h-7 rounded-full relative p-1.5 transition-colors duration-300 shadow-inner ${active ? "bg-indigo-600" : "bg-slate-300"}`}
      >
        <div
          className={`w-4 h-4 bg-white rounded-full absolute transition-all duration-300 shadow-sm ${active ? "left-[calc(100%-20px)]" : "left-1.5"}`}
        />
      </div>
    </div>
  )
}

export default AutomationSettings
