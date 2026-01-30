"use client"

import { useState, useEffect } from "react"
import {
  MessageSquare,
  Palette,
  Type,
  Zap,
  Code,
  Copy,
  Check,
  Eye,
  Send,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export interface ChatWidgetConfig {
  name: string
  welcomeMessage: string
  aiInstructions: string
  themeColor: string
  position: "bottom-right" | "bottom-left"
  buttonSize: "small" | "medium" | "large"
  headerTitle: string
  placeholderText: string
  collectEmail: boolean
  collectPhone: boolean
  collectName: boolean
}

interface ChatWidgetBuilderProps {
  widgetId?: string
  initialConfig?: ChatWidgetConfig | null
  onConfigChange: (config: ChatWidgetConfig) => void
}

const DEFAULT_CONFIG: ChatWidgetConfig = {
  name: "Website Chat",
  welcomeMessage: "Hi there! How can I help you today?",
  aiInstructions: "",
  themeColor: "#6366f1",
  position: "bottom-right",
  buttonSize: "medium",
  headerTitle: "Chat with us",
  placeholderText: "Type a message...",
  collectEmail: true,
  collectPhone: true,
  collectName: true,
}

export function ChatWidgetBuilder({ widgetId, initialConfig, onConfigChange }: ChatWidgetBuilderProps) {
  const [config, setConfig] = useState<ChatWidgetConfig>(initialConfig || DEFAULT_CONFIG)
  const [activeTab, setActiveTab] = useState<"design" | "behavior" | "embed">("design")
  const [copied, setCopied] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(true)

  // Sync config changes with parent
  const updateConfig = (newConfig: ChatWidgetConfig) => {
    setConfig(newConfig)
    onConfigChange(newConfig)
  }

  const generateEmbedCode = () => {
    if (!widgetId) return "<!-- Save the widget first to get embed code -->"
    
    const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
    return `<!-- Flourish Agency Chat Widget -->
<script src="${baseUrl}/api/widget/embed.js?id=${widgetId}" async></script>`
  }

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(generateEmbedCode())
    setCopied(true)
    toast.success("Embed code copied to clipboard!")
    setTimeout(() => setCopied(false), 2000)
  }

  const buttonSizes = {
    small: { button: 48, icon: 20 },
    medium: { button: 56, icon: 24 },
    large: { button: 64, icon: 28 },
  }

  return (
    <div className="flex h-full">
      {/* Left Panel - Configuration */}
      <div className="w-80 bg-white border-r border-slate-100 flex flex-col">
        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          {[
            { id: "design", label: "Design" },
            { id: "behavior", label: "Behavior" },
            { id: "embed", label: "Embed Code" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id
                  ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === "design" && (
            <div className="space-y-6">
              {/* Widget Name */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                  Widget Name
                </label>
                <input
                  type="text"
                  value={config.name}
                  onChange={(e) => updateConfig({ ...config, name: e.target.value })}
                  className="w-full text-sm px-3 py-2.5 border border-slate-200 rounded-xl focus:border-indigo-300 outline-none"
                  placeholder="My Chat Widget"
                />
              </div>

              {/* Theme Color */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                  Theme Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={config.themeColor}
                    onChange={(e) => updateConfig({ ...config, themeColor: e.target.value })}
                    className="w-12 h-12 rounded-xl cursor-pointer border border-slate-200"
                  />
                  <input
                    type="text"
                    value={config.themeColor}
                    onChange={(e) => updateConfig({ ...config, themeColor: e.target.value })}
                    className="flex-1 text-sm px-3 py-2.5 border border-slate-200 rounded-xl focus:border-indigo-300 outline-none font-mono"
                  />
                </div>
              </div>

              {/* Header Title */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                  Header Title
                </label>
                <input
                  type="text"
                  value={config.headerTitle}
                  onChange={(e) => updateConfig({ ...config, headerTitle: e.target.value })}
                  className="w-full text-sm px-3 py-2.5 border border-slate-200 rounded-xl focus:border-indigo-300 outline-none"
                  placeholder="Chat with us"
                />
              </div>

              {/* Welcome Message */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                  Welcome Message
                </label>
                <textarea
                  value={config.welcomeMessage}
                  onChange={(e) => updateConfig({ ...config, welcomeMessage: e.target.value })}
                  className="w-full text-sm px-3 py-2.5 border border-slate-200 rounded-xl focus:border-indigo-300 outline-none resize-none"
                  rows={3}
                  placeholder="Hi there! How can I help you today?"
                />
              </div>

              {/* Placeholder Text */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                  Input Placeholder
                </label>
                <input
                  type="text"
                  value={config.placeholderText}
                  onChange={(e) => updateConfig({ ...config, placeholderText: e.target.value })}
                  className="w-full text-sm px-3 py-2.5 border border-slate-200 rounded-xl focus:border-indigo-300 outline-none"
                  placeholder="Type a message..."
                />
              </div>

              {/* Position */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                  Position
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "bottom-right", label: "Bottom Right" },
                    { id: "bottom-left", label: "Bottom Left" },
                  ].map((pos) => (
                    <button
                      key={pos.id}
                      onClick={() => updateConfig({ ...config, position: pos.id as typeof config.position })}
                      className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        config.position === pos.id
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Button Size */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                  Button Size
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["small", "medium", "large"] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => updateConfig({ ...config, buttonSize: size })}
                      className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all capitalize ${
                        config.buttonSize === size
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "behavior" && (
            <div className="space-y-6">
              {/* AI Instructions */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                  AI Instructions
                </label>
                <textarea
                  value={config.aiInstructions}
                  onChange={(e) => updateConfig({ ...config, aiInstructions: e.target.value })}
                  className="w-full text-sm px-3 py-2.5 border border-slate-200 rounded-xl focus:border-indigo-300 outline-none resize-none"
                  rows={4}
                  placeholder="Custom instructions for how the AI should respond to visitors..."
                />
                <p className="text-[10px] text-slate-400 mt-2">
                  These instructions guide AI responses when auto-replying to visitors.
                </p>
              </div>

              {/* Lead Capture Fields */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">
                  Lead Capture Form
                </label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={config.collectName}
                      onChange={(e) => updateConfig({ ...config, collectName: e.target.checked })}
                      className="w-4 h-4 rounded text-indigo-600"
                    />
                    <div>
                      <span className="text-sm font-medium text-slate-700">Collect Name</span>
                      <p className="text-[10px] text-slate-400">Ask for visitor's first name</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={config.collectEmail}
                      onChange={(e) => updateConfig({ ...config, collectEmail: e.target.checked })}
                      className="w-4 h-4 rounded text-indigo-600"
                    />
                    <div>
                      <span className="text-sm font-medium text-slate-700">Collect Email</span>
                      <p className="text-[10px] text-slate-400">Ask for company email address</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={config.collectPhone}
                      onChange={(e) => updateConfig({ ...config, collectPhone: e.target.checked })}
                      className="w-4 h-4 rounded text-indigo-600"
                    />
                    <div>
                      <span className="text-sm font-medium text-slate-700">Collect Phone</span>
                      <p className="text-[10px] text-slate-400">Ask for cell phone number</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === "embed" && (
            <div className="space-y-6">
              <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                <div className="flex items-center gap-2 mb-2">
                  <Code size={16} className="text-indigo-600" />
                  <h5 className="text-sm font-bold text-indigo-900">Embed Code</h5>
                </div>
                <p className="text-xs text-indigo-700 mb-4">
                  Copy this code and paste it into your website just before the closing &lt;/body&gt; tag.
                </p>
                <pre className="bg-slate-900 text-emerald-400 p-4 rounded-xl text-[10px] overflow-x-auto whitespace-pre-wrap font-mono">
                  {generateEmbedCode()}
                </pre>
                <Button
                  onClick={copyEmbedCode}
                  className="w-full mt-4 rounded-xl"
                  disabled={!widgetId}
                >
                  {copied ? (
                    <>
                      <Check size={14} className="mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={14} className="mr-2" />
                      Copy Embed Code
                    </>
                  )}
                </Button>
                {!widgetId && (
                  <p className="text-[10px] text-amber-600 mt-2 text-center">
                    Save the widget first to generate embed code
                  </p>
                )}
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <h5 className="text-xs font-bold text-slate-700 mb-2">How it works</h5>
                <ul className="text-[10px] text-slate-500 space-y-1.5">
                  <li>1. Copy the embed code above</li>
                  <li>2. Paste it into your website HTML before &lt;/body&gt;</li>
                  <li>3. Visitors can chat with you in real-time</li>
                  <li>4. Leads are automatically added to your contacts</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Live Preview */}
      <div className="flex-1 bg-slate-100 p-8 flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-4 right-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewOpen(!previewOpen)}
            className="rounded-xl bg-white"
          >
            <Eye size={14} className="mr-2" />
            {previewOpen ? "Close Preview" : "Open Preview"}
          </Button>
        </div>

        {/* Simulated Website Background */}
        <div className="w-full max-w-3xl h-[500px] bg-white rounded-2xl shadow-2xl relative overflow-hidden border border-slate-200">
          {/* Fake Website Content */}
          <div className="p-8">
            <div className="h-8 w-48 bg-slate-200 rounded mb-6" />
            <div className="space-y-3">
              <div className="h-4 w-full bg-slate-100 rounded" />
              <div className="h-4 w-5/6 bg-slate-100 rounded" />
              <div className="h-4 w-4/6 bg-slate-100 rounded" />
            </div>
            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="h-24 bg-slate-100 rounded-xl" />
              <div className="h-24 bg-slate-100 rounded-xl" />
              <div className="h-24 bg-slate-100 rounded-xl" />
            </div>
          </div>

          {/* Chat Widget Preview */}
          <div
            className={`absolute ${config.position === "bottom-right" ? "right-4" : "left-4"} bottom-4 transition-all`}
          >
            {/* Chat Panel */}
            {previewOpen && (
              <div className="mb-4 w-80 bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in slide-in-from-bottom-4 duration-300">
                {/* Header */}
                <div
                  className="p-4 text-white"
                  style={{ background: `linear-gradient(135deg, ${config.themeColor} 0%, ${config.themeColor}dd 100%)` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <MessageSquare size={20} />
                      </div>
                      <div>
                        <div className="font-semibold">{config.headerTitle}</div>
                        <div className="text-xs opacity-80">We typically reply within minutes</div>
                      </div>
                    </div>
                    <button className="p-1 hover:bg-white/10 rounded">
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="h-48 p-4 bg-slate-50 overflow-y-auto">
                  <div className="flex gap-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs shrink-0"
                      style={{ backgroundColor: config.themeColor }}
                    >
                      <MessageSquare size={14} />
                    </div>
                    <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-2 shadow-sm max-w-[80%]">
                      <p className="text-sm text-slate-700">{config.welcomeMessage}</p>
                    </div>
                  </div>
                </div>

                {/* Input */}
                <div className="p-4 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder={config.placeholderText}
                      className="flex-1 px-4 py-2.5 bg-slate-100 rounded-full text-sm outline-none"
                      disabled
                    />
                    <button
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: config.themeColor }}
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>

                {/* Powered By */}
                <div className="px-4 py-2 text-center border-t border-slate-100">
                  <span className="text-[10px] text-slate-400">
                    Powered by{" "}
                    <a href="https://www.simplyflourish.space" className="text-slate-500 hover:underline">
                      Flourish Agency Systems
                    </a>
                  </span>
                </div>
              </div>
            )}

            {/* Chat Button */}
            <button
              className="rounded-full shadow-2xl flex items-center justify-center text-white transition-transform hover:scale-110"
              style={{
                backgroundColor: config.themeColor,
                width: buttonSizes[config.buttonSize].button,
                height: buttonSizes[config.buttonSize].button,
              }}
              onClick={() => setPreviewOpen(!previewOpen)}
            >
              {previewOpen ? (
                <X size={buttonSizes[config.buttonSize].icon} />
              ) : (
                <MessageSquare size={buttonSizes[config.buttonSize].icon} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
