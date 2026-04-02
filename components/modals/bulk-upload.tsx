"use client"

import { useState, useTransition } from "react"
import { Upload, FileText, AlertCircle, X, CheckCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { bulkImportContactsAction } from "@/app/actions"

interface BulkUploadProps {
  onClose: () => void
  onIngest: (data: IngestedContact[]) => void
}

interface IngestedContact {
  firstName: string
  lastName: string
  email: string
  company: string
  jobTitle?: string
  phone?: string
}

function parseCSV(text: string): IngestedContact[] {
  const lines = text.split("\n").filter(line => line.trim())
  if (lines.length < 2) return []
  
  const headers = lines[0].toLowerCase().split(",").map(h => h.trim())
  const contacts: IngestedContact[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map(v => v.trim())
    const contact: Record<string, string> = {}
    
    headers.forEach((header, idx) => {
      contact[header] = values[idx] || ""
    })
    
    // Map common CSV column names
    const firstName = contact["first name"] || contact["firstname"] || contact["first_name"] || contact["name"]?.split(" ")[0] || ""
    const lastName = contact["last name"] || contact["lastname"] || contact["last_name"] || contact["name"]?.split(" ").slice(1).join(" ") || ""
    const email = contact["email"] || contact["email address"] || contact["work email"] || ""
    const company = contact["company"] || contact["organization"] || contact["company name"] || ""
    const jobTitle = contact["job title"] || contact["title"] || contact["position"] || contact["role"] || ""
    const phone = contact["phone"] || contact["phone number"] || contact["mobile"] || contact["cell"] || ""
    
    if (firstName && email && company) {
      contacts.push({ firstName, lastName, email, company, jobTitle, phone })
    }
  }
  
  return contacts
}

export function BulkUpload({ onClose, onIngest }: BulkUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [parsedContacts, setParsedContacts] = useState<IngestedContact[]>([])
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [step, setStep] = useState<"upload" | "preview" | "done">("upload")

  const handleFileChange = async (selectedFile: File) => {
    setFile(selectedFile)
    setError(null)
    
    try {
      const text = await selectedFile.text()
      const contacts = parseCSV(text)
      
      if (contacts.length === 0) {
        setError("No valid contacts found. Make sure your CSV has columns for: first name, email, and company.")
        return
      }
      
      setParsedContacts(contacts)
      setStep("preview")
    } catch (err) {
      setError("Failed to parse CSV file. Please check the format.")
    }
  }

  const handleImport = () => {
    startTransition(async () => {
      const result = await bulkImportContactsAction(parsedContacts)
      
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(`Successfully imported ${result.count} contacts!`)
        setStep("done")
        onIngest(parsedContacts)
      }
    })
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
          {step === "upload" && (
            <>
              <div
                className="border-4 border-dashed border-slate-100 rounded-[40px] p-16 flex flex-col items-center justify-center text-center space-y-4 hover:border-indigo-100 hover:bg-indigo-50/10 transition-all cursor-pointer group"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  if (e.dataTransfer.files[0]) {
                    handleFileChange(e.dataTransfer.files[0])
                  }
                }}
              >
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 group-hover:bg-white group-hover:text-indigo-400 transition-all shadow-sm">
                  <FileText size={40} />
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900">Drag & Drop CSV File</p>
                  <p className="text-sm text-slate-400 font-medium">Required columns: First Name, Email, Company</p>
                </div>
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  id="csv-upload"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleFileChange(e.target.files[0])
                    }
                  }}
                />
                <label
                  htmlFor="csv-upload"
                  className="px-6 py-2 bg-slate-100 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-200 cursor-pointer transition-all"
                >
                  Choose File
                </label>
              </div>

              {error && (
                <div className="bg-red-50 p-6 rounded-3xl flex items-start gap-4 border border-red-100">
                  <AlertCircle className="text-red-500 shrink-0 mt-1" size={18} />
                  <p className="text-xs text-red-700 leading-relaxed font-medium">{error}</p>
                </div>
              )}

              <div className="bg-amber-50 p-6 rounded-3xl flex items-start gap-4 border border-amber-100">
                <AlertCircle className="text-amber-500 shrink-0 mt-1" size={18} />
                <p className="text-xs text-amber-700 leading-relaxed font-medium">
                  Contacts will be imported directly to your database. Ensure your CSV has accurate data before uploading.
                </p>
              </div>
            </>
          )}

          {step === "preview" && (
            <>
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-bold text-slate-900">Preview ({parsedContacts.length} contacts found)</p>
                  <button
                    onClick={() => { setStep("upload"); setFile(null); setParsedContacts([]) }}
                    className="text-xs text-indigo-600 font-bold hover:text-indigo-700"
                  >
                    Change File
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {parsedContacts.slice(0, 5).map((contact, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 text-sm">
                      <p className="font-bold text-slate-900">{contact.firstName} {contact.lastName}</p>
                      <p className="text-slate-500 text-xs">{contact.email} - {contact.company}</p>
                    </div>
                  ))}
                  {parsedContacts.length > 5 && (
                    <p className="text-xs text-slate-400 text-center py-2">
                      ...and {parsedContacts.length - 5} more contacts
                    </p>
                  )}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 p-6 rounded-3xl flex items-start gap-4 border border-red-100">
                  <AlertCircle className="text-red-500 shrink-0 mt-1" size={18} />
                  <p className="text-xs text-red-700 leading-relaxed font-medium">{error}</p>
                </div>
              )}

              <Button size="lg" className="w-full" disabled={isPending} onClick={handleImport}>
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  `Import ${parsedContacts.length} Contacts`
                )}
              </Button>
            </>
          )}

          {step === "done" && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{success}</h3>
              <p className="text-sm text-slate-500 mb-6">Your contacts have been added to the database.</p>
              <Button onClick={onClose}>Close</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
