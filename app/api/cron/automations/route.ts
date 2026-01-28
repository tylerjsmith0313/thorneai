import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Use service role for cron operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Verify cron secret to prevent unauthorized access
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    console.warn("[v0] CRON_SECRET not set")
    return false
  }

  return authHeader === `Bearer ${cronSecret}`
}

export async function GET(request: NextRequest) {
  // Verify the request is from Vercel Cron
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const startTime = Date.now()
  const results = {
    followUps: { processed: 0, errors: 0 },
    sequences: { processed: 0, errors: 0 },
    withering: { processed: 0, errors: 0 },
    breakups: { processed: 0, errors: 0 },
  }

  try {
    // 1. Process scheduled follow-ups
    await processScheduledFollowUps(results)

    // 2. Process email sequences
    await processEmailSequences(results)

    // 3. Check for withering contacts (no activity in X days)
    await checkWitheringContacts(results)

    // 4. Process break-up sequences
    await processBreakupSequences(results)

    const duration = Date.now() - startTime

    console.log("[v0] Cron job completed", { results, durationMs: duration })

    return NextResponse.json({
      success: true,
      message: "Automations processed",
      results,
      durationMs: duration,
    })
  } catch (error) {
    console.error("[v0] Cron job error:", error)
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    )
  }
}

async function processScheduledFollowUps(results: typeof results.followUps extends { processed: number, errors: number } ? { followUps: { processed: number, errors: number }, sequences: { processed: number, errors: number }, withering: { processed: number, errors: number }, breakups: { processed: number, errors: number } } : never) {
  try {
    // Get all scheduled follow-ups that are due
    const { data: followUps, error } = await supabase
      .from("scheduled_tasks")
      .select(`
        *,
        contact:contacts(id, email, first_name, last_name, organization_id),
        organization:organizations(id, name, settings)
      `)
      .eq("task_type", "follow_up")
      .eq("status", "pending")
      .lte("scheduled_for", new Date().toISOString())
      .limit(100)

    if (error) {
      console.error("[v0] Error fetching follow-ups:", error)
      results.followUps.errors++
      return
    }

    for (const task of followUps || []) {
      try {
        // Mark as processing
        await supabase
          .from("scheduled_tasks")
          .update({ status: "processing" })
          .eq("id", task.id)

        // Send the follow-up email (integrate with your email service)
        // This is a placeholder - integrate with Mailgun or other service
        console.log("[v0] Would send follow-up to:", task.contact?.email)

        // Mark as completed
        await supabase
          .from("scheduled_tasks")
          .update({ 
            status: "completed",
            completed_at: new Date().toISOString()
          })
          .eq("id", task.id)

        results.followUps.processed++
      } catch (taskError) {
        console.error("[v0] Error processing follow-up:", taskError)
        await supabase
          .from("scheduled_tasks")
          .update({ 
            status: "failed",
            error_message: String(taskError)
          })
          .eq("id", task.id)
        results.followUps.errors++
      }
    }
  } catch (error) {
    console.error("[v0] Error in processScheduledFollowUps:", error)
    results.followUps.errors++
  }
}

async function processEmailSequences(results: { followUps: { processed: number, errors: number }, sequences: { processed: number, errors: number }, withering: { processed: number, errors: number }, breakups: { processed: number, errors: number } }) {
  try {
    // Get contacts in active sequences who are due for next email
    const { data: sequenceContacts, error } = await supabase
      .from("contact_sequences")
      .select(`
        *,
        contact:contacts(id, email, first_name, last_name, organization_id),
        sequence:sequences(id, name, steps)
      `)
      .eq("status", "active")
      .lte("next_step_at", new Date().toISOString())
      .limit(100)

    if (error) {
      console.error("[v0] Error fetching sequence contacts:", error)
      results.sequences.errors++
      return
    }

    for (const enrollment of sequenceContacts || []) {
      try {
        const sequence = enrollment.sequence
        const currentStep = enrollment.current_step || 0
        const steps = sequence?.steps || []

        if (currentStep >= steps.length) {
          // Sequence complete
          await supabase
            .from("contact_sequences")
            .update({ status: "completed", completed_at: new Date().toISOString() })
            .eq("id", enrollment.id)
          continue
        }

        const step = steps[currentStep]
        
        // Send email for this step
        console.log("[v0] Would send sequence email:", {
          contact: enrollment.contact?.email,
          sequence: sequence?.name,
          step: currentStep + 1,
        })

        // Calculate next step time
        const nextStepDelay = steps[currentStep + 1]?.delay_days || 0
        const nextStepAt = new Date()
        nextStepAt.setDate(nextStepAt.getDate() + nextStepDelay)

        // Update enrollment
        await supabase
          .from("contact_sequences")
          .update({
            current_step: currentStep + 1,
            next_step_at: currentStep + 1 < steps.length ? nextStepAt.toISOString() : null,
            last_sent_at: new Date().toISOString(),
          })
          .eq("id", enrollment.id)

        results.sequences.processed++
      } catch (stepError) {
        console.error("[v0] Error processing sequence step:", stepError)
        results.sequences.errors++
      }
    }
  } catch (error) {
    console.error("[v0] Error in processEmailSequences:", error)
    results.sequences.errors++
  }
}

async function checkWitheringContacts(results: { followUps: { processed: number, errors: number }, sequences: { processed: number, errors: number }, withering: { processed: number, errors: number }, breakups: { processed: number, errors: number } }) {
  try {
    // Find contacts with no activity in the last 14 days
    const witheringThreshold = new Date()
    witheringThreshold.setDate(witheringThreshold.getDate() - 14)

    const { data: witheringContacts, error } = await supabase
      .from("contacts")
      .select("id, email, first_name, last_name, organization_id, last_activity_at")
      .lt("last_activity_at", witheringThreshold.toISOString())
      .not("status", "eq", "withering")
      .not("status", "eq", "dead")
      .limit(100)

    if (error) {
      console.error("[v0] Error fetching withering contacts:", error)
      results.withering.errors++
      return
    }

    for (const contact of witheringContacts || []) {
      try {
        // Update contact status to withering
        await supabase
          .from("contacts")
          .update({ status: "withering" })
          .eq("id", contact.id)

        // Create a notification/task for the sales team
        await supabase.from("notifications").insert({
          organization_id: contact.organization_id,
          type: "withering_contact",
          title: `Contact needs attention`,
          message: `${contact.first_name} ${contact.last_name} has had no activity in 14+ days`,
          metadata: { contact_id: contact.id },
        })

        results.withering.processed++
      } catch (contactError) {
        console.error("[v0] Error processing withering contact:", contactError)
        results.withering.errors++
      }
    }
  } catch (error) {
    console.error("[v0] Error in checkWitheringContacts:", error)
    results.withering.errors++
  }
}

async function processBreakupSequences(results: { followUps: { processed: number, errors: number }, sequences: { processed: number, errors: number }, withering: { processed: number, errors: number }, breakups: { processed: number, errors: number } }) {
  try {
    // Find contacts in break-up sequences
    const { data: breakupContacts, error } = await supabase
      .from("contact_sequences")
      .select(`
        *,
        contact:contacts(id, email, first_name, last_name, organization_id)
      `)
      .eq("sequence_type", "breakup")
      .eq("status", "active")
      .lte("next_step_at", new Date().toISOString())
      .limit(50)

    if (error) {
      console.error("[v0] Error fetching breakup contacts:", error)
      results.breakups.errors++
      return
    }

    for (const enrollment of breakupContacts || []) {
      try {
        const currentStep = enrollment.current_step || 0
        const maxSteps = 3 // Typical break-up sequence has 3 emails

        if (currentStep >= maxSteps) {
          // Mark contact as dead deal
          await supabase
            .from("contacts")
            .update({ status: "dead" })
            .eq("id", enrollment.contact?.id)

          await supabase
            .from("contact_sequences")
            .update({ status: "completed" })
            .eq("id", enrollment.id)
          continue
        }

        // Send break-up email
        console.log("[v0] Would send break-up email:", {
          contact: enrollment.contact?.email,
          step: currentStep + 1,
        })

        // Schedule next step (typically 3-5 days apart)
        const nextStepAt = new Date()
        nextStepAt.setDate(nextStepAt.getDate() + 3)

        await supabase
          .from("contact_sequences")
          .update({
            current_step: currentStep + 1,
            next_step_at: nextStepAt.toISOString(),
            last_sent_at: new Date().toISOString(),
          })
          .eq("id", enrollment.id)

        results.breakups.processed++
      } catch (breakupError) {
        console.error("[v0] Error processing breakup:", breakupError)
        results.breakups.errors++
      }
    }
  } catch (error) {
    console.error("[v0] Error in processBreakupSequences:", error)
    results.breakups.errors++
  }
}
