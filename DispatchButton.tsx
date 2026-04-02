
import React from 'react';
import { SendIcon } from './Icons';

interface DispatchButtonProps {
  onClick: () => void;
  status: 'pending' | 'sent' | 'collected';
  isSimulating: boolean;
}

const DispatchButton: React.FC<DispatchButtonProps> = ({ onClick, status, isSimulating }) => {
  if (status === 'collected') {
    return (
      <div className="w-full py-5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-black text-xs uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
        </svg>
        Settlement Verified: Node Operational
      </div>
    );
  }

  if (isSimulating) {
    return (
      <div className="w-full py-5 bg-slate-800 text-slate-400 font-black text-xs uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3">
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Transmitting Settlement Request...
      </div>
    );
  }

  return (
    <button 
      onClick={onClick}
      className={`w-full py-5 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all flex items-center justify-center gap-3 shadow-lg ${
        status === 'sent' 
          ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-900/20' 
          : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-900/20 hover:-translate-y-0.5'
      }`}
    >
      <SendIcon />
      {status === 'sent' ? 'Re-Dispatch Stripe Node' : 'Dispatch Stripe Payment Node'}
    </button>
  );
};

export default DispatchButton;
