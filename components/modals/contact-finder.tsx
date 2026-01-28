"use client"

import { useState } from "react"
import { Search, Linkedin, Facebook, Globe, Instagram, CheckCircle, UserPlus, Filter, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ContactFinderProps {
  onClose: () => void
  onVerify: (lead: FoundLead) => void
}

interface FoundLead {
  id: number
  name: string
  role: string
  company: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  sources: string[]
  integrity: number
}

export function ContactFinder({ onClose, onVerify }: ContactFinderProps) {
  const [query, setQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<FoundLead[]>([])
  const [selectedSources, setSelectedSources] = useState<string[]>(["LINKEDIN", "GOOGLE"])

  const sources = ["LINKEDIN", "FACEBOOK", "TIKTOK", "INSTAGRAM", "URL", "GOOGLE"]

  const toggleSource = (source: string) => {
    setSelectedSources((prev) => (prev.includes(source) ? prev.filter((s) => s !== source) : [...prev, source]))
  }

  const handleSearch = () => {
    if (!query) return
    setIsSearching(true)

    // Simulate AI search across multiple sources with cross-referencing logic
    setTimeout(() => {
      const mockResults: FoundLead[] = [
        {
          id: 1,
          name: "Alex Rivera",
          role: "Head of Growth",
          company: "CloudScale",
          firstName: "Alex",
          lastName: "Rivera",
          email: "alex@cloudscale.io",
          phone: "+1 (555) 902-1234",
          sources: selectedSources.filter((s) => ["LINKEDIN", "GOOGLE", "URL"].includes(s)),
          integrity: selectedSources.length > 2 ? 98 : 85,
        },
        {
          id: 2,
          name: "Sarah Chen",
          role: "CTO",
          company: "Venture Capital Partners",
          firstName: "Sarah",
          lastName: "Chen",
          email: "s.chen@vcp.capital",
          sources: selectedSources.filter((s) => ["LINKEDIN", "GOOGLE"].includes(s)),
          integrity: selectedSources.length > 1 ? 94 : 72,
        },
        {
          id: 3,
          name: "Jordan Smyth",
          role: "Founder",
          company: "Smyth & Co",
          firstName: "Jordan",
          lastName: "Smyth",
          email: "jordan@smyth.co",
          sources: selectedSources.filter((s) => ["INSTAGRAM", "FACEBOOK", "GOOGLE"].includes(s)),
          integrity: selectedSources.length > 2 ? 91 : 80,
        },
      ]
      setResults(mockResults)
      setIsSearching(false)
    }, 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />

      <div className="bg-white w-full max-w-4xl h-[85vh] rounded-[48px] shadow-2xl overflow-hidden relative flex flex-col animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-10 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-indigo-600 rounded-[22px] text-white flex items-center justify-center shadow-xl shadow-indigo-100">
              <Search size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none uppercase">
                Thorne Contact Finder
              </h2>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-2">
                Scanning social nodes and public directories for high-integrity data.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 font-black text-xs uppercase tracking-widest hover:text-slate-900 transition-colors"
          >
            Close
          </button>
        </div>

        {/* Search & Sources Container */}
        <div className="px-10 py-8 bg-white border-b border-slate-50 space-y-6">
          <div className="relative group">
            <Search
              className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by name, company, or URL..."
              className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500/10 focus:bg-white rounded-[32px] py-5 pl-16 pr-44 text-sm font-bold shadow-inner outline-none transition-all"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={isSearching || !query}
              className="absolute right-3 top-1/2 -translate-y-1/2 px-8 h-12 bg-slate-900 text-white rounded-[20px] font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 shadow-xl"
            >
              {isSearching ? "Processing..." : "Find Contacts"}
            </button>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {sources.map((source) => (
              <button
                key={source}
                onClick={() => toggleSource(source)}
                className={`px-6 py-2.5 rounded-[18px] text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
                  selectedSources.includes(source)
                    ? "bg-indigo-50 border-indigo-600 text-indigo-600 shadow-sm"
                    : "bg-white border-slate-100 text-slate-300 hover:border-slate-200 hover:text-slate-500"
                }`}
              >
                {source}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-10 bg-white">
          {isSearching ? (
            <div className="h-full flex flex-col items-center justify-center space-y-8 animate-pulse">
              <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                <Sparkles size={40} className="animate-spin" style={{ animationDuration: "3s" }} />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Cross-Referencing Sources</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                  Verifying data points across {selectedSources.length} neural nodes...
                </p>
              </div>

              <div className="flex gap-2">
                {selectedSources.map((s, i) => (
                  <div
                    key={s}
                    className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Verified High-Heat Nodes
                </h3>
                <Button variant="ghost" size="sm" className="text-[9px] uppercase font-black">
                  <Filter size={14} className="mr-1" />
                  Filter Accuracy
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {results.map((res) => (
                  <div
                    key={res.id}
                    className="p-8 bg-slate-50 border border-slate-100 rounded-[40px] flex items-center justify-between hover:bg-white hover:shadow-2xl hover:border-indigo-100 transition-all group animate-in slide-in-from-bottom-4"
                  >
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <div className="w-16 h-16 bg-white rounded-2xl border border-slate-200 flex items-center justify-center text-indigo-600 shadow-sm font-black text-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                          {res.name[0]}
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-white shadow-lg">
                          <CheckCircle size={10} />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-black text-slate-900 text-lg tracking-tight">{res.name}</h4>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                          {res.role} at <span className="text-indigo-600">{res.company}</span>
                        </p>
                        <div className="flex items-center gap-3 mt-3">
                          <div className="flex -space-x-1">
                            {res.sources.map((s: string) => (
                              <div
                                key={s}
                                className="w-6 h-6 bg-white rounded-full border border-slate-100 flex items-center justify-center shadow-sm"
                                title={s}
                              >
                                {s === "LINKEDIN" && <Linkedin size={10} className="text-blue-600" />}
                                {s === "FACEBOOK" && <Facebook size={10} className="text-indigo-600" />}
                                {s === "GOOGLE" && <Globe size={10} className="text-slate-400" />}
                                {s === "INSTAGRAM" && <Instagram size={10} className="text-pink-600" />}
                              </div>
                            ))}
                          </div>
                          <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                            {res.integrity}% Verified
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button onClick={() => onVerify(res)} className="rounded-2xl px-8 shadow-indigo-100">
                      <UserPlus size={16} className="mr-2" />
                      Verify Lead
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center space-y-6 text-center opacity-40">
              <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                <Search size={64} />
              </div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] max-w-xs leading-loose">
                Enter a query to start finding high-quality leads
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
