import { BookingRecord, TripRecord } from '@/lib/types';
import { calculateTripRevenue, deriveTripStatus, suggestVehicleType } from '@/lib/business/trips';

export function groupBookingsIntoTrips(bookings: BookingRecord[]) {
  const sorted = [...bookings].sort((a, b) => {
    const left = `${a.travelDate ?? ''} ${a.travelTime ?? ''}`.trim();
    const right = `${b.travelDate ?? ''} ${b.travelTime ?? ''}`.trim();
    return left.localeCompare(right);
  });

  const trips: TripRecord[] = [];

  for (const booking of sorted) {
    const maxCapacity = suggestVehicleType(booking.passengerCount) === '4-seat vehicle' ? 4 : 7;
    const trip = trips.find(
      (item) =>
        item.routeType === booking.routeType &&
        item.passengerCount + booking.passengerCount <= item.maxCapacity &&
        Math.abs(item.passengerCount - booking.passengerCount) <= 4
    );

    if (trip) {
      trip.passengerCount += booking.passengerCount;
      trip.totalRevenue += calculateTripRevenue(booking.passengerCount);
      trip.tripStatus = deriveTripStatus(trip.passengerCount, trip.maxCapacity);
      continue;
    }

    trips.push({
      id: `trip_${booking.id}`,
      routeType: booking.routeType,
      passengerCount: booking.passengerCount,
      maxCapacity,
      tripStatus: deriveTripStatus(booking.passengerCount, maxCapacity),
      totalRevenue: calculateTripRevenue(booking.passengerCount),
      createdAt: new Date().toISOString()
    });
  }

  return trips;
}

export function calculateTripScore(trip: TripRecord) {
  const capacityScore = trip.passengerCount / trip.maxCapacity;
  const revenueScore = trip.totalRevenue / 100000;
  return Math.round((capacityScore * 70 + revenueScore * 30) * 100) / 100;
}

export function recommendDepartureTime(bookings: BookingRecord[]) {
  return bookings[0]?.travelTime ?? '07:00';
}
