"use client"

import { useState } from "react"
import {
  MessageSquare,
  Check,
  Copy,
  Code,
  MousePointer,
  Square,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export interface ChatButtonConfig {
  name: string
  chatbotId: string
  buttonType: "floating" | "inline"
  buttonText: string
  showIcon: boolean
  iconPosition: "left" | "right"
  // Style options
  backgroundColor: string
  textColor: string
  borderRadius: number
  borderWidth: number
  borderColor: string
  paddingX: number
  paddingY: number
  fontSize: number
  fontWeight: "normal" | "medium" | "semibold" | "bold" | "black"
  // Floating-specific options
  floatingPosition: "bottom-right" | "bottom-left" | "bottom-center"
  floatingOffsetX: number
  floatingOffsetY: number
}

interface ChatButtonBuilderProps {
  buttonId?: string
  chatbotId?: string
  initialConfig?: ChatButtonConfig | null
  onConfigChange: (config: ChatButtonConfig) => void
}

const DEFAULT_CONFIG: ChatButtonConfig = {
  name: "Chat Button",
  chatbotId: "",
  buttonType: "floating",
  buttonText: "ENTER CHAT",
  showIcon: true,
  iconPosition: "left",
  backgroundColor: "#18181b",
  textColor: "#ffffff",
  borderRadius: 50,
  borderWidth: 0,
  borderColor: "#18181b",
  paddingX: 32,
  paddingY: 16,
  fontSize: 14,
  fontWeight: "bold",
  floatingPosition: "bottom-center",
  floatingOffsetX: 0,
  floatingOffsetY: 24,
}

export function ChatButtonBuilder({ buttonId, chatbotId, initialConfig, onConfigChange }: ChatButtonBuilderProps) {
  const [config, setConfig] = useState<ChatButtonConfig>({
    ...DEFAULT_CONFIG,
    ...initialConfig,
    chatbotId: chatbotId || initialConfig?.chatbotId || "",
  })
  const [activeTab, setActiveTab] = useState<"style" | "behavior" | "embed">("style")
  const [copied, setCopied] = useState(false)

  const updateConfig = (newConfig: ChatButtonConfig) => {
    setConfig(newConfig)
    onConfigChange(newConfig)
  }

  const fontWeights: Record<string, number> = {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    black: 900,
  }

  const generateEmbedCode = () => {
    if (!buttonId || !config.chatbotId) return "<!-- Save the button and select a chatbot first -->"
    
    const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
    
    if (config.buttonType === "floating") {
      return `<!-- Flourish Chat Button (Floating) -->
<script>
(function() {
  var btn = document.createElement('button');
  btn.innerHTML = '${config.showIcon ? `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-${config.iconPosition === 'left' ? 'right' : 'left'}: 8px;${config.iconPosition === 'right' ? 'order: 1;' : ''}"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>' : ''}${config.buttonText}';
  btn.style.cssText = 'position:fixed;${config.floatingPosition === 'bottom-center' ? 'left:50%;transform:translateX(-50%);' : config.floatingPosition === 'bottom-right' ? `right:${config.floatingOffsetX}px;` : `left:${config.floatingOffsetX}px;`}bottom:${config.floatingOffsetY}px;display:flex;align-items:center;justify-content:center;background:${config.backgroundColor};color:${config.textColor};border-radius:${config.borderRadius}px;border:${config.borderWidth}px solid ${config.borderColor};padding:${config.paddingY}px ${config.paddingX}px;font-size:${config.fontSize}px;font-weight:${fontWeights[config.fontWeight]};cursor:pointer;font-family:system-ui,-apple-system,sans-serif;z-index:9999;transition:all 0.2s;box-shadow:0 4px 20px rgba(0,0,0,0.15);';
  btn.onmouseover = function() { this.style.transform = '${config.floatingPosition === 'bottom-center' ? 'translateX(-50%) ' : ''}scale(1.05)'; this.style.boxShadow = '0 6px 24px rgba(0,0,0,0.2)'; };
  btn.onmouseout = function() { this.style.transform = '${config.floatingPosition === 'bottom-center' ? 'translateX(-50%)' : 'scale(1)'}'; this.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)'; };
  btn.onclick = function() {
    if (window.FlourishWidget) { window.FlourishWidget.open(); }
    else { var s = document.createElement('script'); s.src = '${baseUrl}/api/widget/embed.js?id=${config.chatbotId}'; s.onload = function() { setTimeout(function() { if (window.FlourishWidget) window.FlourishWidget.open(); }, 500); }; document.body.appendChild(s); }
  };
  document.body.appendChild(btn);
})();
</script>`
    } else {
      // Inline CTA button
      return `<!-- Flourish Chat Button (Inline CTA) -->
<button
  onclick="if(window.FlourishWidget){window.FlourishWidget.open();}else{var s=document.createElement('script');s.src='${baseUrl}/api/widget/embed.js?id=${config.chatbotId}';s.onload=function(){setTimeout(function(){if(window.FlourishWidget)window.FlourishWidget.open();},500);};document.body.appendChild(s);}"
  style="display:inline-flex;align-items:center;justify-content:center;background:${config.backgroundColor};color:${config.textColor};border-radius:${config.borderRadius}px;border:${config.borderWidth}px solid ${config.borderColor};padding:${config.paddingY}px ${config.paddingX}px;font-size:${config.fontSize}px;font-weight:${fontWeights[config.fontWeight]};cursor:pointer;font-family:system-ui,-apple-system,sans-serif;transition:all 0.2s;"
>
  ${config.showIcon && config.iconPosition === 'left' ? '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:8px;"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>' : ''}${config.buttonText}${config.showIcon && config.iconPosition === 'right' ? '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left:8px;"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>' : ''}
</button>`
    }
  }

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(generateEmbedCode())
    setCopied(true)
    toast.success("Embed code copied to clipboard!")
    setTimeout(() => setCopied(false), 2000)
  }

  const buttonStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: config.backgroundColor,
    color: config.textColor,
    borderRadius: `${config.borderRadius}px`,
    border: `${config.borderWidth}px solid ${config.borderColor}`,
    padding: `${config.paddingY}px ${config.paddingX}px`,
    fontSize: `${config.fontSize}px`,
    fontWeight: fontWeights[config.fontWeight],
    cursor: "pointer",
    fontFamily: "system-ui, -apple-system, sans-serif",
    transition: "all 0.2s",
    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
  }

  return (
    <div className="flex h-full">
      {/* Left Panel - Configuration */}
      <div className="w-80 bg-white border-r border-slate-100 flex flex-col">
        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          {[
            { id: "style", label: "Style" },
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
          {activeTab === "style" && (
            <div className="space-y-6">
              {/* Button Name */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                  Button Name
                </label>
                <input
                  type="text"
                  value={config.name}
                  onChange={(e) => updateConfig({ ...config, name: e.target.value })}
                  className="w-full text-sm px-3 py-2.5 border border-slate-200 rounded-xl focus:border-indigo-300 outline-none"
                  placeholder="My Chat Button"
                />
              </div>

              {/* Button Type */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                  Button Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => updateConfig({ ...config, buttonType: "floating" })}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      config.buttonType === "floating"
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <MousePointer size={20} className={config.buttonType === "floating" ? "text-indigo-600" : "text-slate-400"} />
                    <span className={`text-xs font-bold ${config.buttonType === "floating" ? "text-indigo-700" : "text-slate-600"}`}>
                      Floating
                    </span>
                    <span className="text-[9px] text-slate-400 text-center">Fixed position, scrolls with page</span>
                  </button>
                  <button
                    onClick={() => updateConfig({ ...config, buttonType: "inline" })}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      config.buttonType === "inline"
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <Square size={20} className={config.buttonType === "inline" ? "text-indigo-600" : "text-slate-400"} />
                    <span className={`text-xs font-bold ${config.buttonType === "inline" ? "text-indigo-700" : "text-slate-600"}`}>
                      Inline CTA
                    </span>
                    <span className="text-[9px] text-slate-400 text-center">Place anywhere as CTA button</span>
                  </button>
                </div>
              </div>

              {/* Button Text */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                  Button Text
                </label>
                <input
                  type="text"
                  value={config.buttonText}
                  onChange={(e) => updateConfig({ ...config, buttonText: e.target.value })}
                  className="w-full text-sm px-3 py-2.5 border border-slate-200 rounded-xl focus:border-indigo-300 outline-none"
                  placeholder="ENTER CHAT"
                />
              </div>

              {/* Show Icon */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                  Chat Icon
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.showIcon}
                      onChange={(e) => updateConfig({ ...config, showIcon: e.target.checked })}
                      className="w-4 h-4 rounded text-indigo-600"
                    />
                    <span className="text-sm text-slate-600">Show icon</span>
                  </label>
                  {config.showIcon && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateConfig({ ...config, iconPosition: "left" })}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg ${
                          config.iconPosition === "left" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        Left
                      </button>
                      <button
                        onClick={() => updateConfig({ ...config, iconPosition: "right" })}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg ${
                          config.iconPosition === "right" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        Right
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Colors */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                    Background
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.backgroundColor}
                      onChange={(e) => updateConfig({ ...config, backgroundColor: e.target.value })}
                      className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200"
                    />
                    <input
                      type="text"
                      value={config.backgroundColor}
                      onChange={(e) => updateConfig({ ...config, backgroundColor: e.target.value })}
                      className="flex-1 text-xs px-2 py-2 border border-slate-200 rounded-lg outline-none font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                    Text Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.textColor}
                      onChange={(e) => updateConfig({ ...config, textColor: e.target.value })}
                      className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200"
                    />
                    <input
                      type="text"
                      value={config.textColor}
                      onChange={(e) => updateConfig({ ...config, textColor: e.target.value })}
                      className="flex-1 text-xs px-2 py-2 border border-slate-200 rounded-lg outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Border Radius */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                  Corner Roundness: {config.borderRadius}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={config.borderRadius}
                  onChange={(e) => updateConfig({ ...config, borderRadius: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-[9px] text-slate-400 mt-1">
                  <span>Square</span>
                  <span>Pill</span>
                </div>
              </div>

              {/* Border/Stroke */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                  Border/Stroke
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[9px] text-slate-400">Width: {config.borderWidth}px</span>
                    <input
                      type="range"
                      min="0"
                      max="5"
                      value={config.borderWidth}
                      onChange={(e) => updateConfig({ ...config, borderWidth: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <input
                      type="color"
                      value={config.borderColor}
                      onChange={(e) => updateConfig({ ...config, borderColor: e.target.value })}
                      className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200"
                    />
                    <span className="text-[9px] text-slate-400 mb-2">Color</span>
                  </div>
                </div>
              </div>

              {/* Padding */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                  Padding
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[9px] text-slate-400">Horizontal: {config.paddingX}px</span>
                    <input
                      type="range"
                      min="12"
                      max="48"
                      value={config.paddingX}
                      onChange={(e) => updateConfig({ ...config, paddingX: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400">Vertical: {config.paddingY}px</span>
                    <input
                      type="range"
                      min="8"
                      max="24"
                      value={config.paddingY}
                      onChange={(e) => updateConfig({ ...config, paddingY: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Font Size & Weight */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                    Font Size: {config.fontSize}px
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="20"
                    value={config.fontSize}
                    onChange={(e) => updateConfig({ ...config, fontSize: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                    Font Weight
                  </label>
                  <select
                    value={config.fontWeight}
                    onChange={(e) => updateConfig({ ...config, fontWeight: e.target.value as ChatButtonConfig["fontWeight"] })}
                    className="w-full text-sm px-3 py-2.5 border border-slate-200 rounded-xl focus:border-indigo-300 outline-none"
                  >
                    <option value="normal">Normal</option>
                    <option value="medium">Medium</option>
                    <option value="semibold">Semibold</option>
                    <option value="bold">Bold</option>
                    <option value="black">Black</option>
                  </select>
                </div>
              </div>

              {/* Floating Position (only for floating type) */}
              {config.buttonType === "floating" && (
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                    Floating Position
                  </label>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[
                      { id: "bottom-left", label: "Left" },
                      { id: "bottom-center", label: "Center" },
                      { id: "bottom-right", label: "Right" },
                    ].map((pos) => (
                      <button
                        key={pos.id}
                        onClick={() => updateConfig({ ...config, floatingPosition: pos.id as typeof config.floatingPosition })}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                          config.floatingPosition === pos.id
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {pos.label}
                      </button>
                    ))}
                  </div>
                  {config.floatingPosition !== "bottom-center" && (
                    <div>
                      <span className="text-[9px] text-slate-400">Horizontal Offset: {config.floatingOffsetX}px</span>
                      <input
                        type="range"
                        min="0"
                        max="48"
                        value={config.floatingOffsetX}
                        onChange={(e) => updateConfig({ ...config, floatingOffsetX: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                  )}
                  <div className="mt-2">
                    <span className="text-[9px] text-slate-400">Bottom Offset: {config.floatingOffsetY}px</span>
                    <input
                      type="range"
                      min="8"
                      max="48"
                      value={config.floatingOffsetY}
                      onChange={(e) => updateConfig({ ...config, floatingOffsetY: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "behavior" && (
            <div className="space-y-6">
              {/* Linked Chatbot */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                  Linked Chatbot
                </label>
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <p className="text-xs text-amber-700 mb-2">
                    This button will open the chat widget when clicked. Make sure you have created a Chat Widget first.
                  </p>
                  <input
                    type="text"
                    value={config.chatbotId}
                    onChange={(e) => updateConfig({ ...config, chatbotId: e.target.value })}
                    className="w-full text-sm px-3 py-2.5 border border-amber-200 rounded-xl focus:border-amber-400 outline-none bg-white"
                    placeholder="Enter your Chat Widget ID"
                  />
                  <p className="text-[9px] text-amber-600 mt-2">
                    Find your Chat Widget ID in the Creative Suite under Chat Widget.
                  </p>
                </div>
              </div>

              {/* Info */}
              <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <p className="text-xs text-indigo-700">
                  When visitors click this button, it will load and open your chat widget. The lead capture form will appear first, then visitors can start chatting.
                </p>
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
                  {config.buttonType === "floating" 
                    ? "Copy this code and paste it before the closing </body> tag."
                    : "Copy this button code and place it anywhere in your HTML."
                  }
                </p>
                <pre className="bg-slate-900 text-emerald-400 p-4 rounded-xl text-[10px] overflow-x-auto whitespace-pre-wrap font-mono max-h-48">
                  {generateEmbedCode()}
                </pre>
                <Button
                  onClick={copyEmbedCode}
                  className="w-full mt-4 rounded-xl"
                  disabled={!buttonId || !config.chatbotId}
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
                {(!buttonId || !config.chatbotId) && (
                  <p className="text-[10px] text-amber-600 mt-2 text-center">
                    {!buttonId ? "Save the button first" : "Enter a Chatbot ID first"}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Live Preview */}
      <div className="flex-1 bg-gradient-to-br from-slate-100 via-slate-50 to-indigo-50 p-8 flex items-center justify-center relative overflow-hidden">
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
            
            {/* Inline CTA Preview */}
            {config.buttonType === "inline" && (
              <div className="mt-8 flex justify-center">
                <button style={buttonStyle}>
                  {config.showIcon && config.iconPosition === "left" && (
                    <MessageSquare size={20} style={{ marginRight: 8 }} />
                  )}
                  {config.buttonText}
                  {config.showIcon && config.iconPosition === "right" && (
                    <MessageSquare size={20} style={{ marginLeft: 8 }} />
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Floating Button Preview */}
          {config.buttonType === "floating" && (
            <div
              className="absolute transition-all"
              style={{
                bottom: config.floatingOffsetY,
                ...(config.floatingPosition === "bottom-center" 
                  ? { left: "50%", transform: "translateX(-50%)" }
                  : config.floatingPosition === "bottom-right"
                  ? { right: config.floatingOffsetX }
                  : { left: config.floatingOffsetX }
                ),
              }}
            >
              <button style={buttonStyle}>
                {config.showIcon && config.iconPosition === "left" && (
                  <MessageSquare size={20} style={{ marginRight: 8 }} />
                )}
                {config.buttonText}
                {config.showIcon && config.iconPosition === "right" && (
                  <MessageSquare size={20} style={{ marginLeft: 8 }} />
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
