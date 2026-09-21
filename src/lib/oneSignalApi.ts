// OneSignal REST API Helper Module (Secure Backend Edge Function Integration)
import { supabase } from './supabaseClient';

interface SendPushNotificationResult {
  success: boolean;
  error?: string;
  data?: any;
}

/**
 * Dispatches a push notification to a specific recipient by their external user ID
 * (e.g. Supabase user UUID) via the secure Supabase Edge Function `send-push`.
 * 
 * Security Note:
 * The OneSignal REST API Key is an administrative secret stored exclusively in Supabase Secrets.
 * It is NEVER exposed to or bundled in the client application.
 */
export async function sendPushNotification(
  recipientUserId: string,
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<SendPushNotificationResult> {
  if (!recipientUserId) {
    return {
      success: false,
      error: 'Recipient user ID is required to send push notification.',
    };
  }

  try {
    const { data: edgeData, error: edgeError } = await supabase.functions.invoke('send-push', {
      body: {
        recipientUserId,
        title,
        body,
        data: data || {},
      },
    });

    if (edgeError) {
      // Graceful fallback: Edge function not deployed yet or returning error.
      // In-app notifications in Supabase database already work seamlessly.
      console.warn('[OneSignal API] Push dispatch notice:', edgeError.message);
      return {
        success: false,
        error: edgeError.message,
      };
    }

    return {
      success: true,
      data: edgeData,
    };
  } catch (err: any) {
    console.warn('[OneSignal API] Unexpected error invoking push dispatch function:', err);
    return {
      success: false,
      error: err?.message || 'Failed to dispatch push notification',
    };
  }
}
