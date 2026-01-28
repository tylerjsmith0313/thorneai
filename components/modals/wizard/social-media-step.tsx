"use client"

import { Share2, Linkedin, Facebook, Youtube, Instagram, Twitter } from "lucide-react"

export function SocialMediaStep() {
  const networks = [
    { id: "LinkedIn", icon: Linkedin, color: "text-blue-600", bg: "bg-blue-50" },
    { id: "Facebook", icon: Facebook, color: "text-indigo-600", bg: "bg-indigo-50" },
    { id: "Instagram", icon: Instagram, color: "text-pink-600", bg: "bg-pink-50" },
    { id: "TikTok", icon: Share2, color: "text-slate-900", bg: "bg-slate-50" },
    { id: "Youtube", icon: Youtube, color: "text-rose-600", bg: "bg-rose-50" },
    { id: "X / Twitter", icon: Twitter, color: "text-slate-800", bg: "bg-slate-50" },
  ]

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Public Presence Verification</h4>
        <p className="text-sm text-slate-500">Thorne will attempt to match these profiles automatically. Human verification is required for accuracy.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {networks.map(net => (
          <div key={net.id} className="p-6 bg-white border border-slate-200 rounded-[28px] flex items-center justify-between hover:shadow-lg transition-all cursor-pointer group hover:border-indigo-100">
            <div className="flex items-center gap-4">
              <div className={`p-3 ${net.bg} rounded-xl group-hover:scale-110 transition-transform`}>
                <net.icon size={20} className={net.color} />
              </div>
              <span className="text-sm font-bold text-slate-700">{net.id}</span>
            </div>
            <button className="px-4 py-1.5 bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-widest rounded-full hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
              Verify Link
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
