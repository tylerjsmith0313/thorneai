
import React from 'react';
import { User } from '../types';
import { CrownIcon, ITRoleIcon, VPRoleIcon } from './Icons';

interface UserListItemProps {
  user: User;
}

const UserListItem: React.FC<UserListItemProps> = ({ user }) => {
  const getBadgeColor = () => {
    switch (user.permissions) {
      case 'Admin': return 'bg-slate-900';
      case 'IT': return 'bg-emerald-600';
      case 'Marketing': return 'bg-rose-600';
      case 'VP': return 'bg-indigo-600';
      default: return 'bg-slate-200 text-slate-500';
    }
  };

  const displayName = user.firstName || user.lastName 
    ? `${user.firstName} ${user.lastName}`.trim()
    : 'New Identity Node';

  return (
    <button className="w-full flex items-center gap-4 p-4 rounded-3xl bg-white border border-slate-50 hover:border-indigo-100 hover:shadow-md transition-all text-left group">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white shadow-sm transition-colors ${getBadgeColor()}`}>
        {(user.firstName && user.firstName[0]) || (user.permissions[0])}
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="font-black text-xs text-slate-900 uppercase tracking-tight truncate">
          {displayName}
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          {user.permissions === 'Admin' && <div className="text-[#FFB900] scale-75"><CrownIcon /></div>}
          <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{user.permissions}</span>
        </div>
      </div>
      <svg className="w-4 h-4 text-slate-200 group-hover:text-indigo-400 transition-colors transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
};

export default UserListItem;
