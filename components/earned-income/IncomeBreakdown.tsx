import React from 'react';

interface IncomeBreakdownProps {
  onClose: () => void;
}

export const IncomeBreakdown: React.FC<IncomeBreakdownProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Income Breakdown</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-2xl"
          >
            ×
          </button>
        </div>
        <p className="text-slate-500">Income breakdown view coming soon...</p>
      </div>
    </div>
  );
};
