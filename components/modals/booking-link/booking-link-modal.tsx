"use client"

import { useState } from "react"
import {
  X,
  Sparkles,
  Link as LinkIcon,
  Check,
  Copy,
  ArrowRight,
  Zap,
  Target,
  Sliders,
  Info,
  ShieldCheck,
  Edit3,
} from "lucide-react"
import { BaseButton } from "@/components/ui/base-button"

interface BookingLinkModalProps {
  onClose: () => void
}

type Step = "intent" | "logic" | "result"

export function BookingLinkModal({ onClose }: BookingLinkModalProps) {
  const [step, setStep] = useState<Step>("intent")
  const [isCopied, setIsCopied] = useState(false)
  const [isEditingUrl, setIsEditingUrl] = useState(false)
  const [bookingUrl, setBookingUrl] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("thorne_booking_link") || "https://thorne.ai/book/commander"
    }
    return "https://thorne.ai/book/commander"
  })
  const [config, setConfig] = useState({
    title: "",
    duration: "30",
    logic: "High-Heat Priority",
  })

  const handleCopy = () => {
    navigator.clipboard.writeText(bookingUrl)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleSaveUrl = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("thorne_booking_link", bookingUrl)
    }
    setIsEditingUrl(false)
  }

  const nextStep = () => {
    if (step === "intent") setStep("logic")
    else if (step === "logic") setStep("result")
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-8">
      <div
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div className="bg-white w-full max-w-2xl rounded-[56px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] overflow-hidden relative flex flex-col border border-white/20 animate-in zoom-in-95 duration-500 max-h-[90vh]">
        <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-white/80 backdrop-blur-md shrink-0 z-20">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-indigo-600 rounded-[22px] text-white flex items-center justify-center shadow-2xl shadow-indigo-200 ring-4 ring-indigo-50 group transition-all">
              <LinkIcon
                size={28}
                className="group-hover:rotate-12 transition-transform"
              />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-none">
                Neural Booking Hub
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Agentic Slot Generation
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-4 bg-slate-50 rounded-full text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all border border-slate-100 shadow-sm"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-12 no-scrollbar bg-slate-50/20">
          {/* Universal Link Setting - Visible on all steps */}
          <div className="mb-10 p-8 bg-white border border-slate-100 rounded-[40px] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <LinkIcon size={14} />
                </div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Global Outreach Endpoint
                </h4>
              </div>
              {!isEditingUrl ? (
                <button
                  onClick={() => setIsEditingUrl(true)}
                  className="text-[9px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1.5 hover:underline"
                >
                  <Edit3 size={12} /> Edit Link
                </button>
              ) : (
                <button
                  onClick={handleSaveUrl}
                  className="text-[9px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1.5 hover:underline"
                >
                  <Check size={12} /> Save Node
                </button>
              )}
            </div>

            {isEditingUrl ? (
              <input
                autoFocus
                className="w-full bg-slate-50 border-2 border-indigo-600/20 rounded-2xl p-4 text-xs font-bold outline-none focus:bg-white transition-all shadow-inner"
                value={bookingUrl}
                onChange={(e) => setBookingUrl(e.target.value)}
                placeholder="https://calendly.com/your-name"
              />
            ) : (
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                <span className="text-xs font-bold text-slate-500 truncate mr-4">
                  {bookingUrl}
                </span>
                <button
                  onClick={handleCopy}
                  className="text-slate-300 hover:text-indigo-600 transition-colors"
                >
                  {isCopied ? (
                    <Check size={16} className="text-emerald-500" />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </div>
            )}
            <p className="text-[9px] text-slate-400 font-medium italic">
              &ldquo;This link is automatically injected into AI outreach scripts
              when a meeting is requested.&rdquo;
            </p>
          </div>

          {step === "intent" && (
            <div className="space-y-10 animate-in slide-in-from-bottom-8 duration-500">
              <div className="space-y-6">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-600 shadow-sm">
                      <Target size={20} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">
                      Objective Logic
                    </h3>
                  </div>
                  <div
                    className="text-slate-300 hover:text-indigo-500 cursor-help"
                    title="Thorne adapts slot duration and messaging based on the session intent."
                  >
                    <Info size={16} />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    "Introductory Discovery",
                    "Product Deep Dive",
                    "Technical Audit",
                    "Casual Check-in",
                  ].map((type) => (
                    <button
                      key={type}
                      onClick={() => setConfig({ ...config, title: type })}
                      className={`p-6 rounded-[32px] border-2 text-left flex items-center justify-between transition-all group ${
                        config.title === type
                          ? "bg-white border-indigo-600 shadow-2xl shadow-indigo-100 scale-[1.02]"
                          : "bg-white border-slate-100 text-slate-400 hover:border-slate-200 hover:shadow-lg"
                      }`}
                    >
                      <span
                        className={`font-black text-sm uppercase tracking-tight ${config.title === type ? "text-slate-900" : "text-slate-400"}`}
                      >
                        {type}
                      </span>
                      {config.title === type ? (
                        <div className="p-1.5 bg-indigo-600 text-white rounded-full">
                          <Check size={16} />
                        </div>
                      ) : (
                        <ArrowRight
                          size={18}
                          className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0"
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">
                  Temporal Limit (Duration)
                </label>
                <div className="flex gap-2 p-1.5 bg-white rounded-2xl border border-slate-100 shadow-inner">
                  {["15", "30", "45", "60"].map((d) => (
                    <button
                      key={d}
                      onClick={() => setConfig({ ...config, duration: d })}
                      className={`flex-1 py-4 rounded-xl text-xs font-black transition-all ${
                        config.duration === d
                          ? "bg-slate-900 text-white shadow-xl scale-[1.05]"
                          : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      {d}m
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === "logic" && (
            <div className="space-y-10 animate-in slide-in-from-right-8 duration-500">
              <div className="space-y-6">
                <div className="flex items-center gap-3 px-1">
                  <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-600 shadow-sm">
                    <Sliders size={20} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">
                    Neural Guardrails
                  </h3>
                </div>
                <p className="text-slate-500 text-sm font-medium leading-relaxed pl-1 italic">
                  &ldquo;Calibrate how Thorne triages available time nodes for
                  this entry point.&rdquo;
                </p>

                <div className="space-y-4">
                  <LogicToggle
                    label="High-Heat Priority"
                    desc="Open morning slots exclusively for leads with >80% heat signals."
                    active={config.logic === "High-Heat Priority"}
                    onClick={() =>
                      setConfig({ ...config, logic: "High-Heat Priority" })
                    }
                  />
                  <LogicToggle
                    label="Volume Maximizer"
                    desc="Minimize gaps between sessions to ensure 100% bandwidth utilization."
                    active={config.logic === "Volume Maximizer"}
                    onClick={() =>
                      setConfig({ ...config, logic: "Volume Maximizer" })
                    }
                  />
                  <LogicToggle
                    label="Deep Work Buffer"
                    desc="Force 30m 'Internal Nodes' between all external sessions."
                    active={config.logic === "Zero-Lag Buffer"}
                    onClick={() =>
                      setConfig({ ...config, logic: "Zero-Lag Buffer" })
                    }
                  />
                </div>
              </div>

              <div className="p-6 bg-amber-50 rounded-[32px] border border-amber-100 flex items-start gap-4">
                <div className="p-2 bg-white rounded-xl text-amber-500 shadow-sm">
                  <ShieldCheck size={18} />
                </div>
                <p className="text-[11px] text-amber-700 leading-relaxed font-bold italic">
                  &ldquo;Warning: Tight packing may lead to meeting fatigue.
                  Thorne recommends High-Heat Priority for this objective.&rdquo;
                </p>
              </div>
            </div>
          )}

          {step === "result" && (
            <div className="flex flex-col items-center justify-center text-center space-y-12 animate-in zoom-in duration-700 h-full py-10 relative overflow-hidden">
              <div className="w-28 h-28 bg-indigo-600 rounded-[40px] flex items-center justify-center text-white shadow-[0_20px_50px_rgba(79,70,229,0.4)] border-4 border-indigo-50 relative z-10 animate-bounce">
                <Check size={56} />
              </div>

              <div className="space-y-4 relative z-10">
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                  Neural Link Established
                </h3>
                <p className="text-slate-400 font-medium max-w-xs mx-auto text-sm leading-relaxed">
                  Thorne has established a dedicated endpoint with{" "}
                  <span className="text-indigo-600 font-black">
                    {config.logic}
                  </span>{" "}
                  logic enabled.
                </p>
              </div>

              <div className="w-full max-w-sm bg-white border border-slate-100 rounded-[40px] p-2.5 flex items-center justify-between shadow-2xl relative z-10 group">
                <span className="text-xs font-bold text-slate-400 truncate pl-6 pr-4 group-hover:text-slate-600 transition-colors">
                  {bookingUrl}
                </span>
                <BaseButton
                  variant={isCopied ? "secondary" : "primary"}
                  size="sm"
                  className="rounded-[24px] px-8 min-w-[150px] font-black uppercase tracking-widest text-[9px] shadow-lg"
                  icon={isCopied ? <Check size={14} /> : <Copy size={14} />}
                  onClick={handleCopy}
                >
                  {isCopied ? "Copied" : "Copy Endpoint"}
                </BaseButton>
              </div>

              <div className="pt-6 relative z-10">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] flex items-center justify-center gap-2">
                  <Zap size={10} className="fill-slate-300" /> Auto-Sync Active
                  across 4 Calendars
                </p>
              </div>

              <Sparkles
                size={300}
                className="absolute inset-0 text-indigo-500/5 -z-0 pointer-events-none"
              />
            </div>
          )}
        </div>

        {step !== "result" && (
          <div className="p-10 border-t border-slate-50 bg-white/80 backdrop-blur-md flex items-center justify-between shrink-0 z-20">
            <button
              className="text-slate-400 hover:text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] transition-colors"
              onClick={onClose}
            >
              Discard Node
            </button>
            <div className="flex gap-4">
              <BaseButton
                variant="primary"
                size="lg"
                className="px-12 rounded-[28px] shadow-2xl shadow-indigo-200 font-black uppercase tracking-widest text-xs"
                icon={
                  step === "logic" ? (
                    <Sparkles size={18} />
                  ) : (
                    <ArrowRight size={18} />
                  )
                }
                onClick={nextStep}
                disabled={step === "intent" && !config.title}
              >
                {step === "logic" ? "Finalize Neural Node" : "Next Integration"}
              </BaseButton>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function LogicToggle({
  label,
  desc,
  active,
  onClick,
}: {
  label: string
  desc: string
  active: boolean
  onClick: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={`p-7 bg-white border-2 rounded-[40px] flex items-center justify-between cursor-pointer transition-all group ${
        active
          ? "border-indigo-600 shadow-2xl shadow-indigo-50 scale-[1.01]"
          : "border-slate-100 hover:border-indigo-100 hover:shadow-xl"
      }`}
    >
      <div className="flex-1 pr-8">
        <h4
          className={`text-sm font-black uppercase tracking-tight transition-colors ${active ? "text-indigo-600" : "text-slate-900"}`}
        >
          {label}
        </h4>
        <p className="text-[10px] font-bold text-slate-400 mt-1.5 leading-relaxed">
          {desc}
        </p>
      </div>
      <div
        className={`w-14 h-7 rounded-full relative transition-all duration-300 p-1 ${active ? "bg-indigo-600" : "bg-slate-200"}`}
      >
        <div
          className={`absolute w-5 h-5 bg-white rounded-full transition-all shadow-md ${active ? "right-1" : "left-1"}`}
        />
      </div>
    </div>
  )
}
