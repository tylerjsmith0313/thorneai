import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// Use service role client for form submissions (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Helper to extract field value from form data by key patterns
function extractField(data: Record<string, any>, patterns: string[]): string | null {
  for (const [key, value] of Object.entries(data)) {
    const keyLower = key.toLowerCase().replace(/[^a-z]/g, '')
    for (const pattern of patterns) {
      if (keyLower.includes(pattern) && value && typeof value === 'string' && value.trim()) {
        return value.trim()
      }
    }
  }
  return null
}

// Helper to extract boolean opt-in values
function extractOptIn(data: Record<string, any>, patterns: string[]): boolean {
  for (const [key, value] of Object.entries(data)) {
    const keyLower = key.toLowerCase().replace(/[^a-z]/g, '')
    for (const pattern of patterns) {
      if (keyLower.includes(pattern)) {
        return value === true || value === 'true' || value === 'on' || value === '1'
      }
    }
  }
  return false
}

export async function POST(request: Request) {
  try {
    const { formId, data } = await request.json()

    if (!formId || !data) {
      return NextResponse.json(
        { error: "Missing formId or data" },
        { status: 400 }
      )
    }

    // Get the form to verify it exists and get user_id
    const { data: form, error: formError } = await supabaseAdmin
      .from("creative_assets")
      .select("id, user_id, name, metadata")
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
    const { data: submission, error: submitError } = await supabaseAdmin
      .from("form_submissions")
      .insert({
        form_id: formId,
        user_id: form.user_id,
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

    // Extract contact fields from form data
    const firstName = extractField(data, ['firstname', 'first']) || ''
    const lastName = extractField(data, ['lastname', 'last']) || ''
    const email = extractField(data, ['email', 'mail'])
    const phone = extractField(data, ['phone', 'cell', 'mobile', 'telephone'])
    const company = extractField(data, ['company', 'business', 'organization', 'org'])
    const jobTitle = extractField(data, ['title', 'jobtitle', 'position', 'role'])
    
    // Extract opt-in preferences
    const optInEmail = extractOptIn(data, ['optemail', 'emailopt', 'agreeemail', 'receiveemail'])
    const optInSms = extractOptIn(data, ['optsms', 'smsopt', 'agreesms', 'textmessage', 'receivetext'])
    const optInPhone = extractOptIn(data, ['optphone', 'phoneopt', 'agreephone', 'receivecall', 'phonecall'])

    // If we have an email, create or merge contact
    if (email && form.user_id) {
      await matchOrCreateContact(form.user_id, {
        firstName,
        lastName,
        email,
        phone,
        company,
        jobTitle,
        optInEmail,
        optInSms,
        optInPhone,
        source: `Form: ${form.name}`,
      }, submission.id)
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

async function matchOrCreateContact(
  userId: string, 
  contactInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string | null
    company: string | null
    jobTitle: string | null
    optInEmail: boolean
    optInSms: boolean
    optInPhone: boolean
    source: string
  },
  submissionId: string
) {
  try {
    // First try to find an existing contact by email (case-insensitive)
    const { data: existingContacts } = await supabaseAdmin
      .from("contacts")
      .select("id, first_name, last_name, email, phone, company, job_title")
      .eq("user_id", userId)
      .ilike("email", contactInfo.email)

    let contactId: string | null = null

    if (existingContacts && existingContacts.length > 0) {
      // Use the first matching contact - merge data
      contactId = existingContacts[0].id
      const existing = existingContacts[0]

      // Build update object - only update empty fields or opt-ins
      const updateData: Record<string, any> = {
        last_contact_date: new Date().toISOString(),
        opt_in_email: contactInfo.optInEmail || undefined,
        opt_in_sms: contactInfo.optInSms || undefined,
        opt_in_phone: contactInfo.optInPhone || undefined,
      }
      
      // Only update if existing field is empty
      if (!existing.first_name && contactInfo.firstName) {
        updateData.first_name = contactInfo.firstName
      }
      if (!existing.last_name && contactInfo.lastName) {
        updateData.last_name = contactInfo.lastName
      }
      if (!existing.phone && contactInfo.phone) {
        updateData.phone = contactInfo.phone
      }
      if (!existing.company && contactInfo.company) {
        updateData.company = contactInfo.company
      }
      if (!existing.job_title && contactInfo.jobTitle) {
        updateData.job_title = contactInfo.jobTitle
      }

      await supabaseAdmin
        .from("contacts")
        .update(updateData)
        .eq("id", contactId)

      // Log activity for existing contact
      await supabaseAdmin
        .from("activities")
        .insert({
          user_id: userId,
          contact_id: contactId,
          type: "System",
          title: "Form Submission Received",
          detail: `Contact submitted a form: ${contactInfo.source}`,
        })

    } else {
      // Also check by name if no email match (for merging)
      if (contactInfo.firstName && contactInfo.lastName) {
        const { data: nameMatches } = await supabaseAdmin
          .from("contacts")
          .select("id, email, phone")
          .eq("user_id", userId)
          .ilike("first_name", contactInfo.firstName)
          .ilike("last_name", contactInfo.lastName)

        if (nameMatches && nameMatches.length > 0 && !nameMatches[0].email) {
          // Found a name match with no email - update it
          contactId = nameMatches[0].id
          await supabaseAdmin
            .from("contacts")
            .update({
              email: contactInfo.email,
              phone: contactInfo.phone || nameMatches[0].phone,
              company: contactInfo.company,
              job_title: contactInfo.jobTitle,
              opt_in_email: contactInfo.optInEmail,
              opt_in_sms: contactInfo.optInSms,
              opt_in_phone: contactInfo.optInPhone,
              last_contact_date: new Date().toISOString(),
            })
            .eq("id", contactId)

          // Log activity
          await supabaseAdmin
            .from("activities")
            .insert({
              user_id: userId,
              contact_id: contactId,
              type: "System",
              title: "Contact Updated via Form",
              detail: `Email and details added from form submission: ${contactInfo.source}`,
            })
          
          return contactId
        }
      }

      // Create a new contact
      const { data: newContact } = await supabaseAdmin
        .from("contacts")
        .insert({
          user_id: userId,
          first_name: contactInfo.firstName || "Unknown",
          last_name: contactInfo.lastName || "",
          email: contactInfo.email,
          phone: contactInfo.phone,
          company: contactInfo.company || "",
          job_title: contactInfo.jobTitle,
          source: contactInfo.source,
          status: "New",
          opt_in_email: contactInfo.optInEmail,
          opt_in_sms: contactInfo.optInSms,
          opt_in_phone: contactInfo.optInPhone,
          added_date: new Date().toISOString().split("T")[0],
          last_contact_date: new Date().toISOString(),
        })
        .select("id")
        .single()

      contactId = newContact?.id || null

      // Log activity for new contact
      if (contactId) {
        await supabaseAdmin
          .from("activities")
          .insert({
            user_id: userId,
            contact_id: contactId,
            type: "System",
            title: "New Contact Created",
            detail: `Lead captured via ${contactInfo.source}`,
          })
      }
    }

    // Link form submission to contact if we have one
    if (contactId) {
      await supabaseAdmin
        .from("form_submissions")
        .update({ contact_id: contactId })
        .eq("id", submissionId)
    }

    return contactId
  } catch (error) {
    console.error("Contact matching error:", error)
    return null
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
