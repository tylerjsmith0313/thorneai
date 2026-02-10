
import React from 'react';
import { CrownIcon, CloseIcon } from './Icons';
import { WizardStep } from '../types';

interface WizardHeaderProps {
  step: WizardStep;
}

const WizardHeader: React.FC<WizardHeaderProps> = ({ step }) => {
  return (
    <header className="px-12 pt-12 pb-10 flex items-center justify-between border-b border-slate-50/50">
      <div className="flex items-center gap-6">
        <div className="w-16 h-16 bg-[#0f172a] rounded-3xl flex items-center justify-center shadow-lg shadow-slate-200">
           <CrownIcon />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black italic text-slate-900 uppercase tracking-tighter leading-none">Agynt OS Tenant & User Control</h1>
          <div className="flex items-center gap-3 mt-2">
             <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className={`w-3 h-3 rounded-full ${step >= i ? 'bg-[#FFB900]' : 'bg-slate-200'}`} />
                ))}
             </div>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">TYLER LEVEL 5 CLEARANCE</span>
          </div>
        </div>
      </div>
      <button className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors">
        <CloseIcon />
      </button>
    </header>
  );
};

export default WizardHeader;