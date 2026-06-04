import { BookingRecord, TripRecord } from '@/lib/types';
import { calculateTripRevenue, deriveTripStatus, suggestVehicleType } from '@/lib/business/trips';

export function groupBookingsIntoTrips(bookings: BookingRecord[]) {
  const trips: TripRecord[] = [];
  const sorted = [...bookings].sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  for (const booking of sorted) {
    const capacity = suggestVehicleType(booking.passengerCount) === '4-seat vehicle' ? 4 : 7;
    const existing = trips.find(
      (trip) => trip.routeType === booking.routeType && trip.passengerCount + booking.passengerCount <= trip.maxCapacity
    );

    if (existing) {
      existing.passengerCount += booking.passengerCount;
      existing.totalRevenue += calculateTripRevenue(booking.passengerCount);
      existing.tripStatus = deriveTripStatus(existing.passengerCount, existing.maxCapacity);
      continue;
    }

    trips.push({
      id: `trip_${booking.id}`,
      routeType: booking.routeType,
      passengerCount: booking.passengerCount,
      maxCapacity: capacity,
      tripStatus: deriveTripStatus(booking.passengerCount, capacity),
      totalRevenue: calculateTripRevenue(booking.passengerCount),
      createdAt: new Date().toISOString()
    });
  }

  return trips;
}

export function optimizePickupOrder(bookings: BookingRecord[]) {
  return [...bookings].sort((a, b) => {
    const left = `${a.pickupLocation} ${a.travelTime ?? ''}`.trim();
    const right = `${b.pickupLocation} ${b.travelTime ?? ''}`.trim();
    return left.localeCompare(right);
  });
}

export function estimateTripScore(bookings: BookingRecord[]) {
  const passengers = bookings.reduce((sum, booking) => sum + booking.passengerCount, 0);
  return passengers * 10 + bookings.length * 3;
}

export function predictDemand() {
  return {
    peakHours: ['06:30', '07:15', '17:30', '18:15'],
    routePreference: ['dai_loc_to_da_nang', 'da_nang_to_dai_loc'],
    confidence: 0.62
  };
}
