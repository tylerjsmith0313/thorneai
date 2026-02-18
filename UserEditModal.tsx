
import React, { useState } from 'react';
import { User, UserRole } from './types';
import { CloseIcon, TrashIcon } from './Icons';
import { HumanIdentityFields } from './components/shared/HumanIdentityFields';

interface UserEditModalProps {
  user: User;
  onSave: (updatedUser: User) => void;
  onClose: () => void;
  onDelete?: (userId: string) => void;
}

const UserEditModal: React.FC<UserEditModalProps> = ({ user, onSave, onClose, onDelete }) => {
  const [formData, setFormData] = useState<User>(user);

  const roles: UserRole[] = ['Admin', 'VP', 'Director', 'Manager', 'User', 'IT', 'Marketing'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleIdentityChange = (field: string, value: string) => {
    // Map field names if they differ from the User type
    const map: Record<string, keyof User> = {
      'first_name': 'firstName',
      'last_name': 'lastName',
      'email': 'email',
      'phone': 'phone'
    };
    setFormData(prev => ({ ...prev, [map[field]]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#020617]/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden border border-slate-100 flex flex-col animate-in zoom-in-95 duration-300">
        <div className="px-8 pt-8 pb-4 flex items-center justify-between border-b border-slate-50">
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Modify Identity Node</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8 flex-1 overflow-y-auto">
          <HumanIdentityFields 
            firstName={formData.firstName}
            lastName={formData.lastName}
            email={formData.email}
            phone={formData.phone}
            onChange={handleIdentityChange}
            variant="light"
          />

          <div>
            <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest ml-3 mb-2">Access Role</label>
            <div className="relative">
              <select 
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-100 transition-all appearance-none cursor-pointer"
                value={formData.permissions}
                onChange={e => setFormData({...formData, permissions: e.target.value as UserRole})}
              >
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>
        </form>

        <div className="px-8 pb-8 pt-4 flex items-center justify-between border-t border-slate-50 bg-slate-50/50">
          {onDelete && (
             <button 
               type="button" 
               onClick={() => onDelete(user.id)}
               className="p-3 text-red-400 hover:text-red-500 transition-colors"
             >
               <TrashIcon />
             </button>
          )}
          <div className="flex gap-4 ml-auto">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600"
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit}
              className="px-8 py-3 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserEditModal;
