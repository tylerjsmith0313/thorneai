
import React from 'react';
import { CustomerFormData } from '../types';
import IdentitySection from './step1/IdentitySection';
import CompanySection from './step1/CompanySection';
import LocationFields from './LocationFields';

interface WizardStep1Props {
  formData: CustomerFormData;
  updateForm: (updates: Partial<CustomerFormData>) => void;
}

const WizardStep1: React.FC<WizardStep1Props> = ({ formData, updateForm }) => {
  return (
    <div className="flex flex-col lg:flex-row gap-4 p-4 md:p-6 lg:p-8">
      {/* Primary Identity Stack */}
      <div className="flex-1 flex flex-col gap-4">
        <IdentitySection 
          firstName={formData.firstName}
          lastName={formData.lastName}
          email={formData.email}
          phone={formData.phone}
          updateForm={updateForm}
        />
        <CompanySection 
          companyName={formData.companyName}
          jobTitle={formData.jobTitle}
          updateForm={updateForm}
        />
      </div>

      {/* Secondary Context (Location) */}
      <div className="lg:w-[320px] xl:w-[380px] shrink-0">
        <LocationFields 
          data={{
            street: formData.streetAddress,
            city: formData.city,
            state: formData.state,
            zip: formData.zipCode,
            country: formData.country
          }}
          onChange={(field, val) => updateForm({ [field]: val })}
        />
      </div>
    </div>
  );
};

export default WizardStep1;
