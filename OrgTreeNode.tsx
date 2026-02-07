import React from 'react';
import { User, UserRole } from '../types';
import { CrownIcon, UserRoleIcon, ManagerRoleIcon, DirectorRoleIcon, VPRoleIcon } from './Icons';

interface OrgTreeNodeProps {
  user: User;
  allUsers: User[];
  onMoveUser: (userId: string, newParentId: string | undefined) => void;
  onEditUser: (user: User) => void;
  level: number;
}

const RoleIcon = ({ role }: { role: UserRole }) => {
  switch (role) {
    case 'Admin': return <CrownIcon />;
    case 'VP': return <VPRoleIcon />;
    case 'Director': return <DirectorRoleIcon />;
    case 'Manager': return <ManagerRoleIcon />;
    default: return <UserRoleIcon />;
  }
};

const OrgTreeNode: React.FC<OrgTreeNodeProps> = ({ user, allUsers, onMoveUser, onEditUser, level }) => {
  const children = allUsers.filter(u => u.parentId === user.id);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('userId', user.id);
    e.stopPropagation();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const draggedUserId = e.dataTransfer.getData('userId');
    if (draggedUserId !== user.id) {
      onMoveUser(draggedUserId, user.id);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div 
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => onEditUser(user)}
        className={`relative group cursor-grab active:cursor-grabbing p-4 rounded-2xl border-2 transition-all flex items-center gap-3 bg-white shadow-sm hover:shadow-md ${
          level === 0 ? 'border-indigo-600' : 'border-slate-100 hover:border-indigo-200'
        }`}
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white ${
          user.permissions === 'Admin' ? 'bg-slate-900' : 'bg-indigo-600'
        }`}>
          {user.firstName[0] || '?'}
        </div>
        <div>
          <div className="text-[10px] font-black uppercase tracking-tight text-slate-900">
            {user.firstName || 'New'} {user.lastName || 'Profile'}
          </div>
          <div className="flex items-center gap-1.5">
             <div className="scale-75 text-indigo-400"><RoleIcon role={user.permissions} /></div>
             <span className="text-[8px] font-bold uppercase text-slate-400 tracking-widest">{user.permissions}</span>
          </div>
        </div>
        
        {/* Drop zone indicator */}
        <div className="absolute inset-0 rounded-2xl border-2 border-indigo-400 opacity-0 group-hover:opacity-10 pointer-events-none border-dashed" />
      </div>

      {children.length > 0 && (
        <div className="relative pt-8 flex gap-8">
          {/* Connecting vertical line */}
          <div className="absolute top-0 left-1/2 w-px h-8 bg-slate-200" />
          
          {/* Connecting horizontal line */}
          {children.length > 1 && (
             <div className="absolute top-8 left-[10%] right-[10%] h-px bg-slate-200" />
          )}

          {children.map((child) => (
            // Fix: Changed 'users' to 'allUsers' to match the prop passed into the component
            <OrgTreeNode 
              key={child.id} 
              user={child} 
              allUsers={allUsers} 
              onMoveUser={onMoveUser} 
              onEditUser={onEditUser}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default OrgTreeNode;