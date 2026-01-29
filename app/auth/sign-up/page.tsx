"use client"

import React, { useState, Suspense } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { createClient } from "@/lib/supabase/client"
import { 
  Shield, 
  Check, 
  User, 
  Mail, 
  Phone, 
  Building2, 
  ArrowRight, 
  Zap, 
  Loader2,
  CreditCard,
  Users,
  Database
} from "lucide-react"
import { getEmailValidationError, isBusinessEmail } from "@/lib/email-validation"

// Dynamically import the checkout component to avoid SSR issues
const SignupCheckout = dynamic(() => import("@/components/signup/signup-checkout"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
    </div>
  ),
})

type Step = "identity" | "plan" | "payment" | "activation"

interface Plan {
  id: string
  name: string
  description: string
  basePrice: number
  pricePerSeat: number
}

const PLANS: Plan[] = [
  {
    id: "agyntos",
    name: "AGYNTOS",
    description: "Core CRM nodes, calendar sync, and database management.",
    basePrice: 99,
    pricePerSeat: 99,
  },
  {
    id: "agyntsync",
    name: "AGYNTSYNC",
    description: "Full Neural Network automation, multi-channel flows, and AI support.",
    basePrice: 249,
    pricePerSeat: 99, // $99 per additional 5 users after first
  },
]

export default function SignUpPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>("identity")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  
  // Identity form data
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    companyName: "",
  })
  
  // Plan selection
  const [selectedPlan, setSelectedPlan] = useState<string>("agyntsync")
  const [seatCount, setSeatCount] = useState(1)
  
  // Activation
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isActivating, setIsActivating] = useState(false)
  const [activationComplete, setActivationComplete] = useState(false)

  const steps = [
    { id: "identity", label: "IDENTITY REGISTRY", number: "01" },
    { id: "plan", label: "BILL PLAN CALIBRATION", number: "02" },
    { id: "payment", label: "SECURE SETTLEMENT", number: "03" },
    { id: "activation", label: "SYSTEM ACTIVATION", number: "04" },
  ]

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError(null)
  }

  const calculatePrice = () => {
    const plan = PLANS.find((p) => p.id === selectedPlan)
    if (!plan) return 0
    
    if (selectedPlan === "agyntsync") {
      // $249 for first user, +$99 per additional 5 users
      const additionalBlocks = Math.floor((seatCount - 1) / 5)
      return plan.basePrice + (additionalBlocks * 99)
    }
    
    return plan.basePrice * seatCount
  }

  const handleIdentitySubmit = async () => {
    setError(null)

    // Validation
    if (!formData.firstName.trim()) {
      setError("First name is required")
      return
    }
    if (!formData.lastName.trim()) {
      setError("Last name is required")
      return
    }
    if (!formData.email.trim()) {
      setError("Email is required")
      return
    }

    const emailError = getEmailValidationError(formData.email)
    if (emailError) {
      setError(emailError)
      return
    }

    if (!isBusinessEmail(formData.email)) {
      setError("Please use a corporate or business email address")
      return
    }

    if (!formData.companyName.trim()) {
      setError("Company name is required")
      return
    }

    setCurrentStep("plan")
  }

  const handlePlanSubmit = () => {
    setCurrentStep("payment")
  }

  const handlePaymentComplete = () => {
    setCurrentStep("activation")
  }

  const handleActivation = async () => {
    setError(null)

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsActivating(true)

    try {
      const supabase = createClient()

      // Create the user account with Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            company_name: formData.companyName,
            phone: formData.phone,
          },
        },
      })

      if (signUpError) {
        setError(signUpError.message)
        setIsActivating(false)
        return
      }

      if (data.user) {
        setUserId(data.user.id)
        setActivationComplete(true)
      }
    } catch {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsActivating(false)
    }
  }

  // Sidebar Component
  const Sidebar = () => (
    <div className="w-72 bg-white rounded-3xl border border-slate-200 p-6 h-fit shadow-sm">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
          <Shield className="w-6 h-6 text-indigo-500" />
        </div>
        <div>
          <h1 className="font-bold text-slate-900">THORNE</h1>
          <p className="text-xs text-indigo-500 tracking-wider">ACCOUNT CREATION</p>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep
          const isCompleted = index < currentStepIndex

          return (
            <div key={step.id} className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                  isCompleted
                    ? "bg-indigo-100 text-indigo-500"
                    : isActive
                    ? "bg-indigo-500 text-white"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : step.number}
              </div>
              <span
                className={`text-sm font-medium tracking-wide ${
                  isActive ? "text-slate-900" : isCompleted ? "text-slate-600" : "text-slate-400"
                }`}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Info Card */}
      <div className="mt-8 bg-slate-900 rounded-2xl p-4 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Database className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-semibold text-indigo-400">SUPABASE NODE</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          "Upon completion, Thorne will provision a dedicated Supabase instance and clone your master schema nodes automatically."
        </p>
      </div>
    </div>
  )

  // Identity Registry Step
  const IdentityStep = () => (
    <div className="flex-1">
      <h2 className="text-3xl font-bold text-slate-900 italic mb-2">IDENTITY NODE</h2>
      <p className="text-slate-500 mb-8">Establish your corporate signature for CRM routing.</p>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Name Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-400 tracking-wider mb-2 block">
              FIRST NAME
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-100 border-0 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400 tracking-wider mb-2 block">
              LAST NAME
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-100 border-0 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="text-xs font-medium text-slate-400 tracking-wider mb-2 block">
            COMPANY EMAIL
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="ceo@company.com"
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-100 border-0 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="text-xs font-medium text-slate-400 tracking-wider mb-2 block">
            CELL PHONE
          </label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 (555) 000-0000"
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-100 border-0 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Company */}
        <div>
          <label className="text-xs font-medium text-slate-400 tracking-wider mb-2 block">
            COMPANY NAME
          </label>
          <div className="relative">
            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="Acme Enterprise Nodes"
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-100 border-0 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleIdentitySubmit}
          className="w-full bg-slate-600 hover:bg-slate-700 text-white rounded-xl py-4 font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
          CONTINUE TO PLANS
        </button>
      </div>
    </div>
  )

  // Plan Selection Step
  const PlanStep = () => (
    <div className="flex-1">
      <h2 className="text-3xl font-bold text-slate-900 mb-2">BILL PLAN SELECTION</h2>
      <p className="text-slate-500 italic mb-8">"Calibrate your operational bandwidth and neural access."</p>

      {/* Plan Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {PLANS.map((plan) => (
          <button
            key={plan.id}
            onClick={() => setSelectedPlan(plan.id)}
            className={`relative p-6 rounded-2xl text-left transition-all ${
              selectedPlan === plan.id
                ? "bg-slate-900 text-white ring-2 ring-indigo-500"
                : "bg-white border border-slate-200 hover:border-slate-300"
            }`}
          >
            {selectedPlan === plan.id && (
              <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}
            
            {plan.id === "agyntsync" && (
              <div className="absolute top-4 right-4 text-[8px] font-bold tracking-wider text-indigo-400">
                POWERED<br />BY<br />THORNE
              </div>
            )}

            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${
              selectedPlan === plan.id ? "bg-white/10" : "bg-slate-100"
            }`}>
              {plan.id === "agyntsync" ? (
                <Zap className={`w-5 h-5 ${selectedPlan === plan.id ? "text-indigo-400" : "text-indigo-500"}`} />
              ) : (
                <Shield className={`w-5 h-5 ${selectedPlan === plan.id ? "text-slate-300" : "text-slate-400"}`} />
              )}
            </div>

            <h3 className={`text-xl font-bold mb-2 ${selectedPlan === plan.id ? "text-white" : "text-slate-900"}`}>
              {plan.name}
            </h3>
            <p className={`text-sm mb-4 ${selectedPlan === plan.id ? "text-slate-300" : "text-slate-500"}`}>
              {plan.description}
            </p>

            <div className="flex items-baseline gap-1">
              <span className={`text-3xl font-bold ${selectedPlan === plan.id ? "text-white" : "text-slate-900"}`}>
                ${plan.basePrice}
              </span>
              <span className={`text-sm ${selectedPlan === plan.id ? "text-slate-400" : "text-slate-500"}`}>
                / MONTH
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* User Nodes Slider */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-400" />
            <span className="text-sm font-medium text-slate-600">USER NODES</span>
          </div>
          <span className="text-2xl font-bold text-slate-900">{seatCount} Nodes</span>
        </div>

        <input
          type="range"
          min="1"
          max="25"
          value={seatCount}
          onChange={(e) => setSeatCount(parseInt(e.target.value))}
          className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-500"
        />

        <div className="flex justify-between mt-3 text-xs text-slate-500">
          <span>1 USER (${selectedPlan === "agyntsync" ? "249" : "99"})</span>
          <span>5 USERS (${selectedPlan === "agyntsync" ? "495" : "495"})</span>
          <span>SCALING (+$99 / 5 USERS)</span>
        </div>
      </div>

      {/* Monthly Billing Note */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <div className="w-2 h-2 rounded-full bg-indigo-500" />
          MONTHLY BILLING NODE ENABLED
        </div>
        <button
          onClick={handlePlanSubmit}
          className="bg-slate-600 hover:bg-slate-700 text-white rounded-xl px-8 py-4 font-semibold flex items-center gap-2 transition-colors"
        >
          Secure Authorization
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )

  // Payment Step
  const PaymentStep = () => (
    <div className="flex-1">
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
          <CreditCard className="w-8 h-8 text-indigo-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">PAYMENT NODE</h2>
        <p className="text-slate-500 text-sm">Authorization secured by Thorne Cryptographic Layer.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        }>
          <SignupCheckout
            email={formData.email}
            username={`${formData.firstName.toLowerCase()}.${formData.lastName.toLowerCase()}`}
            userId={userId || "pending"}
            companyName={formData.companyName}
            planId={selectedPlan}
            seatCount={seatCount}
            monthlyPrice={calculatePrice()}
            onComplete={handlePaymentComplete}
          />
        </Suspense>
      </div>
    </div>
  )

  // Activation Step
  const ActivationStep = () => {
    if (activationComplete) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="relative mb-8">
            {/* Background decoration */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 rounded-full bg-indigo-50 opacity-50" />
            </div>
            <div className="relative w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-4xl font-bold text-indigo-500">
                {formData.firstName.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>

          <h2 className="text-3xl font-bold italic text-slate-900 mb-4">SYSTEM ACTIVATED</h2>
          <p className="text-slate-500 text-center max-w-md mb-6">
            Stand by. Thorne is currently cloning the master CRM schema in Supabase for your dedicated v0 tenant...
          </p>

          <div className="w-64 mb-4">
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full animate-pulse w-2/3" />
            </div>
          </div>
          <p className="text-xs text-indigo-500 tracking-wider">CLONING SCHEMA NODES...</p>

          <p className="mt-8 text-sm text-slate-500 text-center">
            Check your email to verify your account and complete activation.
          </p>
        </div>
      )
    }

    return (
      <div className="flex-1">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-indigo-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">SET YOUR PASSWORD</h2>
          <p className="text-slate-500 text-sm">Create your secure credentials to activate your account.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
          <div>
            <label className="text-xs font-medium text-slate-400 tracking-wider mb-2 block">
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              className="w-full px-4 py-4 rounded-xl bg-slate-100 border-0 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-400 tracking-wider mb-2 block">
              CONFIRM PASSWORD
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className="w-full px-4 py-4 rounded-xl bg-slate-100 border-0 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            onClick={handleActivation}
            disabled={isActivating}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl py-4 font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isActivating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                ACTIVATING...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                ACTIVATE SYSTEM
              </>
            )}
          </button>

          <p className="text-xs text-slate-500 text-center">
            You will receive an activation email from Supabase to verify your account.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex gap-6">
          <Sidebar />
          
          <div className="flex-1 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            {currentStep === "identity" && <IdentityStep />}
            {currentStep === "plan" && <PlanStep />}
            {currentStep === "payment" && <PaymentStep />}
            {currentStep === "activation" && <ActivationStep />}
          </div>
        </div>
      </div>
    </div>
  )
}
