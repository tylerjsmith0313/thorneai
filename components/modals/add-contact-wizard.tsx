"use client"

import { useState, useTransition } from "react"
import { X, User, ChevronLeft, ChevronRight, Check, Globe, Sparkles, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { createContactAction } from "@/app/actions"

interface AddContactWizardProps {
  onClose: () => void
  onSuccess?: () => void
  initialData?: Partial<WizardFormData>
}

export type WizardStep = "details" | "social" | "company" | "outreach" | "strategy" | "finalize"

export interface WizardFormData {
  firstName: string
  lastName: string
  pEmail: string
  wEmail: string
  phone: string
  company: string
  companyUrl: string
  jobTitle: string
  employees: string
  locations: string
  channels: string[]
  budget: number
  mode: "manual" | "flow"
  source: string
}

const steps: { id: WizardStep; label: string }[] = [
  { id: "details", label: "Details" },
  { id: "social", label: "Social" },
  { id: "company", label: "Company" },
  { id: "outreach", label: "Outreach" },
  { id: "strategy", label: "Strategy" },
  { id: "finalize", label: "Finalize" }
]

export function AddContactWizard({ onClose, onSuccess, initialData }: AddContactWizardProps) {
  const [step, setStep] = useState<WizardStep>("details")
  const [isPending, startTransition] = useTransition()
  const [loading, setLoading] = useState(false)
  const [campaignIdeas, setCampaignIdeas] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<WizardFormData>({
    firstName: initialData?.firstName || "",
    lastName: initialData?.lastName || "",
    pEmail: initialData?.pEmail || "",
    wEmail: initialData?.wEmail || "",
    phone: initialData?.phone || "",
    company: initialData?.company || "",
    companyUrl: initialData?.companyUrl || "",
    jobTitle: initialData?.jobTitle || "",
    employees: "",
    locations: "",
    channels: [],
    budget: 50,
    mode: "manual",
    source: "Manual Entry"
  })

  const currentIdx = steps.findIndex(s => s.id === step)

  const handleNext = () => {
    if (currentIdx === steps.length - 1) {
      handleSubmit()
    } else {
      const nextStep = steps[currentIdx + 1].id
      setStep(nextStep)
      if (nextStep === "strategy") {
        generateCampaign()
      }
    }
  }

  const handleBack = () => {
    if (currentIdx > 0) {
      setStep(steps[currentIdx - 1].id)
    }
  }

  const handleSubmit = () => {
    setError(null)
    startTransition(async () => {
      const result = await createContactAction({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.wEmail || formData.pEmail,
        company: formData.company,
        jobTitle: formData.jobTitle,
        phone: formData.phone,
        source: formData.source,
        status: "New",
      })

      if (result.error) {
        setError(result.error)
      } else {
        onSuccess?.()
        onClose()
      }
    })
  }

  const generateCampaign = async () => {
    setLoading(true)
    setTimeout(() => {
      setCampaignIdeas(`Based on ${formData.firstName}'s profile at ${formData.company}, Thorne AI recommends a consultative approach with a personalized physical mailer to bridge the gap. Consider highlighting ROI metrics and scheduling a discovery call within 48 hours of initial contact.`)
      setLoading(false)
    }, 1500)
  }

  const updateData = (updates: Partial<WizardFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const toggleChannel = (channel: string) => {
    setFormData(prev => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter(c => c !== channel)
        : [...prev.channels, channel]
    }))
  }

  const isStepValid = () => {
    switch (step) {
      case "details":
        return formData.firstName.trim() && formData.lastName.trim() && (formData.pEmail.trim() || formData.wEmail.trim())
      case "company":
        return formData.company.trim()
      default:
        return true
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
      <div className="bg-white w-full max-w-3xl rounded-[40px] shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-600 to-violet-600">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white">
              <User size={24} />
            </div>
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-widest">Add Contact</h2>
              <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-widest mt-1">
                Step {currentIdx + 1} of {steps.length} - {steps[currentIdx].label}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-white/10 rounded-full text-white/60 hover:text-white hover:bg-white/20 transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Progress */}
        <div className="px-8 py-4 bg-slate-50 border-b border-slate-100">
          <div className="flex items-center gap-2">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                  i < currentIdx ? "bg-emerald-500 text-white" :
                  i === currentIdx ? "bg-indigo-600 text-white" :
                  "bg-slate-200 text-slate-400"
                }`}>
                  {i < currentIdx ? <Check size={14} /> : i + 1}
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 rounded-full transition-all ${
                    i < currentIdx ? "bg-emerald-500" : "bg-slate-200"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-8 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {step === "details" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h3 className="text-lg font-black text-slate-900">Contact Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name *</Label>
                  <Input value={formData.firstName} onChange={(e) => updateData({ firstName: e.target.value })} placeholder="John" />
                </div>
                <div className="space-y-2">
                  <Label>Last Name *</Label>
                  <Input value={formData.lastName} onChange={(e) => updateData({ lastName: e.target.value })} placeholder="Doe" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Personal Email</Label>
                  <Input value={formData.pEmail} onChange={(e) => updateData({ pEmail: e.target.value })} placeholder="john@personal.com" type="email" />
                </div>
                <div className="space-y-2">
                  <Label>Work Email *</Label>
                  <Input value={formData.wEmail} onChange={(e) => updateData({ wEmail: e.target.value })} placeholder="john@company.com" type="email" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input value={formData.phone} onChange={(e) => updateData({ phone: e.target.value })} placeholder="+1 (555) 000-0000" />
                </div>
                <div className="space-y-2">
                  <Label>Job Title</Label>
                  <Input value={formData.jobTitle} onChange={(e) => updateData({ jobTitle: e.target.value })} placeholder="VP of Sales" />
                </div>
              </div>
            </div>
          )}

          {step === "social" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h3 className="text-lg font-black text-slate-900">Social Profiles</h3>
              <p className="text-sm text-slate-500">Connect social profiles for enhanced intelligence gathering.</p>
              <div className="grid grid-cols-2 gap-4">
                {["LinkedIn", "Twitter", "Facebook", "Instagram"].map(platform => (
                  <div key={platform} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:border-indigo-200 transition-all cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors shadow-sm">
                        <Globe size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{platform}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Click to connect</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === "company" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h3 className="text-lg font-black text-slate-900">Company Information</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Company Name *</Label>
                  <Input value={formData.company} onChange={(e) => updateData({ company: e.target.value })} placeholder="Acme Corp" />
                </div>
                <div className="space-y-2">
                  <Label>Website URL</Label>
                  <Input value={formData.companyUrl} onChange={(e) => updateData({ companyUrl: e.target.value })} placeholder="https://acme.com" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Employees</Label>
                    <Input value={formData.employees} onChange={(e) => updateData({ employees: e.target.value })} placeholder="50-100" />
                  </div>
                  <div className="space-y-2">
                    <Label>Locations</Label>
                    <Input value={formData.locations} onChange={(e) => updateData({ locations: e.target.value })} placeholder="New York, LA" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === "outreach" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h3 className="text-lg font-black text-slate-900">Outreach Preferences</h3>
              <div className="space-y-4">
                <Label>Select Channels</Label>
                <div className="grid grid-cols-3 gap-3">
                  {["Email", "SMS", "LinkedIn", "WhatsApp", "Call", "Gift"].map(channel => (
                    <button
                      key={channel}
                      onClick={() => toggleChannel(channel)}
                      className={`p-4 rounded-2xl border-2 text-sm font-bold transition-all ${
                        formData.channels.includes(channel)
                          ? "bg-indigo-50 border-indigo-600 text-indigo-600"
                          : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      {channel}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <Label>Budget per Lead: ${formData.budget}</Label>
                <Slider
                  value={[formData.budget]}
                  onValueChange={(value) => updateData({ budget: value[0] })}
                  min={10}
                  max={500}
                  step={10}
                />
              </div>
            </div>
          )}

          {step === "strategy" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h3 className="text-lg font-black text-slate-900">AI Strategy Generation</h3>
              {loading ? (
                <div className="p-8 bg-indigo-50 rounded-3xl border border-indigo-100 flex items-center justify-center">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                    <p className="text-indigo-600 font-bold">Thorne AI is analyzing...</p>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-3xl border border-indigo-100">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-indigo-600 rounded-2xl text-white">
                      <Sparkles size={24} />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 mb-2">Recommended Strategy</h4>
                      <p className="text-sm text-slate-600 leading-relaxed">{campaignIdeas}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === "finalize" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h3 className="text-lg font-black text-slate-900">Finalize & Deploy</h3>
              
              {/* Summary */}
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200">
                <h4 className="font-black text-slate-900 mb-4">Contact Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500">Name</p>
                    <p className="font-bold text-slate-900">{formData.firstName} {formData.lastName}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Company</p>
                    <p className="font-bold text-slate-900">{formData.company}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Email</p>
                    <p className="font-bold text-slate-900">{formData.wEmail || formData.pEmail}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Channels</p>
                    <p className="font-bold text-slate-900">{formData.channels.length > 0 ? formData.channels.join(", ") : "None selected"}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Engagement Mode</Label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => updateData({ mode: "manual" })}
                    className={`p-6 rounded-3xl border-2 text-left transition-all ${
                      formData.mode === "manual"
                        ? "bg-indigo-50 border-indigo-600"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <h4 className="font-black text-slate-900">Manual Control</h4>
                    <p className="text-xs text-slate-500 mt-1">You approve each action before execution</p>
                  </button>
                  <button
                    onClick={() => updateData({ mode: "flow" })}
                    className={`p-6 rounded-3xl border-2 text-left transition-all ${
                      formData.mode === "flow"
                        ? "bg-indigo-50 border-indigo-600"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <h4 className="font-black text-slate-900">Full Auto Flow</h4>
                    <p className="text-xs text-slate-500 mt-1">Thorne AI handles engagement autonomously</p>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentIdx === 0 || isPending}
            className="gap-2 bg-transparent"
          >
            <ChevronLeft size={16} />
            Back
          </Button>
          <Button 
            onClick={handleNext} 
            className="gap-2"
            disabled={!isStepValid() || isPending}
          >
            {isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                {currentIdx === steps.length - 1 ? "Deploy Contact" : "Continue"}
                {currentIdx < steps.length - 1 && <ChevronRight size={16} />}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
