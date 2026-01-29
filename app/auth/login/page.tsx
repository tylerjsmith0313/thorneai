"use client"

import React, { useState, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Shield, ArrowLeft, ArrowRight, User, Loader2 } from "lucide-react"

type AuthStep = "email" | "password" | "authenticating" | "error"

interface ChatMessage {
  id: string
  type: "system" | "user"
  content: string
  timestamp: Date
}

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState<AuthStep>("email")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [inputValue, setInputValue] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      type: "system",
      content: "Welcome back, Customer. I am Thorne. Identify yourself to access the Neural Feed.",
      timestamp: new Date(),
    },
  ])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (searchParams.get('reason') === 'session_timeout') {
      setMessages((prev) => [
        ...prev,
        {
          id: "timeout",
          type: "system",
          content: "Your session has expired due to inactivity. Please re-authenticate to continue.",
          timestamp: new Date(),
        },
      ])
    }
  }, [searchParams])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [step])

  const addMessage = (type: "system" | "user", content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        type,
        content,
        timestamp: new Date(),
      },
    ])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    const value = inputValue.trim()
    setInputValue("")

    if (step === "email") {
      // Validate email format
      if (!value.includes("@") || !value.includes(".")) {
        addMessage("user", value)
        addMessage("system", "Invalid identification format. Please provide a valid email address.")
        return
      }

      setEmail(value)
      addMessage("user", value)
      setTimeout(() => {
        addMessage("system", "Confirmed. Now, please provide your Credentials (Password).")
        setStep("password")
      }, 500)
    } else if (step === "password") {
      setPassword(value)
      addMessage("user", "•".repeat(value.length))
      setStep("authenticating")
      setIsLoading(true)

      try {
        const supabase = createClient()
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password: value,
        })

        if (signInError) {
          setStep("error")
          setIsLoading(false)
          setTimeout(() => {
            addMessage("system", `Authentication failed: ${signInError.message}. Please verify your credentials and try again.`)
            setStep("email")
            setEmail("")
            setPassword("")
          }, 500)
          return
        }

        addMessage("system", "Identity verified. Access granted. Redirecting to Neural Feed...")
        setTimeout(() => {
          router.push("/")
          router.refresh()
        }, 1500)
      } catch {
        setStep("error")
        setIsLoading(false)
        addMessage("system", "A system error occurred. Please try again later.")
        setStep("email")
        setEmail("")
        setPassword("")
      }
    }
  }

  const getInputLabel = () => {
    switch (step) {
      case "email":
        return "IDENTIFICATION (EMAIL)"
      case "password":
        return "CREDENTIALS (PASSWORD)"
      case "authenticating":
        return "AUTHENTICATING..."
      default:
        return "IDENTIFICATION (EMAIL)"
    }
  }

  const getInputPlaceholder = () => {
    switch (step) {
      case "email":
        return "Enter email..."
      case "password":
        return "Enter password..."
      default:
        return "Enter email..."
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Chat Container */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden flex flex-col h-[600px]">
          {/* Header */}
          <div className="flex items-center gap-4 p-4 border-b border-slate-100">
            <Link
              href="/auth"
              className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <Shield className="w-5 h-5 text-indigo-500" />
              </div>
              <span className="font-semibold tracking-wide text-slate-900">THORNE AUTH CORE</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                {message.type === "system" && (
                  <div className="flex items-start gap-3 max-w-[85%]">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div>
                      <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-4 py-3">
                        <p className="text-slate-700 text-sm">{message.content}</p>
                      </div>
                      <p className="text-xs text-indigo-500 font-medium mt-1 ml-1">NOW</p>
                    </div>
                  </div>
                )}
                {message.type === "user" && (
                  <div className="flex items-start gap-3 max-w-[85%]">
                    <div>
                      <div className="bg-indigo-500 text-white rounded-2xl rounded-tr-sm px-4 py-3">
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <p className="text-xs text-indigo-500 font-medium mt-1 mr-1 text-right">NOW</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-slate-600" />
                    </div>
                  </div>
                )}
              </div>
            ))}
            {isLoading && step === "authenticating" && (
              <div className="flex justify-start">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-4 py-3">
                    <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500" />
              <span className="text-xs font-medium text-indigo-500 tracking-wider">{getInputLabel()}</span>
            </div>
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type={step === "password" ? "password" : "text"}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={getInputPlaceholder()}
                  className="w-full px-4 py-3 rounded-full bg-slate-100 border-0 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={isLoading || step === "authenticating"}
                  autoComplete={step === "password" ? "current-password" : "email"}
                />
              </div>
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading || step === "authenticating"}
                className="px-6 py-3 bg-indigo-500 text-white rounded-full font-medium flex items-center gap-2 hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                CONFIRM
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-4 text-center">
          <Link
            href="/auth/forgot-password"
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            Forgot your credentials?
          </Link>
        </div>
      </div>
    </div>
  )
}
