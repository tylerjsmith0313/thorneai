
import React from 'react';
import { DocIcon } from './Icons';

interface GovernanceItemProps {
  label: string;
  isEnabled: boolean;
  onToggle: () => void;
}

const GovernanceItem: React.FC<GovernanceItemProps> = ({ label, isEnabled, onToggle }) => {
  return (
    <div className="group p-2 rounded-[30px] border border-slate-100 bg-white hover:border-indigo-100 transition-all shadow-sm mb-4">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
            <DocIcon />
          </div>
          <span className="font-black text-[11px] tracking-[0.15em] text-indigo-600 uppercase">{label}</span>
        </div>
        <button 
          onClick={onToggle}
          className={`w-14 h-8 rounded-full transition-all relative flex items-center ${isEnabled ? 'bg-indigo-600 shadow-lg shadow-indigo-100' : 'bg-slate-200'}`}
        >
          <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-all absolute ${isEnabled ? 'left-7' : 'left-1'}`} />
        </button>
      </div>
    </div>
  );
};

export default GovernanceItem;
