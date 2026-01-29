import Link from "next/link"
import { Calendar, Mail, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 text-white mb-6">
          <Calendar className="w-6 h-6" />
        </div>

        {/* Success Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 mb-6">
            <Mail className="w-8 h-8" />
          </div>

          <h1 className="text-2xl font-semibold text-slate-900 mb-2">Check your email</h1>
          <p className="text-slate-500 mb-6">
            We've sent you a confirmation link. Please check your inbox and click the link to activate your account.
          </p>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 mb-6">
            <p className="text-sm text-slate-600">
              Didn't receive the email? Check your spam folder or{" "}
              <Link href="/auth/sign-up" className="text-indigo-600 hover:text-indigo-700 font-medium">
                try signing up again
              </Link>
            </p>
          </div>

          <Button asChild className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium">
            <Link href="/onboarding">
              Continue to Setup
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
