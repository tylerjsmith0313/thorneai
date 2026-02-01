"use client"

import React from "react"

import { useState, useEffect } from "react"
import {
  X,
  Sparkles,
  MessageSquare,
  BrainCircuit,
  Mail,
  Target,
  CreditCard,
} from "lucide-react"
import type { Contact } from "@/types"
import { ChatBubble } from "@/components/conversation/chat-bubble"
import { BaseButton } from "@/components/ui/base-button"
import { CampaignWizard, type CampaignConfig } from "@/components/conversation/campaign-wizard"
import { ModeToggle } from "@/components/conversation/mode-toggle"
import { ChatInput } from "@/components/conversation/chat-input"

interface Message {
  id: string
  sender: "thorne" | "user" | "contact"
  text: string
  timestamp: string
  type?: "email" | "sms" | "call_transcript"
}

interface Conversation {
  id: string
  contactId: string
  contactName: string
  lastMessage: string
  status: string
  channel: string
}

interface ConversationModalProps {
  contact: Contact
  onClose: () => void
}

export function ConversationModal({ contact, onClose }: ConversationModalProps) {
  const [activeConv, setActiveConv] = useState<Conversation | null>(null)
  const [isStartingCampaign, setIsStartingCampaign] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [thorneInsight, setThorneInsight] = useState<string>("")
  const [mode, setMode] = useState<"user" | "flow">("flow")
  const [draft, setDraft] = useState("")

  useEffect(() => {
    // Simulate finding existing conversation
    setActiveConv({
      id: "conv-1",
      contactId: contact.id,
      contactName: `${contact.firstName} ${contact.lastName}`,
      lastMessage: "Looking forward to our call",
      status: "thorne_handling",
      channel: "email",
    })
    setMessages([
      {
        id: "1",
        sender: "thorne",
        text: "Analyzing our integration documentation... I'm preparing a detailed response that covers our 30-day onboarding guarantee.",
        timestamp: "55M AGO",
      },
      {
        id: "3",
        sender: "contact",
        text: "[Phone Transcription]: Just wanted to follow up on my email. Let me know if you can jump on a call tomorrow.",
        timestamp: "10M AGO",
        type: "call_transcript",
      },
    ])
    setThorneInsight(
      "Thorne is currently drafting a reply that leverages the 'Q2 Onboarding' node. Recommended: Schedule call for tomorrow 2PM."
    )
  }, [contact.id, contact.firstName, contact.lastName])

  const handleStartCampaign = (config: CampaignConfig) => {
    setIsStartingCampaign(false)
    setActiveConv({
      id: "new-conv",
      contactId: contact.id,
      contactName: `${contact.firstName} ${contact.lastName}`,
      lastMessage: "Campaign Initialized",
      status: "thorne_handling",
      channel: config.channels[0],
    })
    setMessages([
      {
        id: "m1",
        sender: "thorne",
        text: "Campaign initialized. Thorne is monitoring for incoming signals.",
        timestamp: "NOW",
      },
    ])
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div className="bg-white w-full max-w-6xl h-[85vh] rounded-[56px] shadow-2xl overflow-hidden relative flex flex-col animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white z-10 shrink-0">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-indigo-600 rounded-[24px] text-white flex items-center justify-center shadow-xl shadow-indigo-100 relative">
              <BrainCircuit size={32} />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-none">
                Thorne Conversation Engine
              </h2>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] mt-2">
                Active Intelligence: {contact.firstName} {contact.lastName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <ModeToggle mode={mode} onModeChange={setMode} />
            <button
              onClick={onClose}
              className="p-4 bg-slate-50 rounded-full text-slate-300 hover:text-rose-500 transition-all border border-slate-100"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 flex overflow-hidden">
          {!activeConv && !isStartingCampaign ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-8 bg-slate-50/30">
              <div className="w-24 h-24 bg-white rounded-[40px] flex items-center justify-center text-slate-200 border-2 border-dashed border-slate-200">
                <MessageSquare size={48} />
              </div>
              <div className="max-w-md space-y-4">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  No Active Engagement
                </h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                  Thorne is currently monitoring this node. Start a multi-channel
                  campaign to initiate outreach sequences.
                </p>
              </div>
              <BaseButton
                variant="primary"
                size="lg"
                className="px-12"
                icon={<Sparkles size={18} />}
                onClick={() => setIsStartingCampaign(true)}
              >
                Start New Campaign
              </BaseButton>
            </div>
          ) : isStartingCampaign ? (
            <CampaignWizard
              contact={contact}
              onCancel={() => setIsStartingCampaign(false)}
              onStart={handleStartCampaign}
            />
          ) : (
            <>
              {/* Chat View */}
              <div className="flex-1 flex flex-col bg-white overflow-hidden">
                <div className="flex-1 overflow-y-auto p-10 space-y-12 no-scrollbar bg-slate-50/20">
                  {messages.map((m) => (
                    <ChatBubble
                      key={m.id}
                      role={
                        m.sender === "thorne"
                          ? "thorne"
                          : m.sender === "contact"
                            ? "contact"
                            : "user"
                      }
                      content={m.text}
                      timestamp={m.timestamp}
                      type={m.type}
                    />
                  ))}
                </div>
                <div className="p-10 border-t border-slate-100 bg-white">
                  <ChatInput
                    value={draft}
                    onChange={setDraft}
                    onSend={() => setDraft("")}
                    onThorneDraft={() => setDraft("Drafting optimized response...")}
                    placeholder={`Reply to ${contact.firstName}...`}
                  />
                </div>
              </div>

              {/* Sidebar Intel */}
              <div className="w-[400px] border-l border-slate-100 flex flex-col bg-white overflow-hidden shrink-0">
                <div className="p-10 bg-[#2d308b] text-white">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-indigo-500/30 rounded-xl">
                        <Sparkles size={20} className="text-indigo-300" />
                      </div>
                      <h3 className="text-sm font-black uppercase tracking-widest text-indigo-100">
                        Thorne Real-Time Intel
                      </h3>
                    </div>
                    <div className="p-6 bg-white/5 rounded-3xl border border-white/10 relative overflow-hidden">
                      <p className="text-xs italic leading-relaxed text-indigo-50 font-medium relative z-10">
                        &quot;{thorneInsight}&quot;
                      </p>
                      <BrainCircuit className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-10 space-y-12 bg-white no-scrollbar">
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
                      Contact Profile Context
                    </h4>
                    <div className="space-y-3">
                      <ContextPill label="Industry" value="SaaS Architecture" />
                      <ContextPill label="Interests" value="Golf, Tech Investing" />
                      <ContextPill label="Demeanor" value="Analytical" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
                      Tactical Actions
                    </h4>
                    <div className="grid grid-cols-1 gap-2.5">
                      <ActionBtn icon={<Mail size={14} />} label="Send Case Study" />
                      <ActionBtn icon={<Target size={14} />} label="Propose Discovery Call" />
                      <ActionBtn icon={<CreditCard size={14} />} label="Send Custom Gift" />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function ContextPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 rounded-2xl border border-slate-100/50">
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
        {label}
      </span>
      <span className="text-xs font-black text-slate-800 tracking-tight">{value}</span>
    </div>
  )
}

function ActionBtn({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <BaseButton
      variant="outline"
      size="sm"
      fullWidth
      icon={icon}
      className="justify-start py-4 px-6 rounded-2xl border-slate-100 text-slate-600 font-bold hover:bg-slate-50 transition-all"
    >
      {label}
    </BaseButton>
  )
}
