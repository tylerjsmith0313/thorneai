
import React from 'react';

interface InfrastructureSectionProps {
  title: string;
  children: React.ReactNode;
}

const InfrastructureSection: React.FC<InfrastructureSectionProps> = ({ title, children }) => {
  return (
    <div className="bg-slate-50/50 p-8 rounded-[40px] border border-slate-100/50 flex flex-col h-full shadow-sm hover:shadow-md transition-shadow duration-500">
      <div className="mb-8">
        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] border-l-4 border-indigo-500 pl-4">{title}</h4>
      </div>
      <div className="flex-1 space-y-2">
        {children}
      </div>
    </div>
  );
};

export default InfrastructureSection;
