import React from 'react';
import { InfoIcon } from './Icons';

const TransmittalInfo: React.FC = () => {
  return (
    <div className="mt-8 p-8 rounded-[35px] border border-dashed border-indigo-200 bg-indigo-50/30 flex gap-6 items-start">
      <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-100">
        <InfoIcon />
      </div>
      <div>
        <h5 className="font-black text-[10px] tracking-widest text-indigo-900 mb-2 uppercase">Automated Transmittal</h5>
        <p className="text-[11px] text-indigo-600 font-medium italic leading-relaxed">
          "Upon dispatch, Thorne will track recipient engagement with each agreement link and alert Tyler on signature completion."
        </p>
      </div>
    </div>
  );
};

export default TransmittalInfo;