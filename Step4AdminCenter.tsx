
import React, { useState } from 'react';
import { User, UserRole, AuditEntry } from '../types';
import AdminHeader from './AdminHeader';
import UserListItem from './UserListItem';
import OrgTree from './OrgTree';
import UserEditModal from './UserEditModal';
import AuditLogModal from './AuditLogModal';
import { PlusIcon } from './Icons';

interface Step4Props {
  users: User[];
  auditLogs: AuditEntry[];
  onUpdateUsers: (users: User[]) => void;
  onUpdateLogs: (logs: AuditEntry[]) => void;
}

const Step4AdminCenter: React.FC<Step4Props> = ({ users, auditLogs, onUpdateUsers, onUpdateLogs }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  const filteredUsers = users.filter(u => 
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.permissions.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addAuditLog = (action: AuditEntry['action'], details: string) => {
    const newEntry: AuditEntry = {
      id: Math.random().toString(36).substr(2, 9),
      tenant_id: 'default-tenant', // Fix: Added missing tenant_id
      timestamp: new Date().toLocaleTimeString(),
      action,
      details
    };
    onUpdateLogs([newEntry, ...auditLogs]);
  };

  const handleQuickAddRole = (role: UserRole) => {
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      tenant_id: 'default-tenant', // Fix: Added missing tenant_id
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      permissions: role,
      parentId: users[0]?.id || undefined,
      created_at: new Date().toISOString() // Fix: Added missing created_at
    };
    onUpdateUsers([...users, newUser]);
    addAuditLog('CREATE', `Initialized blank profile with role: ${role}`);
    setEditingUser(newUser); 
  };

  const handleSaveUser = (updatedUser: User) => {
    const oldUser = users.find(u => u.id === updatedUser.id);
    const changes = [];
    if (oldUser) {
      if (oldUser.firstName !== updatedUser.firstName) changes.push(`First Name: ${oldUser.firstName} -> ${updatedUser.firstName}`);
      if (oldUser.lastName !== updatedUser.lastName) changes.push(`Last Name: ${oldUser.lastName} -> ${updatedUser.lastName}`);
      if (oldUser.permissions !== updatedUser.permissions) changes.push(`Role: ${oldUser.permissions} -> ${updatedUser.permissions}`);
    }
    
    onUpdateUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (changes.length > 0) {
      addAuditLog('UPDATE', `Modified profile (${updatedUser.firstName || 'Blank'}): ${changes.join(', ')}`);
    }
    setEditingUser(null);
  };

  const handleDeleteUser = (userId: string) => {
    const target = users.find(u => u.id === userId);
    const updatedUsers = users
      .filter(u => u.id !== userId)
      .map(u => u.parentId === userId ? { ...u, parentId: undefined } : u);
    onUpdateUsers(updatedUsers);
    addAuditLog('DELETE', `Deactivated profile: ${target?.firstName || 'Blank'} ${target?.lastName || ''} (${target?.permissions})`);
    setEditingUser(null);
  };

  const handleMoveUser = (userId: string, newParentId: string | undefined) => {
    const target = users.find(u => u.id === userId);
    const parent = users.find(u => u.id === newParentId);
    
    const isDescendant = (parent: string, child: string): boolean => {
      const parentUser = users.find(u => u.id === parent);
      if (!parentUser || !parentUser.parentId) return false;
      if (parentUser.parentId === child) return true;
      return isDescendant(parentUser.parentId, child);
    };

    if (newParentId && isDescendant(newParentId, userId)) {
      alert("Invalid move: Cannot make a user report to their own subordinate.");
      return;
    }

    onUpdateUsers(users.map(u => u.id === userId ? { ...u, parentId: newParentId } : u));
    addAuditLog('MOVE', `Reorganized hierarchy: ${target?.firstName || 'Blank'} now reports to ${parent?.firstName || 'System Root'}`);
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500">
      <AdminHeader 
        onQuickAdd={handleQuickAddRole} 
        onOpenAudit={() => setIsAuditModalOpen(true)}
      />

      <div className="flex-1 flex gap-10 min-h-0">
        {/* Sidebar List */}
        <div className="w-80 flex flex-col gap-6">
          <div className="flex gap-3">
            <div className="relative group flex-1">
              <input 
                className="w-full pl-14 pr-6 py-5 rounded-[25px] bg-slate-50 border-2 border-transparent text-sm font-bold placeholder:text-slate-300 outline-none focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-50/50 transition-all shadow-sm" 
                placeholder="Filter profiles..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-400 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <button 
              onClick={() => handleQuickAddRole('User')}
              className="w-16 h-full bg-[#0f172a] text-white rounded-[25px] flex items-center justify-center hover:bg-slate-800 transition-all shadow-lg hover:-translate-y-0.5"
              title="Quick Add User Profile"
            >
              <PlusIcon />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-3 space-y-4 custom-scrollbar">
            {filteredUsers.map((user) => (
              <div key={user.id} onClick={() => setEditingUser(user)}>
                <UserListItem user={user} />
              </div>
            ))}
            {filteredUsers.length === 0 && (
              <div className="py-20 text-center">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No profiles found</p>
              </div>
            )}
          </div>
        </div>

        {/* Hierarchical Org Tree */}
        <OrgTree 
          users={users} 
          onUpdateUsers={onUpdateUsers} 
          onEditUser={setEditingUser}
          onMoveUser={handleMoveUser}
        />
      </div>

      {editingUser && (
        <UserEditModal 
          user={editingUser}
          onSave={handleSaveUser}
          onDelete={handleDeleteUser}
          onClose={() => setEditingUser(null)}
        />
      )}

      {isAuditModalOpen && (
        <AuditLogModal 
          logs={auditLogs}
          onClose={() => setIsAuditModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Step4AdminCenter;
