// OneSignal REST API Helper Module

interface SendPushNotificationResult {
  success: boolean;
  error?: string;
  data?: any;
}

/**
 * Dispatches a push notification to a specific recipient by their external user ID
 * (e.g. Supabase user UUID).
 * 
 * Note: Client-side helper for development & direct push dispatch.
 * In a future phase, this should be moved to a secure Supabase Edge Function.
 */
export async function sendPushNotification(
  recipientUserId: string,
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<SendPushNotificationResult> {
  const appId =
    import.meta.env.VITE_ONESIGNAL_APP_ID || '4e342640-422d-4582-aa32-434b8c236e5b';
  const restApiKey = import.meta.env.VITE_ONESIGNAL_REST_API_KEY;

  if (
    !restApiKey ||
    restApiKey.includes('PASTE YOUR') ||
    restApiKey.includes('YOUR_REST_API_KEY_HERE') ||
    restApiKey.includes('your-rest-api-key-here')
  ) {
    console.warn(
      '[OneSignal API] Missing or placeholder VITE_ONESIGNAL_REST_API_KEY. Skipping push notification.'
    );
    return {
      success: false,
      error: 'OneSignal REST API key is not configured in environment variables.',
    };
  }

  if (!recipientUserId) {
    return {
      success: false,
      error: 'Recipient user ID is required to send push notification.',
    };
  }

  const payload = {
    app_id: appId,
    target_channel: 'push',
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

  try {
    const response = await fetch('https://api.onesignal.com/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Key ${restApiKey.trim()}`,
      },
      body: JSON.stringify(payload),
    });

    const resultData = await response.json().catch(() => null);

    if (!response.ok) {
      console.warn('[OneSignal API] Push notification delivery error:', resultData);
      return {
        success: false,
        error: resultData?.errors?.[0] || resultData?.error || `HTTP Error ${response.status}`,
        data: resultData,
      };
    }

    console.log('[OneSignal API] Push notification sent successfully to:', recipientUserId, resultData);
    return {
      success: true,
      data: resultData,
    };
  } catch (err: any) {
    console.error('[OneSignal API] Unexpected fetch error while sending push notification:', err);
    return {
      success: false,
      error: err?.message || 'Failed to dispatch push notification',
    };
  }
}
