import React from 'react';

interface QuickActionsSectionProps {
  onAddContact: () => void;
}

export const QuickActionsSection: React.FC<QuickActionsSectionProps> = ({ onAddContact }) => {
  return (
    <div className="flex gap-3">
      <button
        onClick={onAddContact}
        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
      >
        Add Contact
      </button>
    </div>
  );
};
