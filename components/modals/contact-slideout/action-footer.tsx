"use client"

import { MessageSquareShare } from "lucide-react"
import { BaseButton } from "@/components/ui/base-button"

interface ActionFooterProps {
  onOpenEngine: () => void
}

export function ActionFooter({ onOpenEngine }: ActionFooterProps) {
  return (
    <div className="p-8 border-t border-slate-100 bg-white shrink-0 shadow-[0_-10px_20px_-15px_rgba(0,0,0,0.1)]">
      <BaseButton 
        variant="primary" 
        size="lg" 
        fullWidth 
        icon={<MessageSquareShare size={20} />}
        onClick={onOpenEngine}
      >
        Open Thorne Conversation Engine
      </BaseButton>
    </div>
  )
}
