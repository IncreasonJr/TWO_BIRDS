// Supabase Edge Function: paystack-reminders
// Daily scheduled task to send subscription reminders (3 days before, day of expiry, and grace period expiration)
// Deploy with: supabase functions deploy paystack-reminders
// Secrets required: SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL, ONESIGNAL_REST_API_KEY, ONESIGNAL_APP_ID

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Push notification dispatcher using OneSignal
async function dispatchPush(userId: string, title: string, body: string, data: Record<string, any> = {}) {
  const restApiKey = Deno.env.get("ONESIGNAL_REST_API_KEY");
  const appId = Deno.env.get("ONESIGNAL_APP_ID") || "4e342640-422d-4582-aa32-434b8c236e5b";
  if (!restApiKey) return;

  try {
    await fetch("https://api.onesignal.com/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Key ${restApiKey.trim()}`,
      },
      body: JSON.stringify({
        app_id: appId,
        target_channel: "push",
        include_aliases: {
          external_id: [userId],
        },
        headings: { en: title },
        contents: { en: body },
        data,
      }),
    });
  } catch (err) {
    console.warn(`[paystack-reminders] Failed push to ${userId}:`, err);
  }
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response("Database credentials not configured", { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const now = new Date();
    const nowMs = now.getTime();

    // Query all profiles with is_premium = true and a valid premium_expires_at
    const { data: premiumUsers, error } = await supabase
      .from("profiles")
      .select("id, email, is_premium, premium_expires_at, paystack_channel, paystack_authorization_code, last_reminder_sent_at")
      .eq("is_premium", true)
      .not("premium_expires_at", "is", null);

    if (error) {
      console.error("[paystack-reminders] Fetch error:", error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    const summary = {
      evaluated: (premiumUsers || []).length,
      threeDayReminders: 0,
      expiryReminders: 0,
      deactivations: 0,
    };

    for (const user of premiumUsers || []) {
      const expiresAt = new Date(user.premium_expires_at);
      const expiresAtMs = expiresAt.getTime();
      const diffMs = expiresAtMs - nowMs;
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      const isCard = user.paystack_channel === "card" || !!user.paystack_authorization_code;
      const lastReminder = user.last_reminder_sent_at ? new Date(user.last_reminder_sent_at).getTime() : 0;
      const hoursSinceLastReminder = (nowMs - lastReminder) / (1000 * 60 * 60);

      // Scenario 1: Expired past 24-hour Grace Period
      const gracePeriodEndMs = expiresAtMs + 24 * 60 * 60 * 1000;
      if (nowMs > gracePeriodEndMs) {
        await supabase
          .from("profiles")
          .update({
            is_premium: false,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);

        await supabase.from("notifications").insert({
          user_id: user.id,
          type: "system",
          title: "Premium Expired",
          body: "Your Two Birds Premium grace period has ended. Upgrade anytime to reactivate gender filters and your gold badge!",
          data: { is_premium: false, action: "upgrade" },
        });

        await dispatchPush(
          user.id,
          "Premium Expired",
          "Your Two Birds Premium features have expired. Tap to reactivate anytime!",
          { is_premium: false, action: "upgrade" }
        );

        summary.deactivations++;
        continue;
      }

      // Scenario 2: Expiry Day Reminder (Within 24 hours of expiry)
      if (diffDays <= 1 && diffDays > -1 && hoursSinceLastReminder > 18) {
        const title = isCard ? "Premium Renews Today! ⚡" : "Premium Expires Today! 🚨";
        const body = isCard
          ? "Your monthly Two Birds Premium auto-renewal is processing today via your saved card."
          : "Today is the last day of your Two Birds Premium. Renew now to keep your gender filters uninterrupted!";

        await supabase.from("notifications").insert({
          user_id: user.id,
          type: "system",
          title,
          body,
          data: { is_premium: true, action: isCard ? "info" : "renew", expires_at: user.premium_expires_at },
        });

        await dispatchPush(user.id, title, body, { action: isCard ? "info" : "renew" });

        await supabase
          .from("profiles")
          .update({ last_reminder_sent_at: new Date().toISOString() })
          .eq("id", user.id);

        summary.expiryReminders++;
        continue;
      }

      // Scenario 3: 3 Days Remaining Reminder
      if (diffDays <= 3.2 && diffDays > 1.0 && hoursSinceLastReminder > 48) {
        const title = isCard ? "Premium Renews in 3 Days 💳" : "Premium Expires in 3 Days ⏳";
        const body = isCard
          ? "Your Two Birds Premium auto-renewal is scheduled in 3 days. No action needed!"
          : "Your Two Birds Premium expires in 3 days. Renew now with Mobile Money or Card to keep your perks!";

        await supabase.from("notifications").insert({
          user_id: user.id,
          type: "system",
          title,
          body,
          data: { is_premium: true, action: isCard ? "info" : "renew", expires_at: user.premium_expires_at },
        });

        await dispatchPush(user.id, title, body, { action: isCard ? "info" : "renew" });

        await supabase
          .from("profiles")
          .update({ last_reminder_sent_at: new Date().toISOString() })
          .eq("id", user.id);

        summary.threeDayReminders++;
      }
    }

    return new Response(JSON.stringify({ success: true, summary }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("[paystack-reminders] Execution error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
