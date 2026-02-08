"use client"

import React, { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Calendar, Eye, EyeOff, Loader2, User, Mail, Building2, Lock } from "lucide-react"
import { getEmailValidationError, isBusinessEmail } from "@/lib/email-validation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  // Signup dialog state
  const [showSignupDialog, setShowSignupDialog] = useState(false)
  const [signupStep, setSignupStep] = useState<"form" | "success">("form")
  const [signupLoading, setSignupLoading] = useState(false)
  const [signupError, setSignupError] = useState<string | null>(null)
  const [signupData, setSignupData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    companyName: "",
    password: "",
    confirmPassword: "",
  })

  const sessionTimeout = searchParams.get('reason') === 'session_timeout'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim() || isLoading) return

    setError(null)
    setIsLoading(true)

    try {
      console.log("[v0] Login attempt:", { email: email.trim() })
      const supabase = createClient()
      console.log("[v0] Supabase client created")
      
      const { error: signInError, data } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      console.log("[v0] Sign in response:", { 
        hasError: !!signInError, 
        errorMessage: signInError?.message,
        hasData: !!data
      })

      if (signInError) {
        console.error("[v0] Sign in error:", signInError)
        setError(signInError.message)
        setIsLoading(false)
        return
      }

      console.log("[v0] Sign in successful, redirecting")
      router.push("/")
      router.refresh()
    } catch (err) {
      console.error("[v0] Unexpected error:", err)
      setError("A system error occurred. Please try again later.")
      setIsLoading(false)
    }
  }

  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSignupData((prev) => ({ ...prev, [name]: value }))
    setSignupError(null)
  }

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSignupError(null)

    // Validate required fields
    if (!signupData.firstName.trim()) {
      setSignupError("First name is required")
      return
    }
    if (!signupData.lastName.trim()) {
      setSignupError("Last name is required")
      return
    }
    if (!signupData.email.trim()) {
      setSignupError("Email is required")
      return
    }

    // Validate email format
    const emailError = getEmailValidationError(signupData.email)
    if (emailError) {
      setSignupError(emailError)
      return
    }

    // Check for business email
    if (!isBusinessEmail(signupData.email)) {
      setSignupError("Please use a corporate or business email address. Personal emails (Gmail, Yahoo, Outlook, etc.) are not allowed.")
      return
    }

    if (!signupData.companyName.trim()) {
      setSignupError("Company name is required")
      return
    }

    if (signupData.password.length < 6) {
      setSignupError("Password must be at least 6 characters")
      return
    }

    if (signupData.password !== signupData.confirmPassword) {
      setSignupError("Passwords do not match")
      return
    }

    setSignupLoading(true)

    try {
      const supabase = createClient()
      console.log("[v0] Signup attempt:", { email: signupData.email })

      // Extract domain from email for schema creation
      const emailDomain = signupData.email.toLowerCase().split('@')[1]

      // Create the user account with Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            first_name: signupData.firstName,
            last_name: signupData.lastName,
            company_name: signupData.companyName,
            email_domain: emailDomain,
          },
        },
      })

      console.log("[v0] Signup response:", { 
        hasError: !!signUpError, 
        errorMessage: signUpError?.message,
        hasUser: !!data.user 
      })

      if (signUpError) {
        console.error("[v0] Signup error:", signUpError)
        setSignupError(signUpError.message)
        setSignupLoading(false)
        return
      }

      if (data.user) {
        console.log("[v0] User created, checking organization")
        // Check if this is a new domain and create schema if needed
        const { data: existingOrg, error: queryError } = await supabase
          .from('organizations')
          .select('id')
          .eq('domain', emailDomain)
          .single()

        if (queryError) {
          console.log("[v0] Query org error (expected for new domain):", queryError.message)
        } else {
          console.log("[v0] Organization exists")
        }

        if (!existingOrg) {
          console.log("[v0] Creating organization")
          // Create new organization for this domain
          const { error: orgError } = await supabase
            .from('organizations')
            .insert({
              name: signupData.companyName,
              domain: emailDomain,
              created_by: data.user.id,
            })

          if (orgError) {
            console.log("[v0] Organization creation error (may already exist):", orgError.message)
          }
        }

        console.log("[v0] Signup complete, showing success screen")
        setSignupStep("success")
      } else {
        console.error("[v0] No user returned from signup")
        setSignupError("Failed to create account. Please try again.")
      }
    } catch (err) {
      console.error("[v0] Signup exception:", err)
      setSignupError("An unexpected error occurred. Please try again.")
    } finally {
      setSignupLoading(false)
    }
  }

  const resetSignupForm = () => {
    setShowSignupDialog(false)
    setSignupStep("form")
    setSignupError(null)
    setSignupData({
      firstName: "",
      lastName: "",
      email: "",
      companyName: "",
      password: "",
      confirmPassword: "",
    })
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-indigo-500 flex items-center justify-center mb-6">
            <Calendar className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="text-slate-500 text-sm mt-1">Sign in to your account</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          {sessionTimeout && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
              Your session has expired. Please sign in again.
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={isLoading}
                autoComplete="email"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <Link href="/auth/forgot-password" className="text-sm text-indigo-500 hover:text-indigo-600">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  disabled={isLoading}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={!email.trim() || !password.trim() || isLoading}
              className="w-full py-3 bg-indigo-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              {"Don't have an account? "}
              <button
                onClick={() => setShowSignupDialog(true)}
                className="text-indigo-500 hover:text-indigo-600 font-medium"
              >
                Create one
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Signup Dialog */}
      <Dialog open={showSignupDialog} onOpenChange={(open) => {
        if (!open) resetSignupForm()
        else setShowSignupDialog(true)
      }}>
        <DialogContent className="sm:max-w-lg bg-white">
          {signupStep === "form" ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-slate-900">Create your account</DialogTitle>
                <DialogDescription className="text-slate-500">
                  Please use your corporate or business email address. Personal emails are not accepted.
                </DialogDescription>
              </DialogHeader>

              {signupError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  {signupError}
                </div>
              )}

              <form onSubmit={handleSignupSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      First name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        name="firstName"
                        value={signupData.firstName}
                        onChange={handleSignupChange}
                        placeholder="John"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        disabled={signupLoading}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Last name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        name="lastName"
                        value={signupData.lastName}
                        onChange={handleSignupChange}
                        placeholder="Doe"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        disabled={signupLoading}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Corporate email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      value={signupData.email}
                      onChange={handleSignupChange}
                      placeholder="you@company.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      disabled={signupLoading}
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Gmail, Yahoo, Outlook, and other personal emails are not accepted.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Company name
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      name="companyName"
                      value={signupData.companyName}
                      onChange={handleSignupChange}
                      placeholder="Acme Inc."
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      disabled={signupLoading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      name="password"
                      value={signupData.password}
                      onChange={handleSignupChange}
                      placeholder="Min. 6 characters"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      disabled={signupLoading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Confirm password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={signupData.confirmPassword}
                      onChange={handleSignupChange}
                      placeholder="Confirm your password"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      disabled={signupLoading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={signupLoading}
                  className="w-full py-3 bg-indigo-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {signupLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create account"
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <DialogTitle className="text-xl font-bold text-slate-900 mb-2">Account created!</DialogTitle>
              <DialogDescription className="text-slate-500 mb-6">
                Please check your email to verify your account. Once verified, you can sign in.
              </DialogDescription>
              <button
                onClick={resetSignupForm}
                className="px-6 py-3 bg-indigo-500 text-white rounded-xl font-medium hover:bg-indigo-600 transition-colors"
              >
                Back to sign in
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
