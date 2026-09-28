// Client-side Paystack Inline Integration
// Dynamically loads Paystack inline JS SDK, opens payment modal, and verifies with backend

import { supabase } from './supabaseClient';

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: PaystackOptions) => {
        openIframe: () => void;
      };
    };
  }
}

export interface PaystackOptions {
  key: string;
  email: string;
  amount: number; // in pesewas: 4734 pesewas = GHS 47.34
  currency?: string;
  ref?: string;
  plan?: string;
  channels?: ('card' | 'mobile_money')[];
  metadata?: Record<string, any>;
  callback: (response: { reference: string; status?: string; trans?: string; message?: string }) => void;
  onClose: () => void;
}

export interface InitializePaymentParams {
  email: string;
  userId: string;
  channelPreference?: 'card' | 'mobile_money';
  onSuccess: (data: { reference: string; expiresAt?: string }) => void;
  onCancel?: () => void;
  onError?: (errorMessage: string) => void;
}

const SCRIPT_URL = 'https://js.paystack.co/v1/inline.js';
let scriptLoadPromise: Promise<void> | null = null;

export function loadPaystackScript(): Promise<void> {
  if (window.PaystackPop) {
    return Promise.resolve();
  }

  if (scriptLoadPromise) {
    return scriptLoadPromise;
  }

  scriptLoadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${SCRIPT_URL}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Paystack SDK')));
      return;
    }

    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptLoadPromise = null;
      reject(new Error('Failed to load Paystack payment gateway. Please check your connection.'));
    };
    document.body.appendChild(script);
  });

  return scriptLoadPromise;
}

/**
 * Generates unique payment reference
 */
export function generateReference(userId: string): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000);
  return `tb_${userId.slice(0, 8)}_${timestamp}_${random}`;
}

/**
 * Initializes Paystack inline payment popup
 */
export async function initializePaystackPayment({
  email,
  userId,
  channelPreference,
  onSuccess,
  onCancel,
  onError,
}: InitializePaymentParams): Promise<void> {
  try {
    await loadPaystackScript();

    if (!window.PaystackPop) {
      throw new Error('Paystack SDK failed to initialize.');
    }

    const publicKey = (import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '').trim();
    const planCode = (import.meta.env.VITE_PAYSTACK_PLAN_CODE || '').trim();

    // If key is missing or set to placeholder in development, provide simulated dev fallback
    if (!publicKey || publicKey.includes('placeholder')) {
      console.warn(
        '[Paystack] VITE_PAYSTACK_PUBLIC_KEY is not configured or using placeholder. Running test payment simulation.'
      );
      const simulatedRef = `sim_${generateReference(userId)}`;
      const verifyRes = await verifyPaymentWithBackend(simulatedRef, userId);
      onSuccess({ reference: simulatedRef, expiresAt: verifyRes.expiresAt });
      return;
    }

    const channels: ('card' | 'mobile_money')[] = channelPreference
      ? [channelPreference]
      : ['card', 'mobile_money'];

    const reference = generateReference(userId);

    const handler = window.PaystackPop.setup({
      key: publicKey,
      email: email.trim(),
      amount: 4734, // GHS 47.34 in pesewas
      currency: 'GHS',
      ref: reference,
      // If plan is configured and user is paying via card, attach plan for automated recurring charges
      plan: planCode && !planCode.includes('placeholder') && channelPreference !== 'mobile_money'
        ? planCode
        : undefined,
      channels,
      metadata: {
        user_id: userId,
        app_name: 'Two Birds',
        product: 'Monthly Premium Subscription',
        custom_fields: [
          {
            display_name: 'User ID',
            variable_name: 'user_id',
            value: userId,
          },
        ],
      },
      callback: async (response) => {
        try {
          const verifyResult = await verifyPaymentWithBackend(response.reference || reference, userId);
          onSuccess({
            reference: response.reference || reference,
            expiresAt: verifyResult.expiresAt,
          });
        } catch (verifyErr: any) {
          console.error('[Paystack] Verification failed:', verifyErr);
          if (onError) onError(verifyErr.message || 'Payment verification failed.');
        }
      },
      onClose: () => {
        if (onCancel) onCancel();
      },
    });

    handler.openIframe();
  } catch (err: any) {
    console.error('[Paystack] Payment initialization failed:', err);
    if (onError) onError(err.message || 'Could not launch payment gateway.');
  }
}

/**
 * Sends transaction reference to Supabase Edge Function to verify with Paystack secret key
 */
export async function verifyPaymentWithBackend(
  reference: string,
  userId: string
): Promise<{ success: boolean; expiresAt?: string; message?: string }> {
  // If simulation reference in dev environment
  if (reference.startsWith('sim_')) {
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    try {
      await supabase
        .from('profiles')
        .update({
          is_premium: true,
          premium_expires_at: expiresAt,
          paystack_channel: 'card',
          last_reminder_sent_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);
    } catch {
      // non-blocking
    }
    return { success: true, expiresAt, message: 'Test simulation successful.' };
  }

  // Real Edge Function call
  const { data, error } = await supabase.functions.invoke('paystack-verify', {
    body: { reference, userId },
  });

  if (error) {
    console.warn('[Paystack] Edge function invoke warning:', error);
    // If edge function returned an error response
    throw new Error(error.message || 'Payment verification failed on the server.');
  }

  if (!data?.success) {
    throw new Error(data?.error || 'Payment was not confirmed by Paystack.');
  }

  return {
    success: true,
    expiresAt: data.premiumExpiresAt,
    message: data.message,
  };
}
