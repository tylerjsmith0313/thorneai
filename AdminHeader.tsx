import React from 'react';
import { UserRole } from '../types';
import { 
  AuditIcon, 
  UserRoleIcon, 
  ManagerRoleIcon, 
  DirectorRoleIcon, 
  VPRoleIcon, 
  ITRoleIcon, 
  MarketingRoleIcon 
} from './Icons';
import RoleToggleButton from './RoleToggleButton';

interface AdminHeaderProps {
  onQuickAdd: (role: UserRole) => void;
  onOpenAudit: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onQuickAdd, onOpenAudit }) => {
  return (
    <div className="bg-[#0f172a] rounded-[40px] p-10 mb-8 flex items-center justify-between text-white relative overflow-hidden shadow-2xl shadow-indigo-950/40">
      <div className="relative z-10">
        <h3 className="text-3xl font-black uppercase tracking-tight mb-1">Admin Center</h3>
        <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em]">Governance & Capability Management</p>
      </div>
      
      <div className="flex gap-6 items-center relative z-10">
        {/* Actions Area */}
        <button 
          onClick={onOpenAudit}
          className="flex items-center gap-3 px-6 py-3 text-[10px] font-black uppercase tracking-widest bg-slate-800/80 hover:bg-slate-700 rounded-2xl shadow-lg border border-slate-700/50 transition-all group"
        >
          <div className="text-indigo-400 group-hover:rotate-12 transition-transform">
            <AuditIcon />
          </div>
          Audit Logs
        </button>

        {/* Vertical Divider */}
        <div className="w-px h-10 bg-slate-700/50" />

        {/* Quick Add Matrix */}
        <div className="flex gap-2">
          <div onClick={() => onQuickAdd('User')} title="Quick Add User Profile">
            <RoleToggleButton label="User" icon={<UserRoleIcon />} color="slate" />
          </div>
          <div onClick={() => onQuickAdd('Manager')} title="Quick Add Manager Profile">
            <RoleToggleButton label="Manager" icon={<ManagerRoleIcon />} color="slate" />
          </div>
          <div onClick={() => onQuickAdd('Director')} title="Quick Add Director Profile">
            <RoleToggleButton label="Director" icon={<DirectorRoleIcon />} color="slate" />
          </div>
          <div onClick={() => onQuickAdd('VP')} title="Quick Add VP Profile">
            <RoleToggleButton label="VP" icon={<VPRoleIcon />} color="slate" />
          </div>
          <div onClick={() => onQuickAdd('IT')} title="Quick Add IT Profile">
            <RoleToggleButton label="IT" icon={<ITRoleIcon />} color="emerald" />
          </div>
          <div onClick={() => onQuickAdd('Marketing')} title="Quick Add Marketing Profile">
            <RoleToggleButton label="Marketing" icon={<MarketingRoleIcon />} color="rose" />
          </div>
        </div>
      </div>

      {/* Shield Decoration */}
      <div className="absolute right-0 top-0 bottom-0 w-64 opacity-5 pointer-events-none translate-x-12">
        <svg viewBox="0 0 100 100" className="w-full h-full fill-white">
          <path d="M50 0 L90 20 L90 70 L50 100 L10 70 L10 20 Z" />
        </svg>
      </div>
    </div>
  );
};

export default AdminHeader;