"use client"

import { useRouter } from "next/navigation"
import { OnboardingSequence } from "@/components/onboarding/onboarding-sequence"

export default function OnboardingPage() {
  const router = useRouter()

  const handleComplete = () => {
    router.push("/")
  }

  return <OnboardingSequence onComplete={handleComplete} />
}
