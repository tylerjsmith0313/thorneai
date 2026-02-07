import React from 'react';

interface AiCommandSectionProps {
  onOpen: () => void;
}

export const AiCommandSection: React.FC<AiCommandSectionProps> = ({ onOpen }) => {
  return (
    <div
      onClick={onOpen}
      className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white cursor-pointer hover:shadow-lg transition-shadow"
    >
      <h3 className="text-lg font-semibold mb-2">AI Command</h3>
      <p className="text-indigo-100">Click to open AI command interface...</p>
    </div>
  );
};
