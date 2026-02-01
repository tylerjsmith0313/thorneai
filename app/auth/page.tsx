"use client"

import { Shield, User, UserPlus, ArrowRight, KeyRound, Crown } from "lucide-react"
import Link from "next/link"

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center">
        <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center mb-6">
          <Shield className="w-12 h-12 text-indigo-500" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">THORNE</h1>
        <p className="text-indigo-500 tracking-[0.3em] text-sm font-medium mt-1">NEURAL CORE</p>
      </div>

      {/* System Initiation Card */}
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 mb-4 text-center shadow-sm">
          <h2 className="text-xl font-bold tracking-wide text-slate-900 mb-2">SYSTEM INITIATION</h2>
          <p className="text-slate-500 text-sm">
            Identify your signature or begin the core integration sequence.
          </p>
        </div>

        {/* Auth Options */}
        <Link
          href="/auth/login"
          className="w-full bg-slate-900 text-white rounded-2xl p-5 flex items-center justify-between mb-3 hover:bg-slate-800 transition-colors group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <span className="font-semibold tracking-wide">RETURNING USER</span>
          </div>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          href="/auth/sign-up"
          className="w-full bg-white border border-slate-200 text-slate-900 rounded-2xl p-5 flex items-center justify-between hover:bg-slate-50 transition-colors group shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
              <UserPlus className="w-6 h-6" />
            </div>
            <span className="font-semibold tracking-wide">NEW USER</span>
          </div>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>

        {/* Developer Links */}
        <div className="mt-8 flex flex-col items-center gap-2">
          <button className="text-xs text-slate-400 tracking-wider flex items-center gap-2 hover:text-slate-600 transition-colors">
            <KeyRound className="w-3.5 h-3.5" />
            BYPASS SECURITY PROTOCOL
          </button>
          <Link 
            href="/auth/master-login" 
            className="text-xs text-slate-400 tracking-wider flex items-center gap-2 hover:text-slate-600 transition-colors"
          >
            <Crown className="w-3.5 h-3.5" />
            LOG AS MASTER (TYLER)
          </Link>
        </div>
      </div>

      {/* Footer */}
      <p className="mt-12 text-xs text-slate-400 tracking-wider">
        SECURED BY THORNE CRYPTOGRAPHIC LAYER
      </p>
    </div>
  )
}
