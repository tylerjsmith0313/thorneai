"use client"

import React, { useState } from 'react'
import { Scan, Camera, X, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ScannerProps {
  onClose: () => void
  onScan?: (data: { firstName: string; lastName: string; company: string }) => void
}

export function Scanner({ onClose, onScan }: ScannerProps) {
  const [isScanning, setIsScanning] = useState(false)

  const handleScan = () => {
    setIsScanning(true)
    setTimeout(() => {
      onScan?.({ firstName: 'Marcus', lastName: 'Aurelius', company: 'Rome Inc' })
      setIsScanning(false)
    }, 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
      <div className="bg-white w-full max-w-lg rounded-[48px] shadow-2xl overflow-hidden relative flex flex-col animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl text-white">
              <Scan size={20} />
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Node Scanner</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
            <X size={20} />
          </button>
        </div>

        <div className="p-10 space-y-8">
          <div className="aspect-[3/2] bg-slate-900 rounded-[40px] relative overflow-hidden flex items-center justify-center group shadow-2xl">
             <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-indigo-500 to-purple-600" />
             <div className="relative z-10 w-4/5 h-4/5 border-2 border-indigo-400/50 rounded-2xl flex items-center justify-center">
                <div className="absolute inset-0 animate-pulse border border-white/20 rounded-2xl" />
                <div className="w-full h-1 bg-indigo-500/50 absolute top-0 animate-[scan_3s_ease-in-out_infinite] shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                <Camera size={48} className="text-white/30" />
             </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-indigo-600">
              <Sparkles size={18} />
              <h4 className="text-sm font-bold uppercase tracking-widest">OCR Extraction Active</h4>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              Thorne will extract name, company, phone, and social handles from business cards or screenshots in real-time.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              size="lg" 
              className="w-full bg-indigo-600 hover:bg-indigo-700" 
              onClick={handleScan} 
              disabled={isScanning}
            >
              {isScanning ? 'Extracting Node Data...' : 'Capture and Scan'}
            </Button>
            <Button variant="outline" size="lg" className="w-full bg-transparent">
              Upload from Photo Library
            </Button>
          </div>
        </div>

        <style jsx>{`
          @keyframes scan {
            0%, 100% { top: 0%; }
            50% { top: 100%; }
          }
        `}</style>
      </div>
    </div>
  )
}
