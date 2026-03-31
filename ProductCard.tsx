
import React from 'react';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  desc: string;
  icon: React.ReactNode;
  isSelected: boolean;
  onToggle: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  name,
  price,
  desc,
  icon,
  isSelected,
  onToggle,
}) => {
  return (
    <button
      onClick={onToggle}
      className={`p-8 rounded-[40px] border-2 text-left transition-all group relative overflow-hidden flex flex-col justify-between min-h-[200px] ${
        isSelected
          ? 'border-indigo-600 bg-white shadow-xl shadow-indigo-50'
          : 'border-slate-100 bg-white hover:border-slate-200'
      }`}
    >
      <div className="flex justify-between items-start w-full">
        {/* Icon Container */}
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
            isSelected ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-300'
          }`}
        >
          {icon}
        </div>

        {/* Price Section */}
        <div className="text-right">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">
            MONTHLY
          </span>
          <span className="text-2xl font-black text-slate-900">${price}</span>
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-8">
        <h4
          className={`font-black text-sm tracking-widest mb-1 uppercase ${
            isSelected ? 'text-indigo-600' : 'text-slate-900'
          }`}
        >
          {name}
        </h4>
        <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
          {desc}
        </p>
      </div>

      {/* Subtle background glow when selected */}
      {isSelected && (
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
      )}
    </button>
  );
};

export default ProductCard;
