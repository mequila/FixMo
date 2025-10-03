/**
 * Calculate distance between two geographic coordinates using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of Earth in kilometers
  
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  const distance = R * c; // Distance in kilometers
  
  return distance;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format distance for display
 * @param distanceKm - Distance in kilometers
 * @returns Formatted string like "2.5 km" or "850 m"
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    // Show in meters if less than 1 km
    const meters = Math.round(distanceKm * 1000);
    return `${meters} m`;
  } else {
    // Show in kilometers with 1 decimal place
    return `${distanceKm.toFixed(1)} km`;
  }
}

/**
 * Parse exact_location string to coordinates
 * Expected format: "latitude,longitude" or "14.5547,121.0244"
 */
export function parseCoordinates(exactLocation: string | undefined): { lat: number; lng: number } | null {
  if (!exactLocation) return null;
  
  const parts = exactLocation.split(',').map(part => part.trim());
  if (parts.length !== 2) return null;
  
  const lat = parseFloat(parts[0]);
  const lng = parseFloat(parts[1]);
  
  if (isNaN(lat) || isNaN(lng)) return null;
  
  return { lat, lng };
}

/**
 * Sort providers by distance from user location
 */
export function sortProvidersByDistance<T extends { distance?: number }>(
  providers: T[]
): T[] {
  return [...providers].sort((a, b) => {
    const distanceA = a.distance ?? Infinity;
    const distanceB = b.distance ?? Infinity;
    return distanceA - distanceB;
  });
}
