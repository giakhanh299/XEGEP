import { RouteType, TripRecord, TripStatus, VehicleType } from '@/lib/types';

const BASE_FARE = 90000;

export function calculateTripRevenue(passengerCount: number, farePerPassenger = BASE_FARE) {
  return Math.max(0, passengerCount) * farePerPassenger;
}

export function suggestVehicleType(passengerCount: number): VehicleType {
  return passengerCount <= 4 ? '4-seat vehicle' : '7-seat vehicle';
}

export function isTripReady(trip: Pick<TripRecord, 'passengerCount' | 'maxCapacity' | 'tripStatus'>, forceDeparture = false) {
  return forceDeparture || trip.passengerCount >= trip.maxCapacity || trip.tripStatus === 'ready';
}

export function normalizeRouteType(value: string): RouteType {
  return value === 'da_nang_to_dai_loc' ? 'da_nang_to_dai_loc' : 'dai_loc_to_da_nang';
}

export function deriveTripStatus(passengerCount: number, maxCapacity: number): TripStatus {
  return passengerCount >= maxCapacity ? 'ready' : 'scheduled';
}
