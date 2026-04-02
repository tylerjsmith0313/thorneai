"use client"

import React from "react"

import { Sparkles, HeartCrack, Skull, Database } from "lucide-react"

export function StatusGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Withering */}
      <StatusCard
        icon={<Sparkles className="w-5 h-5" />}
        label="WITHERING"
        value="2"
        valueSmall="Leads (18%)"
        badge={{ text: "ATTENTION", color: "warning" }}
        details={[
          { label: "RISK", value: "ELEVATED" },
          { label: "RECAPTURE", value: "14%" },
        ]}
        iconBg="bg-thorne-warning/10"
        iconColor="text-thorne-warning"
      />

      {/* Break Ups */}
      <StatusCard
        icon={<HeartCrack className="w-5 h-5" />}
        label="BREAK UPS"
        value="2"
        valueSmall="Contacts"
        badge={{ text: "SILENCE", color: "danger" }}
        details={[
          { label: "LAST MSG", value: "14D+ AVG" },
          { label: "RISK", value: "HIGH", highlight: true },
        ]}
        iconBg="bg-thorne-danger/10"
        iconColor="text-thorne-danger"
      />

      {/* Dead Deals */}
      <StatusCard
        icon={<Skull className="w-5 h-5" />}
        label="DEAD DEALS"
        value="0"
        valueSmall="Lost"
        badge={{ text: "AUTOPSY", color: "muted" }}
        details={[
          { label: "LOST VAL", value: "50%" },
          { label: "RECOVERY", value: "CRITICAL", highlight: true, danger: true },
        ]}
        iconBg="bg-thorne-lavender/30"
        iconColor="text-thorne-indigo"
      />

      {/* DB Health */}
      <StatusCard
        icon={<Database className="w-5 h-5" />}
        label="DB HEALTH"
        value="11"
        valueSmall="Nodes"
        badge={{ text: "VERIFIED", color: "success" }}
        details={[
          { label: "ENRICHED", value: "91%" },
          { label: "STORAGE", value: "SECURE" },
        ]}
        iconBg="bg-thorne-success/10"
        iconColor="text-thorne-success"
      />
    </div>
  )
}

interface StatusCardProps {
  icon: React.ReactNode
  label: string
  value: string
  valueSmall?: string
  badge?: { text: string; color: "success" | "warning" | "danger" | "muted" }
  details?: { label: string; value: string; highlight?: boolean; danger?: boolean }[]
  iconBg: string
  iconColor: string
}

function StatusCard({ icon, label, value, valueSmall, badge, details, iconBg, iconColor }: StatusCardProps) {
  const badgeColors = {
    success: "bg-thorne-success/10 text-thorne-success",
    warning: "bg-thorne-warning/10 text-thorne-warning",
    danger: "bg-thorne-danger/10 text-thorne-danger",
    muted: "bg-secondary text-muted-foreground",
  }

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center ${iconColor}`}>
          {icon}
        </div>
        {badge && (
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${badgeColors[badge.color]}`}>
            {badge.text}
          </span>
        )}
      </div>
      <p className="text-[10px] text-muted-foreground tracking-wider mb-1">{label}</p>
      <div className="mb-3">
        <span className="text-2xl font-bold text-foreground">{value}</span>
        {valueSmall && <span className="text-sm text-muted-foreground ml-1">{valueSmall}</span>}
      </div>
      {details && (
        <div className="flex items-center gap-4 pt-3 border-t border-border">
          {details.map((detail, i) => (
            <div key={i}>
              <p className="text-[10px] text-muted-foreground">{detail.label}</p>
              <p className={`text-sm font-medium ${detail.danger ? "text-thorne-danger" : detail.highlight ? "text-thorne-indigo" : "text-foreground"}`}>
                {detail.value}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
