
import React from 'react';

interface FinancialFieldProps {
  label: string;
  value: number | string;
  symbol: string;
  readOnly?: boolean;
  onChange?: (val: number) => void;
}

const FinancialField: React.FC<FinancialFieldProps> = ({ label, value, symbol, readOnly, onChange }) => {
  return (
    <div className="flex-1">
      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
        {label}
      </label>
      <div className="relative group">
        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 text-xl font-bold select-none">
          {symbol}
        </div>
        <input 
          type="number"
          className={`w-full pl-12 pr-6 py-6 rounded-3xl bg-slate-50 border-none text-2xl font-black text-slate-900 outline-none transition-all ${
            readOnly ? 'cursor-not-allowed opacity-80' : 'focus:bg-white focus:ring-2 focus:ring-indigo-100'
          }`}
          value={value}
          readOnly={readOnly}
          onChange={(e) => onChange?.(parseInt(e.target.value) || 0)}
        />
      </div>
    </div>
  );
};

export default FinancialField;
