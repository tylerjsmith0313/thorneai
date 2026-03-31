
import React from 'react';
import { GlobeIcon, BoltIcon, ProductCrownIcon } from './Icons';
import { ProductSelection } from '../types';
import ProductCard from './ProductCard';

interface Step2Props {
  products: ProductSelection;
  prices: { agyantos: number; agyantsync: number; thorneNeural: number };
  onToggleProduct: (id: keyof ProductSelection) => void;
}

const Step2ProductPackaging: React.FC<Step2Props> = ({ products, prices, onToggleProduct }) => {
  const items = [
    { 
      id: 'agyantos', 
      name: 'AGYANTOS', 
      price: prices.agyantos, 
      desc: 'Core CRM, Calendar, Contacts, Analytics', 
      icon: <GlobeIcon /> 
    },
    { 
      id: 'agyantsync', 
      name: 'AGYNTSYNC', 
      price: prices.agyantsync, 
      desc: 'First Engagement Automation & Basic Flow', 
      icon: <BoltIcon /> 
    },
    { 
      id: 'thorneNeural', 
      name: 'THORNE NEURAL NETWORK', 
      price: prices.thorneNeural, 
      desc: 'Advanced AI Success Agent & Data Tech', 
      icon: <ProductCrownIcon /> 
    }
  ];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-slate-900 mb-2 uppercase tracking-tight">
          Account Product Packaging
        </h3>
        <p className="text-slate-500 font-medium">
          Select components for Prospective Tenant activation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {items.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            price={product.price}
            desc={product.desc}
            icon={product.icon}
            isSelected={products[product.id as keyof ProductSelection]}
            onToggle={() => onToggleProduct(product.id as keyof ProductSelection)}
          />
        ))}
      </div>
    </div>
  );
};

export default Step2ProductPackaging;
