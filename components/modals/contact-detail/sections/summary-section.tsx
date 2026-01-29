"use client"

import { useState, useEffect } from "react"
import { Heart, FileText, User, Plus, X, Save, Loader2, Pencil } from "lucide-react"
import type { Contact } from "@/types"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ContactExtended {
  interests: string[]
  hobbies: string[]
  notes: string | null
  demeanor: string | null
  communication_pace: string | null
}

interface SummarySectionProps {
  contact: Contact
}

export function SummarySection({ contact }: SummarySectionProps) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  
  // Contact extended data
  const [interests, setInterests] = useState<string[]>([])
  const [hobbies, setHobbies] = useState<string[]>([])
  const [notes, setNotes] = useState("")
  const [demeanor, setDemeanor] = useState("")
  const [communicationPace, setCommunicationPace] = useState("")
  
  // New item inputs
  const [newInterest, setNewInterest] = useState("")
  const [newHobby, setNewHobby] = useState("")

  const supabase = createClient()

  useEffect(() => {
    async function loadContactData() {
      setLoading(true)
      
      const { data, error } = await supabase
        .from("contacts")
        .select("interests, hobbies, notes, demeanor, communication_pace")
        .eq("id", contact.id)
        .single()
      
      if (data && !error) {
        setInterests(data.interests || [])
        setHobbies(data.hobbies || [])
        setNotes(data.notes || "")
        setDemeanor(data.demeanor || "")
        setCommunicationPace(data.communication_pace || "")
      }
      
      setLoading(false)
    }
    
    loadContactData()
  }, [contact.id])

  const handleSave = async () => {
    setSaving(true)
    
    const { error } = await supabase
      .from("contacts")
      .update({
        interests,
        hobbies,
        notes: notes || null,
        demeanor: demeanor || null,
        communication_pace: communicationPace || null,
      })
      .eq("id", contact.id)
    
    if (error) {
      console.error("[v0] Error saving contact summary:", error)
    }
    
    setSaving(false)
    setIsEditing(false)
  }

  // Helper to save contact data
  const saveContactData = async (updates: Record<string, unknown>) => {
    const { error } = await supabase
      .from("contacts")
      .update(updates)
      .eq("id", contact.id)
    
    if (error) {
      console.error("[v0] Error saving contact data:", error)
    }
  }

  const addInterest = async () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      const newInterests = [...interests, newInterest.trim()]
      setInterests(newInterests)
      setNewInterest("")
      // Auto-save
      await saveContactData({ interests: newInterests })
    }
  }

  const removeInterest = async (interest: string) => {
    const newInterests = interests.filter(i => i !== interest)
    setInterests(newInterests)
    // Auto-save
    await saveContactData({ interests: newInterests })
  }

  const addHobby = async () => {
    if (newHobby.trim() && !hobbies.includes(newHobby.trim())) {
      const newHobbies = [...hobbies, newHobby.trim()]
      setHobbies(newHobbies)
      setNewHobby("")
      // Auto-save
      await saveContactData({ hobbies: newHobbies })
    }
  }

  const removeHobby = async (hobby: string) => {
    const newHobbies = hobbies.filter(h => h !== hobby)
    setHobbies(newHobbies)
    // Auto-save
    await saveContactData({ hobbies: newHobbies })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Edit Toggle */}
      <div className="flex justify-end">
        {isEditing ? (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsEditing(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button 
              size="sm" 
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? <Loader2 size={14} className="animate-spin mr-2" /> : <Save size={14} className="mr-2" />}
              Save
            </Button>
          </div>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <Pencil size={14} className="mr-2" />
            Edit
          </Button>
        )}
      </div>

      {/* Interests - Always show add input */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-indigo-500">
          <Heart size={16} />
          <h4 className="text-sm font-bold">Interests</h4>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {interests.map(interest => (
            <span 
              key={interest} 
              className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold border border-indigo-100 flex items-center gap-1.5 group"
            >
              {interest}
              <button 
                onClick={() => removeInterest(interest)} 
                className="hover:text-indigo-800 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
            </span>
          ))}
          {/* Always show add input */}
          <div className="flex items-center gap-2">
            <Input
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              placeholder="Add interest..."
              className="h-8 w-32 text-xs"
              onKeyDown={(e) => e.key === "Enter" && addInterest()}
            />
            <Button size="sm" variant="outline" onClick={addInterest} className="h-8 px-2 bg-transparent">
              <Plus size={14} />
            </Button>
          </div>
        </div>
      </div>

      {/* Hobbies - Always show add input */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-rose-500">
          <Heart size={16} />
          <h4 className="text-sm font-bold">Hobbies</h4>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {hobbies.map(hobby => (
            <span 
              key={hobby} 
              className="px-3 py-1 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold border border-rose-100 flex items-center gap-1.5 group"
            >
              {hobby}
              <button 
                onClick={() => removeHobby(hobby)} 
                className="hover:text-rose-800 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
            </span>
          ))}
          {/* Always show add input */}
          <div className="flex items-center gap-2">
            <Input
              value={newHobby}
              onChange={(e) => setNewHobby(e.target.value)}
              placeholder="Add hobby..."
              className="h-8 w-32 text-xs"
              onKeyDown={(e) => e.key === "Enter" && addHobby()}
            />
            <Button size="sm" variant="outline" onClick={addHobby} className="h-8 px-2 bg-transparent">
              <Plus size={14} />
            </Button>
          </div>
        </div>
      </div>

      {/* Notes - Editable textarea that auto-saves on blur */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-emerald-500">
          <FileText size={16} />
          <h4 className="text-sm font-bold">Notes</h4>
        </div>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => saveContactData({ notes: notes || null })}
          placeholder={`Add notes about ${contact.firstName}...`}
          className="min-h-[120px] bg-slate-50 border-slate-200"
        />
      </div>

      {/* Persona Attributes */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-slate-500">
          <User size={16} />
          <h4 className="text-sm font-bold">Persona Attributes</h4>
        </div>
        {isEditing ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500">Demeanor</label>
              <Select value={demeanor} onValueChange={setDemeanor}>
                <SelectTrigger>
                  <SelectValue placeholder="Select demeanor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Analytical">Analytical</SelectItem>
                  <SelectItem value="Driver">Driver</SelectItem>
                  <SelectItem value="Amiable">Amiable</SelectItem>
                  <SelectItem value="Expressive">Expressive</SelectItem>
                  <SelectItem value="Skeptical">Skeptical</SelectItem>
                  <SelectItem value="Enthusiastic">Enthusiastic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500">Communication Pace</label>
              <Select value={communicationPace} onValueChange={setCommunicationPace}>
                <SelectTrigger>
                  <SelectValue placeholder="Select pace" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Rapid">Rapid</SelectItem>
                  <SelectItem value="Moderate">Moderate</SelectItem>
                  <SelectItem value="Slow">Slow</SelectItem>
                  <SelectItem value="Deliberate">Deliberate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Demeanor</p>
              <p className="text-xs font-bold text-slate-700">{demeanor || "Not set"}</p>
            </div>
            <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Pace</p>
              <p className="text-xs font-bold text-slate-700">{communicationPace || "Not set"}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
