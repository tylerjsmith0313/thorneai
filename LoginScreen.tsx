
import React, { useState } from 'react';
import { supabase } from './lib/supabase';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const MailIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const CompanyIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 21V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v16h18zM8 21v-4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4M12 9v2M8 9v2M16 9v2" />
  </svg>
);

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP' | 'BILLING'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'SIGNUP') {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              company: companyName, // Metadata key used by the trigger
              job_title: jobTitle,
              phone: phone
            }
          }
        });

        if (signUpError) throw signUpError;
        setMode('BILLING');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.toLowerCase().trim(),
          password,
        });

        if (error) throw error;
        onLoginSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Handshake failed. Verify terminal connectivity.');
    } finally {
      setLoading(false);
    }
  };

  const handleActivateNode = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const currentEmail = session?.user?.email || email;
      
      await supabase.functions.invoke('signal-ingest', {
        body: {
          sender_email: currentEmail,
          target_tenant: 'simplyflourish.space',
          target_user_email: 'tyler@simplyflourish.space',
          signal_type: 'NEW_NODE_ACTIVATION',
          payload: {
            first_name: firstName,
            last_name: lastName,
            job_title: jobTitle,
            company: companyName,
            status: 'AWAITING_SETTLEMENT'
          }
        }
      });

      window.open('https://buy.stripe.com/test_dRmaEYfw3aincs7f5Fc3m01', '_blank');
      onLoginSuccess();
    } catch (err) {
      console.error("Commercial activation failure:", err);
      onLoginSuccess(); 
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'BILLING') {
    return (
      <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center p-6">
        <div className="w-full max-w-[540px] animate-in fade-in zoom-in-95 duration-500">
          <div className="bg-white rounded-[64px] p-16 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-emerald-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-500/20 mb-10 relative overflow-hidden">
               <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
               <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                 <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.546 1.16 3.74.904 5.244-.406 1.503-1.31 1.503-3.446 0-4.756-1.504-1.31-3.698-1.566-5.244-.406L10.5 9.182m0 5.636a5.002 5.002 0 01-1.188-8.844l.879-.659c1.546-1.16 3.74-.904 5.244-.406 1.503-1.31 1.503-3.446 0-4.756-1.504-1.31-3.698-1.566-5.244-.406L10.5 9.182m0 5.636a5.002 5.002 0 01-1.188 3.636H12" />
               </svg>
            </div>
            <h2 className="text-[32px] font-[900] text-slate-900 uppercase tracking-tight mb-4">COMMERCIAL ACTIVATION</h2>
            <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed mb-12 max-w-sm">
              Your neural identity has been initialized. Complete the settlement protocol to activate your node.
            </p>
            <button onClick={handleActivateNode} className="w-full py-6 bg-slate-900 text-white font-black uppercase tracking-[0.3em] rounded-[24px] hover:bg-black transition-all flex items-center justify-center gap-4">
              Activate Node
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center p-6 py-12">
      <div className={`w-full ${mode === 'SIGNUP' ? 'max-w-[700px]' : 'max-w-[480px]'} animate-in fade-in zoom-in-95`}>
        <div className="bg-white rounded-[64px] p-12 md:p-16 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] flex flex-col items-center">
          <div className="w-20 h-20 bg-[#5547eb] rounded-full flex items-center justify-center shadow-2xl mb-10 relative">
             <div className="absolute inset-0 rounded-full bg-indigo-500/10 animate-pulse scale-110"></div>
             <ShieldIcon />
          </div>

          <div className="text-center mb-10">
            <h2 className="text-[32px] font-[900] text-slate-900 uppercase tracking-tight leading-none mb-2">
              {mode === 'SIGNUP' ? 'Initialize Node' : 'AGYNTOS CORE'}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-6">
            {mode === 'SIGNUP' && (
              <>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-1">First Name</label>
                    <div className="relative"><div className="absolute left-6 top-1/2 -translate-y-1/2"><UserIcon /></div>
                    <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full pl-16 pr-8 py-4 rounded-[20px] border border-slate-100 bg-slate-50/50 font-bold" placeholder="JOHN" required /></div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Last Name</label>
                    <div className="relative"><div className="absolute left-6 top-1/2 -translate-y-1/2"><UserIcon /></div>
                    <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full pl-16 pr-8 py-4 rounded-[20px] border border-slate-100 bg-slate-50/50 font-bold" placeholder="DOE" required /></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Company</label>
                    <div className="relative"><div className="absolute left-6 top-1/2 -translate-y-1/2"><CompanyIcon /></div>
                    <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full pl-16 pr-8 py-4 rounded-[20px] border border-slate-100 bg-slate-50/50 font-bold" placeholder="ACME CORP" required /></div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Job Title</label>
                    <div className="relative"><div className="absolute left-6 top-1/2 -translate-y-1/2"><ShieldIcon /></div>
                    <input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className="w-full pl-16 pr-8 py-4 rounded-[20px] border border-slate-100 bg-slate-50/50 font-bold" placeholder="CEO" required /></div>
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Email</label>
              <div className="relative"><div className="absolute left-6 top-1/2 -translate-y-1/2"><MailIcon /></div>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-16 pr-8 py-5 rounded-[22px] border border-slate-100 font-bold" placeholder="operator@agyntos.io" required /></div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Access Cipher</label>
              <div className="relative"><div className="absolute left-6 top-1/2 -translate-y-1/2"><LockIcon /></div>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-16 pr-8 py-5 rounded-[22px] border border-slate-100 font-bold" placeholder="••••••••" required /></div>
            </div>

            {error && <div className="p-4 bg-rose-50 text-rose-500 font-bold text-[10px] uppercase text-center rounded-2xl">{error}</div>}

            <button type="submit" disabled={loading} className="w-full py-5 bg-[#5547eb] text-white font-black uppercase tracking-widest rounded-[22px] hover:bg-[#4338ca] transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-[0.98]">
              {loading ? 'Processing...' : (mode === 'SIGNUP' ? 'Initialize Node' : 'Login')}
            </button>
          </form>

          <button onClick={() => setMode(mode === 'SIGNUP' ? 'LOGIN' : 'SIGNUP')} className="mt-8 text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">
            {mode === 'SIGNUP' ? 'Switch to Login' : 'Initialize New Account'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
