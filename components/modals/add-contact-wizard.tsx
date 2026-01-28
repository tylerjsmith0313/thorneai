"use client"

import { useState, useTransition } from "react"
import { createContactAction } from "@/app/actions"
import { WizardHeader } from "./wizard/wizard-header"
import { WizardFooter } from "./wizard/wizard-footer"
import { BaseInput } from "@/components/ui/base-input"
import { User, Mail, Phone, Building2, Briefcase, MapPin, ChevronDown, ChevronUp } from "lucide-react"

interface AddContactWizardProps {
  onClose: () => void
  onSuccess?: () => void
}

export interface WizardFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  company: string
  jobTitle: string
  source: string
  // Address fields (optional)
  streetAddress: string
  city: string
  state: string
  zipCode: string
  country: string
  companyAddress: string
}

const defaultFormData: WizardFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  company: "",
  jobTitle: "",
  source: "manual",
  streetAddress: "",
  city: "",
  state: "",
  zipCode: "",
  country: "",
  companyAddress: ""
}

export function AddContactWizard({ onClose, onSuccess }: AddContactWizardProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<WizardFormData>(defaultFormData)
  const [showAddressFields, setShowAddressFields] = useState(false)

  const updateData = (updates: Partial<WizardFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const isValid = formData.firstName.trim() && formData.lastName.trim() && formData.email.trim()

  const hasAddress = formData.streetAddress.trim() || formData.city.trim()

  const handleSubmit = () => {
    if (!isValid) {
      setError("Please fill in required fields (First Name, Last Name, Email)")
      return
    }

    startTransition(async () => {
      try {
        const result = await createContactAction({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          jobTitle: formData.jobTitle,
          source: formData.source,
          streetAddress: formData.streetAddress,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
          companyAddress: formData.companyAddress,
          status: "New"
        })
        
        if (result.success) {
          onSuccess?.()
          onClose()
        } else {
          setError(result.error || "Failed to create contact")
        }
      } catch (err) {
        setError("An unexpected error occurred")
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-[48px] shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        <WizardHeader
          stepNumber={1}
          totalSteps={1}
          stepLabel="Add New Contact"
          onClose={onClose}
        />

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <p className="text-sm text-slate-500">
            Add basic contact info now. You can configure outreach channels and AI strategy from their profile later.
          </p>

          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <BaseInput
                label="First Name *"
                placeholder="John"
                value={formData.firstName}
                onChange={e => updateData({ firstName: e.target.value })}
                icon={<User size={16} />}
              />
              <BaseInput
                label="Last Name *"
                placeholder="Doe"
                value={formData.lastName}
                onChange={e => updateData({ lastName: e.target.value })}
                icon={<User size={16} />}
              />
            </div>

            <BaseInput
              label="Email Address *"
              type="email"
              placeholder="john@company.com"
              value={formData.email}
              onChange={e => updateData({ email: e.target.value })}
              icon={<Mail size={16} />}
            />

            <BaseInput
              label="Phone Number"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={formData.phone}
              onChange={e => updateData({ phone: e.target.value })}
              icon={<Phone size={16} />}
            />

            <BaseInput
              label="Company"
              placeholder="Acme Corp"
              value={formData.company}
              onChange={e => updateData({ company: e.target.value })}
              icon={<Building2 size={16} />}
            />

            <BaseInput
              label="Job Title"
              placeholder="VP of Sales"
              value={formData.jobTitle}
              onChange={e => updateData({ jobTitle: e.target.value })}
              icon={<Briefcase size={16} />}
            />

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                Source
              </label>
              <select
                value={formData.source}
                onChange={e => updateData({ source: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
              >
                <option value="manual">Manual Entry</option>
                <option value="linkedin">LinkedIn</option>
                <option value="referral">Referral</option>
                <option value="conference">Conference</option>
                <option value="website">Website</option>
                <option value="cold_outreach">Cold Outreach</option>
              </select>
            </div>

            {/* Collapsible Address Section */}
            <div className="border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={() => setShowAddressFields(!showAddressFields)}
                className="w-full flex items-center justify-between text-left group"
              >
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Address (Optional)
                  </span>
                  {hasAddress && (
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Added
                    </span>
                  )}
                </div>
                {showAddressFields ? (
                  <ChevronUp size={16} className="text-slate-400" />
                ) : (
                  <ChevronDown size={16} className="text-slate-400" />
                )}
              </button>

              {!showAddressFields && (
                <p className="text-[11px] text-slate-400 mt-2 ml-6">
                  Add address to enable physical mail, gifts, and visits
                </p>
              )}

              {showAddressFields && (
                <div className="mt-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
                  <BaseInput
                    label="Street Address"
                    placeholder="123 Main Street, Suite 100"
                    value={formData.streetAddress}
                    onChange={e => updateData({ streetAddress: e.target.value })}
                    icon={<MapPin size={16} />}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <BaseInput
                      label="City"
                      placeholder="San Francisco"
                      value={formData.city}
                      onChange={e => updateData({ city: e.target.value })}
                    />
                    <BaseInput
                      label="State/Province"
                      placeholder="CA"
                      value={formData.state}
                      onChange={e => updateData({ state: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <BaseInput
                      label="ZIP/Postal Code"
                      placeholder="94105"
                      value={formData.zipCode}
                      onChange={e => updateData({ zipCode: e.target.value })}
                    />
                    <BaseInput
                      label="Country"
                      placeholder="United States"
                      value={formData.country}
                      onChange={e => updateData({ country: e.target.value })}
                    />
                  </div>

                  <BaseInput
                    label="Company Address (if different)"
                    placeholder="456 Business Blvd"
                    value={formData.companyAddress}
                    onChange={e => updateData({ companyAddress: e.target.value })}
                    icon={<Building2 size={16} />}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <WizardFooter
          isFirstStep={true}
          isLastStep={true}
          isPending={isPending}
          onBack={onClose}
          onNext={handleSubmit}
          nextLabel="Add Contact"
          backLabel="Cancel"
        />
      </div>
    </div>
  )
}
