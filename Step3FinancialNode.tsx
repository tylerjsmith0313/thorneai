import React from 'react';
import { Financials } from '../types';
import FinancialField from './FinancialField';
import SettlementCard from './SettlementCard';
import DispatchButton from './DispatchButton';

interface Step3Props {
  financials: Financials;
  yieldValue: number;
  simulatingPayment: boolean;
  onUpdateFinancials: (field: string, value: any) => void;
  onDispatchPayment: () => void;
  onManualOverride: () => void;
}

const Step3FinancialNode: React.FC<Step3Props> = ({ 
  financials, 
  yieldValue, 
  simulatingPayment, 
  onUpdateFinancials, 
  onDispatchPayment,
  onManualOverride
}) => {
  return (
    <div className="space-y-12 animate-in fade-in duration-500 max-w-2xl mx-auto">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-slate-900 mb-2 uppercase tracking-tight">Financial Layer Configuration</h3>
        <p className="text-slate-500 italic font-medium">"Tyler override: Set direct pricing and discount signatures."</p>
      </div>

      <div className="bg-white rounded-[50px] p-12 border border-slate-100 shadow-sm space-y-10">
        {/* Input Layer */}
        <div className="flex gap-10">
          <FinancialField 
            label="Base Price ($)"
            symbol="$"
            value={financials.basePrice}
            readOnly
          />
          <FinancialField 
            label="Discount Override (%)"
            symbol="%"
            value={financials.discount}
            onChange={(val) => onUpdateFinancials('discount', val)}
          />
        </div>

        {/* Summary Layer */}
        <SettlementCard 
          yieldValue={yieldValue} 
          paymentStatus={financials.paymentStatus}
        >
          <DispatchButton 
            status={financials.paymentStatus}
            isSimulating={simulatingPayment}
            onClick={onDispatchPayment}
          />
          
          {financials.paymentStatus === 'sent' && (
            <button 
              onClick={onManualOverride}
              className="mt-4 w-full text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
            >
              System Override: Mark as Settled Manually
            </button>
          )}
        </SettlementCard>
      </div>
    </div>
  );
};

export default Step3FinancialNode;