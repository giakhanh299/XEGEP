import { BookingRecord, BookingStatus, TripRecord } from '@/lib/types';
import { DriverPayoutRecord, PaymentRecord } from '@/lib/types';

export const mockMetrics = [
  { label: 'Total Bookings', value: '128', detail: 'Across both core routes.' },
  { label: 'Active Trips', value: '14', detail: 'Trips currently in progress.' },
  { label: 'Completed Trips', value: '94', detail: 'Successfully finished journeys.' },
  { label: 'Revenue', value: '11.8M', detail: 'Estimated monthly revenue (VND).' }
];

export const routeHighlights = [
  { label: 'Dai Loc → Da Nang', description: 'Morning and evening commuter demand.' },
  { label: 'Da Nang → Dai Loc', description: 'Return trips and inbound passenger flow.' }
];

export const mockCustomerBooking: BookingRecord = {
  id: 'booking_1',
  customerName: 'Pham Minh Tuan',
  phone: '0901 234 567',
  pickupLocation: 'Dai Loc Bus Station',
  dropoffLocation: 'Da Nang Center',
  travelDate: '2026-06-03',
  travelTime: '06:30',
  pickupLat: null,
  pickupLng: null,
  dropoffLat: null,
  dropoffLng: null,
  passengerCount: 3,
  notes: 'Need rear seat space for bags.',
  status: 'matching',
  routeType: 'dai_loc_to_da_nang',
  paymentStatus: 'unpaid',
  paymentMethod: 'cash',
  tripId: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export const mockBookings: BookingRecord[] = [
  mockCustomerBooking,
  {
    ...mockCustomerBooking,
    id: 'booking_2',
    customerName: 'Le Thi Hoa',
    pickupLocation: 'Da Nang Airport',
    dropoffLocation: 'Dai Loc Town',
    status: 'confirmed'
  },
  {
    ...mockCustomerBooking,
    id: 'booking_3',
    customerName: 'Tran Quoc Viet',
    passengerCount: 1,
    status: 'driver_assigned'
  }
];

export const mockTrips: TripRecord[] = [
  {
    id: 'trip_1',
    routeType: 'dai_loc_to_da_nang',
    routeLabel: 'Dai Loc → Da Nang',
    vehicleId: 'vehicle_1',
    vehicle: '7-seat vehicle',
    driverId: 'driver_1',
    driver: 'Nguyen Van A',
    schedule: '06:30 AM departure',
    passengerCount: 4,
    maxCapacity: 4,
    tripStatus: 'ready',
    estimatedDeparture: '2026-06-03T07:00:00+07:00',
    actualDeparture: null,
    estimatedArrival: '2026-06-03T08:30:00+07:00',
    completedAt: null,
    totalRevenue: 360000,
    createdAt: new Date().toISOString()
  },
  {
    id: 'trip_2',
    routeType: 'da_nang_to_dai_loc',
    routeLabel: 'Da Nang → Dai Loc',
    vehicleId: 'vehicle_2',
    vehicle: '4-seat vehicle',
    driverId: 'driver_2',
    driver: 'Tran Thi B',
    schedule: '05:00 PM departure',
    passengerCount: 6,
    maxCapacity: 7,
    tripStatus: 'in_progress',
    estimatedDeparture: '2026-06-03T17:00:00+07:00',
    actualDeparture: '2026-06-03T17:10:00+07:00',
    estimatedArrival: '2026-06-03T18:40:00+07:00',
    completedAt: null,
    totalRevenue: 540000,
    createdAt: new Date().toISOString()
  }
];

export const mockPayments: PaymentRecord[] = [
  {
    id: 'payment_1',
    bookingId: 'booking_1',
    tripId: 'trip_1',
    amount: 270000,
    method: 'cash',
    status: 'paid',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'payment_2',
    bookingId: 'booking_2',
    tripId: 'trip_2',
    amount: 180000,
    method: 'bank_transfer',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const mockDriverPayouts: DriverPayoutRecord[] = [
  {
    id: 'payout_1',
    driverId: 'driver_1',
    tripId: 'trip_1',
    amount: 180000,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const mockDrivers = [
  { id: 'driver_1', fullName: 'Nguyen Van A', phone: '0909 111 222' },
  { id: 'driver_2', fullName: 'Tran Thi B', phone: '0909 333 444' }
];

export const mockDriverStops = [
  { label: 'Trip 1 - Dai Loc → Da Nang', subtitle: 'Pickup sequence ready for dispatch.', passengers: 4 },
  { label: 'Trip 2 - Da Nang → Dai Loc', subtitle: 'Passenger pick-up list in progress.', passengers: 6 }
];

export const mockBookingStatuses: BookingStatus[] = [
  'pending',
  'matching',
  'confirmed',
  'driver_assigned',
  'on_the_way',
  'completed',
  'cancelled'
];
