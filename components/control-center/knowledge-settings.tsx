"use client"

import React from "react"

import { useState, useEffect, useRef } from "react"
import { Plus, FileText, AlignLeft, Link, Trash2, Loader2, Upload, Save, CheckCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface KnowledgeSource {
  id: string
  type: "pdf" | "text" | "url"
  name: string
  content?: string
  file_url?: string
}

const sourceIcons = {
  pdf: FileText,
  text: AlignLeft,
  url: Link,
}

export function KnowledgeSettings() {
  const [sources, setSources] = useState<KnowledgeSource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [addType, setAddType] = useState<"pdf" | "text" | "url">("text")
  const [newSourceName, setNewSourceName] = useState("")
  const [newSourceContent, setNewSourceContent] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load knowledge sources on mount
  useEffect(() => {
    async function loadSources() {
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setIsLoading(false)
        return
      }
      
      setUserId(user.id)
      
      // Get knowledge sources for this user
      const { data: knowledgeSources } = await supabase
        .from("knowledge_sources")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
      
      if (knowledgeSources) {
        setSources(knowledgeSources.map(s => ({
          id: s.id,
          type: s.type as "pdf" | "text" | "url",
          name: s.name,
          content: s.content,
          file_url: s.file_url,
        })))
      }
      
      setIsLoading(false)
    }
    
    loadSources()
  }, [])

  const handleDelete = async (id: string) => {
    if (!userId) return
    
    const supabase = createClient()
    
    const { error } = await supabase
      .from("knowledge_sources")
      .delete()
      .eq("id", id)
      .eq("user_id", userId)
    
    if (!error) {
      setSources(sources.filter((s) => s.id !== id))
    } else {
      console.error("[v0] Error deleting knowledge source:", error)
    }
  }

  const handleAddSource = async () => {
    if (!userId || !newSourceName.trim()) return
    
    setIsSaving(true)
    setSaveSuccess(false)
    
    const supabase = createClient()
    
    const newSource = {
      user_id: userId,
      type: addType,
      name: newSourceName.trim(),
      content: addType === "url" ? newSourceContent.trim() : (addType === "text" ? newSourceContent.trim() : null),
      file_url: addType === "pdf" ? newSourceContent.trim() : null,
    }
    
    const { data, error } = await supabase
      .from("knowledge_sources")
      .insert(newSource)
      .select()
      .single()
    
    if (error) {
      console.error("[v0] Error adding knowledge source:", error)
    } else if (data) {
      setSources([{
        id: data.id,
        type: data.type as "pdf" | "text" | "url",
        name: data.name,
        content: data.content,
        file_url: data.file_url,
      }, ...sources])
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2000)
      setShowAddModal(false)
      setNewSourceName("")
      setNewSourceContent("")
    }
    
    setIsSaving(false)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !userId) return
    
    setIsSaving(true)
    
    // For now, just store the file name - in production you'd upload to storage
    setNewSourceName(file.name)
    setAddType("pdf")
    setShowAddModal(true)
    
    setIsSaving(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
      </div>
    )
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
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.doc,.docx"
            onChange={handleFileUpload}
            className="hidden"
          />
          <div 
            onClick={() => setShowAddModal(true)}
            className="border-2 border-dashed border-thorne-indigo/30 rounded-2xl bg-thorne-indigo/5 p-12 flex flex-col items-center justify-center min-h-[280px] cursor-pointer hover:border-thorne-indigo/50 hover:bg-thorne-indigo/10 transition-all"
          >
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
            ACTIVE CORE SOURCES ({sources.length})
          </p>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {sources.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                No knowledge sources added yet.
              </div>
            ) : (
              sources.map((source) => {
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
              })
            )}
          </div>
        </div>
      </div>

      {/* Add Source Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Add Knowledge Source</h3>
            
            {/* Type Selection */}
            <div className="flex gap-2 mb-4">
              {(["text", "url", "pdf"] as const).map((type) => {
                const Icon = sourceIcons[type]
                return (
                  <button
                    key={type}
                    onClick={() => setAddType(type)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                      addType === type
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <Icon size={16} />
                    {type.toUpperCase()}
                  </button>
                )
              })}
            </div>

            {/* Source Name */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Source Name
              </label>
              <input
                type="text"
                value={newSourceName}
                onChange={(e) => setNewSourceName(e.target.value)}
                placeholder="e.g., Brand Guidelines 2024"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Content Based on Type */}
            {addType === "url" && (
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  URL
                </label>
                <input
                  type="url"
                  value={newSourceContent}
                  onChange={(e) => setNewSourceContent(e.target.value)}
                  placeholder="https://example.com/docs"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}

            {addType === "text" && (
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Content
                </label>
                <textarea
                  value={newSourceContent}
                  onChange={(e) => setNewSourceContent(e.target.value)}
                  placeholder="Paste your text content here..."
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
            )}

            {addType === "pdf" && (
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  File
                </label>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-4 py-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl text-sm text-slate-500 hover:border-indigo-300 hover:bg-indigo-50 transition-all flex flex-col items-center gap-2"
                >
                  <Upload size={24} />
                  Click to upload PDF
                </button>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setNewSourceName("")
                  setNewSourceContent("")
                }}
                className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSource}
                disabled={isSaving || !newSourceName.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : saveSuccess ? (
                  <CheckCircle size={16} />
                ) : (
                  <Save size={16} />
                )}
                {saveSuccess ? "Added!" : "Add Source"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
