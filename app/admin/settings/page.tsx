import { AdminSettingsClient } from "./admin-settings-client"

export const metadata = {
  title: "Admin Settings | AgyntSynq",
  description: "Manage your organization settings, team members, and permissions",
}

export default function AdminSettingsPage() {
  return <AdminSettingsClient />
}
