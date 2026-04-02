import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardWrapper } from "@/components/dashboard-wrapper"

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If not authenticated, redirect to login
  if (!user) {
    redirect("/auth/login")
  }

  return <DashboardWrapper />
}
