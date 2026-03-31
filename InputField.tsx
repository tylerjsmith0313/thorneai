
import React from 'react';
import { InputProps } from '../types';

const InputField: React.FC<InputProps> = ({ label, placeholder, value, onChange, required, type = 'text', icon }) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-0.5 pl-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors">
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-[13px] text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all ${icon ? 'pl-9' : ''}`}
        />
      </div>
    </div>
  );
};

export default InputField;
