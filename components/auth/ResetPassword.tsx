import React, { useEffect, useState } from 'react';
import { usePasswordReset } from '../hooks/useAuth';

interface ResetPasswordProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * ResetPassword Component - Handles password reset flow
 * 
 * This component handles both requesting a reset email and updating the password
 * when user clicks the reset link from their email.
 * 
 * Usage:
 * 1. User clicks "Forgot Password" → show this component
 * 2. User enters email → confirmation message
 * 3. User gets email with reset link
 * 4. Link redirects to app with recovery code
 * 5. Component detects code and shows password update form
 */
export const ResetPassword: React.FC<ResetPasswordProps> = ({ onSuccess, onCancel }) => {
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { requestReset, updatePassword, loading, error, success } = usePasswordReset();

  // Check if user came from reset email
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get('type');
    if (type === 'recovery') {
      setStep('reset');
    }
  }, []);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await requestReset(email);
    if (success) {
      // Show confirmation message
      setStep('reset');
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      alert('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    const success = await updatePassword(newPassword);
    if (success) {
      onSuccess?.();
    }
  };

  if (step === 'request') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-[480px] animate-in fade-in">
          <div className="bg-white rounded-[64px] p-12 shadow-lg">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Reset Password</h2>
            <p className="text-slate-600 text-sm mb-8">
              Enter your email and we'll send you a link to reset your password.
            </p>

            <form onSubmit={handleRequestReset} className="space-y-6">
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-2 block">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="you@example.com"
                  required
                />
              </div>

              {error && (
                <div className="p-3 bg-rose-50 text-rose-600 text-sm rounded-lg">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 bg-emerald-50 text-emerald-600 text-sm rounded-lg">
                  Check your email for a password reset link. It expires in 1 hour.
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            {onCancel && (
              <button
                onClick={onCancel}
                className="w-full mt-4 py-3 text-slate-600 font-medium hover:text-slate-900 transition-all"
              >
                Back to Login
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-[480px] animate-in fade-in">
        <div className="bg-white rounded-[64px] p-12 shadow-lg">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Create New Password</h2>
          <p className="text-slate-600 text-sm mb-8">
            Enter your new password below.
          </p>

          <form onSubmit={handleUpdatePassword} className="space-y-6">
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-2 block">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="••••••••"
                required
              />
              <p className="text-xs text-slate-500 mt-2">Minimum 8 characters</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 mb-2 block">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-rose-50 text-rose-600 text-sm rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-emerald-50 text-emerald-600 text-sm rounded-lg">
                Password updated successfully! Redirecting...
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
