"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { X, BrainCircuit, Sparkles, ArrowRight, Check, ShoppingBag, Target, FileText, Send } from "lucide-react"

interface CreativeConsultationModalProps {
  onClose: () => void
}

type Step = "intent" | "products" | "directing" | "consulting"

export function CreativeConsultationModal({ onClose }: CreativeConsultationModalProps) {
  const [step, setStep] = useState<Step>("intent")
  const [formData, setFormData] = useState({
    projectType: "",
    goal: "",
    products: [] as string[],
    customInstructions: "",
  })

  const productOptions = ["SaaS Platform License", "Enterprise Consulting", "AgyntSynq API", "Digital Integration Audit"]

  const toggleProduct = (product: string) => {
    setFormData((prev) => ({
      ...prev,
      products: prev.products.includes(product) ? prev.products.filter((p) => p !== product) : [...prev.products, product],
    }))
  }

  const handleNext = () => {
    if (step === "intent") setStep("products")
    else if (step === "products") setStep("directing")
    else if (step === "directing") setStep("consulting")
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300" onClick={onClose} />

      <div className="bg-[#0f172a] w-full max-w-4xl h-[65vh] rounded-[48px] shadow-[0_0_100px_-20px_rgba(79,70,229,0.3)] overflow-hidden relative flex flex-col border border-white/10 animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-slate-900/40 backdrop-blur-md z-10 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-[18px] text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <BrainCircuit size={24} />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-tight uppercase leading-none">Thorne Creative Consultant</h2>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em]">Neural Consultation Active</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 bg-white/5 rounded-2xl text-slate-400 hover:text-white transition-all border border-white/10 group"
          >
            <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-10 relative">
          {step === "intent" && (
            <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-white/90">
                  <div className="p-2.5 bg-indigo-500/20 rounded-xl text-indigo-400 shadow-inner">
                    <FileText size={20} />
                  </div>
                  <h3 className="text-xl font-black tracking-tight">What are you building today?</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {["Email Campaign", "Landing Page", "Social Ad Set", "Direct Mail Postcard", "SaaS Onboarding", "Sales Deck"].map(
                    (type) => (
                      <button
                        key={type}
                        onClick={() => setFormData({ ...formData, projectType: type })}
                        className={`p-5 rounded-[24px] border-2 text-left transition-all duration-300 ${
                          formData.projectType === type
                            ? "bg-indigo-600 border-indigo-500 shadow-xl shadow-indigo-500/20 text-white translate-y-[-2px]"
                            : "bg-white/5 border-white/5 text-slate-300 font-bold hover:border-white/10 hover:bg-white/10"
                        }`}
                      >
                        <span className="text-sm tracking-tight">{type}</span>
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="space-y-6 pt-6 border-t border-white/5">
                <div className="flex items-center gap-3 text-white/90">
                  <div className="p-2.5 bg-emerald-500/20 rounded-xl text-emerald-400 shadow-inner">
                    <Target size={20} />
                  </div>
                  <h3 className="text-xl font-black tracking-tight">What is the primary goal?</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {["High Conversion (Direct)", "Brand Awareness", "Educational / Value", "Re-engagement", "Referral Push"].map((goal) => (
                    <button
                      key={goal}
                      onClick={() => setFormData({ ...formData, goal: goal })}
                      className={`p-5 rounded-[24px] border-2 text-left transition-all duration-300 ${
                        formData.goal === goal
                          ? "bg-emerald-600 border-emerald-500 shadow-xl shadow-emerald-500/20 text-white translate-y-[-2px]"
                          : "bg-white/5 border-white/5 text-slate-300 font-bold hover:border-white/10 hover:bg-white/10"
                      }`}
                    >
                      <span className="text-sm tracking-tight">{goal}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === "products" && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 max-w-2xl mx-auto">
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-white/90">
                  <div className="p-2.5 bg-indigo-500/20 rounded-xl text-indigo-400 shadow-inner">
                    <ShoppingBag size={20} />
                  </div>
                  <h3 className="text-xl font-black tracking-tight">Include specific products?</h3>
                </div>
                <p className="text-slate-400 text-sm font-medium pl-1">
                  Select any products from your portfolio that Thorne should emphasize.
                </p>
                <div className="grid grid-cols-1 gap-3">
                  {productOptions.map((p) => (
                    <button
                      key={p}
                      onClick={() => toggleProduct(p)}
                      className={`p-5 rounded-[24px] border-2 flex items-center justify-between transition-all duration-300 ${
                        formData.products.includes(p)
                          ? "bg-indigo-600 border-indigo-500 shadow-xl shadow-indigo-500/20 text-white"
                          : "bg-white/5 border-white/5 text-slate-300 font-bold hover:border-white/10 hover:bg-white/10"
                      }`}
                    >
                      <span className="text-sm tracking-tight">{p}</span>
                      {formData.products.includes(p) && <Check size={18} className="text-indigo-200" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === "directing" && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 max-w-2xl mx-auto">
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-white/90">
                  <div className="p-2.5 bg-indigo-500/20 rounded-xl text-indigo-400 shadow-inner">
                    <Send size={20} />
                  </div>
                  <h3 className="text-xl font-black tracking-tight">Direct Thorne AI</h3>
                </div>
                <p className="text-slate-400 text-sm font-medium pl-1">
                  Add any specific constraints, brand voice directives, or visual preferences.
                </p>
                <Textarea
                  className="bg-white/5 border-white/10 text-white min-h-[220px] p-6 text-base font-medium focus:bg-white/10 focus:border-indigo-500/50 rounded-[32px] placeholder:text-slate-600 shadow-inner"
                  placeholder="e.g. Keep it consultative but urgent. Use dark mode aesthetics. Mention our 30-day ROI guarantee in the second paragraph..."
                  value={formData.customInstructions}
                  onChange={(e) => setFormData({ ...formData, customInstructions: e.target.value })}
                />
              </div>
            </div>
          )}

          {step === "consulting" && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-in zoom-in duration-700">
              <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-[0_0_50px_rgba(79,70,229,0.4)] relative">
                <Sparkles size={32} className="animate-pulse" />
                <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-20" />
              </div>
              <div className="space-y-3 max-w-sm">
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">Thorne is Processing</h3>
                <p className="text-slate-400 text-sm font-medium leading-relaxed">
                  Analyzing your {formData.projectType} mission for {formData.goal}. Ingesting product knowledge nodes...
                </p>
              </div>
              <div className="w-full max-w-xs h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 animate-[progress_3s_ease-in-out_infinite]" />
              </div>
              <Button size="lg" className="px-10 mt-6 rounded-2xl shadow-indigo-500/20" onClick={onClose}>
                View Strategy
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        {step !== "consulting" && (
          <div className="p-8 border-t border-white/5 bg-slate-900/60 backdrop-blur-md flex items-center justify-between shrink-0">
            <button
              className="text-slate-500 hover:text-white text-xs font-black uppercase tracking-widest transition-colors"
              onClick={onClose}
            >
              Cancel Consultation
            </button>
            <Button
              size="lg"
              className="px-10 rounded-2xl bg-indigo-600 hover:bg-indigo-500 border-none shadow-xl shadow-indigo-900/50"
              onClick={handleNext}
              disabled={step === "intent" && (!formData.projectType || !formData.goal)}
            >
              {step === "directing" ? "Finalize Brief" : "Next Step"}
              <ArrowRight size={18} className="ml-2" />
            </Button>
          </div>
        )}

        <style>{`
          @keyframes progress {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </div>
    </div>
  )
}
