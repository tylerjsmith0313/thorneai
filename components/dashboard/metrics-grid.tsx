"use client"

import React from "react"

import { DollarSign, Target, Users, MessageSquare } from "lucide-react"

export function MetricsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      {/* Earned Income */}
      <MetricCard
        icon={<DollarSign className="w-5 h-5" />}
        label="EARNED INCOME"
        value="$57,000"
        badge={{ text: "+12%", color: "success" }}
        details={[
          { label: "PIPELINE", value: "$15,500" },
          { label: "CONV.", value: "68%" },
        ]}
      />

      {/* Opportunities */}
      <MetricCard
        icon={<Target className="w-5 h-5" />}
        label="OPPORTUNITIES"
        value="3 Active"
        valueSmall="/8"
        badge={{ text: "50% WIN", color: "success" }}
        details={[
          { label: "AVG SIZE", value: "$12k" },
          { label: "VELOCITY", value: "HIGH", highlight: true },
        ]}
      />

      {/* Contacts */}
      <MetricCard
        icon={<Users className="w-5 h-5" />}
        label="CONTACTS"
        value="0"
        valueSmall="THIS MONTH"
        badge={{ text: "+18%", color: "primary" }}
        details={[
          { label: "TOTAL DB", value: "11" },
          { label: "GROWTH", value: "STEADY" },
        ]}
      />

      {/* Conversations */}
      <MetricCard
        icon={<MessageSquare className="w-5 h-5" />}
        label="CONVERSATIONS"
        value="4"
        valueSmall="Ongoing"
        badge={{ text: "AI ACTIVE", color: "primary" }}
        details={[
          { label: "MANAGED", value: "1" },
          { label: "ACTION", value: "2" },
        ]}
      />
    </div>
  )
}

interface MetricCardProps {
  icon: React.ReactNode
  label: string
  value: string
  valueSmall?: string
  badge?: { text: string; color: "success" | "primary" | "warning" | "danger" }
  details?: { label: string; value: string; highlight?: boolean }[]
}

function MetricCard({ icon, label, value, valueSmall, badge, details }: MetricCardProps) {
  const badgeColors = {
    success: "bg-thorne-success/10 text-thorne-success",
    primary: "bg-thorne-indigo/10 text-thorne-indigo",
    warning: "bg-thorne-warning/10 text-thorne-warning",
    danger: "bg-thorne-danger/10 text-thorne-danger",
  }

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          {icon}
          <span className="text-[10px] font-medium tracking-wider">{label}</span>
        </div>
        {badge && (
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${badgeColors[badge.color]}`}>
            {badge.text}
          </span>
        )}
      </div>
      <div className="mb-3">
        <span className="text-2xl font-bold text-foreground">{value}</span>
        {valueSmall && <span className="text-sm text-muted-foreground ml-1">{valueSmall}</span>}
      </div>
      {details && (
        <div className="flex items-center gap-4 pt-3 border-t border-border">
          {details.map((detail, i) => (
            <div key={i}>
              <p className="text-[10px] text-muted-foreground">{detail.label}</p>
              <p className={`text-sm font-medium ${detail.highlight ? "text-thorne-indigo" : "text-foreground"}`}>
                {detail.value}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
