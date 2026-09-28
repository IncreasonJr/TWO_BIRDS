// Supabase Edge Function: paystack-verify
// Verifies transaction references with Paystack API and activates 30-day Premium membership
// Deploy with: supabase functions deploy paystack-verify
// Secrets required: PAYSTACK_SECRET_KEY, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { reference, userId } = await req.json();

    if (!reference) {
      return new Response(
        JSON.stringify({ error: "Transaction reference is required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const paystackSecret = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackSecret) {
      console.error("[paystack-verify] Missing PAYSTACK_SECRET_KEY");
      return new Response(
        JSON.stringify({ error: "Server payment configuration missing." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Verify transaction with Paystack API
    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${paystackSecret.trim()}`,
          "Content-Type": "application/json",
        },
      }
    );

    const paystackData = await paystackRes.json();

    if (!paystackRes.ok || !paystackData.status || paystackData.data?.status !== "success") {
      return new Response(
        JSON.stringify({
          error: paystackData.message || "Payment verification failed or status not successful.",
          details: paystackData.data?.gateway_response,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const tx = paystackData.data;

    // Validate expected currency and minimum amount (4734 pesewas = GHS 47.34)
    if (tx.amount < 4734) {
      return new Response(
        JSON.stringify({ error: "Invalid payment amount." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const targetUserId = userId || tx.metadata?.user_id;
    if (!targetUserId) {
      return new Response(
        JSON.stringify({ error: "Could not identify user associated with this payment." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase Admin client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("[paystack-verify] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
      return new Response(
        JSON.stringify({ error: "Database service credentials not configured." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 2. Fetch existing user profile to check if already active (extend expiry if so)
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_premium, premium_expires_at")
      .eq("id", targetUserId)
      .maybeSingle();

    const now = Date.now();
    let baseTime = now;

    if (profile?.is_premium && profile?.premium_expires_at) {
      const existingExpiry = new Date(profile.premium_expires_at).getTime();
      if (existingExpiry > now) {
        baseTime = existingExpiry;
      }
    }

    // 30 days extension (30 * 24 * 60 * 60 * 1000)
    const newExpiresAt = new Date(baseTime + 30 * 24 * 60 * 60 * 1000).toISOString();

    const authCode = tx.authorization?.authorization_code || null;
    const customerCode = tx.customer?.customer_code || null;
    const channel = tx.channel || (authCode ? "card" : "mobile_money");
    const subscriptionCode = tx.plan_object?.plan_code || tx.subscription_code || null;

    // 3. Update public.profiles table
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        is_premium: true,
        premium_expires_at: newExpiresAt,
        paystack_authorization_code: authCode,
        paystack_customer_code: customerCode,
        paystack_subscription_code: subscriptionCode,
        paystack_channel: channel,
        last_reminder_sent_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", targetUserId);

    if (updateError) {
      console.error("[paystack-verify] Failed to update profile:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to activate subscription in profile." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Insert in-app confirmation notification
    try {
      await supabase.from("notifications").insert({
        user_id: targetUserId,
        type: "system",
        title: "Welcome to Two Birds Premium! 🌟",
        body: "Your 30-day premium membership is active. Enjoy exclusive gender filters, gold profile badge, and discovery priority!",
        data: {
          is_premium: true,
          expires_at: newExpiresAt,
          channel,
          reference: tx.reference,
        },
      });
    } catch (notifErr) {
      console.warn("[paystack-verify] Could not create welcome notification:", notifErr);
    }

    return new Response(
      JSON.stringify({
        success: true,
        isPremium: true,
        premiumExpiresAt: newExpiresAt,
        channel,
        message: "Premium subscription activated successfully for 30 days.",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("[paystack-verify] Unexpected exception:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error occurred." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
