"use client"

import { useState } from "react"
import { Upload, FileText, AlertCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BulkUploadProps {
  onClose: () => void
  onIngest: (data: IngestedContact[]) => void
}

interface IngestedContact {
  firstName: string
  lastName: string
  email: string
  company: string
}

export function BulkUpload({ onClose, onIngest }: BulkUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleUpload = () => {
    if (!file) return
    setIsUploading(true)
    // Simulate parsing CSV
    setTimeout(() => {
      onIngest([
        { firstName: "Marcus", lastName: "Aurelius", email: "marcus@stoic.com", company: "Rome Inc" },
        { firstName: "Lucius", lastName: "Vorenus", email: "lucius@legion.com", company: "The 13th" },
      ])
      setIsUploading(false)
    }, 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
      <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-600 rounded-2xl text-white">
              <Upload size={24} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Bulk Upload Leads</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
            <X size={24} />
          </button>
        </div>

        <div className="p-10 space-y-8">
          <div
            className="border-4 border-dashed border-slate-100 rounded-[40px] p-16 flex flex-col items-center justify-center text-center space-y-4 hover:border-indigo-100 hover:bg-indigo-50/10 transition-all cursor-pointer group"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              setFile(e.dataTransfer.files[0])
            }}
          >
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 group-hover:bg-white group-hover:text-indigo-400 transition-all shadow-sm">
              <FileText size={40} />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900">Drag & Drop CSV File</p>
              <p className="text-sm text-slate-400 font-medium">Thorne will parse and verify each node in the wizard.</p>
            </div>
            <input
              type="file"
              accept=".csv"
              className="hidden"
              id="csv-upload"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <label
              htmlFor="csv-upload"
              className="px-6 py-2 bg-slate-100 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-200 cursor-pointer transition-all"
            >
              Choose File
            </label>
            {file && <p className="text-xs font-bold text-indigo-600 animate-in fade-in">Selected: {file.name}</p>}
          </div>

          <div className="bg-amber-50 p-6 rounded-3xl flex items-start gap-4 border border-amber-100">
            <AlertCircle className="text-amber-500 shrink-0 mt-1" size={18} />
            <p className="text-xs text-amber-700 leading-relaxed font-medium">
              Every contact uploaded via CSV must still complete the <strong>Human Verification Wizard</strong> to maintain
              our high-integrity database standard.
            </p>
          </div>

          <Button size="lg" className="w-full" disabled={!file || isUploading} onClick={handleUpload}>
            {isUploading ? "Processing..." : "Ingest and Start Verification Loop"}
          </Button>
        </div>
      </div>
    </div>
  )
}
