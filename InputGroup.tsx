
import React, { useState } from 'react';
import { getSetupGuidance } from '../services/geminiService';

interface InputGroupProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
}

const InputGroup: React.FC<InputGroupProps> = ({ label, name, value, onChange, placeholder, type = 'text' }) => {
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
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <label className="block text-sm font-semibold text-gray-700">{label}</label>
        <button 
          onClick={handleHelp}
          className="text-xs text-indigo-600 hover:text-indigo-800 transition-colors font-medium flex items-center gap-1"
        >
          {loading ? 'Thinking...' : guidance ? 'Close info' : 'What is this?'}
        </button>
      </div>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
      />
      {guidance && (
        <div className="mt-2 p-3 bg-indigo-50 border border-indigo-100 rounded-md text-xs text-indigo-900 animate-in fade-in slide-in-from-top-1">
          {guidance}
        </div>
      )}
    </div>
  );
};

export default InputGroup;
