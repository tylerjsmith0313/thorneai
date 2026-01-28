"use client"

import { useState } from "react"
import { X, Sparkles, Link as LinkIcon, Check, Copy, ArrowRight, Target, Sliders } from "lucide-react"
import { BaseButton } from "@/components/ui/base-button"

interface BookingLinkModalProps {
  onClose: () => void
}

type Step = "intent" | "logic" | "result"

export function BookingLinkModal({ onClose }: BookingLinkModalProps) {
  const [step, setStep] = useState<Step>("intent")
  const [isCopied, setIsCopied] = useState(false)
  const [config, setConfig] = useState({
    title: "",
    duration: "30",
    logic: "High-Heat Priority"
  })

  const handleCopy = () => {
    navigator.clipboard.writeText("https://thorne.ai/book/customer-IV-delta")
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const nextStep = () => {
    if (step === "intent") setStep("logic")
    else if (step === "logic") setStep("result")
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-8">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="bg-white w-full max-w-2xl rounded-[56px] shadow-2xl overflow-hidden relative flex flex-col border border-white/20 animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-indigo-600 rounded-[22px] text-white flex items-center justify-center shadow-xl shadow-indigo-100">
              <LinkIcon size={28} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-none">Thorne Neural Booking</h2>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Link Generator v2.0</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-4 bg-slate-50 rounded-full text-slate-300 hover:text-rose-500 transition-all border border-slate-100">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-12 no-scrollbar bg-white">
          {step === "intent" && (
            <div className="space-y-10 animate-in slide-in-from-bottom-8 duration-500">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-600"><Target size={20} /></div>
                   <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Meeting Objective</h3>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {["Introductory Discovery", "Product Deep Dive", "Technical Audit", "Casual Check-in"].map(type => (
                    <button 
                      key={type}
                      onClick={() => setConfig({...config, title: type})}
                      className={`p-6 rounded-[32px] border-2 flex items-center justify-between transition-all ${
                        config.title === type 
                        ? "bg-indigo-50 border-indigo-600 shadow-xl shadow-indigo-100 text-indigo-900" 
                        : "bg-white border-slate-100 text-slate-400 hover:border-indigo-100 hover:text-slate-600"
                      }`}
                    >
                      <span className="font-bold text-sm uppercase tracking-tight">{type}</span>
                      {config.title === type && <Check size={20} />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Session Duration</label>
                <div className="flex gap-2">
                  {["15", "30", "45", "60"].map(d => (
                    <button 
                      key={d}
                      onClick={() => setConfig({...config, duration: d})}
                      className={`flex-1 py-4 rounded-2xl text-xs font-black transition-all border-2 ${
                        config.duration === d 
                        ? "bg-slate-900 border-slate-900 text-white shadow-xl" 
                        : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
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
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-600"><Sliders size={20} /></div>
                   <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Thorne Availability Logic</h3>
                </div>
                <p className="text-slate-500 text-sm font-medium leading-relaxed italic">Select how Thorne should triage slots for this specific link.</p>
                
                <div className="space-y-3">
                   <LogicToggle 
                    label="High-Heat Priority" 
                    desc="Open morning slots only for leads with >80% heat." 
                    active={config.logic === "High-Heat Priority"}
                    onClick={() => setConfig({...config, logic: "High-Heat Priority"})}
                   />
                   <LogicToggle 
                    label="Volume Maximizer" 
                    desc="Pack slots tightly to ensure high daily throughput." 
                    active={config.logic === "Volume Maximizer"}
                    onClick={() => setConfig({...config, logic: "Volume Maximizer"})}
                   />
                   <LogicToggle 
                    label="Zero-Lag Buffer" 
                    desc="Insert 15m deep-work buffers between all meetings." 
                    active={config.logic === "Zero-Lag Buffer"}
                    onClick={() => setConfig({...config, logic: "Zero-Lag Buffer"})}
                   />
                </div>
              </div>
            </div>
          )}

          {step === "result" && (
            <div className="flex flex-col items-center justify-center text-center space-y-10 animate-in zoom-in duration-700 h-full py-10">
              <div className="w-24 h-24 bg-emerald-50 rounded-[40px] flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-xl shadow-emerald-50 animate-bounce">
                <Check size={48} />
              </div>
              
              <div className="space-y-3">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Neural Link Ready</h3>
                <p className="text-slate-400 font-medium max-w-xs mx-auto">
                  Thorne has established a dedicated endpoint for {config.title}.
                </p>
              </div>

              <div className="w-full max-w-sm bg-slate-50 border border-slate-200 rounded-[32px] p-2 flex items-center justify-between shadow-inner">
                 <span className="text-xs font-bold text-slate-400 truncate pl-6 pr-4">thorne.ai/book/customer-IV...</span>
                 <BaseButton 
                   variant={isCopied ? "secondary" : "dark"} 
                   size="sm" 
                   className="rounded-2xl px-6 min-w-[140px]" 
                   icon={isCopied ? <Check size={14} /> : <Copy size={14} />}
                   onClick={handleCopy}
                 >
                   {isCopied ? "Copied!" : "Copy Link"}
                 </BaseButton>
              </div>

              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                Analytics: Link performance will be visible in Analytics Section.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {step !== "result" && (
          <div className="p-10 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
            <BaseButton variant="ghost" className="text-slate-400 font-black uppercase tracking-widest text-[10px]" onClick={onClose}>Cancel</BaseButton>
            <BaseButton 
              variant="primary" 
              size="lg" 
              className="px-12 rounded-[28px] shadow-indigo-100" 
              icon={step === "logic" ? <Sparkles size={18} /> : <ArrowRight size={18} />}
              onClick={nextStep}
              disabled={step === "intent" && !config.title}
            >
              {step === "logic" ? "Finalize Neural Node" : "Next Step"}
            </BaseButton>
          </div>
        )}
      </div>
    </div>
  )
}

function LogicToggle({ label, desc, active, onClick }: { label: string; desc: string; active: boolean; onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={`p-6 bg-white border-2 rounded-[32px] flex items-center justify-between cursor-pointer transition-all ${
        active ? "border-indigo-600 shadow-xl shadow-indigo-50 bg-indigo-50/20" : "border-slate-100 hover:border-indigo-100"
      }`}
    >
      <div className="flex-1 pr-6">
        <h4 className="text-sm font-black uppercase tracking-tight text-slate-900">{label}</h4>
        <p className="text-[10px] font-bold text-slate-400 mt-1">{desc}</p>
      </div>
      <div className={`w-12 h-6 rounded-full relative transition-colors ${active ? "bg-indigo-600" : "bg-slate-200"}`}>
         <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${active ? "right-1" : "left-1"}`} />
      </div>
    </div>
  )
}
