"use client"

import React from "react"

import { Mail, Phone, Globe, Building2, MapPin, Linkedin, Twitter, Instagram, Facebook, Youtube, Share2 } from "lucide-react"
import type { Contact } from "@/types"
import { ThorneInsightBox } from "../common/thorne-insight-box"
import { BaseButton } from "@/components/ui/base-button"

interface ProfileSectionProps {
  contact: Contact
}

export function ProfileSection({ contact }: ProfileSectionProps) {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <ThorneInsightBox 
        insight={`"This contact is showing 'Hot' signals through LinkedIn activity. Suggested next step: Send a personalized physical gift based on their interests."`} 
      />

      <div className="bg-white border border-slate-200 rounded-[40px] p-8 space-y-8 shadow-sm">
        <div className="flex items-center justify-between">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Verified Information</h4>
          <button className="px-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-white hover:text-indigo-600 transition-all">
            Update Profile
          </button>
        </div>

        <div className="grid grid-cols-2 gap-x-10 gap-y-8">
          <InfoItem label="Personal Email" value={contact.email || "Not set"} icon={<Mail size={16} />} />
          <InfoItem label="Work Email" value={contact.email} icon={<Building2 size={16} />} />
          <InfoItem label="Cell Phone" value={contact.phone || "Not set"} icon={<Phone size={16} />} />
          <InfoItem label="Office Phone" value="+1 (555) 987-6543" icon={<Phone size={16} />} />
          <InfoItem label="Location" value="New York, NY" icon={<MapPin size={16} />} />
          <InfoItem label="Website" value={contact.company ? `www.${contact.company.toLowerCase().replace(/\s/g, '')}.com` : "N/A"} icon={<Globe size={16} />} />
        </div>

        <div className="pt-8 border-t border-slate-100">
           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Social Media Nodes</h4>
           <div className="grid grid-cols-2 gap-x-10 gap-y-8">
              <InfoItem label="LinkedIn" value="li/in/profile" icon={<Linkedin size={16} className="text-blue-600" />} />
              <InfoItem label="X / Twitter" value="@handle" icon={<Twitter size={16} className="text-slate-900" />} />
              <InfoItem label="Instagram" value="@instagram" icon={<Instagram size={16} className="text-pink-600" />} />
              <InfoItem label="Facebook" value="fb.com/profile" icon={<Facebook size={16} className="text-indigo-600" />} />
              <InfoItem label="Youtube" value="yt.com/@channel" icon={<Youtube size={16} className="text-rose-600" />} />
              <InfoItem label="TikTok" value="@tiktok" icon={<Share2 size={16} className="text-slate-800" />} />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <BaseButton variant="secondary" className="py-4 rounded-[24px] font-black text-[10px] uppercase tracking-widest w-full">Download VCF</BaseButton>
        <BaseButton variant="outline" className="py-4 rounded-[24px] font-black text-[10px] uppercase tracking-widest w-full">Share Node</BaseButton>
      </div>
    </div>
  )
}

function InfoItem({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="space-y-1.5 group cursor-pointer">
      <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.1em]">{label}</p>
      <p className="text-[13px] font-bold text-slate-800 flex items-center gap-3 transition-colors group-hover:text-indigo-600">
        <span className="text-slate-300 group-hover:text-indigo-400 transition-colors">{icon}</span>
        {value}
      </p>
    </div>
  )
}
