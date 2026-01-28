"use client"

import { useState } from "react"
import { Settings, User, Cog, Package, Brain, GitBranch, Shield, X } from "lucide-react"
import { UserSettings } from "./control-center/user-settings"
import { AutomationSettings } from "./control-center/automation-settings"
import { ProductsSettings } from "./control-center/products-settings"
import { KnowledgeSettings } from "./control-center/knowledge-settings"
import { SafeguardsSettings } from "./control-center/safeguards-settings"

const navItems = [
  { id: "user", label: "User Settings", icon: User },
  { id: "automation", label: "Automation", icon: Cog },
  { id: "products", label: "Products", icon: Package },
  { id: "knowledge", label: "Knowledge", icon: Brain },
  { id: "workflow", label: "Workflow", icon: GitBranch },
  { id: "safeguards", label: "Safeguards", icon: Shield },
]

interface ControlCenterProps {
  onClose: () => void
}

export function ControlCenter({ onClose }: ControlCenterProps) {
  const [activeSection, setActiveSection] = useState("user")

  return (
    <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex">
        {/* Sidebar */}
        <div className="w-64 border-r border-border p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <Settings className="w-5 h-5 text-foreground" />
            </div>
            <span className="font-semibold text-foreground">Control Center</span>
          </div>

          <nav className="flex-1 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === item.id
                    ? "bg-thorne-indigo/10 text-thorne-indigo"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>

          <button
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
            Close Settings
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeSection === "user" && <UserSettings />}
          {activeSection === "automation" && <AutomationSettings />}
          {activeSection === "products" && <ProductsSettings />}
          {activeSection === "knowledge" && <KnowledgeSettings />}
          {activeSection === "workflow" && <PlaceholderSection title="Workflow Settings" description="Customize engagement sequences and triggers." />}
          {activeSection === "safeguards" && <SafeguardsSettings />}
        </div>
      </div>
    </div>
  )
}

function PlaceholderSection({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
      <p className="text-muted-foreground mb-8">{description}</p>
      <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
        <p className="text-sm">Coming soon...</p>
      </div>
    </div>
  )
}
