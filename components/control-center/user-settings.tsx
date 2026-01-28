"use client"

import { User, Mail, Phone, Building, Briefcase, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function UserSettings() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Account Details</h2>
          <p className="text-muted-foreground">Manage your identity within the Thorne ecosystem.</p>
        </div>
        <Button className="bg-thorne-indigo hover:bg-thorne-indigo/90 text-white">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <div className="space-y-6">
        {/* Name Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-medium text-muted-foreground tracking-wider block mb-2">
              FIRST NAME
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                defaultValue="Thorne"
                className="pl-10 bg-secondary border-none h-12 rounded-xl"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-medium text-muted-foreground tracking-wider block mb-2">
              LAST NAME
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                defaultValue="AI"
                className="pl-10 bg-secondary border-none h-12 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="text-[10px] font-medium text-thorne-danger tracking-wider block mb-2">
            EMAIL ADDRESS
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              defaultValue="commander@thorne.ai"
              className="pl-10 bg-secondary border-none h-12 rounded-xl"
            />
          </div>
        </div>

        {/* Phone Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-medium text-thorne-danger tracking-wider block mb-2">
              OFFICE PHONE
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="+1 (555) 000-0000"
                className="pl-10 bg-secondary border-none h-12 rounded-xl"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-medium text-thorne-danger tracking-wider block mb-2">
              CELL PHONE
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="+1 (555) 000-0000"
                className="pl-10 bg-secondary border-none h-12 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Company Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-medium text-muted-foreground tracking-wider block mb-2">
              COMPANY
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                defaultValue="Thorne Intelligence"
                className="pl-10 bg-secondary border-none h-12 rounded-xl"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-medium text-muted-foreground tracking-wider block mb-2">
              JOB TITLE
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                defaultValue="Chief Revenue Officer"
                className="pl-10 bg-secondary border-none h-12 rounded-xl"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
