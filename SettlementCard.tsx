
import React from 'react';

interface SettlementCardProps {
  yieldValue: number;
  paymentStatus: 'pending' | 'sent' | 'collected';
  children: React.ReactNode;
}

const SettlementCard: React.FC<SettlementCardProps> = ({ yieldValue, paymentStatus, children }) => {
  const statusLabels = {
    pending: 'PENDING DISPATCH',
    sent: 'AWAITING COLLECTION',
    collected: 'SETTLED'
  };

  const statusColors = {
    pending: 'bg-slate-700 text-slate-400',
    sent: 'bg-amber-500/20 text-amber-400',
    collected: 'bg-emerald-500/20 text-emerald-400'
  };

  return (
    <div className="bg-[#0f172a] rounded-[40px] p-10 text-white relative overflow-hidden group shadow-2xl shadow-indigo-900/20">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-transparent opacity-50"></div>
      
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-[10px] font-black tracking-widest uppercase text-indigo-400 mb-2">Settlement Yield</p>
          <div className="text-5xl font-black">${yieldValue.toLocaleString()}</div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black tracking-widest uppercase text-slate-500 mb-2">Payment Status</p>
          <span className={`text-[10px] font-bold px-4 py-1.5 rounded-full tracking-wider ${statusColors[paymentStatus]}`}>
            {statusLabels[paymentStatus]}
          </span>
        </div>
      </div>

      <div className="mt-10 relative z-10">
        {children}
      </div>
      
      {/* Decorative icon background */}
      <div className="absolute right-10 bottom-10 opacity-10 scale-150 rotate-12 pointer-events-none transition-transform group-hover:rotate-0">
        <svg className="w-24 h-24" fill="white" viewBox="0 0 24 24">
          <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v4z" />
        </svg>
      </div>
    </div>
  );
};

export default SettlementCard;
