// Supabase Edge Function: send-push
// Securely dispatches push notifications via OneSignal REST API using server-side secrets
// Deploy with: supabase functions deploy send-push
// Set secret with: supabase secrets set ONESIGNAL_REST_API_KEY=os_v2_app_...

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

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
    const { recipientUserId, title, body, data } = await req.json();

    if (!recipientUserId || !title || !body) {
      return new Response(
        JSON.stringify({ error: "recipientUserId, title, and body are required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const restApiKey = Deno.env.get("ONESIGNAL_REST_API_KEY");
    const appId = Deno.env.get("ONESIGNAL_APP_ID") || "4e342640-422d-4582-aa32-434b8c236e5b";

    if (!restApiKey) {
      console.error("[send-push] Missing ONESIGNAL_REST_API_KEY secret in Supabase");
      return new Response(
        JSON.stringify({ error: "Server push notification credentials not configured." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload = {
      app_id: appId,
      target_channel: "push",
      include_aliases: {
        external_id: [recipientUserId],
      },
      headings: {
        en: title,
      },
      contents: {
        en: body,
      },
      data: data || {},
    };

    const response = await fetch("https://api.onesignal.com/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Key ${restApiKey.trim()}`,
      },
      body: JSON.stringify(payload),
    });

    const resultData = await response.json();

    return new Response(JSON.stringify(resultData), {
      status: response.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("[send-push] Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
