import React from 'react';
import { Governance } from '../types';
import GovernanceHeader from './GovernanceHeader';
import GovernanceItem from './GovernanceItem';
import TransmittalInfo from './TransmittalInfo';

interface Step5Props {
  governance: Governance;
  onToggleGovernance: (id: keyof Governance) => void;
}

const Step5GovernanceDispatch: React.FC<Step5Props> = ({ governance, onToggleGovernance }) => {
  const items = [
    { id: 'tos', label: 'Terms of Service (TOS)' },
    { id: 'privacy', label: 'Privacy & Data Governance' },
    { id: 'mua', label: 'Master User Agreement' }
  ] as const;

  return (
    <div className="animate-in fade-in duration-500 max-w-2xl mx-auto w-full py-4">
      <GovernanceHeader />

      <div className="space-y-2">
        {items.map(item => (
          <GovernanceItem 
            key={item.id}
            label={item.label}
            isEnabled={governance[item.id]}
            onToggle={() => onToggleGovernance(item.id)}
          />
        ))}
      </div>

      <TransmittalInfo />
    </div>
  );
};

export default Step5GovernanceDispatch;