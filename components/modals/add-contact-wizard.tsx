"use client"

import { useState, useTransition } from "react"
import { createContactAction } from "@/app/actions"
import { WizardHeader } from "./wizard/wizard-header"
import { WizardFooter } from "./wizard/wizard-footer"
import { ContactDetailsStep } from "./wizard/contact-details-step"
import { SocialMediaStep } from "./wizard/social-media-step"
import { CompanyInfoStep } from "./wizard/company-info-step"
import { OutreachStep } from "./wizard/outreach-step"
import { StrategyStep } from "./wizard/strategy-step"
import { FinalizeStep } from "./wizard/finalize-step"

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
  { id: "details", label: "Contact Details" },
  { id: "social", label: "Social Media" },
  { id: "company", label: "Company Info" },
  { id: "outreach", label: "Outreach Channels" },
  { id: "strategy", label: "AI Strategy" },
  { id: "finalize", label: "Finalize" }
]

const defaultFormData: WizardFormData = {
  firstName: "",
  lastName: "",
  pEmail: "",
  wEmail: "",
  phone: "",
  company: "",
  companyUrl: "",
  jobTitle: "",
  employees: "",
  locations: "",
  channels: ["Email", "LinkedIn"],
  budget: 100,
  mode: "manual",
  source: "manual"
}

export function AddContactWizard({ onClose, onSuccess, initialData }: AddContactWizardProps) {
  const [step, setStep] = useState<WizardStep>("details")
  const [isPending, startTransition] = useTransition()
  const [loading, setLoading] = useState(false)
  const [campaignIdeas, setCampaignIdeas] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<WizardFormData>({
    ...defaultFormData,
    ...initialData
  })

  const currentStepIndex = steps.findIndex(s => s.id === step)
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === steps.length - 1

  const updateData = (updates: Partial<WizardFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const generateStrategy = async () => {
    setLoading(true)
    // Simulate AI strategy generation
    await new Promise(resolve => setTimeout(resolve, 2000))
    setCampaignIdeas(`Based on ${formData.firstName} ${formData.lastName}'s profile at ${formData.company || "their company"}, here's your recommended outreach strategy:

1. **Initial Contact via ${formData.channels[0] || "Email"}**
   Start with a personalized message highlighting mutual connections or shared interests.

2. **Value-First Approach**
   Share relevant industry insights or case studies before pitching.

3. **Multi-Touch Sequence**
   Plan ${formData.channels.length} touchpoints across ${formData.channels.join(", ")} over 3 weeks.

4. **Budget Allocation**
   With your $${formData.budget} budget, consider a thoughtful gift after the third touchpoint.

5. **Timing Optimization**
   Best outreach windows: Tuesday-Thursday, 9-11 AM local time.`)
    setLoading(false)
  }

  const handleNext = async () => {
    if (isLastStep) {
      // Submit the form
      startTransition(async () => {
        try {
          const result = await createContactAction({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.wEmail || formData.pEmail,
            phone: formData.phone,
            company: formData.company,
            jobTitle: formData.jobTitle,
            source: formData.source,
            status: "New"
          })
          
          if (result.success) {
            onSuccess?.()
            onClose()
          } else {
            setError(result.error || "Failed to create contact")
          }
        } catch (err) {
          setError("An unexpected error occurred")
        }
      })
    } else {
      const nextIndex = currentStepIndex + 1
      const nextStep = steps[nextIndex].id
      setStep(nextStep)
      
      // Generate strategy when moving to strategy step
      if (nextStep === "strategy" && !campaignIdeas) {
        generateStrategy()
      }
    }
  }

  const handleBack = () => {
    if (!isFirstStep) {
      const prevIndex = currentStepIndex - 1
      setStep(steps[prevIndex].id)
    }
  }

  const renderStep = () => {
    switch (step) {
      case "details":
        return <ContactDetailsStep data={formData} updateData={updateData} />
      case "social":
        return <SocialMediaStep />
      case "company":
        return <CompanyInfoStep data={formData} updateData={updateData} />
      case "outreach":
        return <OutreachStep data={formData} updateData={updateData} />
      case "strategy":
        return <StrategyStep loading={loading} campaignIdeas={campaignIdeas} />
      case "finalize":
        return <FinalizeStep data={formData} updateData={updateData} />
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-[48px] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        <WizardHeader
          stepNumber={currentStepIndex + 1}
          totalSteps={steps.length}
          stepLabel={steps[currentStepIndex].label}
          onClose={onClose}
        />

        {/* Progress Bar */}
        <div className="px-8 py-4 bg-slate-50/50 border-b border-slate-100">
          <div className="flex items-center gap-2">
            {steps.map((s, index) => (
              <div key={s.id} className="flex items-center flex-1">
                <div 
                  className={`h-1.5 flex-1 rounded-full transition-all ${
                    index <= currentStepIndex 
                      ? "bg-indigo-600" 
                      : "bg-slate-200"
                  }`}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {steps.map((s, index) => (
              <span 
                key={s.id}
                className={`text-[9px] font-bold uppercase tracking-widest ${
                  index <= currentStepIndex 
                    ? "text-indigo-600" 
                    : "text-slate-300"
                }`}
              >
                {s.label}
              </span>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm">
              {error}
            </div>
          )}
          {renderStep()}
        </div>

        <WizardFooter
          isFirstStep={isFirstStep}
          isLastStep={isLastStep}
          isPending={isPending}
          onBack={handleBack}
          onNext={handleNext}
        />
      </div>
    </div>
  )
}
