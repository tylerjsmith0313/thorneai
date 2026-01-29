"use client"

import { useState } from "react"
import {
  Plus,
  Trash2,
  GripVertical,
  Type,
  Mail,
  Phone,
  AlignLeft,
  CheckSquare,
  Circle,
  ChevronDown,
  Copy,
  Check,
  Code,
  Eye,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export interface FormField {
  id: string
  type: "text" | "email" | "phone" | "textarea" | "checkbox" | "radio" | "select"
  label: string
  placeholder?: string
  required: boolean
  options?: string[] // For radio/select/checkbox
}

export interface FormConfig {
  fields: FormField[]
  submitButtonText: string
  successMessage: string
  primaryColor: string
  backgroundColor: string
  fontFamily: string
}

interface FormBuilderProps {
  formId?: string
  config: FormConfig
  onConfigChange: (config: FormConfig) => void
}

const FIELD_TYPES = [
  { id: "text", label: "Text Input", icon: Type },
  { id: "email", label: "Email", icon: Mail },
  { id: "phone", label: "Phone", icon: Phone },
  { id: "textarea", label: "Text Area", icon: AlignLeft },
  { id: "checkbox", label: "Checkbox", icon: CheckSquare },
  { id: "radio", label: "Radio Buttons", icon: Circle },
  { id: "select", label: "Dropdown", icon: ChevronDown },
] as const

export function FormBuilder({ formId, config, onConfigChange }: FormBuilderProps) {
  const [activeTab, setActiveTab] = useState<"build" | "style" | "embed">("build")
  const [copied, setCopied] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  const addField = (type: FormField["type"]) => {
    const newField: FormField = {
      id: crypto.randomUUID(),
      type,
      label: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
      placeholder: "",
      required: false,
      options: type === "radio" || type === "select" || type === "checkbox" ? ["Option 1", "Option 2"] : undefined,
    }
    onConfigChange({
      ...config,
      fields: [...config.fields, newField],
    })
  }

  const updateField = (id: string, updates: Partial<FormField>) => {
    onConfigChange({
      ...config,
      fields: config.fields.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    })
  }

  const removeField = (id: string) => {
    onConfigChange({
      ...config,
      fields: config.fields.filter((f) => f.id !== id),
    })
  }

  const moveField = (fromIndex: number, toIndex: number) => {
    const newFields = [...config.fields]
    const [removed] = newFields.splice(fromIndex, 1)
    newFields.splice(toIndex, 0, removed)
    onConfigChange({ ...config, fields: newFields })
  }

  const generateEmbedCode = () => {
    if (!formId) return "<!-- Save the form first to get embed code -->"
    
    const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
    
    // Script embed (recommended)
    return `<!-- Thorne AI Embeddable Form -->
<div id="thorne-form-${formId}"></div>
<script src="${baseUrl}/embed/form.js" data-form-id="${formId}" async></script>

<!-- Alternative: iFrame Embed -->
<iframe 
  src="${baseUrl}/embed/form/${formId}" 
  width="100%" 
  height="500" 
  frameborder="0"
  style="border: none; max-width: 600px;"
></iframe>`
  }

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(generateEmbedCode())
    setCopied(true)
    toast.success("Embed code copied to clipboard!")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex h-full">
      {/* Left Panel - Field Builder */}
      <div className="w-80 bg-white border-r border-slate-100 flex flex-col">
        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          {[
            { id: "build", label: "Build" },
            { id: "style", label: "Style" },
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
          {activeTab === "build" && (
            <div className="space-y-6">
              {/* Add Field Section */}
              <div>
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                  Add Field
                </h5>
                <div className="grid grid-cols-2 gap-2">
                  {FIELD_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => addField(type.id as FormField["type"])}
                      className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-100 text-slate-600"
                    >
                      <type.icon size={14} />
                      <span className="text-[9px] font-bold uppercase tracking-wide">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Field List */}
              <div>
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                  Form Fields ({config.fields.length})
                </h5>
                <div className="space-y-2">
                  {config.fields.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-8">
                      Add fields to build your form
                    </p>
                  ) : (
                    config.fields.map((field, index) => (
                      <div
                        key={field.id}
                        className="bg-white border border-slate-200 rounded-xl p-3 space-y-3"
                      >
                        <div className="flex items-center gap-2">
                          <GripVertical size={14} className="text-slate-300 cursor-move" />
                          <input
                            type="text"
                            value={field.label}
                            onChange={(e) => updateField(field.id, { label: e.target.value })}
                            className="flex-1 text-sm font-medium bg-transparent border-none outline-none"
                          />
                          <button
                            onClick={() => removeField(field.id)}
                            className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-500"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        <div className="flex items-center gap-3 text-xs">
                          <label className="flex items-center gap-1.5 text-slate-500">
                            <input
                              type="checkbox"
                              checked={field.required}
                              onChange={(e) => updateField(field.id, { required: e.target.checked })}
                              className="rounded"
                            />
                            Required
                          </label>
                          <span className="text-slate-300">|</span>
                          <span className="text-slate-400 text-[10px] uppercase">{field.type}</span>
                        </div>

                        {field.type !== "checkbox" && field.type !== "radio" && field.type !== "select" && (
                          <input
                            type="text"
                            value={field.placeholder || ""}
                            onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                            placeholder="Placeholder text..."
                            className="w-full text-xs px-2 py-1.5 bg-slate-50 border border-slate-100 rounded-lg"
                          />
                        )}

                        {(field.type === "radio" || field.type === "select") && (
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-bold text-slate-400 uppercase">Options</label>
                            {field.options?.map((opt, optIndex) => (
                              <div key={optIndex} className="flex items-center gap-1">
                                <input
                                  type="text"
                                  value={opt}
                                  onChange={(e) => {
                                    const newOptions = [...(field.options || [])]
                                    newOptions[optIndex] = e.target.value
                                    updateField(field.id, { options: newOptions })
                                  }}
                                  className="flex-1 text-xs px-2 py-1 bg-slate-50 border border-slate-100 rounded"
                                />
                                <button
                                  onClick={() => {
                                    const newOptions = field.options?.filter((_, i) => i !== optIndex)
                                    updateField(field.id, { options: newOptions })
                                  }}
                                  className="p-1 text-slate-300 hover:text-red-500"
                                >
                                  <Trash2 size={10} />
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => {
                                const newOptions = [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`]
                                updateField(field.id, { options: newOptions })
                              }}
                              className="text-[9px] font-bold text-indigo-600 hover:text-indigo-700"
                            >
                              + Add Option
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div>
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                  Submit Button
                </h5>
                <input
                  type="text"
                  value={config.submitButtonText}
                  onChange={(e) => onConfigChange({ ...config, submitButtonText: e.target.value })}
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl"
                  placeholder="Submit"
                />
              </div>

              {/* Success Message */}
              <div>
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                  Success Message
                </h5>
                <textarea
                  value={config.successMessage}
                  onChange={(e) => onConfigChange({ ...config, successMessage: e.target.value })}
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl resize-none"
                  rows={2}
                  placeholder="Thank you for submitting!"
                />
              </div>
            </div>
          )}

          {activeTab === "style" && (
            <div className="space-y-6">
              <div>
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                  Primary Color
                </h5>
                <input
                  type="color"
                  value={config.primaryColor}
                  onChange={(e) => onConfigChange({ ...config, primaryColor: e.target.value })}
                  className="w-full h-10 rounded-xl cursor-pointer"
                />
              </div>

              <div>
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                  Background Color
                </h5>
                <input
                  type="color"
                  value={config.backgroundColor}
                  onChange={(e) => onConfigChange({ ...config, backgroundColor: e.target.value })}
                  className="w-full h-10 rounded-xl cursor-pointer"
                />
              </div>

              <div>
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                  Font Family
                </h5>
                <select
                  value={config.fontFamily}
                  onChange={(e) => onConfigChange({ ...config, fontFamily: e.target.value })}
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl"
                >
                  <option value="Inter">Inter</option>
                  <option value="system-ui">System UI</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Helvetica">Helvetica</option>
                </select>
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
                  Copy this code and paste it into your website to display this form.
                </p>
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-[10px] overflow-x-auto whitespace-pre-wrap">
                  {generateEmbedCode()}
                </pre>
                <Button
                  onClick={copyEmbedCode}
                  className="w-full mt-4 rounded-xl"
                  disabled={!formId}
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
                {!formId && (
                  <p className="text-[10px] text-amber-600 mt-2 text-center">
                    Save the form first to generate embed code
                  </p>
                )}
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <h5 className="text-xs font-bold text-slate-700 mb-2">How it works</h5>
                <ul className="text-[10px] text-slate-500 space-y-1.5">
                  <li>1. Copy the embed code above</li>
                  <li>2. Paste it into your website HTML</li>
                  <li>3. Form submissions will appear in your dashboard</li>
                  <li>4. Leads are automatically added to your contacts</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Preview */}
      <div className="flex-1 bg-slate-50 p-8 flex flex-col items-center justify-center relative overflow-auto">
        <div className="absolute top-4 right-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewMode(!previewMode)}
            className="rounded-xl"
          >
            <Eye size={14} className="mr-2" />
            {previewMode ? "Edit Mode" : "Preview Mode"}
          </Button>
        </div>

        <div
          className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 space-y-6"
          style={{
            backgroundColor: config.backgroundColor,
            fontFamily: config.fontFamily,
          }}
        >
          <h3 className="text-xl font-bold text-slate-900">Contact Form</h3>

          {config.fields.map((field) => (
            <div key={field.id} className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-1">
                {field.label}
                {field.required && <span className="text-red-500">*</span>}
              </label>

              {field.type === "text" && (
                <input
                  type="text"
                  placeholder={field.placeholder}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-300 outline-none transition-colors"
                  disabled={!previewMode}
                />
              )}

              {field.type === "email" && (
                <input
                  type="email"
                  placeholder={field.placeholder || "email@example.com"}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-300 outline-none transition-colors"
                  disabled={!previewMode}
                />
              )}

              {field.type === "phone" && (
                <input
                  type="tel"
                  placeholder={field.placeholder || "(555) 555-5555"}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-300 outline-none transition-colors"
                  disabled={!previewMode}
                />
              )}

              {field.type === "textarea" && (
                <textarea
                  placeholder={field.placeholder}
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-300 outline-none transition-colors resize-none"
                  disabled={!previewMode}
                />
              )}

              {field.type === "select" && (
                <select
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-300 outline-none transition-colors"
                  disabled={!previewMode}
                >
                  <option value="">Select an option</option>
                  {field.options?.map((opt, i) => (
                    <option key={i} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              )}

              {field.type === "radio" && (
                <div className="space-y-2">
                  {field.options?.map((opt, i) => (
                    <label key={i} className="flex items-center gap-2 text-sm text-slate-600">
                      <input type="radio" name={field.id} disabled={!previewMode} />
                      {opt}
                    </label>
                  ))}
                </div>
              )}

              {field.type === "checkbox" && (
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input type="checkbox" disabled={!previewMode} />
                  {field.options?.[0] || "I agree"}
                </label>
              )}
            </div>
          ))}

          {config.fields.length > 0 && (
            <button
              className="w-full py-3 rounded-xl text-white font-bold transition-all"
              style={{ backgroundColor: config.primaryColor }}
              disabled={!previewMode}
            >
              {config.submitButtonText}
            </button>
          )}

          {config.fields.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <p className="text-sm">Add fields to preview your form</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export const DEFAULT_FORM_CONFIG: FormConfig = {
  fields: [
    { id: "name", type: "text", label: "Full Name", placeholder: "John Doe", required: true },
    { id: "email", type: "email", label: "Email Address", placeholder: "john@example.com", required: true },
    { id: "message", type: "textarea", label: "Message", placeholder: "Tell us more...", required: false },
  ],
  submitButtonText: "Submit",
  successMessage: "Thank you! We'll be in touch soon.",
  primaryColor: "#6366f1",
  backgroundColor: "#ffffff",
  fontFamily: "Inter",
}
