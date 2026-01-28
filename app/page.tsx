"use client"

import { useState } from "react"
import { AuthScreen } from "@/components/auth-screen"
import { Dashboard } from "@/components/dashboard"

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  if (!isAuthenticated) {
    return <AuthScreen onAuthenticate={() => setIsAuthenticated(true)} />
  }

  return <Dashboard />
}
