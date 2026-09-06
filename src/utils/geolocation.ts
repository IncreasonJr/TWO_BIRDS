export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

// Default fallback coordinates (Stanford University Campus)
export const DEFAULT_CAMPUS_LOCATION: GeoCoordinates = {
  latitude: 37.4275,
  longitude: -122.1697,
};

/**
 * Get current user location using browser Geolocation API.
 * Falls back to default campus coordinates if denied or unavailable.
 */
export async function getUserLocation(): Promise<GeoCoordinates> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.warn('[Geolocation] Geolocation API not supported by browser. Using campus fallback.');
      resolve(DEFAULT_CAMPUS_LOCATION);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.warn('[Geolocation] Error or denied permission:', error.message);
        resolve(DEFAULT_CAMPUS_LOCATION);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  });
}

/**
 * Compute Haversine distance between two sets of lat/lng coordinates in miles.
 */
export function calculateDistanceMiles(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const EARTH_RADIUS_MILES = 3958.8; // Radius of Earth in miles

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const rLat1 = toRad(lat1);
  const rLat2 = toRad(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(rLat1) * Math.cos(rLat2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round((EARTH_RADIUS_MILES * c) * 10) / 10;
}

function toRad(value: number): number {
  return (value * Math.PI) / 180;
}
