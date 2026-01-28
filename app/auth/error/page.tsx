import Link from "next/link"
import { Calendar, AlertCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 text-white mb-6">
          <Calendar className="w-6 h-6" />
        </div>

        {/* Error Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 text-red-500 mb-6">
            <AlertCircle className="w-8 h-8" />
          </div>

          <h1 className="text-2xl font-semibold text-slate-900 mb-2">Authentication Error</h1>
          <p className="text-slate-500 mb-6">
            Something went wrong during the authentication process. This could be due to an expired link or an invalid request.
          </p>

          <div className="flex flex-col gap-3">
            <Button asChild className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium">
              <Link href="/auth/login">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to login
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full h-11 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 bg-transparent">
              <Link href="/auth/sign-up">
                Create new account
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
