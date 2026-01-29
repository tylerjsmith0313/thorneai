"use client"

import React, { useState, Suspense } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import dynamic from "next/dynamic"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, Loader2, Eye, EyeOff, Check, Building2, CreditCard, ArrowLeft } from "lucide-react"
import { getEmailValidationError, isBusinessEmail } from "@/lib/email-validation"

// Dynamically import the checkout component to avoid SSR issues
const SignupCheckout = dynamic(() => import("@/components/signup/signup-checkout"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
    </div>
  ),
})

type Step = "details" | "payment" | "success"

export default function SignUpPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("details")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    companyName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setError(null)

    // Real-time email validation
    if (name === "email" && value) {
      const emailError = getEmailValidationError(value)
      if (emailError && value.includes("@")) {
        setError(emailError)
      }
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!formData.companyName.trim()) {
      setError("Company name is required")
      return
    }

    if (formData.companyName.length < 2) {
      setError("Company name must be at least 2 characters")
      return
    }

    if (!formData.username.trim()) {
      setError("Username is required")
      return
    }

    if (formData.username.length < 3) {
      setError("Username must be at least 3 characters")
      return
    }

    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      setError("Username can only contain letters, numbers, and underscores")
      return
    }

    // Email validation - must be business email
    const emailError = getEmailValidationError(formData.email)
    if (emailError) {
      setError(emailError)
      return
    }

    if (!isBusinessEmail(formData.email)) {
      setError("Please use a corporate or business email address. Personal email addresses are not allowed.")
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()

      // Check if username is already taken
      const { data: existingUser } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", formData.username.toLowerCase())
        .single()

      if (existingUser) {
        setError("Username is already taken")
        setIsLoading(false)
        return
      }

      // Sign up with Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${window.location.origin}/auth/callback`,
          data: {
            username: formData.username.toLowerCase(),
          },
        },
      })

      if (signUpError) {
        setError(signUpError.message)
        setIsLoading(false)
        return
      }

      if (data.user) {
        setUserId(data.user.id)
        // Move to payment step
        setStep("payment")
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePaymentComplete = () => {
    setStep("success")
    // Redirect after a short delay
    setTimeout(() => {
      router.push("/auth/sign-up-success")
    }, 2000)
  }

  // Step indicator
  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
        step === "details" ? "bg-indigo-100 text-indigo-700" : "bg-green-100 text-green-700"
      }`}>
        {step !== "details" ? <Check className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
        <span>Account</span>
      </div>
      <div className="w-8 h-px bg-slate-300" />
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
        step === "payment" ? "bg-indigo-100 text-indigo-700" : step === "success" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-400"
      }`}>
        {step === "success" ? <Check className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
        <span>Payment</span>
      </div>
    </div>
  )

  if (step === "success") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-6">
            <Check className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 mb-2">Payment Successful!</h1>
          <p className="text-slate-500 mb-4">Your account is being set up. Redirecting...</p>
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto" />
        </div>
      </div>
    )
  }

  if (step === "payment" && userId) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 text-white mb-4">
              <Calendar className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-semibold text-slate-900">Complete Your Subscription</h1>
            <p className="text-slate-500 mt-2">One-time setup fee + monthly subscription</p>
          </div>

          <StepIndicator />

          {/* Pricing Summary */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <div>
                  <p className="font-medium text-slate-900">Setup Fee</p>
                  <p className="text-sm text-slate-500">One-time onboarding and configuration</p>
                </div>
                <p className="font-semibold text-slate-900">$949.00</p>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <div>
                  <p className="font-medium text-slate-900">Monthly Subscription</p>
                  <p className="text-sm text-slate-500">Full platform access, billed monthly</p>
                </div>
                <p className="font-semibold text-slate-900">$499.00/mo</p>
              </div>
              <div className="flex justify-between items-center py-2 pt-3">
                <p className="font-semibold text-slate-900">Due Today</p>
                <p className="text-xl font-bold text-indigo-600">$1,448.00</p>
              </div>
            </div>
          </div>

          {/* Checkout */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <Suspense fallback={
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              </div>
            }>
<SignupCheckout
  email={formData.email}
  username={formData.username}
  userId={userId}
  companyName={formData.companyName}
                onComplete={handlePaymentComplete}
              />
            </Suspense>
          </div>

          <button
            onClick={() => setStep("details")}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mt-4 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to account details
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 text-white mb-4">
            <Calendar className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">Create your account</h1>
          <p className="text-slate-500 mt-2">Start automating your sales with AgyntSynq</p>
        </div>

        <StepIndicator />

        {/* Pricing Preview */}
        <div className="bg-indigo-50 rounded-xl p-4 mb-6 border border-indigo-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-900">AgyntSynq Platform</p>
              <p className="text-xs text-indigo-600">$949 setup + $499/month</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-indigo-900">$1,448</p>
              <p className="text-xs text-indigo-600">due today</p>
            </div>
          </div>
        </div>

        {/* Sign Up Form */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <form onSubmit={handleSignUp} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="companyName" className="text-slate-700">
                Company Name
              </Label>
              <Input
                id="companyName"
                name="companyName"
                type="text"
                placeholder="Acme Inc."
                value={formData.companyName}
                onChange={handleChange}
                className="h-11 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-700">
                Username
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="johndoe"
                value={formData.username}
                onChange={handleChange}
                className="h-11 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                disabled={isLoading}
                required
              />
              <p className="text-xs text-slate-400">
                Letters, numbers, and underscores only
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700">
                Work Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@company.com"
                value={formData.email}
                onChange={handleChange}
                className="h-11 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                disabled={isLoading}
                required
              />
              <p className="text-xs text-slate-400">
                Business email required (no Gmail, Yahoo, etc.)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  className="h-11 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 pr-10"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-slate-700">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="h-11 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                disabled={isLoading}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Continue to Payment"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}
