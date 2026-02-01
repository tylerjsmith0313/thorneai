"use client"

import { useState, useEffect } from "react"
import { 
  MessageSquare, 
  Plus, 
  Code, 
  Copy, 
  Check, 
  Trash2, 
  Loader2,
  Palette,
  Zap,
  CheckCircle,
  X,
  Pencil
} from "lucide-react"
import { BaseButton } from "@/components/ui/base-button"
import { BaseInput } from "@/components/ui/base-input"
import { createClient } from "@/lib/supabase/client"
import { Switch } from "@/components/ui/switch"

interface Chatbot {
  id: string
  name: string
  welcome_message: string
  ai_instructions: string | null
  theme_color: string
  is_active: boolean
  embed_key: string
  created_at: string
}

export function WidgetSettings() {
  const [chatbots, setChatbots] = useState<Chatbot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [copiedModal, setCopiedModal] = useState(false)
  
  // Modal states
  const [showCodeModal, setShowCodeModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [currentChatbot, setCurrentChatbot] = useState<Chatbot | null>(null)
  
  // Form state
  const [name, setName] = useState("")
  const [welcomeMessage, setWelcomeMessage] = useState("Hi there! How can I help you today?")
  const [themeColor, setThemeColor] = useState("#6366f1")
  const [aiInstructions, setAiInstructions] = useState("")

  useEffect(() => {
    loadChatbots()
  }, [])

  async function loadChatbots() {
    const supabase = createClient()
    const { data } = await supabase
      .from("widget_chatbots")
      .select("*")
      .order("created_at", { ascending: false })
    
    if (data) setChatbots(data)
    setIsLoading(false)
  }

  async function handleCreate() {
    if (!name.trim()) return
    setCreating(true)

    try {
      const res = await fetch("/api/widget/chatbots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          welcomeMessage,
          aiInstructions: aiInstructions || null,
          themeColor,
        }),
      })

      const data = await res.json()
      if (data.chatbot) {
        setChatbots([data.chatbot, ...chatbots])
        setShowCreate(false)
        resetForm()
        // Show the code modal with the new chatbot
        setCurrentChatbot(data.chatbot)
        setShowCodeModal(true)
      }
    } catch (error) {
      console.error("[v0] Error creating chatbot:", error)
    }
    setCreating(false)
  }

  async function handleEdit() {
    if (!currentChatbot || !name.trim()) return
    setSaving(true)

    try {
      const res = await fetch("/api/widget/chatbots", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: currentChatbot.id,
          name,
          welcomeMessage,
          aiInstructions: aiInstructions || null,
          themeColor,
        }),
      })

      const data = await res.json()
      if (data.chatbot) {
        setChatbots(chatbots.map(c => c.id === currentChatbot.id ? data.chatbot : c))
        setShowEditModal(false)
        setCurrentChatbot(null)
        resetForm()
      }
    } catch (error) {
      console.error("[v0] Error updating chatbot:", error)
    }
    setSaving(false)
  }

  function openEditModal(chatbot: Chatbot) {
    setCurrentChatbot(chatbot)
    setName(chatbot.name)
    setWelcomeMessage(chatbot.welcome_message)
    setThemeColor(chatbot.theme_color)
    setAiInstructions(chatbot.ai_instructions || "")
    setShowEditModal(true)
  }

  function openCodeModal(chatbot: Chatbot) {
    setCurrentChatbot(chatbot)
    setShowCodeModal(true)
  }

  async function handleToggle(chatbot: Chatbot) {
    const newStatus = !chatbot.is_active
    setChatbots(chatbots.map(c => c.id === chatbot.id ? { ...c, is_active: newStatus } : c))
    
    await fetch("/api/widget/chatbots", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: chatbot.id, isActive: newStatus }),
    })
  }

  async function handleDelete(chatbotId: string) {
    if (!confirm("Delete this widget? All chat history will be permanently removed.")) return
    
    await fetch(`/api/widget/chatbots?id=${chatbotId}`, { method: "DELETE" })
    setChatbots(chatbots.filter(c => c.id !== chatbotId))
    if (currentChatbot?.id === chatbotId) {
      setCurrentChatbot(null)
      setShowCodeModal(false)
      setShowEditModal(false)
    }
  }

  function resetForm() {
    setName("")
    setWelcomeMessage("Hi there! How can I help you today?")
    setThemeColor("#6366f1")
    setAiInstructions("")
  }

  function getEmbedCode(chatbot: Chatbot) {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
    return `<script src="${baseUrl}/api/widget/embed.js?id=${chatbot.id}" async></script>`
  }

  function copyEmbedCode(chatbot: Chatbot, isModal = false) {
    navigator.clipboard.writeText(getEmbedCode(chatbot))
    if (isModal) {
      setCopiedModal(true)
      setTimeout(() => setCopiedModal(false), 2000)
    } else {
      setCopiedId(chatbot.id)
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">CHAT WIDGETS</h3>
          <p className="text-sm text-slate-500 mt-1">Embed live chat on your website to capture leads instantly.</p>
        </div>
        {!showCreate && (
          <BaseButton 
            variant="primary" 
            icon={<Plus size={18} />}
            onClick={() => setShowCreate(true)}
          >
            CREATE WIDGET
          </BaseButton>
        )}
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 space-y-6 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-black text-slate-900 uppercase tracking-tight">New Chat Widget</h4>
            <button 
              onClick={() => { setShowCreate(false); resetForm() }}
              className="text-slate-400 hover:text-slate-600 text-sm font-medium"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Widget Name</label>
              <BaseInput 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Main Website Chat"
                icon={<MessageSquare size={16} />}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Theme Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={themeColor}
                  onChange={(e) => setThemeColor(e.target.value)}
                  className="w-12 h-12 rounded-2xl border border-slate-200 cursor-pointer"
                />
                <BaseInput 
                  value={themeColor}
                  onChange={(e) => setThemeColor(e.target.value)}
                  placeholder="#6366f1"
                  icon={<Palette size={16} />}
                />
              </div>
            </div>
            <div className="col-span-2 space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Welcome Message</label>
              <BaseInput 
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                placeholder="Hi there! How can I help you today?"
                icon={<MessageSquare size={16} />}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">AI Instructions (Optional)</label>
              <textarea
                value={aiInstructions}
                onChange={(e) => setAiInstructions(e.target.value)}
                placeholder="Custom instructions for how the AI should respond to visitors..."
                rows={3}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 hover:border-slate-300 resize-none"
              />
              <p className="text-xs text-slate-400 ml-1">These instructions guide the AI when auto-responding.</p>
            </div>
          </div>

          <div className="flex justify-end">
            <BaseButton 
              variant="primary" 
              icon={creating ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
              onClick={handleCreate}
              disabled={creating || !name.trim()}
            >
              {creating ? "CREATING..." : "CREATE WIDGET"}
            </BaseButton>
          </div>
        </div>
      )}

      {/* Widget List */}
      {chatbots.length === 0 && !showCreate ? (
        <div className="text-center py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-slate-400" />
          </div>
          <h4 className="font-bold text-slate-700 mb-2">No Chat Widgets Yet</h4>
          <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
            Create your first widget to start capturing leads from your website visitors.
          </p>
          <BaseButton 
            variant="primary" 
            icon={<Plus size={18} />}
            onClick={() => setShowCreate(true)}
          >
            CREATE YOUR FIRST WIDGET
          </BaseButton>
        </div>
      ) : (
        <div className="space-y-3">
          {chatbots.map((chatbot) => (
            <div
              key={chatbot.id}
              className="p-5 bg-white rounded-3xl border border-slate-200 hover:border-slate-300 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: chatbot.theme_color }}
                  >
                    <MessageSquare className="text-white" size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-900">{chatbot.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        chatbot.is_active 
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                          : "bg-slate-100 text-slate-500 border border-slate-200"
                      }`}>
                        {chatbot.is_active ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">{chatbot.welcome_message}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openCodeModal(chatbot)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      copiedId === chatbot.id
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {copiedId === chatbot.id ? <CheckCircle size={14} /> : <Code size={14} />}
                    {copiedId === chatbot.id ? "COPIED" : "GET CODE"}
                  </button>
                  <button
                    onClick={() => openEditModal(chatbot)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                    title="Edit widget"
                  >
                    <Pencil size={18} />
                  </button>
                  <Switch
                    checked={chatbot.is_active}
                    onCheckedChange={() => handleToggle(chatbot)}
                  />
                  <button
                    onClick={() => handleDelete(chatbot.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    title="Delete widget"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Installation Guide */}
      <div className="pt-8 border-t border-slate-100">
        <div className="mb-6">
          <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">Installation Guide</h4>
          <p className="text-sm text-slate-500 mt-1">Get your chat widget live in minutes.</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="p-5 bg-white border border-slate-200 rounded-3xl">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mb-4">
              <span className="text-indigo-600 font-black">1</span>
            </div>
            <h5 className="font-bold text-slate-900 text-sm mb-1">Create Widget</h5>
            <p className="text-xs text-slate-500">Set up your chat widget with custom branding and welcome message.</p>
          </div>
          <div className="p-5 bg-white border border-slate-200 rounded-3xl">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mb-4">
              <span className="text-indigo-600 font-black">2</span>
            </div>
            <h5 className="font-bold text-slate-900 text-sm mb-1">Copy Code</h5>
            <p className="text-xs text-slate-500">Click on a widget to reveal the embed code, then copy it.</p>
          </div>
          <div className="p-5 bg-white border border-slate-200 rounded-3xl">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-4">
              <CheckCircle size={18} className="text-emerald-600" />
            </div>
            <h5 className="font-bold text-slate-900 text-sm mb-1">Go Live</h5>
            <p className="text-xs text-slate-500">Paste before &lt;/body&gt; and start chatting with visitors!</p>
          </div>
        </div>
      </div>

      {/* Embed Code Modal */}
      {showCodeModal && currentChatbot && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: currentChatbot.theme_color }}
                  >
                    <Code className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 uppercase tracking-tight">Embed Code</h3>
                    <p className="text-xs text-slate-500">{currentChatbot.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => { setShowCodeModal(false); setCurrentChatbot(null); setCopiedModal(false) }}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="relative">
                <pre className="p-4 bg-slate-900 rounded-2xl text-sm font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap break-all">
                  <code>{getEmbedCode(currentChatbot)}</code>
                </pre>
              </div>

              <BaseButton
                variant={copiedModal ? "secondary" : "primary"}
                icon={copiedModal ? <CheckCircle size={18} className="text-emerald-500" /> : <Copy size={18} />}
                onClick={() => copyEmbedCode(currentChatbot, true)}
                className="w-full"
              >
                {copiedModal ? "COPIED TO CLIPBOARD!" : "COPY EMBED CODE"}
              </BaseButton>

              <div className="flex items-start gap-3 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                  <Zap size={16} className="text-white" />
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 text-sm">Quick Install</h5>
                  <p className="text-xs text-slate-600 mt-1">
                    Paste this code just before the closing <code className="px-1.5 py-0.5 bg-white rounded text-indigo-600 font-mono text-[10px]">&lt;/body&gt;</code> tag on any page.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Widget Modal */}
      {showEditModal && currentChatbot && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-slate-900 uppercase tracking-tight">Edit Widget</h3>
                <button
                  onClick={() => { setShowEditModal(false); setCurrentChatbot(null); resetForm() }}
                  className="text-slate-400 hover:text-slate-600 text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Widget Name</label>
                  <BaseInput 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Main Website Chat"
                    icon={<MessageSquare size={16} />}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Theme Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      className="w-12 h-12 rounded-2xl border border-slate-200 cursor-pointer"
                    />
                    <BaseInput 
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      placeholder="#6366f1"
                      icon={<Palette size={16} />}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Welcome Message</label>
                <BaseInput 
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  placeholder="Hi there! How can I help you today?"
                  icon={<MessageSquare size={16} />}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">AI Instructions (Optional)</label>
                <textarea
                  value={aiInstructions}
                  onChange={(e) => setAiInstructions(e.target.value)}
                  placeholder="Custom instructions for how the AI should respond..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 hover:border-slate-300 resize-none"
                />
                <p className="text-xs text-slate-400 ml-1">These instructions guide the AI when auto-responding.</p>
              </div>

              <div className="flex gap-3 pt-2">
                <BaseButton 
                  variant="outline" 
                  onClick={() => { setShowEditModal(false); setCurrentChatbot(null); resetForm() }}
                  className="flex-1"
                >
                  CANCEL
                </BaseButton>
                <BaseButton 
                  variant="primary" 
                  icon={saving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                  onClick={handleEdit}
                  disabled={saving || !name.trim()}
                  className="flex-1"
                >
                  {saving ? "SAVING..." : "SAVE CHANGES"}
                </BaseButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default WidgetSettings
