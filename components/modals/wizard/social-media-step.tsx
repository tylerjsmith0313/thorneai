"use client"

import { useState } from "react"
import { Share2, Linkedin, Facebook, Youtube, Instagram, Twitter, X, Check, ExternalLink, Copy } from "lucide-react"
import { BaseInput } from "@/components/ui/base-input"
import { BaseButton } from "@/components/ui/base-button"

interface SocialLink {
  id: string
  url: string
  verified: boolean
}

interface SocialMediaStepProps {
  links?: Record<string, SocialLink>
  onUpdateLinks?: (links: Record<string, SocialLink>) => void
}

const networks = [
  { id: "LinkedIn", icon: Linkedin, color: "text-blue-600", bg: "bg-blue-50", placeholder: "linkedin.com/in/username" },
  { id: "Facebook", icon: Facebook, color: "text-indigo-600", bg: "bg-indigo-50", placeholder: "facebook.com/username" },
  { id: "Instagram", icon: Instagram, color: "text-pink-600", bg: "bg-pink-50", placeholder: "instagram.com/username" },
  { id: "TikTok", icon: Share2, color: "text-slate-900", bg: "bg-slate-50", placeholder: "tiktok.com/@username" },
  { id: "Youtube", icon: Youtube, color: "text-rose-600", bg: "bg-rose-50", placeholder: "youtube.com/@channel" },
  { id: "X / Twitter", icon: Twitter, color: "text-slate-800", bg: "bg-slate-50", placeholder: "x.com/username" },
]

export function SocialMediaStep({ links = {}, onUpdateLinks }: SocialMediaStepProps) {
  const [activeNetwork, setActiveNetwork] = useState<string | null>(null)
  const [inputUrl, setInputUrl] = useState("")
  const [localLinks, setLocalLinks] = useState<Record<string, SocialLink>>(links)

  const handleAddLink = (networkId: string) => {
    setActiveNetwork(networkId)
    setInputUrl(localLinks[networkId]?.url || "")
  }

  const handleSaveLink = () => {
    if (!activeNetwork || !inputUrl.trim()) return
    
    const updatedLinks = {
      ...localLinks,
      [activeNetwork]: {
        id: activeNetwork,
        url: inputUrl.trim(),
        verified: true
      }
    }
    setLocalLinks(updatedLinks)
    onUpdateLinks?.(updatedLinks)
    setActiveNetwork(null)
    setInputUrl("")
  }

  const handleRemoveLink = (networkId: string) => {
    const { [networkId]: removed, ...rest } = localLinks
    setLocalLinks(rest)
    onUpdateLinks?.(rest)
  }

  const getNetworkConfig = (id: string) => networks.find(n => n.id === id)

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Social Media Links</h4>
        <p className="text-sm text-slate-500">Add social media profiles to help Thorne gather intelligence and personalize outreach.</p>
      </div>

      {/* Add Link Modal */}
      {activeNetwork && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setActiveNetwork(null)} />
          <div className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-md p-8 space-y-6 animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {(() => {
                  const config = getNetworkConfig(activeNetwork)
                  if (!config) return null
                  const Icon = config.icon
                  return (
                    <>
                      <div className={`p-3 ${config.bg} rounded-xl`}>
                        <Icon size={24} className={config.color} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">Add {activeNetwork}</h3>
                        <p className="text-xs text-slate-500">Enter the profile URL</p>
                      </div>
                    </>
                  )
                })()}
              </div>
              <button 
                onClick={() => setActiveNetwork(null)}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <BaseInput
              label="Profile URL"
              placeholder={getNetworkConfig(activeNetwork)?.placeholder || "Enter URL"}
              value={inputUrl}
              onChange={e => setInputUrl(e.target.value)}
              icon={<ExternalLink size={16} />}
            />

            <div className="flex gap-3">
              <BaseButton 
                variant="outline" 
                className="flex-1"
                onClick={() => setActiveNetwork(null)}
              >
                Cancel
              </BaseButton>
              <BaseButton 
                variant="primary" 
                className="flex-1"
                onClick={handleSaveLink}
                disabled={!inputUrl.trim()}
              >
                <Check size={16} className="mr-2" />
                Save Link
              </BaseButton>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {networks.map(net => {
          const hasLink = localLinks[net.id]?.url
          return (
            <div 
              key={net.id} 
              className={`p-6 bg-white border rounded-[28px] transition-all ${
                hasLink 
                  ? "border-green-200 bg-green-50/30" 
                  : "border-slate-200 hover:shadow-lg hover:border-indigo-100"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 ${net.bg} rounded-xl`}>
                    <net.icon size={20} className={net.color} />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-700 block">{net.id}</span>
                    {hasLink && (
                      <span className="text-[10px] text-green-600 font-medium flex items-center gap-1 mt-0.5">
                        <Check size={10} /> Linked
                      </span>
                    )}
                  </div>
                </div>
                {hasLink ? (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => navigator.clipboard.writeText(localLinks[net.id].url)}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Copy URL"
                    >
                      <Copy size={14} className="text-slate-400" />
                    </button>
                    <button 
                      onClick={() => handleAddLink(net.id)}
                      className="px-3 py-1.5 bg-slate-100 text-[10px] font-bold text-slate-600 uppercase tracking-widest rounded-full hover:bg-slate-200 transition-all"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleRemoveLink(net.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove"
                    >
                      <X size={14} className="text-red-400" />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => handleAddLink(net.id)}
                    className="px-4 py-1.5 bg-indigo-600 text-[10px] font-bold text-white uppercase tracking-widest rounded-full hover:bg-indigo-700 transition-all shadow-sm"
                  >
                    Add Link
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
