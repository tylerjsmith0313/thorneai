"use client"

import { useState } from "react"
import { DashboardHeader } from "./dashboard/header"
import { NeuralFeed } from "./dashboard/neural-feed"
import { MetricsGrid } from "./dashboard/metrics-grid"
import { StatusGrid } from "./dashboard/status-grid"
import { ContentTabs } from "./dashboard/content-tabs"
import { ControlCenter } from "./control-center"

export function Dashboard() {
  const [showControlCenter, setShowControlCenter] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader onOpenSettings={() => setShowControlCenter(true)} />
      
      <main className="max-w-7xl mx-auto px-4 py-6">
        <NeuralFeed />
        <MetricsGrid />
        <StatusGrid />
        <ContentTabs />
      </main>

      {showControlCenter && (
        <ControlCenter onClose={() => setShowControlCenter(false)} />
      )}
    </div>
  )
}
