import React from 'react';
import { User } from '../types';
import OrgTreeNode from './OrgTreeNode';

interface OrgTreeProps {
  users: User[];
  onUpdateUsers: (newUsers: User[]) => void;
  onEditUser: (user: User) => void;
  onMoveUser: (userId: string, newParentId: string | undefined) => void;
}

const OrgTree: React.FC<OrgTreeProps> = ({ users, onUpdateUsers, onEditUser, onMoveUser }) => {
  const rootNodes = users.filter(u => !u.parentId);

  return (
    <div className="flex-1 bg-white border border-dashed border-slate-200 rounded-[50px] overflow-auto p-12 custom-scrollbar flex flex-col items-center">
      <div className="mb-10 text-center">
        <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">Network Hierarchy</h4>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Drag and drop personnel to reorganize system logic. Click profiles to configure identity.</p>
      </div>
      
      <div className="flex gap-12 min-w-max pb-12">
        {rootNodes.map(root => (
          <OrgTreeNode 
            key={root.id} 
            user={root} 
            allUsers={users} 
            onMoveUser={onMoveUser} 
            onEditUser={onEditUser}
            level={0}
          />
        ))}
      </div>
    </div>
  );
};

export default OrgTree;