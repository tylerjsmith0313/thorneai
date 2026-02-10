
import React from 'react';
import InputField from './InputField';

interface CompanyFieldsProps {
  companyName: string;
  jobTitle: string;
  onCompanyChange: (val: string) => void;
  onTitleChange: (val: string) => void;
}

const CompanyFields: React.FC<CompanyFieldsProps> = ({ companyName, jobTitle, onCompanyChange, onTitleChange }) => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-widest">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        Company Details
      </div>
      <InputField label="Company Name" placeholder="Acme Corp" value={companyName} onChange={onCompanyChange} />
      <InputField 
        label="Job Title" 
        placeholder="VP of Sales" 
        value={jobTitle} 
        onChange={onTitleChange} 
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        }
      />
    </div>
  );
};

export default CompanyFields;
