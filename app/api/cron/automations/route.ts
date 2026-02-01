export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Use service role for cron operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key';

const supabase = createClient(supabaseUrl, supabaseKey);
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

interface CronResults {
  scheduledTasks: { processed: number; errors: number }
  sequences: { processed: number; errors: number }
  withering: { processed: number; errors: number }
  breakups: { processed: number; errors: number }
}

export async function GET(request: NextRequest) {
  // Verify the request is from Vercel Cron
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const startTime = Date.now()
  const results: CronResults = {
    scheduledTasks: { processed: 0, errors: 0 },
    sequences: { processed: 0, errors: 0 },
    withering: { processed: 0, errors: 0 },
    breakups: { processed: 0, errors: 0 },
  }

  try {
    // 1. Process scheduled tasks (follow-ups, etc.)
    await processScheduledTasks(results)

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

async function processScheduledTasks(results: CronResults) {
  try {
    // Get all scheduled tasks that are due (using tenant-based schema)
    const { data: tasks, error } = await supabase
      .from("scheduled_tasks")
      .select(`
        *,
        contact:contacts(id, email, first_name, last_name, tenant_id)
      `)
      .eq("status", "pending")
      .lte("scheduled_for", new Date().toISOString())
      .limit(100)

    if (error) {
      console.error("[v0] Error fetching scheduled tasks:", error)
      results.scheduledTasks.errors++
      return
    }

    for (const task of tasks || []) {
      try {
        // Check max attempts
        if (task.attempts >= task.max_attempts) {
          await supabase
            .from("scheduled_tasks")
            .update({ 
              status: "failed",
              error_message: "Max attempts exceeded"
            })
            .eq("id", task.id)
          results.scheduledTasks.errors++
          continue
        }

        // Mark as processing and increment attempts
        await supabase
          .from("scheduled_tasks")
          .update({ 
            status: "processing",
            attempts: task.attempts + 1,
            last_attempt_at: new Date().toISOString()
          })
          .eq("id", task.id)

        // Process based on task type
        let success = false
        switch (task.task_type) {
          case "send_email":
            success = await handleSendEmailTask(task)
            break
          case "follow_up":
            success = await handleFollowUpTask(task)
            break
          case "check_engagement":
            success = await handleEngagementCheckTask(task)
            break
          case "update_status":
            success = await handleStatusUpdateTask(task)
            break
          default:
            console.log("[v0] Unknown task type:", task.task_type)
            success = true // Mark unknown tasks as complete
        }

        // Mark as completed or failed
        await supabase
          .from("scheduled_tasks")
          .update({ 
            status: success ? "completed" : "pending",
            completed_at: success ? new Date().toISOString() : null,
            result: { success }
          })
          .eq("id", task.id)

        if (success) {
          results.scheduledTasks.processed++
        } else {
          results.scheduledTasks.errors++
        }
      } catch (taskError) {
        console.error("[v0] Error processing task:", taskError)
        await supabase
          .from("scheduled_tasks")
          .update({ 
            status: "pending", // Allow retry
            error_message: String(taskError)
          })
          .eq("id", task.id)
        results.scheduledTasks.errors++
      }
    }
  } catch (error) {
    console.error("[v0] Error in processScheduledTasks:", error)
    results.scheduledTasks.errors++
  }
}

async function handleSendEmailTask(task: { payload: { to?: string; subject?: string; body?: string }; contact?: { email: string } }) {
  const { to, subject, body } = task.payload || {}
  const recipientEmail = to || task.contact?.email
  
  if (!recipientEmail) {
    console.error("[v0] No recipient email for send_email task")
    return false
  }

  // TODO: Integrate with Mailgun to send email
  console.log("[v0] Would send email:", { to: recipientEmail, subject })
  return true
}

async function handleFollowUpTask(task: { contact?: { id: string; email: string; first_name: string; tenant_id: string } }) {
  if (!task.contact) return false

  // Create a follow-up notification
  const { data: tenantUsers } = await supabase
    .from("tenant_users")
    .select("user_id")
    .eq("tenant_id", task.contact.tenant_id)

  if (tenantUsers) {
    for (const tu of tenantUsers) {
      await supabase.from("notifications").insert({
        tenant_id: task.contact.tenant_id,
        user_id: tu.user_id,
        title: "Follow-up Reminder",
        message: `Time to follow up with ${task.contact.first_name}`,
        type: "action_required",
        contact_id: task.contact.id,
      })
    }
  }

  return true
}

async function handleEngagementCheckTask(task: { contact?: { id: string } }) {
  if (!task.contact) return false
  // Placeholder for engagement analysis
  console.log("[v0] Checking engagement for contact:", task.contact.id)
  return true
}

async function handleStatusUpdateTask(task: { contact?: { id: string }; payload?: { new_status?: string } }) {
  if (!task.contact || !task.payload?.new_status) return false

  await supabase
    .from("contacts")
    .update({ status: task.payload.new_status })
    .eq("id", task.contact.id)

  return true
}

async function processEmailSequences(results: CronResults) {
  try {
    // Get contacts in active sequences who are due for next email
    const { data: sequenceContacts, error } = await supabase
      .from("contact_sequences")
      .select(`
        *,
        contact:contacts(id, email, first_name, last_name, tenant_id),
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
        const sequence = enrollment.sequence as { id: string; name: string; steps: Array<{ delay_days?: number; subject?: string; body?: string }> } | null
        const currentStep = enrollment.current_step || 0
        const steps = sequence?.steps || []

        if (currentStep >= steps.length) {
          // Sequence complete
          await supabase
            .from("contact_sequences")
            .update({ 
              status: "completed", 
              completed_at: new Date().toISOString() 
            })
            .eq("id", enrollment.id)

          // Update sequence stats
          await supabase.rpc("increment_sequence_completed", { sequence_id: sequence?.id })
          continue
        }

        const step = steps[currentStep]
        
        // TODO: Send email for this step via Mailgun
        console.log("[v0] Would send sequence email:", {
          contact: (enrollment.contact as { email?: string })?.email,
          sequence: sequence?.name,
          step: currentStep + 1,
          subject: step?.subject,
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
            emails_sent: enrollment.emails_sent + 1,
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

async function checkWitheringContacts(results: CronResults) {
  try {
    // Find contacts with no activity in the last 14 days
    const witheringThreshold = new Date()
    witheringThreshold.setDate(witheringThreshold.getDate() - 14)

    const { data: witheringContacts, error } = await supabase
      .from("contacts")
      .select("id, email, first_name, last_name, tenant_id, last_contact_date")
      .lt("last_contact_date", witheringThreshold.toISOString())
      .neq("status", "Withering")
      .neq("status", "Dead")
      .limit(100)

    if (error) {
      console.error("[v0] Error fetching withering contacts:", error)
      results.withering.errors++
      return
    }

    for (const contact of witheringContacts || []) {
      try {
        // Update contact status to Withering
        await supabase
          .from("contacts")
          .update({ status: "Withering" })
          .eq("id", contact.id)

        // Create notifications for tenant users
        if (contact.tenant_id) {
          const { data: tenantUsers } = await supabase
            .from("tenant_users")
            .select("user_id")
            .eq("tenant_id", contact.tenant_id)

          if (tenantUsers) {
            const notifications = tenantUsers.map((tu) => ({
              tenant_id: contact.tenant_id,
              user_id: tu.user_id,
              title: "Contact Needs Attention",
              message: `${contact.first_name} ${contact.last_name} has had no activity in 14+ days`,
              type: "warning" as const,
              contact_id: contact.id,
            }))

            await supabase.from("notifications").insert(notifications)
          }
        }

        // Log the event
        await supabase.from("conversation_events").insert({
          contact_id: contact.id,
          tenant_id: contact.tenant_id,
          event_type: "status_changed",
          event_data: {
            old_status: "active",
            new_status: "Withering",
            reason: "No activity in 14+ days",
          },
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

async function processBreakupSequences(results: CronResults) {
  try {
    // Find contacts in break-up sequences (status = 'active' and is in a breakup sequence)
    const { data: breakupContacts, error } = await supabase
      .from("contact_sequences")
      .select(`
        *,
        contact:contacts(id, email, first_name, last_name, tenant_id),
        sequence:sequences(id, name, steps)
      `)
      .eq("status", "active")
      .lte("next_step_at", new Date().toISOString())
      .limit(50)

    if (error) {
      console.error("[v0] Error fetching breakup contacts:", error)
      results.breakups.errors++
      return
    }

    // Filter for breakup sequences
    const breakupEnrollments = (breakupContacts || []).filter((enrollment) => {
      const sequence = enrollment.sequence as { name?: string } | null
      return sequence?.name?.toLowerCase().includes("break") || 
             sequence?.name?.toLowerCase().includes("goodbye")
    })

    for (const enrollment of breakupEnrollments) {
      try {
        const sequence = enrollment.sequence as { steps?: Array<{ delay_days?: number }> } | null
        const currentStep = enrollment.current_step || 0
        const steps = sequence?.steps || []
        const maxSteps = steps.length || 3

        if (currentStep >= maxSteps) {
          // Mark contact as Dead
          const contact = enrollment.contact as { id: string; tenant_id: string } | null
          if (contact) {
            await supabase
              .from("contacts")
              .update({ status: "Dead" })
              .eq("id", contact.id)

            // Log the event
            await supabase.from("conversation_events").insert({
              contact_id: contact.id,
              tenant_id: contact.tenant_id,
              event_type: "status_changed",
              event_data: {
                old_status: "Withering",
                new_status: "Dead",
                reason: "Completed break-up sequence with no response",
              },
            })
          }

          await supabase
            .from("contact_sequences")
            .update({ status: "completed", completed_at: new Date().toISOString() })
            .eq("id", enrollment.id)
          continue
        }

        // TODO: Send break-up email via Mailgun
        console.log("[v0] Would send break-up email:", {
          contact: (enrollment.contact as { email?: string })?.email,
          step: currentStep + 1,
        })

        // Schedule next step (typically 3-5 days apart)
        const nextDelay = steps[currentStep]?.delay_days || 3
        const nextStepAt = new Date()
        nextStepAt.setDate(nextStepAt.getDate() + nextDelay)

        await supabase
          .from("contact_sequences")
          .update({
            current_step: currentStep + 1,
            next_step_at: nextStepAt.toISOString(),
            emails_sent: enrollment.emails_sent + 1,
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
