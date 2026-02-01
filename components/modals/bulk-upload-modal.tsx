"use client"

import React from "react"

import { useState, useRef, useCallback } from "react"
import { X, Upload, FileText, AlertCircle, CheckCircle, Loader2, ChevronRight, User, Building2, Mail, Phone } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface ParsedContact {
  firstName: string
  lastName: string
  email: string
  company: string
  jobTitle?: string
  phone?: string
  source?: string
  isValid: boolean
  errors: string[]
}

interface BulkUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

type UploadStep = "upload" | "preview" | "verify" | "complete"

export function BulkUploadModal({ isOpen, onClose, onComplete }: BulkUploadModalProps) {
  const [step, setStep] = useState<UploadStep>("upload")
  const [isDragging, setIsDragging] = useState(false)
  const [parsedContacts, setParsedContacts] = useState<ParsedContact[]>([])
  const [currentVerifyIndex, setCurrentVerifyIndex] = useState(0)
  const [verifiedContacts, setVerifiedContacts] = useState<ParsedContact[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const resetState = () => {
    setStep("upload")
    setParsedContacts([])
    setCurrentVerifyIndex(0)
    setVerifiedContacts([])
    setIsProcessing(false)
    setUploadProgress(0)
  }

  const handleClose = () => {
    resetState()
    onClose()
  }

  const parseCSV = (text: string): ParsedContact[] => {
    const lines = text.trim().split("\n")
    if (lines.length < 2) return []

    const headers = lines[0].toLowerCase().split(",").map(h => h.trim().replace(/"/g, ""))
    const contacts: ParsedContact[] = []

    // Map common header variations
    const headerMap: Record<string, string> = {
      "first name": "firstName",
      "firstname": "firstName",
      "first_name": "firstName",
      "last name": "lastName",
      "lastname": "lastName",
      "last_name": "lastName",
      "email": "email",
      "email address": "email",
      "company": "company",
      "company name": "company",
      "organization": "company",
      "job title": "jobTitle",
      "jobtitle": "jobTitle",
      "title": "jobTitle",
      "position": "jobTitle",
      "phone": "phone",
      "phone number": "phone",
      "mobile": "phone",
      "source": "source",
      "lead source": "source",
    }

    const getHeaderIndex = (field: string) => {
      for (let i = 0; i < headers.length; i++) {
        if (headerMap[headers[i]] === field) return i
      }
      return -1
    }

    const firstNameIdx = getHeaderIndex("firstName")
    const lastNameIdx = getHeaderIndex("lastName")
    const emailIdx = getHeaderIndex("email")
    const companyIdx = getHeaderIndex("company")
    const jobTitleIdx = getHeaderIndex("jobTitle")
    const phoneIdx = getHeaderIndex("phone")
    const sourceIdx = getHeaderIndex("source")

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map(v => v.trim().replace(/"/g, ""))
      const errors: string[] = []

      const firstName = firstNameIdx >= 0 ? values[firstNameIdx] || "" : ""
      const lastName = lastNameIdx >= 0 ? values[lastNameIdx] || "" : ""
      const email = emailIdx >= 0 ? values[emailIdx] || "" : ""
      const company = companyIdx >= 0 ? values[companyIdx] || "" : ""

      // Validation
      if (!firstName) errors.push("Missing first name")
      if (!lastName) errors.push("Missing last name")
      if (!email) errors.push("Missing email")
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("Invalid email format")
      if (!company) errors.push("Missing company")

      contacts.push({
        firstName,
        lastName,
        email,
        company,
        jobTitle: jobTitleIdx >= 0 ? values[jobTitleIdx] : undefined,
        phone: phoneIdx >= 0 ? values[phoneIdx] : undefined,
        source: sourceIdx >= 0 ? values[sourceIdx] : "CSV Import",
        isValid: errors.length === 0,
        errors,
      })
    }

    return contacts
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file && file.type === "text/csv") {
      processFile(file)
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const processFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const contacts = parseCSV(text)
      setParsedContacts(contacts)
      setStep("preview")
    }
    reader.readAsText(file)
  }

  const startVerification = () => {
    setStep("verify")
    setCurrentVerifyIndex(0)
    setVerifiedContacts([])
  }

  const verifyContact = (contact: ParsedContact, approved: boolean) => {
    if (approved) {
      setVerifiedContacts(prev => [...prev, contact])
    }

    if (currentVerifyIndex < parsedContacts.length - 1) {
      setCurrentVerifyIndex(prev => prev + 1)
    } else {
      // All contacts verified, proceed to upload
      uploadContacts()
    }
  }

  const uploadContacts = async () => {
    setStep("complete")
    setIsProcessing(true)

    const contactsToUpload = verifiedContacts.length > 0 ? verifiedContacts : parsedContacts.filter(c => c.isValid)
    const total = contactsToUpload.length

    for (let i = 0; i < total; i++) {
      const contact = contactsToUpload[i]

      await supabase.from("contacts").insert({
        first_name: contact.firstName,
        last_name: contact.lastName,
        email: contact.email,
        company: contact.company,
        job_title: contact.jobTitle,
        phone: contact.phone,
        source: contact.source || "CSV Import",
        status: "New",
        is_verified: false,
        added_date: new Date().toISOString(),
      })

      setUploadProgress(Math.round(((i + 1) / total) * 100))
    }

    setIsProcessing(false)
  }

  if (!isOpen) return null

  const currentContact = parsedContacts[currentVerifyIndex]
  const validCount = parsedContacts.filter(c => c.isValid).length
  const invalidCount = parsedContacts.length - validCount

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <Upload className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Bulk Upload Leads</h2>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === "upload" && (
            <div className="space-y-6">
              {/* Drop Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all ${
                  isDragging ? "border-indigo-400 bg-indigo-50" : "border-slate-200 bg-slate-50"
                }`}
              >
                <div className="w-16 h-16 bg-white rounded-2xl border border-slate-200 flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-slate-300" />
                </div>
                <p className="font-semibold text-slate-900 mb-1">Drag & Drop CSV File</p>
                <p className="text-sm text-slate-500 mb-4">Thorne will parse and verify each node in the wizard.</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all"
                >
                  Choose File
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Info Notice */}
              <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">
                  Every contact uploaded via CSV must still complete the <span className="font-semibold">**Human Verification Wizard**</span> to maintain our high-integrity database standard.
                </p>
              </div>

              {/* Action Button */}
              <button
                disabled
                className="w-full py-4 bg-indigo-600 text-white font-semibold rounded-xl opacity-50 cursor-not-allowed"
              >
                Inject and Start Verification Loop
              </button>
            </div>
          )}

          {step === "preview" && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="flex items-center gap-4">
                <div className="flex-1 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-semibold text-emerald-700">Valid</span>
                  </div>
                  <p className="text-2xl font-bold text-emerald-600">{validCount}</p>
                </div>
                <div className="flex-1 p-4 bg-rose-50 rounded-xl border border-rose-100">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="w-4 h-4 text-rose-500" />
                    <span className="text-sm font-semibold text-rose-700">Issues</span>
                  </div>
                  <p className="text-2xl font-bold text-rose-600">{invalidCount}</p>
                </div>
              </div>

              {/* Preview List */}
              <div className="max-h-64 overflow-y-auto space-y-2">
                {parsedContacts.slice(0, 10).map((contact, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl border ${contact.isValid ? "bg-white border-slate-200" : "bg-rose-50 border-rose-200"}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${contact.isValid ? "bg-slate-100 text-slate-600" : "bg-rose-100 text-rose-600"}`}>
                          {contact.firstName[0]}{contact.lastName[0]}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {contact.firstName} {contact.lastName}
                          </p>
                          <p className="text-xs text-slate-500">{contact.email}</p>
                        </div>
                      </div>
                      {contact.isValid ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-500" />
                      )}
                    </div>
                    {!contact.isValid && contact.errors.length > 0 && (
                      <p className="text-xs text-rose-600 mt-2">{contact.errors.join(", ")}</p>
                    )}
                  </div>
                ))}
                {parsedContacts.length > 10 && (
                  <p className="text-sm text-slate-500 text-center py-2">
                    +{parsedContacts.length - 10} more contacts
                  </p>
                )}
              </div>

              {/* Action Button */}
              <button
                onClick={startVerification}
                className="w-full py-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
              >
                Inject and Start Verification Loop
                <ChevronRight size={18} />
              </button>
            </div>
          )}

          {step === "verify" && currentContact && (
            <div className="space-y-6">
              {/* Progress */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-600">
                  Verifying {currentVerifyIndex + 1} of {parsedContacts.length}
                </span>
                <span className="text-sm text-slate-400">
                  {verifiedContacts.length} approved
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all"
                  style={{ width: `${((currentVerifyIndex + 1) / parsedContacts.length) * 100}%` }}
                />
              </div>

              {/* Contact Card */}
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 font-bold text-lg">
                    {currentContact.firstName[0]}{currentContact.lastName[0]}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {currentContact.firstName} {currentContact.lastName}
                    </h3>
                    <p className="text-sm text-slate-500">{currentContact.company}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-700">{currentContact.email}</span>
                  </div>
                  {currentContact.phone && (
                    <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-700">{currentContact.phone}</span>
                    </div>
                  )}
                  {currentContact.jobTitle && (
                    <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
                      <User className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-700">{currentContact.jobTitle}</span>
                    </div>
                  )}
                </div>

                {!currentContact.isValid && (
                  <div className="mt-4 p-3 bg-rose-50 rounded-xl border border-rose-200">
                    <p className="text-xs text-rose-600 font-medium">
                      Issues: {currentContact.errors.join(", ")}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => verifyContact(currentContact, false)}
                  className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all"
                >
                  Skip
                </button>
                <button
                  onClick={() => verifyContact(currentContact, true)}
                  className="flex-1 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all"
                >
                  Approve & Next
                </button>
              </div>
            </div>
          )}

          {step === "complete" && (
            <div className="text-center py-8">
              {isProcessing ? (
                <>
                  <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Uploading Contacts</h3>
                  <p className="text-sm text-slate-500 mb-4">
                    Injecting {verifiedContacts.length || validCount} leads into the database...
                  </p>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-slate-400 mt-2">{uploadProgress}%</p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Upload Complete</h3>
                  <p className="text-sm text-slate-500 mb-6">
                    Successfully added {verifiedContacts.length || validCount} contacts to your database.
                  </p>
                  <button
                    onClick={() => {
                      handleClose()
                      onComplete()
                    }}
                    className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all"
                  >
                    Done
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
