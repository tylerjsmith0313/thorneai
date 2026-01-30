import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { formId, data } = await request.json()

    if (!formId || !data) {
      return NextResponse.json(
        { error: "Missing formId or data" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get the form to verify it exists and get tenant_id
    const { data: form, error: formError } = await supabase
      .from("creative_assets")
      .select("id, tenant_id, name, metadata")
      .eq("id", formId)
      .eq("type", "form")
      .single()

    if (formError || !form) {
      return NextResponse.json(
        { error: "Form not found" },
        { status: 404 }
      )
    }

    // Store the form submission
    const { data: submission, error: submitError } = await supabase
      .from("form_submissions")
      .insert({
        form_id: formId,
        tenant_id: form.tenant_id,
        data: data,
        source_url: request.headers.get("referer") || null,
        ip_address: request.headers.get("x-forwarded-for") || null,
        user_agent: request.headers.get("user-agent") || null,
      })
      .select()
      .single()

    if (submitError) {
      console.error("[v0] Error saving form submission:", submitError)
      return NextResponse.json(
        { error: "Failed to save submission" },
        { status: 500 }
      )
    }

    // If the form has an email field, try to create/update contact
    const emailField = Object.entries(data).find(
      ([key, value]) => key.toLowerCase().includes("email") && typeof value === "string" && value.includes("@")
    )

    if (emailField && form.tenant_id) {
      const email = emailField[1] as string
      
      // Extract name fields
      const nameField = Object.entries(data).find(
        ([key]) => key.toLowerCase().includes("name") && !key.toLowerCase().includes("company")
      )
      const fullName = nameField ? String(nameField[1]) : ""
      const nameParts = fullName.split(" ")
      const firstName = nameParts[0] || ""
      const lastName = nameParts.slice(1).join(" ") || ""

      // Extract phone if present
      const phoneField = Object.entries(data).find(
        ([key]) => key.toLowerCase().includes("phone")
      )
      const phone = phoneField ? String(phoneField[1]) : null

      // Check if contact already exists
      const { data: existingContact } = await supabase
        .from("contacts")
        .select("id")
        .eq("email", email)
        .eq("tenant_id", form.tenant_id)
        .single()

      if (existingContact) {
        // Update existing contact's last activity
        await supabase
          .from("contacts")
          .update({ 
            last_contact_date: new Date().toISOString().split("T")[0],
            notes: `Form submission received from ${form.name}`
          })
          .eq("id", existingContact.id)
      } else {
        // Create new contact from form submission
        await supabase
          .from("contacts")
          .insert({
            tenant_id: form.tenant_id,
            email: email,
            firstName: firstName,
            lastName: lastName,
            phone: phone,
            source: "Form Embed",
            tags: ["form-submission", form.name.toLowerCase().replace(/\s+/g, "-")],
            notes: `Lead captured via embedded form: ${form.name}`,
          })
      }
    }

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
    })
  } catch (error) {
    console.error("[v0] Form submission error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Allow CORS for embedded forms
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
