"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Dashboard } from "./dashboard"
import { getDashboardStats } from "@/lib/data-service"
import type { Contact, Deal, Conversation } from "@/types"

interface DashboardData {
  contacts: Contact[]
  deals: Deal[]
  conversations: Conversation[]
  stats: {
    totalIncome: number
    pipelineValue: number
    totalContacts: number
    newContacts: number
    hotContacts: number
    witheringContacts: number
    deadContacts: number
    openDeals: number
    closedWonDeals: number
    closedLostDeals: number
    activeConversations: number
    thorneManaged: number
  }
}

export function DashboardWrapper() {
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      console.log("[v0] Fetching dashboard data...")
      const result = await getDashboardStats()
      console.log("[v0] Dashboard data loaded successfully")
      setData(result)
      setError(null)
    } catch (err) {
      console.error("[v0] Error fetching dashboard data:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to load dashboard data"
      
      // If authentication error, redirect to login
      if (errorMessage.includes("authenticated") || errorMessage.includes("Authentication")) {
        router.push("/auth/login")
        return
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Refresh data function to pass to Dashboard
  const refreshData = () => {
    fetchData()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-slate-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-medium mb-4">{error || "Failed to load data"}</p>
          <button 
            onClick={fetchData}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <Dashboard 
      contacts={data.contacts}
      deals={data.deals}
      conversations={data.conversations}
      onRefresh={refreshData}
    />
  )
}
