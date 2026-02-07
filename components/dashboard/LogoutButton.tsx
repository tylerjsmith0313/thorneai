import React from 'react';
import { supabase } from '../../lib/supabase';

export const LogoutButton: React.FC = () => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
    >
      Logout
    </button>
  );
};
