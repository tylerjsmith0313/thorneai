"use client"

import { ConversationEngine } from "@/components/conversation-engine/conversation-engine"
import type { Conversation } from "@/types"

interface ConversationsTabProps {
  conversations: Conversation[]
}

export function ConversationsTab({ conversations }: ConversationsTabProps) {
  return (
    <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden h-[700px]">
      <ConversationEngine />
    </div>
  )
}
