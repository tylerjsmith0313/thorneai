
import React from 'react';

interface Step7Props {
  isProvisioning: boolean;
}

const Step7ProvisioningComplete: React.FC<Step7Props> = ({ isProvisioning }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 animate-in zoom-in duration-700">
      <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-10 transition-all ${isProvisioning ? 'bg-indigo-50' : 'bg-emerald-50 scale-125'}`}>
         {isProvisioning ? (
           <svg className="animate-spin h-12 w-12 text-indigo-600" fill="none" viewBox="0 0 24 24">
             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
           </svg>
         ) : (
           <svg className="w-16 h-16 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
         )}
      </div>
      <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-4 text-center">
        {isProvisioning ? 'PROVISIONING TENANT CLUSTER...' : 'PROVISIONING COMPLETE'}
      </h3>
      <p className="text-slate-500 font-medium text-center max-w-md">
        {isProvisioning 
          ? 'Replicating node structure and configuring security policies within Supabase...' 
          : 'Tenant logic is now active. eSign packets have been dispatched to the owner.'}
      </p>
      
      {!isProvisioning && (
        <button 
          onClick={() => window.location.reload()}
          className="mt-12 px-10 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all"
        >
          Return to Hub
        </button>
      )}
    </div>
  );
};

export default Step7ProvisioningComplete;
