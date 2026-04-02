import React from 'react';
import { TenantConfig } from '../types';

interface Step1Props {
  config: TenantConfig;
  updateConfig: (field: keyof TenantConfig, value: any) => void;
}

const Step1TenantNode: React.FC<Step1Props> = ({ config, updateConfig }) => {
  return (
    <div className="space-y-10 max-w-4xl mx-auto animate-in fade-in duration-500 pb-10">
      <div className="text-center">
        <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Set Up New Tenant</h3>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Initialize your enterprise profile with primary identity data.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 bg-slate-50/30 p-10 rounded-[40px] border border-slate-100">
        {/* Owner Information Section */}
        <div className="md:col-span-2">
           <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-4">Owner Profile</h4>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">First Name</label>
          <input 
            className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 bg-white text-sm font-bold text-slate-900 focus:border-indigo-100 outline-none transition-all placeholder:text-slate-200"
            placeholder="John"
            value={config.ownerFirstName}
            onChange={(e) => updateConfig('ownerFirstName', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Last Name</label>
          <input 
            className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 bg-white text-sm font-bold text-slate-900 focus:border-indigo-100 outline-none transition-all placeholder:text-slate-200"
            placeholder="Doe"
            value={config.ownerLastName}
            onChange={(e) => updateConfig('ownerLastName', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Owner Email</label>
          <input 
            className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 bg-white text-sm font-bold text-slate-900 focus:border-indigo-100 outline-none transition-all placeholder:text-slate-200"
            placeholder="admin@enterprise.com"
            type="email"
            value={config.ownerEmail}
            onChange={(e) => updateConfig('ownerEmail', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Job Title</label>
          <input 
            className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 bg-white text-sm font-bold text-slate-900 focus:border-indigo-100 outline-none transition-all placeholder:text-slate-200"
            placeholder="Managing Director"
            value={config.ownerJobTitle}
            onChange={(e) => updateConfig('ownerJobTitle', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Phone Number</label>
          <input 
            className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 bg-white text-sm font-bold text-slate-900 focus:border-indigo-100 outline-none transition-all placeholder:text-slate-200"
            placeholder="+1 (555) 000-0000"
            value={config.ownerPhone}
            onChange={(e) => updateConfig('ownerPhone', e.target.value)}
          />
        </div>

        {/* Company Section */}
        <div className="md:col-span-2 mt-4">
           <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-4">Company Profile</h4>
        </div>

        <div>
           <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Company Name</label>
           <input 
            className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 bg-white text-sm font-bold text-slate-900 focus:border-indigo-100 outline-none transition-all placeholder:text-slate-200"
            placeholder="Enterprise Solutions Inc."
            value={config.tenantName}
            onChange={(e) => updateConfig('tenantName', e.target.value)}
          />
        </div>

        <div>
           <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Company Address</label>
           <input 
            className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 bg-white text-sm font-bold text-slate-900 focus:border-indigo-100 outline-none transition-all placeholder:text-slate-200"
            placeholder="123 Alpha Lane, Tech Valley"
            value={config.companyAddress}
            onChange={(e) => updateConfig('companyAddress', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default Step1TenantNode;