export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase correctly (fixed double initialization)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase Environment Variables");
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Verify cron secret to prevent unauthorized access
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.warn("[v0] CRON_SECRET not set in Environment Variables");
    return false;
  }

  return authHeader === `Bearer ${cronSecret}`;
}

interface CronResults {
  scheduledTasks: { processed: number; errors: number };
  sequences: { processed: number; errors: number };
  withering: { processed: number; errors: number };
  breakups: { processed: number; errors: number };
}

export async function GET(request: NextRequest) {
  // 1. Security Check
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startTime = Date.now();
  const results: CronResults = {
    scheduledTasks: { processed: 0, errors: 0 },
    sequences: { processed: 0, errors: 0 },
    withering: { processed: 0, errors: 0 },
    breakups: { processed: 0, errors: 0 },
  };

  try {
    // Run processes sequentially to avoid hitting Supabase connection limits
    await processScheduledTasks(results);
    await processEmailSequences(results);
    await checkWitheringContacts(results);
    await processBreakupSequences(results);

    const duration = Date.now() - startTime;
    console.log("[v0] Cron job completed", { results, durationMs: duration });

    return NextResponse.json({
      success: true,
      message: "Automations processed",
      results,
      durationMs: duration,
    });
  } catch (error) {
    console.error("[v0] Cron job fatal error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}

// --- HELPER FUNCTIONS ---

async function processScheduledTasks(results: CronResults) {
  try {
    const { data: tasks, error } = await supabase
      .from("scheduled_tasks")
      .select(`
        *,
        contact:contacts(id, email, first_name, last_name, tenant_id)
      `)
      .eq("status", "pending")
      .lte("scheduled_for", new Date().toISOString())
      .limit(100);

    if (error) throw error;

    for (const task of tasks || []) {
      try {
        if (task.attempts >= task.max_attempts) {
          await supabase.from("scheduled_tasks")
            .update({ status: "failed", error_message: "Max attempts exceeded" })
            .eq("id", task.id);
          results.scheduledTasks.errors++;
          continue;
        }

        await supabase.from("scheduled_tasks")
          .update({ 
            status: "processing", 
            attempts: (task.attempts || 0) + 1,
            last_attempt_at: new Date().toISOString() 
          })
          .eq("id", task.id);

        let success = false;
        switch (task.task_type) {
          case "send_email": success = await handleSendEmailTask(task); break;
          case "follow_up": success = await handleFollowUpTask(task); break;
          case "check_engagement": success = await handleEngagementCheckTask(task); break;
          case "update_status": success = await handleStatusUpdateTask(task); break;
          default: success = true;
        }

        await supabase
