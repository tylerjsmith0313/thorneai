
import React from 'react';
import { WizardStep } from '../types';

interface WizardFooterProps {
  step: WizardStep;
  paymentStatus: string;
  onAdvance: () => void;
  onBack: () => void;
}

const WizardFooter: React.FC<WizardFooterProps> = ({ step, paymentStatus, onAdvance, onBack }) => {
  if (step >= 7) return null;

  return (
    <footer className="px-12 py-12 flex items-center justify-between bg-white border-t border-slate-50">
      <button className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] hover:text-red-400 transition-colors">
        ABORT PROVISIONING
      </button>
      <div className="flex items-center gap-6">
         {step > 1 && (
            <button onClick={onBack} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">
              Back
            </button>
         )}
        <button 
          onClick={onAdvance}
          disabled={step === 3 && paymentStatus !== 'collected'}
          className={`px-12 py-6 bg-gradient-to-r from-[#FFD180] to-[#FFB900] text-white font-black uppercase tracking-widest rounded-[30px] hover:shadow-xl hover:shadow-orange-200 transition-all flex items-center gap-4 ${
            step === 3 && paymentStatus !== 'collected' ? 'opacity-50 cursor-not-allowed grayscale' : ''
          }`}
        >
          <span className="text-sm">
            {step === 3 && paymentStatus !== 'collected' ? 'Awaiting Settlement' :
             step === 5 ? 'PROVISION & DISPATCH PACKAGE' : 
             step === 6 ? 'ACTIVATE NODE' : 'CONFIRM & ADVANCE'}
          </span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
        </button>
      </div>
    </footer>
  );
};

export default WizardFooter;
