// Supabase Edge Function: paystack-webhook
// Securely receives and processes Paystack recurring webhooks (charge.success, subscription.create, subscription.disable)
// Deploy with: supabase functions deploy paystack-webhook
// Secrets required: PAYSTACK_SECRET_KEY, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

// Helper to compute HMAC SHA512 using Web Crypto API in Deno
async function verifyPaystackSignature(bodyText: string, signature: string, secret: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-512" },
      false,
      ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(bodyText));
    const hashArray = Array.from(new Uint8Array(signatureBuffer));
    const computedHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    return computedHex.toLowerCase() === signature.toLowerCase();
  } catch (err) {
    console.error("[paystack-webhook] Signature verification error:", err);
    return false;
  }
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "x-paystack-signature, content-type",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const paystackSecret = Deno.env.get("PAYSTACK_SECRET_KEY");
    const signature = req.headers.get("x-paystack-signature");

    const rawBody = await req.text();

    if (!paystackSecret) {
      console.error("[paystack-webhook] Missing PAYSTACK_SECRET_KEY");
      return new Response("Server configuration error", { status: 500 });
    }

    if (!signature) {
      return new Response("Missing signature header", { status: 401 });
    }

    const isValid = await verifyPaystackSignature(rawBody, signature, paystackSecret.trim());
    if (!isValid) {
      console.warn("[paystack-webhook] Invalid signature rejected");
      return new Response("Unauthorized", { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const { event, data } = payload;
    console.log(`[paystack-webhook] Processing event: ${event}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response("Server error", { status: 500 });
    }
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    switch (event) {
      // 1. Successful Charge (initial or auto-renew recurring card charge)
      case "charge.success": {
        const userId = data.metadata?.user_id;
        const customerEmail = data.customer?.email;

        let query = supabase.from("profiles").select("id, is_premium, premium_expires_at");
        if (userId) {
          query = query.eq("id", userId);
        } else if (customerEmail) {
          query = query.eq("email", customerEmail);
        } else {
          console.warn("[paystack-webhook] No userId or email found in charge.success");
          return new Response("User not found", { status: 200 });
        }

        const { data: profile } = await query.maybeSingle();
        if (!profile) {
          console.warn("[paystack-webhook] User profile not found for charge");
          return new Response("OK", { status: 200 });
        }

        const now = Date.now();
        let baseTime = now;
        if (profile.is_premium && profile.premium_expires_at) {
          const existingExpiry = new Date(profile.premium_expires_at).getTime();
          if (existingExpiry > now) {
            baseTime = existingExpiry;
          }
        }

        const extendedExpiresAt = new Date(baseTime + 30 * 24 * 60 * 60 * 1000).toISOString();
        const authCode = data.authorization?.authorization_code || null;
        const channel = data.channel || (authCode ? "card" : "mobile_money");

        await supabase
          .from("profiles")
          .update({
            is_premium: true,
            premium_expires_at: extendedExpiresAt,
            paystack_authorization_code: authCode,
            paystack_customer_code: data.customer?.customer_code || null,
            paystack_channel: channel,
            last_reminder_sent_at: null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", profile.id);

        // Notification
        await supabase.from("notifications").insert({
          user_id: profile.id,
          type: "system",
          title: "Premium Renewed Successfully 💳",
          body: "Your monthly Two Birds Premium subscription has been renewed for another 30 days. Thank you!",
          data: {
            reference: data.reference,
            expires_at: extendedExpiresAt,
          },
        });
        break;
      }

      // 2. Subscription Created
      case "subscription.create": {
        const subscriptionCode = data.subscription_code;
        const customerEmail = data.customer?.email;

        if (customerEmail && subscriptionCode) {
          await supabase
            .from("profiles")
            .update({
              paystack_subscription_code: subscriptionCode,
              updated_at: new Date().toISOString(),
            })
            .eq("email", customerEmail);
        }
        break;
      }

      // 3. Subscription Disabled / Cancelled
      case "subscription.disable": {
        const subscriptionCode = data.subscription_code;
        const customerEmail = data.customer?.email;

        let query = supabase.from("profiles").update({
          paystack_subscription_code: null,
          updated_at: new Date().toISOString(),
        });

        if (subscriptionCode) {
          query = query.eq("paystack_subscription_code", subscriptionCode);
        } else if (customerEmail) {
          query = query.eq("email", customerEmail);
        }

        await query;
        break;
      }

      default:
        console.log(`[paystack-webhook] Unhandled event type: ${event}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("[paystack-webhook] Uncaught handler error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
