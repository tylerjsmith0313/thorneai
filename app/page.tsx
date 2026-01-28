import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CalendarDashboard } from "@/components/calendar-dashboard"

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile with username
  const { data: profile } = await supabase
    .from("profiles")
    .select("username, avatar_url")
    .eq("id", user.id)
    .single()

  return (
    <CalendarDashboard 
      user={{
        id: user.id,
        email: user.email ?? "",
        username: profile?.username ?? user.email?.split("@")[0] ?? "User",
        avatarUrl: profile?.avatar_url,
      }}
    />
  )
}
