
import React from 'react';
import { AuditEntry } from '../types';
import { CloseIcon, AuditIcon } from './Icons';

interface AuditLogModalProps {
  logs: AuditEntry[];
  onClose: () => void;
}

const AuditLogModal: React.FC<AuditLogModalProps> = ({ logs, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#020617]/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden border border-slate-100 flex flex-col h-[70vh] animate-in zoom-in-95 duration-300">
        <div className="px-10 pt-10 pb-6 flex items-center justify-between border-b border-slate-50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-indigo-400">
               <AuditIcon />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">System Audit Log</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Temporal Change History</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-50 rounded-full transition-colors">
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-4 custom-scrollbar bg-slate-50/30">
          {logs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
              <AuditIcon />
              <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400">No events recorded in this session</p>
            </div>
          ) : (
            logs.map((entry) => (
              <div key={entry.id} className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex gap-6 items-start">
                <div className={`mt-1 w-16 px-2 py-1 rounded-md text-[8px] font-black uppercase text-center tracking-tighter ${
                  entry.action === 'CREATE' ? 'bg-emerald-500/10 text-emerald-500' :
                  entry.action === 'DELETE' ? 'bg-rose-500/10 text-rose-500' :
                  entry.action === 'MOVE' ? 'bg-amber-500/10 text-amber-500' :
                  'bg-indigo-500/10 text-indigo-500'
                }`}>
                  {entry.action}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-700 leading-relaxed">{entry.details}</p>
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-2 block">{entry.timestamp}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-8 border-t border-slate-50 bg-white text-center">
           <button 
             onClick={onClose}
             className="px-10 py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
           >
             Close Terminal
           </button>
        </div>
      </div>
    </div>
  );
};

export default AuditLogModal;
