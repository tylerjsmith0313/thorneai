"use server"

import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

// Zod schema for form validation
export const submissionSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
})

export type SubmissionFormData = z.infer<typeof submissionSchema>

export async function submitForm(data: SubmissionFormData) {
  // Validate the data with Zod
  const validationResult = submissionSchema.safeParse(data)
  
  if (!validationResult.success) {
    return { 
      success: false, 
      error: validationResult.error.errors[0]?.message || "Validation failed" 
    }
  }

  const supabase = await createClient()

  const { data: submission, error } = await supabase
    .from("submissions")
    .insert({
      full_name: validationResult.data.fullName,
      email: validationResult.data.email,
      message: validationResult.data.message,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error submitting form:", error)
    return { success: false, error: error.message }
  }

  return { success: true, data: submission }
}
