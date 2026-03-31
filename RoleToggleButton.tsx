
import React from 'react';

interface RoleToggleButtonProps {
  label: string;
  icon: React.ReactNode;
  color: 'emerald' | 'rose' | 'slate';
  isSelected?: boolean;
}

const RoleToggleButton: React.FC<RoleToggleButtonProps> = ({ label, icon, color, isSelected }) => {
  const colorClasses = {
    emerald: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20',
    rose: 'border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20',
    slate: 'border-slate-700 bg-slate-800/30 text-slate-400 hover:border-slate-600 hover:bg-slate-800/50'
  };

  return (
    <button 
      className={`flex flex-col items-center justify-center w-16 h-14 rounded-xl border transition-all ${colorClasses[color]} ${isSelected ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-[#0f172a]' : ''}`}
    >
      <div className="scale-90">{icon}</div>
      <span className="text-[8px] font-black uppercase tracking-tighter mt-1">{label}</span>
    </button>
  );
};

export default RoleToggleButton;
