"use client"

import React, { useState, useEffect } from 'react'
import { Scan, Search, Target, Store, Utensils, Navigation, Sparkles, X, MapPin, ChevronRight, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface RadarResult {
  title: string
  location?: { lat: number; lng: number }
  type: string
}

interface RadarScanProps {
  onClose: () => void
  onSelect?: (poi: RadarResult) => void
}

export function RadarScan({ onClose, onSelect }: RadarScanProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<RadarResult[]>([])
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Simulate getting user location
    setUserLocation({ lat: 40.7128, lng: -74.0060 })
  }, [])

  const handleRadarScan = async (queryOverride?: string) => {
    const query = queryOverride || searchQuery || "business centers"
    if (!userLocation) return

    setIsScanning(true)
    setError(null)
    
    // Simulate API call
    setTimeout(() => {
      const mockResults: RadarResult[] = [
        { title: "Tech Startup Hub", location: { lat: 40.7138, lng: -74.0070 }, type: "business" },
        { title: "Innovation Center NYC", location: { lat: 40.7118, lng: -74.0050 }, type: "business" },
        { title: "Downtown Co-working", location: { lat: 40.7148, lng: -74.0080 }, type: "office" },
      ]
      setResults(mockResults)
      setIsScanning(false)
    }, 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="bg-white w-full max-w-6xl h-[85vh] rounded-[48px] shadow-2xl overflow-hidden relative flex flex-col animate-in zoom-in-95 duration-300 border border-white/20">
        
        {/* Map Interface Container */}
        <div className="absolute inset-0 bg-slate-100 z-0 overflow-hidden">
          {/* Visual Grid / Map Background */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:32px_32px]" />
          
          {/* User Location Marker */}
          {userLocation && (
            <div 
              className="absolute w-6 h-6 bg-blue-500 rounded-full border-4 border-white shadow-xl animate-pulse z-10"
              style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
            >
              <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-25" />
            </div>
          )}

          {/* AI Result Markers */}
          {results.map((res, i) => (
            <div 
              key={i}
              className="absolute animate-in zoom-in duration-500 cursor-pointer group z-20"
              style={{ 
                top: `${50 + (i * 8)}%`, 
                left: `${45 + (i * 10)}%` 
              }}
              onClick={() => onSelect?.(res)}
            >
              <div className="p-2.5 bg-indigo-600 text-white rounded-2xl shadow-2xl hover:scale-125 transition-transform border-2 border-white ring-4 ring-indigo-500/10">
                <Target size={20} />
              </div>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-slate-900 text-white p-3 rounded-2xl opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap shadow-2xl scale-90 group-hover:scale-100">
                <p className="text-xs font-bold mb-1">{res.title}</p>
                <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Verify in Database</span>
              </div>
            </div>
          ))}

          {/* Radar Sweep Effect */}
          {isScanning && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
              <div className="w-[600px] h-[600px] border-2 border-indigo-500/10 rounded-full animate-ping" />
              <div className="w-[300px] h-[300px] bg-indigo-500/5 border-2 border-indigo-500/20 rounded-full animate-ping" />
              <div className="absolute w-[800px] h-[800px] bg-[conic-gradient(from_0deg,transparent,rgba(99,102,241,0.1))] animate-[spin_4s_linear_infinite] rounded-full" />
            </div>
          )}
        </div>

        {/* Overlay Controls */}
        <div className="relative z-30 p-8 flex flex-col h-full pointer-events-none">
          {/* Header Area */}
          <div className="flex items-start justify-between pointer-events-auto">
            <div className="flex items-center gap-4 bg-white/90 backdrop-blur-xl p-4 rounded-[32px] border border-white shadow-2xl">
              <div className="p-3.5 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-100">
                <Scan size={24} className={isScanning ? 'animate-spin' : ''} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Thorne Radar</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Neural Link Established</p>
                </div>
              </div>
            </div>
            
            <button 
              onClick={onClose} 
              className="p-4 bg-white/90 backdrop-blur-xl rounded-full shadow-xl border border-white text-slate-400 hover:text-indigo-600 transition-all"
            >
              <X size={24} />
            </button>
          </div>

          {/* Results Sidebar */}
          {results.length > 0 && (
            <div className="mt-8 w-80 bg-white/95 backdrop-blur-xl rounded-[32px] border border-white shadow-2xl p-6 pointer-events-auto space-y-4 animate-in slide-in-from-left-8 duration-500 overflow-hidden">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Identified Nodes</h3>
                <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2 py-0.5 rounded-md">{results.length} Found</span>
              </div>
              <div className="space-y-2 max-h-[30vh] overflow-y-auto">
                {results.map((res, i) => (
                  <div key={i} className="p-3 bg-slate-50/50 hover:bg-white border border-transparent hover:border-indigo-100 rounded-2xl transition-all cursor-pointer group flex items-center justify-between" onClick={() => onSelect?.(res)}>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-xl text-indigo-400 group-hover:text-indigo-600 shadow-sm border border-slate-100"><MapPin size={14} /></div>
                      <span className="text-xs font-bold text-slate-700 truncate max-w-[140px]">{res.title}</span>
                    </div>
                    <ChevronRight size={14} className="text-slate-300" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Control Belt */}
          <div className="mt-auto space-y-6 pointer-events-auto">
            <div className="max-w-2xl mx-auto w-full flex flex-col items-center gap-4">
              {error && (
                <div className="bg-rose-50 border border-rose-100 px-4 py-2 rounded-2xl text-rose-600 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 animate-in slide-in-from-bottom-2">
                  <AlertCircle size={14} /> {error}
                </div>
              )}
              
              <div className="w-full relative group">
                <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                <input 
                  type="text"
                  placeholder="Query niche or address (e.g. 'Law firms', 'Manhattan Tech')"
                  className="w-full bg-white/95 backdrop-blur-xl border-2 border-transparent focus:border-indigo-500/20 rounded-[32px] py-6 pl-16 pr-40 text-sm font-bold shadow-2xl outline-none transition-all placeholder:text-slate-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRadarScan()}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <Button 
                    className="px-8 rounded-2xl shadow-xl bg-slate-900 hover:bg-slate-800" 
                    onClick={() => handleRadarScan()}
                    disabled={isScanning || !userLocation}
                  >
                    <Scan size={18} className="mr-2" />
                    {isScanning ? 'Verifying...' : 'Radar Scan'}
                  </Button>
                </div>
              </div>

              <div className="flex gap-2 pb-2">
                <POIChip icon={<Store size={14} />} label="Retail" onClick={() => handleRadarScan("Retail Stores")} />
                <POIChip icon={<Utensils size={14} />} label="Food" onClick={() => handleRadarScan("Restaurants")} />
                <POIChip icon={<Navigation size={14} />} label="Logistics" onClick={() => handleRadarScan("Logistics companies")} />
                <POIChip icon={<Sparkles size={14} />} label="Emerging" onClick={() => handleRadarScan("New businesses")} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function POIChip({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center gap-2 px-5 py-2.5 bg-white/90 backdrop-blur-xl border border-white rounded-full text-[10px] font-bold text-slate-600 uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-xl shadow-indigo-50/50 group"
    >
      <span className="text-indigo-500 group-hover:text-white transition-colors">{icon}</span> 
      {label}
    </button>
  )
}
