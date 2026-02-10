
import React from 'react';
import { TenantMode } from '../types';

interface TenantTypeSelectorProps {
  mode: TenantMode;
  onModeChange: (mode: TenantMode) => void;
  subdomain: string;
  onSubdomainChange: (val: string) => void;
}

const TenantTypeSelector: React.FC<TenantTypeSelectorProps> = ({ 
  mode, 
  onModeChange, 
  subdomain, 
  onSubdomainChange 
}) => {
  const existingTenants = [
    { name: 'Simply Flourish Main', domain: 'app.simplyflourish.space' },
    { name: 'Thorne Global', domain: 'global.thorne.ai' },
    { name: 'Nexus Core', domain: 'core.nexus.io' }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        {(Object.values(TenantMode) as TenantMode[]).map((m) => (
          <button
            key={m}
            onClick={() => {
              onModeChange(m);
              if (m === TenantMode.MULTI_TENANT) {
                onSubdomainChange('app.simplyflourish.space');
              } else if (m === TenantMode.INDIVIDUAL && subdomain === 'app.simplyflourish.space') {
                onSubdomainChange('');
              }
            }}
            className={`py-3 px-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
              mode === m 
                ? 'bg-[#0f172a] text-white border-[#0f172a]' 
                : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'
            }`}
          >
            {m === TenantMode.INDIVIDUAL && 'Standalone'}
            {m === TenantMode.MULTI_TENANT && 'Network User'}
            {m === TenantMode.EXISTING && 'Current Node'}
          </button>
        ))}
      </div>

      <div className="relative group">
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
          {mode === TenantMode.EXISTING ? 'Select Existing Node' : 'Instance Subdomain'}
        </label>
        
        {mode === TenantMode.EXISTING ? (
          <select 
            className="w-full px-8 py-5 rounded-3xl border border-slate-100 bg-white text-lg font-bold text-slate-900 focus:border-slate-300 focus:ring-0 outline-none transition-all appearance-none cursor-pointer"
            value={subdomain}
            onChange={(e) => onSubdomainChange(e.target.value)}
          >
            <option value="" disabled>Select a tenant...</option>
            {existingTenants.map(t => (
              <option key={t.domain} value={t.domain}>{t.name} ({t.domain})</option>
            ))}
          </select>
        ) : (
          <div className="relative">
            <input 
              className={`w-full px-8 py-5 rounded-3xl border border-slate-100 bg-white text-lg font-bold text-slate-900 focus:border-slate-300 focus:ring-0 outline-none transition-all placeholder:text-slate-200 shadow-sm ${
                mode === TenantMode.MULTI_TENANT ? 'bg-slate-50 cursor-not-allowed' : ''
              }`}
              placeholder="client-name"
              value={subdomain}
              readOnly={mode === TenantMode.MULTI_TENANT}
              onChange={(e) => onSubdomainChange(e.target.value)}
            />
            {mode === TenantMode.INDIVIDUAL && (
              <div className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg pointer-events-none">
                .thorne.ai
              </div>
            )}
          </div>
        )}
        
        {mode === TenantMode.MULTI_TENANT && (
          <div className="mt-3 p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
              Binding to Network: app.simplyflourish.space
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TenantTypeSelector;
