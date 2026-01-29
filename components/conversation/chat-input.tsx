"use client"

import React from "react"

import { useRef } from "react"
import { Paperclip, Zap, Send } from "lucide-react"
import { BaseButton } from "@/components/ui/base-button"

interface ChatInputProps {
  value: string
  onChange: (val: string) => void
  onSend: () => void
  onAgyntDraft: () => void
  onThorneDraft: () => void
  placeholder?: string
}

export function ChatInput({
  value,
  onChange,
  onSend,
  onAgyntDraft,
  onThorneDraft,
  placeholder,
}: ChatInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAttachClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      console.log("Attaching file:", file.name)
    }
  }

  return (
    <div className="relative group">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500/10 focus:bg-white rounded-[32px] p-6 pr-40 text-sm outline-none transition-all resize-none min-h-[140px] shadow-inner"
      />
      <div className="absolute left-6 bottom-6">
        <button
          onClick={handleAttachClick}
          className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all"
          title="Attach Files"
        >
          <Paperclip size={20} />
        </button>
      </div>
      <div className="absolute right-4 bottom-4 flex items-center gap-2">
        <BaseButton
          variant="secondary"
          size="sm"
          icon={<Zap size={16} />}
          className="rounded-xl border-indigo-200 text-indigo-600 bg-indigo-50/50"
          onClick={onAgyntDraft}
        >
          Agynt Draft
        </BaseButton>
        <BaseButton
          variant="primary"
          size="sm"
          icon={<Send size={16} />}
          className="rounded-xl px-8 shadow-indigo-200"
          onClick={onSend}
        >
          Send
        </BaseButton>
      </div>
    </div>
  )
}
