import React from 'react';

interface FeedSectionProps {
  onViewChange: (view: string) => void;
}

export const FeedSection: React.FC<FeedSectionProps> = ({ onViewChange }) => {
  return (
    <div className="bg-white rounded-lg p-6 border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Feed</h3>
      <p className="text-slate-500">Feed section coming soon...</p>
    </div>
  );
};
