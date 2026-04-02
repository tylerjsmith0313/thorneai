
import React from 'react';
import InputField from './InputField';

interface LocationFieldsProps {
  data: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  onChange: (field: string, val: string) => void;
}

const LocationFields: React.FC<LocationFieldsProps> = ({ data, onChange }) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 h-full">
      <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-widest mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Location Details
      </div>
      
      <div className="flex flex-col gap-6">
        <InputField 
          label="Street Address" 
          placeholder="123 Main Street" 
          value={data.street} 
          onChange={(v) => onChange('streetAddress', v)} 
        />
        
        <div className="grid grid-cols-2 gap-4">
          <InputField 
            label="City" 
            placeholder="San Francisco" 
            value={data.city} 
            onChange={(v) => onChange('city', v)} 
          />
          <InputField 
            label="State" 
            placeholder="CA" 
            value={data.state} 
            onChange={(v) => onChange('state', v)} 
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <InputField 
            label="Zip Code" 
            placeholder="94105" 
            value={data.zip} 
            onChange={(v) => onChange('zipCode', v)} 
          />
          <InputField 
            label="Country" 
            placeholder="United States" 
            value={data.country} 
            onChange={(v) => onChange('country', v)} 
          />
        </div>
      </div>
    </div>
  );
};

export default LocationFields;
