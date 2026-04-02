"use client"

import { Shield, User, UserPlus, ArrowRight } from "lucide-react"

interface AuthScreenProps {
  onAuthenticate: () => void
}

export function AuthScreen({ onAuthenticate }: AuthScreenProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center">
        <div className="w-24 h-24 rounded-full bg-thorne-lavender/40 flex items-center justify-center mb-6">
          <Shield className="w-12 h-12 text-thorne-indigo" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-thorne-navy">AGYNTSYNQ</h1>
        <p className="text-thorne-indigo tracking-[0.3em] text-sm font-medium mt-1">NEURAL CORE</p>
      </div>

      {/* System Initiation Card */}
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl border border-border p-8 mb-4 text-center">
          <h2 className="text-xl font-bold tracking-wide text-thorne-navy mb-2">SYSTEM INITIATION</h2>
          <p className="text-muted-foreground text-sm">
            Identify your signature or begin the core integration sequence.
          </p>
        </div>

        {/* Auth Options */}
        <button
          onClick={onAuthenticate}
          className="w-full bg-thorne-navy text-white rounded-2xl p-5 flex items-center justify-between mb-3 hover:bg-thorne-navy/90 transition-colors group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <span className="font-semibold tracking-wide">RETURNING USER</span>
          </div>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          onClick={onAuthenticate}
          className="w-full bg-card border border-border text-thorne-navy rounded-2xl p-5 flex items-center justify-between hover:bg-secondary transition-colors group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
              <UserPlus className="w-6 h-6" />
            </div>
            <span className="font-semibold tracking-wide">NEW USER</span>
          </div>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Footer */}
      <p className="mt-12 text-xs text-muted-foreground tracking-wider">
        SECURED BY AGYNTSYNQ CRYPTOGRAPHIC LAYER &bull; V3.2.0
      </p>
    </div>
  )
}
