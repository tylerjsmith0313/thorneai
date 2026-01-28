"use client"

import { useState } from "react"
import { Send, Zap, MessageSquare, CheckCircle, Link2, Loader2 } from "lucide-react"
import { BaseButton } from "@/components/ui/base-button"
import { communicationManager } from "@/lib/services/communication-manager"
import type { Contact } from "@/types"

interface ChatSectionProps {
  contact: Contact
}

export function ChatSection({ contact }: ChatSectionProps) {
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [lastSent, setLastSent] = useState<string | null>(null)

  // Get booking link from localStorage or default
  const getBookingLink = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("thorne_booking_link") || "https://thorne.ai/book/commander"
    }
    return "https://thorne.ai/book/commander"
  }

  const handleSend = async () => {
    if (!message || isSending) return
    setIsSending(true)

    try {
      // Send via communication manager
      await communicationManager.sendMessage(contact.id, "email", message)
      setLastSent(message)
      setMessage("")
    } catch (error) {
      console.error("[v0] Failed to send message:", error)
    } finally {
      setIsSending(false)
    }
  }

  const handleSendBookingLink = async () => {
    setIsSending(true)
    const link = getBookingLink()
    const bookingMessage = `Hi ${contact.firstName},\n\nI'd like to find some time for us to connect further. You can view my real-time availability and grab a slot that works for you here:\n\n${link}\n\nLooking forward to it,\nThorne Intelligence Core`

    try {
      // Send via communication manager
      await communicationManager.sendBookingLink(contact.id, link)
      setLastSent(`Sent booking request: ${link}`)
    } catch (error) {
      console.error("[v0] Failed to send booking link:", error)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 h-full flex flex-col">
      <div className="flex-1 min-h-[300px] bg-slate-50 rounded-[32px] border border-slate-200 border-dashed flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
        {lastSent ? (
          <div className="animate-in zoom-in-95 duration-500 space-y-4">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full mx-auto flex items-center justify-center border-2 border-emerald-100 shadow-xl">
              <CheckCircle size={32} />
            </div>
            <h4 className="text-base font-bold text-slate-900">Message Delivered</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto italic">"{lastSent.length > 100 ? lastSent.substring(0, 100) + "..." : lastSent}"</p>
            <button 
              onClick={() => setLastSent(null)} 
              className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline"
            >
              Send another message
            </button>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-4">
              <MessageSquare className="text-indigo-400" size={32} />
            </div>
            <h4 className="text-base font-bold text-slate-900">Start a conversation</h4>
            <p className="text-xs text-slate-500 max-w-xs mt-2 leading-relaxed">
              Send a manual message via email. Thorne will track the response and update the profile.
            </p>
            <button 
              onClick={handleSendBookingLink}
              disabled={isSending}
              className="mt-6 flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm group disabled:opacity-50"
            >
              {isSending ? (
                <Loader2 size={14} className="animate-spin text-indigo-500" />
              ) : (
                <Link2 size={14} className="text-indigo-500 group-hover:rotate-12 transition-transform" />
              )}
              Quick: Send Booking Link
            </button>
          </>
        )}
      </div>

      {!lastSent && (
        <div className="space-y-4">
          <div className="relative group">
            <textarea 
              placeholder={`Send an email to ${contact.firstName}...`}
              className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[32px] text-sm focus:ring-4 focus:ring-indigo-500/10 focus:bg-white outline-none transition-all resize-none min-h-[150px] shadow-inner"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isSending}
            />
            <div className="absolute right-6 bottom-6 flex gap-2">
              <button 
                className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all shadow-sm"
                title="Thorne Assist"
              >
                <Zap size={18} />
              </button>
              <BaseButton 
                variant="primary" 
                size="sm" 
                className="rounded-xl px-8 shadow-xl" 
                icon={isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                onClick={handleSend}
                disabled={!message || isSending}
              >
                {isSending ? "Sending..." : "Send"}
              </BaseButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
