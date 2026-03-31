
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseService';

interface TenantSearchResult {
  id: string;
  company_name: string;
  subdomain: string;
}

interface TenantSearchSectionProps {
  onSelectTenant: (tenant: TenantSearchResult) => void;
}

const TenantSearchSection: React.FC<TenantSearchSectionProps> = ({ onSelectTenant }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TenantSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const searchTenants = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setIsSearching(true);
      try {
        if (!supabase) {
          // Robust mock search for Dev Mode including domain matching
          const mock = [
            { id: '1', company_name: 'Thorne Global', subdomain: 'global' },
            { id: '2', company_name: 'Nexus Core', subdomain: 'core' },
            { id: '3', company_name: 'Simply Flourish', subdomain: 'app' },
            { id: '4', company_name: 'Enterprise Alpha', subdomain: 'alpha-node' },
          ].filter(t => 
            t.company_name.toLowerCase().includes(query.toLowerCase()) || 
            t.subdomain.toLowerCase().includes(query.toLowerCase())
          );
          setResults(mock);
        } else {
          // Search across both company name and subdomain (domain prefix)
          const { data, error } = await supabase
            .from('tenants')
            .select('id, company_name, subdomain')
            .or(`company_name.ilike.%${query}%,subdomain.ilike.%${query}%`)
            .limit(5);
          
          if (!error && data) setResults(data as TenantSearchResult[]);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(searchTenants, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="pt-8 w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center mb-6">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-4">Infrastructure Access Hub</p>
        <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Adding User to Existing Tenant</h4>
      </div>

      <div className="relative group">
        <input 
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Name or Domain..."
          className="w-full pl-12 pr-6 py-4 rounded-[20px] border-2 border-slate-50 bg-white text-sm font-bold text-slate-900 focus:border-indigo-100 outline-none transition-all placeholder:text-slate-200 shadow-sm"
        />
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">
          {isSearching ? (
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          )}
        </div>

        {/* Search Autocomplete Dropdown */}
        {results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-[25px] shadow-2xl overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200">
            {results.map((tenant) => (
              <button
                key={tenant.id}
                onClick={() => {
                  onSelectTenant(tenant);
                  setQuery('');
                  setResults([]);
                }}
                className="w-full px-6 py-4 text-left hover:bg-slate-50 flex items-center justify-between group transition-colors border-b border-slate-50 last:border-none"
              >
                <div>
                  <p className="text-xs font-black text-slate-900 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{tenant.company_name}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{tenant.subdomain}.thorne.ai</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-all">
                  <svg className="w-4 h-4 transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TenantSearchSection;
