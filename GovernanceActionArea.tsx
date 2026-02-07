
import React from 'react';
import { PulseIcon, UserRoleIcon } from './Icons';

interface GovernanceActionAreaProps {
  onBrowseTeam: () => void;
}

const GovernanceActionArea: React.FC<GovernanceActionAreaProps> = ({ onBrowseTeam }) => {
  return (
    <div className="flex-1 bg-white border border-dashed border-slate-200 rounded-[50px] flex flex-col items-center justify-center text-center p-10 md:p-20 shadow-inner bg-slate-50/20">
      <div className="w-28 h-28 rounded-full bg-white flex items-center justify-center mb-10 relative shadow-xl shadow-indigo-100/50">
        <div className="text-indigo-600">
          <PulseIcon />
        </div>
        <div className="absolute inset-0 bg-indigo-400/10 rounded-full animate-ping"></div>
      </div>
      
      <h4 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-3">Enterprise Governance</h4>
      <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em] max-w-sm leading-relaxed mb-12">
        Audit global access across management, IT, and marketing layers in real-time.
      </p>
      
      <button 
        onClick={onBrowseTeam}
        className="flex items-center gap-4 px-10 py-5 rounded-full border-2 border-slate-200 text-slate-900 text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all transform hover:-translate-y-1 active:scale-95 shadow-lg shadow-slate-200/50"
      >
        <div className="scale-110"><UserRoleIcon /></div>
        Browse Global Team
      </button>
    </div>
  );
};

export default GovernanceActionArea;
