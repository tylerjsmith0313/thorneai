import React, { useEffect, useState } from 'react';
import { useEmailVerification } from '../hooks/useAuth';

interface VerifyEmailProps {
  onSuccess?: () => void;
  email?: string;
}

/**
 * VerifyEmail Component - Handles email verification flow
 * 
 * This component handles email verification after signup.
 * Automatically detects verification tokens from email links.
 * 
 * Usage:
 * 1. User signs up
 * 2. Gets confirmation email with verification link
 * 3. Link redirects to app with token in URL (type=email_verification)
 * 4. Component automatically detects and verifies
 * 5. Shows success message or allows manual token entry
 */
export const VerifyEmail: React.FC<VerifyEmailProps> = ({ onSuccess, email }) => {
  const [manualToken, setManualToken] = useState('');
  const [resendEmail, setResendEmail] = useState(email || '');
  const [verificationAttempted, setVerificationAttempted] = useState(false);
  const { verifyEmail, resendVerificationEmail, loading, error, success } = useEmailVerification();

  // Auto-verify if token is in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const type = params.get('type');

    if (token && type === 'email_verification') {
      handleAutoVerify(token);
    }
  }, []);

  const handleAutoVerify = async (token: string) => {
    setVerificationAttempted(true);
    const result = await verifyEmail(token, 'email');
    if (result) {
      setTimeout(() => onSuccess?.(), 2000);
    }
  };

  const handleManualVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationAttempted(true);
    const result = await verifyEmail(manualToken, 'email');
    if (result) {
      setTimeout(() => onSuccess?.(), 2000);
    }
  };

  const handleResendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    await resendVerificationEmail(resendEmail);
  };

  if (success && verificationAttempted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-[480px] animate-in fade-in">
          <div className="bg-white rounded-[64px] p-12 shadow-lg text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Email Verified!</h2>
            <p className="text-slate-600 mb-6">
              Your email has been successfully verified. You can now access all features of AGYNTOS CORE.
            </p>
            <p className="text-sm text-slate-500">Redirecting...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-[480px] animate-in fade-in">
        <div className="bg-white rounded-[64px] p-12 shadow-lg">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Verify Your Email</h2>
          <p className="text-slate-600 text-sm mb-8">
            We sent a verification link to your email. Click it or paste the code below.
          </p>

          <form onSubmit={handleManualVerify} className="space-y-6">
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-2 block">Verification Code</label>
              <input
                type="text"
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-center text-lg tracking-widest"
                placeholder="000000"
                maxLength={64}
              />
            </div>

            {error && (
              <div className="p-3 bg-rose-50 text-rose-600 text-sm rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !manualToken}
              className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-200">
            <p className="text-sm text-slate-600 mb-4">Didn't receive the email?</p>
            <form onSubmit={handleResendEmail} className="space-y-4">
              <input
                type="email"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="your@email.com"
                required
              />
              <button
                type="submit"
                disabled={loading || !resendEmail}
                className="w-full py-3 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition-all disabled:opacity-50"
              >
                {loading ? 'Resending...' : 'Resend Verification Email'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
