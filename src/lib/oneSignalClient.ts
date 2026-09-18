// OneSignal Web SDK v16 Client Module

declare global {
  interface Window {
    OneSignalDeferred?: Array<(OneSignal: any) => Promise<void> | void>;
    OneSignal?: any;
  }
}

/**
 * Safely retrieves the OneSignal instance via OneSignalDeferred
 */
function getOneSignal(): Promise<any> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(null);
      return;
    }
    if (window.OneSignal) {
      resolve(window.OneSignal);
      return;
    }
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push((OneSignal: any) => {
      resolve(OneSignal);
    });
  });
}

/**
 * Initializes OneSignal user context and links external user ID (e.g. Supabase user UUID)
 */
export async function initOneSignal(userId?: string): Promise<void> {
  try {
    const OneSignal = await getOneSignal();
    if (!OneSignal) return;

    if (userId) {
      await OneSignal.login(userId);
      console.log('[OneSignal] Logged in user with external ID:', userId);
    }
  } catch (err) {
    console.warn('[OneSignal] initOneSignal error:', err);
  }
}

/**
 * Prompts user for browser notification permission
 */
export async function requestPushPermission(): Promise<boolean> {
  try {
    const OneSignal = await getOneSignal();
    if (!OneSignal) {
      if ('Notification' in window) {
        const perm = await Notification.requestPermission();
        return perm === 'granted';
      }
      return false;
    }

    const result = await OneSignal.Notifications.requestPermission();
    return Boolean(result);
  } catch (err) {
    console.warn('[OneSignal] requestPushPermission error:', err);
    return false;
  }
}

/**
 * Disables push notifications for current user/device
 */
export async function optOutOfPush(): Promise<void> {
  try {
    const OneSignal = await getOneSignal();
    if (!OneSignal) return;
    await OneSignal.User.PushSubscription.optOut();
    console.log('[OneSignal] Opted out of push notifications');
  } catch (err) {
    console.warn('[OneSignal] optOutOfPush error:', err);
  }
}

/**
 * Re-enables push notifications for current user/device
 */
export async function optInToPush(): Promise<void> {
  try {
    const OneSignal = await getOneSignal();
    if (!OneSignal) return;
    await OneSignal.User.PushSubscription.optIn();
    console.log('[OneSignal] Opted into push notifications');
  } catch (err) {
    console.warn('[OneSignal] optInToPush error:', err);
  }
}

/**
 * Sets user tags in OneSignal (university, major, age, gender)
 */
export async function setUserTags(tags: Record<string, string | number>): Promise<void> {
  try {
    const OneSignal = await getOneSignal();
    if (!OneSignal) return;
    await OneSignal.User.addTags(tags);
    console.log('[OneSignal] Set user tags successfully:', tags);
  } catch (err) {
    console.warn('[OneSignal] setUserTags error:', err);
  }
}

/**
 * Listens for notification click events
 */
export function onNotificationClick(callback: (event: any) => void): void {
  getOneSignal()
    .then((OneSignal) => {
      if (!OneSignal) return;
      OneSignal.Notifications.addEventListener('click', callback);
    })
    .catch((err) => {
      console.warn('[OneSignal] onNotificationClick listener registration error:', err);
    });
}

/**
 * Returns the current notification permission state
 */
export function getPermissionStatus(): 'granted' | 'denied' | 'default' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'default';
  }
  return Notification.permission as 'granted' | 'denied' | 'default';
}
