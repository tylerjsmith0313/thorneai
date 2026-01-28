"use client"

import { ChevronRight, ChevronLeft, Loader2 } from "lucide-react"
import { BaseButton } from "@/components/ui/base-button"

interface WizardFooterProps {
  isFirstStep: boolean
  isLastStep: boolean
  isPending?: boolean
  onBack: () => void
  onNext: () => void
}

export function WizardFooter({ isFirstStep, isLastStep, isPending, onBack, onNext }: WizardFooterProps) {
  return (
    <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
      <BaseButton 
        variant="ghost" 
        onClick={onBack} 
        disabled={isFirstStep || isPending}
        icon={<ChevronLeft size={18} />}
      >
        Back
      </BaseButton>
      <BaseButton 
        variant={isLastStep ? "primary" : "dark"} 
        size="lg"
        onClick={onNext}
        disabled={isPending}
        className="px-12"
      >
        {isPending ? (
          <>
            <Loader2 size={18} className="animate-spin mr-2" />
            Processing...
          </>
        ) : isLastStep ? (
          "Finish & Launch"
        ) : (
          <>
            Next Step
            <ChevronRight size={18} className="ml-1" />
          </>
        )}
      </BaseButton>
    </div>
  )
}
