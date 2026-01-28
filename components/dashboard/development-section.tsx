"use client"

import React from "react"

import { useState } from "react"
import { LifeBuoy, GraduationCap, ChevronRight, Share2, HeartPulse, DollarSign, Smartphone, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AcademyModal } from "@/components/academy/academy-modal"

export function DevelopmentSection() {
  const [isAcademyOpen, setIsAcademyOpen] = useState(false)

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SupportCard 
          icon={<LifeBuoy size={24} />} 
          title="Live Support" 
          desc="Chat with a specialist or let Thorne triage your issue." 
          action="Open Chat" 
        />
        <SupportCard 
          icon={<GraduationCap size={24} />} 
          title="Flourish Academy" 
          desc="Master the sales flow with in-depth video tutorials." 
          action="View Academy" 
          onClick={() => setIsAcademyOpen(true)}
        />
        <SupportCard 
          icon={<Share2 size={24} />} 
          title="Discord Server" 
          desc="Join the community of verified Thorne commanders." 
          action="Join Now" 
        />
      </div>

      <div className="space-y-6">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Curated Thorne Partner Deals</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <PartnerDeal icon={<HeartPulse size={18} />} title="Therapist Network" offer="20% Off Session Credits" tag="Wellness" />
          <PartnerDeal icon={<DollarSign size={18} />} title="Tax Accounting Pro" offer="Free SaaS Audit" tag="Finance" />
          <PartnerDeal icon={<Smartphone size={18} />} title="Business Cell Plan" offer="$15 Unlimited Node Sync" tag="Tech" />
          <PartnerDeal icon={<Users size={18} />} title="Personal Training" offer="Thorne Referral Bonus" tag="Lifestyle" />
        </div>
      </div>

      {isAcademyOpen && (
        <AcademyModal onClose={() => setIsAcademyOpen(false)} />
      )}
    </div>
  )
}

function SupportCard({ icon, title, desc, action, onClick }: { icon: React.ReactNode; title: string; desc: string; action: string; onClick?: () => void }) {
  return (
    <div className="p-8 bg-slate-50 border border-slate-200 rounded-[40px] flex flex-col hover:bg-white hover:shadow-2xl hover:border-indigo-100 transition-all group">
      <div className="p-4 bg-white rounded-2xl border border-slate-100 text-indigo-600 mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all w-fit shadow-sm">
        {icon}
      </div>
      <h5 className="text-lg font-bold text-slate-900 mb-2">{title}</h5>
      <p className="text-sm text-slate-500 mb-6 leading-relaxed font-medium">{desc}</p>
      <Button 
        variant="outline" 
        size="sm" 
        className="mt-auto self-start gap-2 bg-transparent" 
        onClick={onClick}
      >
        {action}
        <ChevronRight size={14} />
      </Button>
    </div>
  )
}

function PartnerDeal({ icon, title, offer, tag }: { icon: React.ReactNode; title: string; offer: string; tag: string }) {
  return (
    <div className="p-6 bg-white border border-slate-200 rounded-3xl flex items-center justify-between group hover:border-indigo-200 transition-all cursor-pointer">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-slate-50 text-slate-400 rounded-2xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
          {icon}
        </div>
        <div>
          <h6 className="text-sm font-bold text-slate-900">{title}</h6>
          <p className="text-xs text-indigo-600 font-bold">{offer}</p>
        </div>
      </div>
      <span className="px-2.5 py-1 bg-slate-100 text-[10px] font-bold text-slate-400 rounded-full uppercase tracking-wider">{tag}</span>
    </div>
  )
}
