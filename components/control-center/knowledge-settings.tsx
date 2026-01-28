"use client"

import { useState } from "react"
import { Plus, FileText, AlignLeft, Link, Trash2 } from "lucide-react"

interface KnowledgeSource {
  id: string
  type: "pdf" | "text" | "url"
  name: string
}

const initialSources: KnowledgeSource[] = [
  { id: "1", type: "pdf", name: "Brand Guidelines 2024.pdf" },
  { id: "2", type: "text", name: "Corporate Mission & Values" },
  { id: "3", type: "url", name: "https://thorne.ai/api-specs" },
]

const sourceIcons = {
  pdf: FileText,
  text: AlignLeft,
  url: Link,
}

export function KnowledgeSettings() {
  const [sources, setSources] = useState<KnowledgeSource[]>(initialSources)

  const handleDelete = (id: string) => {
    setSources(sources.filter((s) => s.id !== id))
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-2">AI Intelligence Core</h2>
      <p className="text-muted-foreground mb-8">
        Global training nodes. These configurations apply across all contacts and campaigns to ensure
        consistent brand logic.
      </p>

      <div className="flex gap-6">
        {/* Upload Area */}
        <div className="flex-1">
          <div className="border-2 border-dashed border-thorne-indigo/30 rounded-2xl bg-thorne-indigo/5 p-12 flex flex-col items-center justify-center min-h-[280px]">
            <div className="w-14 h-14 rounded-xl bg-white shadow-sm flex items-center justify-center mb-4">
              <Plus className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="font-medium text-foreground mb-1">Add Global Training Source</p>
            <p className="text-xs font-semibold tracking-wider text-thorne-indigo">SYNC KNOWLEDGE BASE</p>
          </div>
        </div>

        {/* Active Sources */}
        <div className="w-80">
          <p className="text-xs font-semibold tracking-wider text-muted-foreground mb-4">
            ACTIVE CORE SOURCES
          </p>
          <div className="space-y-3">
            {sources.map((source) => {
              const Icon = sourceIcons[source.type]
              return (
                <div
                  key={source.id}
                  className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 group"
                >
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                    <Icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <span className="flex-1 text-sm font-medium text-foreground truncate">
                    {source.name}
                  </span>
                  <button
                    onClick={() => handleDelete(source.id)}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
