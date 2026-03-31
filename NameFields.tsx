
import React from 'react';
import InputField from './InputField';

interface NameFieldsProps {
  firstName: string;
  lastName: string;
  onFirstNameChange: (val: string) => void;
  onLastNameChange: (val: string) => void;
}

const NameFields: React.FC<NameFieldsProps> = ({ firstName, lastName, onFirstNameChange, onLastNameChange }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <InputField 
        label="First Name" 
        placeholder="John" 
        value={firstName} 
        onChange={onFirstNameChange} 
        required 
      />
      <InputField 
        label="Last Name" 
        placeholder="Doe" 
        value={lastName} 
        onChange={onLastNameChange} 
        required 
      />
    </div>
  );
};

export default NameFields;
