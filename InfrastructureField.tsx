
import React, { useState } from 'react';
import { getSetupGuidance } from '../services/geminiService';

interface InfrastructureFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  placeholder?: string;
}

const InfrastructureField: React.FC<InfrastructureFieldProps> = ({ label, value, onChange, type = 'text', placeholder }) => {
  const [guidance, setGuidance] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleHelp = async () => {
    if (guidance) {
      setGuidance(null);
      return;
    }
    setLoading(true);
    const helpText = await getSetupGuidance(label);
    setGuidance(helpText);
    setLoading(false);
  };

  return (
    <div className="mb-6 last:mb-0 group">
      <div className="flex justify-between items-center mb-2 px-1">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</label>
        <button 
          onClick={handleHelp}
          className="text-[9px] text-indigo-500 hover:text-indigo-700 font-bold uppercase tracking-tighter transition-colors"
        >
          {loading ? 'Consulting Gemini...' : guidance ? 'Hide Info' : 'What is this?'}
        </button>
      </div>
      <div className="relative">
        <input 
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-5 py-3.5 rounded-2xl bg-white border-2 border-slate-100 text-sm font-bold text-slate-900 outline-none focus:border-indigo-200 focus:ring-4 focus:ring-indigo-50/30 transition-all placeholder:text-slate-200"
        />
      </div>
      {guidance && (
        <div className="mt-3 p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl text-[11px] text-indigo-700 font-medium leading-relaxed animate-in fade-in slide-in-from-top-2">
          {guidance}
        </div>
      )}
    </div>
  );
};

export default InfrastructureField;
