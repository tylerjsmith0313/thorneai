import React from 'react';

interface AppsSectionProps {
  onViewChange: (view: string) => void;
}

export const AppsSection: React.FC<AppsSectionProps> = ({ onViewChange }) => {
  return (
    <div className="bg-white rounded-lg p-6 border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Apps</h3>
      <p className="text-slate-500">Apps section coming soon...</p>
    </div>
  );
};
