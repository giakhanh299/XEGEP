export async function geocodeAddress(address: string) {
  return {
    address,
    lat: 15.976,
    lng: 108.211,
    source: 'mock'
  };
}

export async function calculateDistanceMatrix(origins: string[], destinations: string[]) {
  return {
    origins,
    destinations,
    rows: origins.map((origin) => ({
      origin,
      elements: destinations.map((destination) => ({
        destination,
        distanceMeters: 12000,
        durationSeconds: 1800
      }))
    })),
    source: 'mock'
  };
}

export async function getOptimizedRoute(points: string[]) {
  return {
    points,
    optimizedPoints: [...points].reverse(),
    source: 'mock'
  };
}

export async function autocompleteAddress(query: string) {
  return {
    query,
    suggestions: query
      ? [`${query} - Dai Loc`, `${query} - Da Nang`, `${query} Bus Station`]
      : [],
    source: 'mock'
  };
}

export async function previewRouteForTrip(points: string[]) {
  return {
    points,
    distanceKm: Math.max(5, points.length * 7),
    durationMinutes: Math.max(15, points.length * 18),
    source: 'mock'
  };
}
