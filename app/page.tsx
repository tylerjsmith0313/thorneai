import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardWrapper } from "@/components/dashboard-wrapper"

export default async function Home() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      redirect("/auth/login")
    }

    return <DashboardWrapper />
  } catch (error) {
    // If Supabase is not configured, redirect to login
    console.error("[v0] Auth check failed:", error)
    redirect("/auth/login")
  }
}
