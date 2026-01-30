"use client"

import React, { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Layout,
  ImageIcon,
  Share2,
  Plus,
  Layers,
  Type,
  Trash2,
  CheckCircle,
  X,
  Save,
  Undo2,
  Redo2,
  Palette,
  ChevronDown,
  Copy,
  Download,
  Square,
  Circle,
  Triangle,
  FileText,
  Globe,
  Mail,
  Instagram,
  Move,
  Code,
  ClipboardCopy,
  Check,
  MessageSquare,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { FormBuilder, type FormConfig } from "./form-builder"
import { ChatWidgetBuilder, type ChatWidgetConfig } from "./chat-widget-builder"

type ProjectType = "form" | "chat_widget" | "landing_page" | "website" | "email_template" | "social_story" | "social_post"

interface CanvasElement {
  id: string
  type: "image" | "text" | "shape"
  x: number
  y: number
  width: number
  height: number
  content?: string
  src?: string
  shape?: "rectangle" | "circle" | "triangle"
  fill?: string
  fontSize?: number
  fontFamily?: string
  color?: string
  rotation?: number
  zIndex: number
}

interface CreativeStudioModalProps {
  onClose: () => void
  initialType?: ProjectType
  editingAsset?: { id: string; name: string; type: ProjectType; canvas_data?: CanvasElement[] }
}

const PROJECT_TYPES: { id: ProjectType; label: string; icon: React.ElementType; description: string }[] = [
  { id: "form", label: "Form", icon: FileText, description: "Lead capture forms" },
  { id: "chat_widget", label: "Chat Widget", icon: MessageSquare, description: "Embeddable live chat" },
  { id: "landing_page", label: "Landing Page", icon: Layout, description: "Conversion pages" },
  { id: "website", label: "Website", icon: Globe, description: "Multi-page sites" },
  { id: "email_template", label: "Email Template", icon: Mail, description: "Email campaigns" },
  { id: "social_story", label: "Social Story", icon: Instagram, description: "9:16 vertical stories" },
  { id: "social_post", label: "Social Post", icon: ImageIcon, description: "1:1 square posts" },
]

const CANVAS_SIZES: Record<ProjectType, { width: number; height: number }> = {
  social_story: { width: 1080, height: 1920 },
  social_post: { width: 1080, height: 1080 },
  form: { width: 600, height: 800 },
  chat_widget: { width: 400, height: 600 },
  landing_page: { width: 1200, height: 900 },
  website: { width: 1440, height: 900 },
  email_template: { width: 600, height: 800 },
}

export function CreativeStudioModal({ onClose, initialType = "landing_page", editingAsset }: CreativeStudioModalProps) {
  const supabase = createClient()
  const canvasRef = useRef<HTMLDivElement>(null)
  
  const [projectType, setProjectType] = useState<ProjectType>(editingAsset?.type || initialType)
  const [projectName, setProjectName] = useState(editingAsset?.name || "Untitled Project")
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)
  const [activeLayer, setActiveLayer] = useState<string>("hero")
  const [elements, setElements] = useState<CanvasElement[]>(editingAsset?.canvas_data || [])
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [history, setHistory] = useState<CanvasElement[][]>([[]])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [saving, setSaving] = useState(false)
  const [previewMode, setPreviewMode] = useState<string>("responsive")
  const [formConfig, setFormConfig] = useState<FormConfig | null>(editingAsset?.canvas_data as FormConfig | null)
  const [chatWidgetConfig, setChatWidgetConfig] = useState<ChatWidgetConfig | null>(editingAsset?.canvas_data as ChatWidgetConfig | null)
  const [showEmbedCode, setShowEmbedCode] = useState(false)
  const [embedCopied, setEmbedCopied] = useState(false)
  const [savedAssetId, setSavedAssetId] = useState<string | null>(editingAsset?.id || null)

  const isCanvasEditor = projectType === "social_story" || projectType === "social_post"
  const isFormBuilder = projectType === "form"
  const isChatWidgetBuilder = projectType === "chat_widget"
  const isEmbeddable = isFormBuilder || isChatWidgetBuilder
  const canvasSize = CANVAS_SIZES[projectType]

  // Save to history for undo/redo
  const saveToHistory = (newElements: CanvasElement[]) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newElements)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setElements(history[historyIndex - 1])
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setElements(history[historyIndex + 1])
    }
  }

  // Add element to canvas
  const addElement = (type: CanvasElement["type"], options?: Partial<CanvasElement>) => {
    const newElement: CanvasElement = {
      id: crypto.randomUUID(),
      type,
      x: canvasSize.width / 2 - 75,
      y: canvasSize.height / 2 - 75,
      width: type === "text" ? 300 : 150,
      height: type === "text" ? 60 : 150,
      zIndex: elements.length,
      ...options,
    }
    
    if (type === "text") {
      newElement.content = "Add your text"
      newElement.fontSize = 32
      newElement.fontFamily = "Inter"
      newElement.color = "#1e293b"
    } else if (type === "shape") {
      newElement.shape = options?.shape || "rectangle"
      newElement.fill = "#6366f1"
    }
    
    const newElements = [...elements, newElement]
    setElements(newElements)
    saveToHistory(newElements)
    setSelectedElement(newElement.id)
  }

  // Delete selected element
  const deleteElement = () => {
    if (!selectedElement) return
    const newElements = elements.filter(el => el.id !== selectedElement)
    setElements(newElements)
    saveToHistory(newElements)
    setSelectedElement(null)
  }

  // Duplicate selected element
  const duplicateElement = () => {
    if (!selectedElement) return
    const el = elements.find(e => e.id === selectedElement)
    if (!el) return
    
    const newElement = {
      ...el,
      id: crypto.randomUUID(),
      x: el.x + 20,
      y: el.y + 20,
      zIndex: elements.length,
    }
    const newElements = [...elements, newElement]
    setElements(newElements)
    saveToHistory(newElements)
    setSelectedElement(newElement.id)
  }

  // Handle drag start
  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation()
    const element = elements.find(el => el.id === elementId)
    if (!element || !canvasRef.current) return
    
    setSelectedElement(elementId)
    setIsDragging(true)
    
    const canvasRect = canvasRef.current.getBoundingClientRect()
    const scale = canvasRect.width / canvasSize.width
    
    setDragOffset({
      x: e.clientX - canvasRect.left - (element.x * scale),
      y: e.clientY - canvasRect.top - (element.y * scale),
    })
  }

  // Handle drag
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedElement || !canvasRef.current) return
    
    const canvasRect = canvasRef.current.getBoundingClientRect()
    const scale = canvasRect.width / canvasSize.width
    
    const newX = (e.clientX - canvasRect.left - dragOffset.x) / scale
    const newY = (e.clientY - canvasRect.top - dragOffset.y) / scale
    
    setElements(prev => prev.map(el => 
      el.id === selectedElement 
        ? { ...el, x: Math.max(0, Math.min(canvasSize.width - el.width, newX)), y: Math.max(0, Math.min(canvasSize.height - el.height, newY)) }
        : el
    ))
  }

  // Handle drag end
  const handleMouseUp = () => {
    if (isDragging) {
      saveToHistory(elements)
    }
    setIsDragging(false)
  }

  // Save project to database
  const handleSave = async () => {
    setSaving(true)
    try {
      // For chat widgets, we need to save to widget_chatbots table
      if (isChatWidgetBuilder && chatWidgetConfig) {
        const chatbotData = {
          name: chatWidgetConfig.name || projectName,
          welcome_message: chatWidgetConfig.welcomeMessage,
          ai_instructions: chatWidgetConfig.aiInstructions || null,
          theme_color: chatWidgetConfig.themeColor,
        }

        if (savedAssetId) {
          const { data } = await supabase
            .from("widget_chatbots")
            .update(chatbotData)
            .eq("id", savedAssetId)
            .select()
            .single()
          if (data) setSavedAssetId(data.id)
        } else {
          const res = await fetch("/api/widget/chatbots", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: chatbotData.name,
              welcomeMessage: chatbotData.welcome_message,
              aiInstructions: chatbotData.ai_instructions,
              themeColor: chatbotData.theme_color,
            }),
          })
          const data = await res.json()
          if (data.chatbot) {
            setSavedAssetId(data.chatbot.id)
          }
        }
        // Show embed code after save
        setShowEmbedCode(true)
        return
      }

      // For forms and other assets
      const assetData = {
        name: projectName,
        type: projectType,
        content_type: (isCanvasEditor || isFormBuilder) ? "json" as const : "html" as const,
        canvas_data: isCanvasEditor ? elements : isFormBuilder ? formConfig : null,
        content: (isCanvasEditor || isFormBuilder) ? null : generateHTML(),
        metadata: { canvasSize, previewMode, formConfig: isFormBuilder ? formConfig : undefined },
      }

      if (editingAsset?.id || savedAssetId) {
        const { data } = await supabase
          .from("creative_assets")
          .update(assetData)
          .eq("id", editingAsset?.id || savedAssetId)
          .select()
          .single()
        if (data) setSavedAssetId(data.id)
      } else {
        const { data } = await supabase
          .from("creative_assets")
          .insert(assetData)
          .select()
          .single()
        if (data) setSavedAssetId(data.id)
      }
      
      // Show embed code for embeddable assets
      if (isEmbeddable) {
        setShowEmbedCode(true)
      }
    } catch (error) {
      console.error("[v0] Failed to save:", error)
    } finally {
      setSaving(false)
    }
  }

  // Generate embed code for forms and chat widgets
  const getEmbedCode = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    const assetId = savedAssetId || editingAsset?.id || 'YOUR_ID'
    
    if (isChatWidgetBuilder) {
      return `<!-- Flourish Agency Chat Widget -->
<script src="${baseUrl}/api/widget/embed.js?id=${assetId}" async></script>`
    }
    
    // Form embed code
    return `<!-- Flourish Agency Embed Form -->
<div id="flourish-form-${assetId}"></div>
<script>
(function() {
  var iframe = document.createElement('iframe');
  iframe.src = '${baseUrl}/embed/form/${assetId}';
  iframe.style.width = '100%';
  iframe.style.height = '600px';
  iframe.style.border = 'none';
  iframe.style.borderRadius = '12px';
  document.getElementById('flourish-form-${assetId}').appendChild(iframe);
})();
</script>`
  }

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(getEmbedCode())
    setEmbedCopied(true)
    setTimeout(() => setEmbedCopied(false), 2000)
  }

  // Generate HTML for non-canvas projects
  const generateHTML = () => {
    return `<!DOCTYPE html><html><head><title>${projectName}</title></head><body></body></html>`
  }

  // Get scale for canvas display
  const getCanvasDisplaySize = () => {
    if (isCanvasEditor) {
      const maxWidth = 400
      const maxHeight = 600
      const scaleW = maxWidth / canvasSize.width
      const scaleH = maxHeight / canvasSize.height
      const scale = Math.min(scaleW, scaleH)
      return {
        width: canvasSize.width * scale,
        height: canvasSize.height * scale,
      }
    }
    return { width: 600, height: 800 }
  }

  const displaySize = getCanvasDisplaySize()

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-2xl animate-in fade-in duration-500" onClick={onClose} />

      {/* Studio Window */}
      <div className="bg-white w-full h-full max-w-[95vw] max-h-[90vh] rounded-[48px] shadow-[0_0_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden relative flex flex-col animate-in zoom-in-95 duration-500 ring-1 ring-white/20">
        {/* Header */}
        <header className="px-10 py-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0 relative z-20 shadow-sm">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <Layout size={24} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Creative Studio</h3>
                <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-indigo-100">
                  Pro Editor
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mt-1.5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Thorne AI Generative Workspace
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl mr-4 border border-slate-200/50">
              <button onClick={undo} disabled={historyIndex <= 0} className="p-2 text-slate-400 hover:text-indigo-600 transition-all disabled:opacity-30">
                <Undo2 size={16} />
              </button>
              <button onClick={redo} disabled={historyIndex >= history.length - 1} className="p-2 text-slate-400 hover:text-indigo-600 transition-all border-l border-slate-200 ml-1 pl-3 disabled:opacity-30">
                <Redo2 size={16} />
              </button>
            </div>
            <Button variant="outline" size="sm" onClick={handleSave} disabled={saving} className="rounded-xl font-black uppercase tracking-widest text-[10px] bg-transparent">
              <Save size={14} className="mr-2" />
              {saving ? "Saving..." : "Save Node"}
            </Button>
            <Button size="sm" className="rounded-xl font-black uppercase tracking-widest text-[10px] px-6 shadow-indigo-200">
              <Share2 size={14} className="mr-2" />
              Deploy to API
            </Button>
            {isCanvasEditor && (
              <Button variant="outline" size="sm" className="rounded-xl font-black uppercase tracking-widest text-[10px] bg-transparent">
                <Download size={14} className="mr-2" />
                Export
              </Button>
            )}
            {isEmbeddable && savedAssetId && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowEmbedCode(!showEmbedCode)}
                className="rounded-xl font-black uppercase tracking-widest text-[10px] bg-transparent"
              >
                <Code size={14} className="mr-2" />
                Get Embed Code
              </Button>
            )}
            <div className="w-px h-8 bg-slate-100 mx-2" />
            <button
              onClick={onClose}
              className="p-3 bg-slate-50 rounded-full text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all border border-slate-100"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        {/* Project Type Dropdown Bar */}
        <div className="px-10 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setShowTypeDropdown(!showTypeDropdown)}
              className="flex items-center gap-3 px-4 py-2.5 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 transition-all shadow-sm"
            >
              {(() => {
                const TypeIcon = PROJECT_TYPES.find(t => t.id === projectType)?.icon || Layout
                return <TypeIcon size={16} className="text-indigo-600" />
              })()}
              <span className="text-sm font-bold text-slate-700">
                {PROJECT_TYPES.find(t => t.id === projectType)?.label}
              </span>
              <ChevronDown size={16} className={`text-slate-400 transition-transform ${showTypeDropdown ? "rotate-180" : ""}`} />
            </button>
            
            {showTypeDropdown && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                {PROJECT_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => {
                      setProjectType(type.id)
                      setShowTypeDropdown(false)
                      if (type.id !== projectType) {
                        setElements([])
                        setSelectedElement(null)
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors ${
                      projectType === type.id ? "bg-indigo-50" : ""
                    }`}
                  >
                    <type.icon size={18} className={projectType === type.id ? "text-indigo-600" : "text-slate-400"} />
                    <div>
                      <div className={`text-sm font-bold ${projectType === type.id ? "text-indigo-700" : "text-slate-700"}`}>
                        {type.label}
                      </div>
                      <div className="text-[10px] text-slate-400">{type.description}</div>
                    </div>
                    {projectType === type.id && (
                      <div className="ml-auto w-2 h-2 rounded-full bg-indigo-600" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="w-px h-6 bg-slate-200" />
          
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="px-3 py-2 text-sm font-medium border border-transparent hover:border-slate-200 focus:border-indigo-300 rounded-xl bg-transparent focus:bg-white transition-all outline-none"
            placeholder="Project name..."
          />
          
          {isCanvasEditor && (
            <>
              <div className="w-px h-6 bg-slate-200" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {canvasSize.width} x {canvasSize.height}px
              </span>
            </>
          )}
        </div>

        {/* Embed Code Modal */}
        {showEmbedCode && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-black text-slate-900">
                    {isChatWidgetBuilder ? "Embed Your Chat Widget" : "Embed Your Form"}
                  </h4>
                  <p className="text-sm text-slate-500 mt-1">
                    {isChatWidgetBuilder 
                      ? "Add this code before </body> to enable live chat on your website"
                      : "Copy this code and paste it into your website"
                    }
                  </p>
                </div>
                <button onClick={() => setShowEmbedCode(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                  <X size={20} className="text-slate-400" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="bg-slate-900 rounded-2xl p-6 overflow-auto max-h-64">
                  <pre className="text-sm text-emerald-400 font-mono whitespace-pre-wrap break-all">
                    {getEmbedCode()}
                  </pre>
                </div>
                <div className="flex items-center gap-4">
                  <Button onClick={copyEmbedCode} className="flex-1 rounded-xl font-black uppercase tracking-widest text-[10px]">
                    {embedCopied ? (
                      <>
                        <Check size={14} className="mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <ClipboardCopy size={14} className="mr-2" />
                        Copy Embed Code
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setShowEmbedCode(false)} className="rounded-xl font-black uppercase tracking-widest text-[10px]">
                    Close
                  </Button>
                </div>
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <p className="text-xs text-amber-700">
                    <strong>Note:</strong> {isChatWidgetBuilder 
                      ? "The chat widget will appear in the bottom corner of your website. Conversations and leads are automatically captured in your dashboard."
                      : "Make sure to save your form first before embedding. The form will automatically capture submissions and store them in your dashboard."
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Workspace */}
        <div className="flex-1 overflow-hidden flex bg-slate-50/40">
          {/* Tool Sidebar - Hide for Form Builder and Chat Widget since they have their own UI */}
          {!isFormBuilder && !isChatWidgetBuilder && (
          <aside className="w-80 bg-white border-r border-slate-100 p-8 flex flex-col gap-10 overflow-y-auto relative z-10">
            <section className="space-y-4">
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-between">
                Canvas Layering
                <button onClick={() => addElement("shape")} className="text-indigo-500 hover:text-indigo-700 transition-colors">
                  <Plus size={12} />
                </button>
              </h5>
              <div className="space-y-2">
                {elements.length === 0 ? (
                  <>
                    <LayerItem icon={<ImageIcon size={14} />} label="Hero Graphics" active={activeLayer === "hero"} onClick={() => setActiveLayer("hero")} />
                    <LayerItem icon={<Type size={14} />} label="Conversion Copy" active={activeLayer === "copy"} onClick={() => setActiveLayer("copy")} />
                    <LayerItem icon={<Square size={14} />} label="Action Buttons" active={activeLayer === "buttons"} onClick={() => setActiveLayer("buttons")} />
                  </>
                ) : (
                  elements.map((el, index) => (
                    <LayerItem
                      key={el.id}
                      icon={el.type === "image" ? <ImageIcon size={14} /> : el.type === "text" ? <Type size={14} /> : <Square size={14} />}
                      label={`${el.type.charAt(0).toUpperCase() + el.type.slice(1)} ${index + 1}`}
                      active={selectedElement === el.id}
                      onClick={() => setSelectedElement(el.id)}
                    />
                  ))
                )}
              </div>
            </section>

            <section className="space-y-4">
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Palette</h5>
              <div className="grid grid-cols-2 gap-3">
                <AssetTool icon={<ImageIcon size={20} />} label="Images" onClick={() => addElement("image")} />
                <AssetTool icon={<Type size={20} />} label="Text" onClick={() => addElement("text")} />
                <AssetTool icon={<Layers size={20} />} label="Shapes" onClick={() => addElement("shape", { shape: "rectangle" })} />
                <AssetTool icon={<Palette size={20} />} label="Themes" onClick={() => {}} />
              </div>
            </section>

            {/* Shape Tools for Canvas Editor */}
            {isCanvasEditor && (
              <section className="space-y-4">
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Shape Tools</h5>
                <div className="flex gap-2">
                  <button 
                    onClick={() => addElement("shape", { shape: "rectangle" })}
                    className="flex-1 p-3 bg-slate-50 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-100"
                  >
                    <Square size={20} className="mx-auto" />
                  </button>
                  <button 
                    onClick={() => addElement("shape", { shape: "circle" })}
                    className="flex-1 p-3 bg-slate-50 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-100"
                  >
                    <Circle size={20} className="mx-auto" />
                  </button>
                  <button 
                    onClick={() => addElement("shape", { shape: "triangle" })}
                    className="flex-1 p-3 bg-slate-50 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-100"
                  >
                    <Triangle size={20} className="mx-auto" />
                  </button>
                </div>
              </section>
            )}

            {/* Selected Element Controls */}
            {selectedElement && isCanvasEditor && (
              <section className="space-y-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-between">
                  Element Properties
                  <div className="flex gap-1">
                    <button onClick={duplicateElement} className="p-1.5 hover:bg-white rounded-lg transition-colors">
                      <Copy size={12} className="text-slate-400" />
                    </button>
                    <button onClick={deleteElement} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={12} className="text-red-400" />
                    </button>
                  </div>
                </h5>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Position</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        value={Math.round(elements.find(e => e.id === selectedElement)?.x || 0)}
                        onChange={(e) => {
                          const newElements = elements.map(el => 
                            el.id === selectedElement ? { ...el, x: Number(e.target.value) } : el
                          )
                          setElements(newElements)
                        }}
                        className="px-2 py-1.5 text-xs border border-slate-200 rounded-lg w-full"
                        placeholder="X"
                      />
                      <input
                        type="number"
                        value={Math.round(elements.find(e => e.id === selectedElement)?.y || 0)}
                        onChange={(e) => {
                          const newElements = elements.map(el => 
                            el.id === selectedElement ? { ...el, y: Number(e.target.value) } : el
                          )
                          setElements(newElements)
                        }}
                        className="px-2 py-1.5 text-xs border border-slate-200 rounded-lg w-full"
                        placeholder="Y"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Size</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        value={Math.round(elements.find(e => e.id === selectedElement)?.width || 0)}
                        onChange={(e) => {
                          const newElements = elements.map(el => 
                            el.id === selectedElement ? { ...el, width: Number(e.target.value) } : el
                          )
                          setElements(newElements)
                        }}
                        className="px-2 py-1.5 text-xs border border-slate-200 rounded-lg w-full"
                        placeholder="W"
                      />
                      <input
                        type="number"
                        value={Math.round(elements.find(e => e.id === selectedElement)?.height || 0)}
                        onChange={(e) => {
                          const newElements = elements.map(el => 
                            el.id === selectedElement ? { ...el, height: Number(e.target.value) } : el
                          )
                          setElements(newElements)
                        }}
                        className="px-2 py-1.5 text-xs border border-slate-200 rounded-lg w-full"
                        placeholder="H"
                      />
                    </div>
                  </div>

                  {elements.find(e => e.id === selectedElement)?.type === "shape" && (
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Fill Color</label>
                      <input
                        type="color"
                        value={elements.find(e => e.id === selectedElement)?.fill || "#6366f1"}
                        onChange={(e) => {
                          const newElements = elements.map(el => 
                            el.id === selectedElement ? { ...el, fill: e.target.value } : el
                          )
                          setElements(newElements)
                        }}
                        className="w-full h-8 rounded-lg cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* AI Insight Box */}
            <div className="mt-auto p-6 bg-indigo-900 rounded-[32px] text-white space-y-4 relative overflow-hidden shadow-2xl shadow-indigo-100/20">
              <div className="flex items-center gap-3 relative z-10">
                <div className="p-2 bg-indigo-500/50 rounded-xl">
                  <CheckCircle size={14} className="text-indigo-200" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-100">AI Design Core</span>
              </div>
              <p className="text-[11px] text-indigo-50 leading-relaxed relative z-10 italic font-medium">
                {isCanvasEditor 
                  ? '"I\'ve analyzed your composition. Consider adding contrast to the focal point for better engagement."'
                  : '"I\'ve optimized the visual hierarchy. Increasing font weight on Section 2 for a projected 8% engagement lift."'
                }
              </p>
              <div className="absolute right-[-15px] bottom-[-15px] opacity-10 rotate-12 pointer-events-none">
                <Layout size={80} />
              </div>
            </div>
          </aside>
          )}

          {/* Canvas Container */}
          <main className="flex-1 relative flex flex-col items-center justify-center p-12 overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

            {isFormBuilder ? (
              /* Form Builder */
              <div className="w-full h-full overflow-auto">
                <FormBuilder 
                  formId={savedAssetId || undefined}
                  initialConfig={formConfig || undefined}
                  onConfigChange={setFormConfig}
                />
              </div>
            ) : isChatWidgetBuilder ? (
              /* Chat Widget Builder */
              <div className="w-full h-full overflow-auto">
                <ChatWidgetBuilder
                  widgetId={savedAssetId || undefined}
                  initialConfig={chatWidgetConfig || undefined}
                  onConfigChange={setChatWidgetConfig}
                />
              </div>
            ) : isCanvasEditor ? (
              /* Canvas Editor for Social Story / Social Post */
              <div 
                ref={canvasRef}
                className="bg-white shadow-[0_50px_100px_-30px_rgba(0,0,0,0.2)] rounded-3xl relative overflow-hidden ring-1 ring-slate-200"
                style={{ width: displaySize.width, height: displaySize.height }}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onClick={() => setSelectedElement(null)}
              >
                {/* Canvas Elements */}
                {elements.map((el) => {
                  const scale = displaySize.width / canvasSize.width
                  return (
                    <div
                      key={el.id}
                      className={`absolute cursor-move transition-shadow ${selectedElement === el.id ? "ring-2 ring-indigo-500 ring-offset-2" : "hover:ring-2 hover:ring-indigo-300"}`}
                      style={{
                        left: el.x * scale,
                        top: el.y * scale,
                        width: el.width * scale,
                        height: el.height * scale,
                        zIndex: el.zIndex,
                      }}
                      onMouseDown={(e) => handleMouseDown(e, el.id)}
                    >
                      {el.type === "text" && (
                        <div
                          className="w-full h-full flex items-center justify-center p-2 select-none"
                          style={{
                            fontSize: `${(el.fontSize || 32) * scale}px`,
                            fontFamily: el.fontFamily,
                            color: el.color,
                          }}
                        >
                          {el.content}
                        </div>
                      )}
                      {el.type === "shape" && (
                        <div
                          className="w-full h-full"
                          style={{
                            backgroundColor: el.fill,
                            borderRadius: el.shape === "circle" ? "50%" : el.shape === "rectangle" ? "8px" : "0",
                            clipPath: el.shape === "triangle" ? "polygon(50% 0%, 0% 100%, 100% 100%)" : undefined,
                          }}
                        />
                      )}
                      {el.type === "image" && (
                        <div className="w-full h-full bg-slate-100 flex items-center justify-center rounded-lg border-2 border-dashed border-slate-300">
                          <ImageIcon size={24} className="text-slate-400" />
                        </div>
                      )}
                      
                      {/* Move indicator */}
                      {selectedElement === el.id && (
                        <div className="absolute -top-3 -left-3 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                          <Move size={12} className="text-white" />
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* Empty State */}
                {elements.length === 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                    <ImageIcon size={48} className="mb-4 opacity-30" />
                    <p className="text-sm font-medium">Add elements to start designing</p>
                    <p className="text-xs text-slate-300 mt-1">Use the asset palette on the left</p>
                  </div>
                )}
              </div>
            ) : (
              /* Standard Landing Page / Form Editor */
              <div className="relative group w-full max-w-4xl h-full max-h-full flex items-center justify-center">
                <div className="w-full max-w-2xl bg-white shadow-[0_50px_100px_-30px_rgba(0,0,0,0.2)] rounded-[40px] aspect-[3/4] p-16 flex flex-col space-y-12 relative overflow-hidden animate-in zoom-in-95 duration-500 delay-100 ring-1 ring-slate-100">
                  <div className="w-full h-56 bg-slate-50/50 rounded-3xl flex items-center justify-center text-slate-200 border border-slate-100 group-hover:border-indigo-100 transition-all relative overflow-hidden">
                    <ImageIcon size={64} className="opacity-50" />
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent" />
                  </div>

                  <div className="space-y-8 flex-1">
                    <div className="h-14 bg-slate-50/50 rounded-2xl w-3/4 border border-slate-100" />
                    <div className="space-y-4">
                      <div className="h-3 bg-slate-50 rounded-full w-full" />
                      <div className="h-3 bg-slate-50 rounded-full w-full" />
                      <div className="h-3 bg-slate-50 rounded-full w-2/3" />
                    </div>
                  </div>

                  <div className="flex justify-center pb-4">
                    <div className="h-16 w-64 bg-indigo-600 rounded-3xl shadow-2xl shadow-indigo-100 border-4 border-white active:scale-95 transition-all cursor-pointer" />
                  </div>

                  <div className="absolute inset-0 border-[6px] border-transparent group-hover:border-indigo-600/10 pointer-events-none transition-all rounded-[40px]" />
                </div>
              </div>
            )}

            {/* Tool Belt */}
            <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 flex items-center gap-6 bg-slate-900/90 backdrop-blur-2xl px-12 py-5 rounded-[28px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border border-white/10 animate-in slide-in-from-bottom-8 duration-500 z-30">
              <div className="flex items-center gap-3 border-r border-white/10 pr-6 mr-2">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Dimension</span>
              </div>
              <div className="flex gap-2">
                {["Responsive", "Mobile", "Email", "Landing"].map((format) => (
                  <button
                    key={format}
                    onClick={() => setPreviewMode(format.toLowerCase())}
                    className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                      previewMode === format.toLowerCase()
                        ? "bg-indigo-600 text-white shadow-lg"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {format}
                  </button>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

function LayerItem({ icon, label, active = false, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all ${
        active
          ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm"
          : "bg-white border-slate-100 text-slate-500 hover:border-slate-200 hover:bg-slate-50"
      }`}
    >
      <div className={`p-1.5 rounded-lg ${active ? "bg-white text-indigo-600 shadow-sm" : "bg-slate-50"}`}>{icon}</div>
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
      {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600" />}
    </button>
  )
}

function AssetTool({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-5 bg-white border border-slate-100 rounded-[28px] hover:border-indigo-200 hover:shadow-xl hover:bg-indigo-50/30 transition-all text-slate-400 hover:text-indigo-600 group shadow-sm active:scale-95"
    >
      <div className="p-3 rounded-2xl bg-slate-50 group-hover:bg-white transition-all shadow-sm">{icon}</div>
      <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
    </button>
  )
}
