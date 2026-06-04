import { randomUUID } from 'crypto';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import {
  BookingRecord,
  BookingSnapshot,
  BookingStatus,
  BookingStatusHistoryEntry,
  RouteType,
  UserRole
} from '@/lib/types';
import { listAvailableDrivers, getCustomerByUserId, getDriverByUserId, updateDriverProfile } from '@/lib/services/accounts';
import { notifyBookingCreated, notifyBookingStatusChanged } from '@/lib/notifications/bookings';
import { estimateFare, getVehicleMultiplier } from '@/lib/business/fare';

type BookingRow = {
  id: string;
  customer_id?: string | null;
  driver_id?: string | null;
  customer_name: string;
  phone: string;
  pickup_location: string;
  dropoff_location: string;
  booking_time?: string | null;
  travel_date?: string | null;
  travel_time?: string | null;
  passenger_count?: number;
  notes?: string | null;
  status: BookingStatus;
  route_type: RouteType;
  estimated_distance_km?: number | null;
  fare_base?: number | null;
  fare_per_km?: number | null;
  fare_multiplier?: number | null;
  estimated_fare?: number | null;
  payment_status?: BookingRecord['paymentStatus'];
  payment_method?: BookingRecord['paymentMethod'];
  trip_id?: string | null;
  customer_snapshot?: BookingSnapshot | null;
  driver_snapshot?: BookingSnapshot | null;
  vehicle_snapshot?: BookingSnapshot | null;
  status_history?: BookingStatusHistoryEntry[] | null;
  created_at: string;
  updated_at: string;
};

type ActorContext = {
  userId: string;
  role: UserRole;
};

const bookingStore: BookingRecord[] = [];

function now() {
  return new Date().toISOString();
}

function createHistoryEntry(
  status: BookingStatusHistoryEntry['status'],
  actorRole: UserRole,
  actorId?: string | null,
  timestamp = now()
): BookingStatusHistoryEntry {
  return {
    status,
    actorRole,
    actorId: actorId ?? null,
    timestamp
  };
}

function mapHistory(history: BookingRow['status_history'], createdAt: string, actorRole: UserRole = 'customer') {
  if (Array.isArray(history) && history.length > 0) {
    return history.map((entry) => ({
      status: entry.status,
      actorRole: entry.actorRole,
      actorId: entry.actorId ?? null,
      timestamp: entry.timestamp
    }));
  }

  return [createHistoryEntry('created', actorRole, null, createdAt)];
}

function mapRow(row: BookingRow): BookingRecord {
  const statusHistory = mapHistory(row.status_history, row.created_at);

  return {
    id: row.id,
    customerName: row.customer_name,
    phone: row.phone,
    pickupLocation: row.pickup_location,
    dropoffLocation: row.dropoff_location,
    travelDate: row.travel_date ?? undefined,
    travelTime: row.travel_time ?? undefined,
    passengerCount: row.passenger_count ?? 1,
    notes: row.notes ?? null,
    status: row.status,
    routeType: row.route_type,
    estimatedDistanceKm: row.estimated_distance_km ?? null,
    fareBase: row.fare_base ?? null,
    farePerKm: row.fare_per_km ?? null,
    fareMultiplier: row.fare_multiplier ?? null,
    estimatedFare: row.estimated_fare ?? null,
    paymentStatus: row.payment_status,
    paymentMethod: row.payment_method,
    tripId: row.trip_id ?? null,
    customerId: row.customer_id ?? null,
    driverId: row.driver_id ?? null,
    bookingTime: row.booking_time ?? null,
    customerSnapshot: row.customer_snapshot ?? null,
    driverSnapshot: row.driver_snapshot ?? null,
    vehicleSnapshot: row.vehicle_snapshot ?? null,
    statusHistory,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function deriveRouteType(pickupLocation: string, dropoffLocation: string): RouteType {
  const text = `${pickupLocation} ${dropoffLocation}`.toLowerCase();
  return text.includes('da nang') || text.includes('đà nẵng') ? 'da_nang_to_dai_loc' : 'dai_loc_to_da_nang';
}

function toSnapshot(profile: Awaited<ReturnType<typeof getCustomerByUserId>> | Awaited<ReturnType<typeof getDriverByUserId>>) {
  if (!profile) {
    return null;
  }

  if ('driverName' in profile) {
    return {
      name: profile.driverName,
      phone: profile.phone,
      username: profile.username,
      vehicleType: profile.vehicleType,
      plateNumber: profile.plateNumber,
      seatCount: profile.seatCount,
      availableSeats: profile.availableSeats,
      serviceArea: profile.serviceArea,
      vehiclePhoto: profile.vehiclePhoto,
      driverPhoto: profile.driverPhoto,
      driverName: profile.driverName,
      description: profile.description
    } satisfies BookingSnapshot;
  }

  return {
    name: profile.fullName,
    phone: profile.phone,
    address: profile.address,
    username: profile.username
  } satisfies BookingSnapshot;
}

function normalizeBooking(booking: BookingRecord) {
  if (!booking.statusHistory || booking.statusHistory.length === 0) {
    booking.statusHistory = [createHistoryEntry('created', 'customer', booking.customerId ?? null, booking.createdAt)];
  }
  return booking;
}

function isTerminalBookingStatus(status: BookingStatus) {
  return status === 'completed' || status === 'cancelled';
}

async function getDriverForBooking(passengerCount: number, driverId?: string | null) {
  if (driverId) {
    const driver = await getDriverByUserId(driverId);
    if (!driver) {
      throw new Error('Driver not found');
    }
    if (!driver.active || driver.approvalStatus !== 'approved' || driver.archivedAt) {
      throw new Error('Selected vehicle is not available');
    }
    if (driver.availableSeats < passengerCount) {
      throw new Error('Selected vehicle does not have enough available seats');
    }
    return driver;
  }

  const drivers = await listAvailableDrivers();
  const eligibleDriver = drivers.find((driver) => driver.availableSeats >= passengerCount);
  if (!eligibleDriver) {
    throw new Error('No available vehicle has enough seats');
  }

  return eligibleDriver;
}

async function adjustDriverAvailableSeats(driverId: string, delta: number) {
  const driver = await getDriverByUserId(driverId);
  if (!driver) {
    throw new Error('Driver not found');
  }

  const currentSeats = driver.availableSeats ?? driver.seatCount;
  const nextSeats = currentSeats + delta;

  if (nextSeats < 0) {
    throw new Error('Selected vehicle does not have enough available seats');
  }

  await updateDriverProfile(driverId, {
    availableSeats: Math.min(driver.seatCount, nextSeats)
  });
}

async function persistBooking(booking: BookingRecord) {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    const { error } = await supabase.from('bookings').upsert({
      id: booking.id,
      customer_id: booking.customerId,
      driver_id: booking.driverId,
      customer_name: booking.customerName,
      phone: booking.phone,
      pickup_location: booking.pickupLocation,
      dropoff_location: booking.dropoffLocation,
      booking_time: booking.bookingTime,
      travel_date: booking.travelDate,
      travel_time: booking.travelTime,
      passenger_count: booking.passengerCount,
      notes: booking.notes,
      status: booking.status,
      route_type: booking.routeType,
      estimated_distance_km: booking.estimatedDistanceKm,
      fare_base: booking.fareBase,
      fare_per_km: booking.farePerKm,
      fare_multiplier: booking.fareMultiplier,
      estimated_fare: booking.estimatedFare,
      payment_status: booking.paymentStatus,
      payment_method: booking.paymentMethod,
      trip_id: booking.tripId,
      customer_snapshot: booking.customerSnapshot,
      driver_snapshot: booking.driverSnapshot,
      vehicle_snapshot: booking.vehicleSnapshot,
      status_history: booking.statusHistory ?? [],
      created_at: booking.createdAt,
      updated_at: booking.updatedAt
    });

    if (!error) {
      return true;
    }
  }

  return false;
}

async function persistBookingPatch(id: string, patch: Partial<BookingRecord>) {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    const { error } = await supabase
      .from('bookings')
      .update({
        customer_name: patch.customerName,
        phone: patch.phone,
        pickup_location: patch.pickupLocation,
        dropoff_location: patch.dropoffLocation,
        booking_time: patch.bookingTime,
        travel_date: patch.travelDate,
        travel_time: patch.travelTime,
        pickup_lat: patch.pickupLat,
        pickup_lng: patch.pickupLng,
        dropoff_lat: patch.dropoffLat,
        dropoff_lng: patch.dropoffLng,
        passenger_count: patch.passengerCount,
        notes: patch.notes,
        status: patch.status,
        route_type: patch.routeType,
        estimated_distance_km: patch.estimatedDistanceKm,
        fare_base: patch.fareBase,
        fare_per_km: patch.farePerKm,
        fare_multiplier: patch.fareMultiplier,
        estimated_fare: patch.estimatedFare,
        payment_status: patch.paymentStatus,
        payment_method: patch.paymentMethod,
        trip_id: patch.tripId,
        customer_snapshot: patch.customerSnapshot,
        driver_snapshot: patch.driverSnapshot,
        vehicle_snapshot: patch.vehicleSnapshot,
        status_history: patch.statusHistory,
        updated_at: patch.updatedAt ?? now()
      })
      .eq('id', id);

    if (!error) {
      return true;
    }
  }

  return false;
}

export async function listBookings(userContext?: ActorContext) {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    let query = supabase.from('bookings').select('*').order('created_at', { ascending: false });
    if (userContext?.role === 'customer') {
      query = query.eq('customer_id', userContext.userId);
    } else if (userContext?.role === 'driver') {
      query = query.eq('driver_id', userContext.userId);
    }

    const { data, error } = await query;
    if (!error && data) {
      return data.map((row) => normalizeBooking(mapRow(row as BookingRow)));
    }
  }

  const bookings = bookingStore.slice().reverse().map(normalizeBooking);
  if (!userContext) {
    return bookings;
  }

  return bookings.filter((booking) =>
    userContext.role === 'customer'
      ? booking.customerId === userContext.userId
      : userContext.role === 'driver'
        ? booking.driverId === userContext.userId
        : true
  );
}

export async function getBooking(id: string) {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    const { data, error } = await supabase.from('bookings').select('*').eq('id', id).maybeSingle();
    if (!error && data) {
      return normalizeBooking(mapRow(data as BookingRow));
    }
  }

  const booking = bookingStore.find((item) => item.id === id) ?? null;
  return booking ? normalizeBooking(booking) : null;
}

export async function getBookingForActor(id: string, actor?: ActorContext | null) {
  const booking = await getBooking(id);
  if (!booking || !actor) {
    return booking;
  }

  if (actor.role === 'customer' && booking.customerId !== actor.userId) {
    return null;
  }

  if (actor.role === 'driver' && booking.driverId !== actor.userId) {
    return null;
  }

  return booking;
}

export async function createRideBooking(input: {
  userId: string;
  role: UserRole;
  pickupLocation: string;
  dropoffLocation: string;
  bookingTime: string;
  notes?: string;
  driverId?: string | null;
  routeType?: RouteType;
  passengerCount?: number;
  estimatedDistanceKm?: number;
  fareBase?: number;
  farePerKm?: number;
}) {
  const customer = await getCustomerByUserId(input.userId);
  const passengerCount = Math.max(1, Math.min(7, Math.floor(input.passengerCount ?? 1)));
  const driver = await getDriverForBooking(passengerCount, input.driverId);
  const routeType = input.routeType ?? deriveRouteType(input.pickupLocation, input.dropoffLocation);
  const fareMultiplier = getVehicleMultiplier(driver?.vehicleType);
  const estimatedFare =
    input.estimatedDistanceKm !== undefined && input.fareBase !== undefined && input.farePerKm !== undefined
      ? estimateFare({
          distanceKm: input.estimatedDistanceKm,
          baseFare: input.fareBase,
          pricePerKm: input.farePerKm,
          vehicleType: driver?.vehicleType
        })
      : null;
  const id = randomUUID();
  const createdAt = now();
  const booking: BookingRecord = normalizeBooking({
    id,
    customerName: customer?.fullName ?? 'Guest customer',
    phone: customer?.phone ?? '',
    pickupLocation: input.pickupLocation.trim(),
    dropoffLocation: input.dropoffLocation.trim(),
    bookingTime: input.bookingTime,
    travelDate: input.bookingTime.split('T')[0],
    travelTime: input.bookingTime.includes('T') ? input.bookingTime.split('T')[1].slice(0, 5) : undefined,
    pickupLat: null,
    pickupLng: null,
    dropoffLat: null,
    dropoffLng: null,
    passengerCount,
    notes: input.notes ?? null,
    status: 'pending',
    routeType,
    estimatedDistanceKm: input.estimatedDistanceKm ?? null,
    fareBase: input.fareBase ?? null,
    farePerKm: input.farePerKm ?? null,
    fareMultiplier,
    estimatedFare,
    paymentStatus: undefined,
    paymentMethod: undefined,
    tripId: null,
    customerId: customer?.userId ?? input.userId,
    driverId: driver?.userId ?? input.driverId ?? null,
    customerSnapshot: toSnapshot(customer),
    driverSnapshot: toSnapshot(driver),
    vehicleSnapshot: driver
      ? {
          name: driver.vehicleType,
          phone: driver.phone,
          username: driver.username,
          vehicleType: driver.vehicleType,
          plateNumber: driver.plateNumber,
          seatCount: driver.seatCount,
          availableSeats: driver.availableSeats,
          serviceArea: driver.serviceArea,
          vehiclePhoto: driver.vehiclePhoto,
          driverPhoto: driver.driverPhoto,
          driverName: driver.driverName,
          description: driver.description
        }
      : null,
    statusHistory: [createHistoryEntry('created', input.role, input.userId, createdAt)],
    createdAt,
    updatedAt: createdAt
  });

  await adjustDriverAvailableSeats(driver.userId, -passengerCount);

  try {
    const saved = await persistBooking(booking);
    if (!saved) {
      bookingStore.unshift(booking);
    }
  } catch (error) {
    await adjustDriverAvailableSeats(driver.userId, passengerCount);
    throw error;
  }

  await notifyBookingCreated(booking, input.role, input.userId);
  return booking;
}

export async function updateBookingStatus(id: string, status: BookingStatus, actor: ActorContext) {
  const booking = await getBooking(id);
  if (!booking) {
    throw new Error('Booking not found');
  }

  if (actor.role === 'customer') {
    throw new Error('Unauthorized');
  }

  if (actor.role === 'driver' && booking.driverId !== actor.userId) {
    throw new Error('Unauthorized');
  }

  const updatedAt = now();
  const wasTerminal = isTerminalBookingStatus(booking.status);
  const willBeTerminal = isTerminalBookingStatus(status);

  if (booking.driverId && wasTerminal !== willBeTerminal) {
    await adjustDriverAvailableSeats(booking.driverId, willBeTerminal ? booking.passengerCount : -booking.passengerCount);
  }

  booking.status = status;
  booking.updatedAt = updatedAt;
  booking.statusHistory = [...(booking.statusHistory ?? []), createHistoryEntry(status, actor.role, actor.userId, updatedAt)];

  try {
    const saved = await persistBooking(booking);
    if (!saved) {
      const index = bookingStore.findIndex((item) => item.id === id);
      if (index >= 0) {
        bookingStore[index] = booking;
      } else {
        bookingStore.unshift(booking);
      }
    }
  } catch (error) {
    if (booking.driverId && wasTerminal !== willBeTerminal) {
      await adjustDriverAvailableSeats(booking.driverId, willBeTerminal ? -booking.passengerCount : booking.passengerCount);
    }
    throw error;
  }

  await notifyBookingStatusChanged(booking, status, actor.role, actor.userId);
  return booking;
}

export async function updateBooking(id: string, patch: Partial<BookingRecord>) {
  const existing = await getBooking(id);
  if (!existing) {
    return false;
  }

  const nextStatus = patch.status ?? existing.status;
  const wasTerminal = isTerminalBookingStatus(existing.status);
  const willBeTerminal = isTerminalBookingStatus(nextStatus);

  if (patch.status && existing.driverId && wasTerminal !== willBeTerminal) {
    await adjustDriverAvailableSeats(existing.driverId, willBeTerminal ? existing.passengerCount : -existing.passengerCount);
  }

  const next: BookingRecord = {
    ...existing,
    ...patch,
    status: nextStatus,
    statusHistory: patch.status
      ? [...(existing.statusHistory ?? []), createHistoryEntry(patch.status, 'admin', null, patch.updatedAt ?? now())]
      : existing.statusHistory,
    updatedAt: patch.updatedAt ?? now()
  };

  try {
    const saved = await persistBookingPatch(id, next);
    if (!saved) {
      const index = bookingStore.findIndex((item) => item.id === id);
      if (index >= 0) {
        bookingStore[index] = next;
      } else {
        bookingStore.unshift(next);
      }
    }
  } catch (error) {
    if (patch.status && existing.driverId && wasTerminal !== willBeTerminal) {
      await adjustDriverAvailableSeats(existing.driverId, willBeTerminal ? -existing.passengerCount : existing.passengerCount);
    }
    throw error;
  }

  return true;
}

export async function getCustomerDashboardBookings(userId: string) {
  return listBookings({ userId, role: 'customer' });
}

export async function getDriverDashboardBookings(userId: string) {
  return listBookings({ userId, role: 'driver' });
}

export async function listVehicleSelections() {
  const drivers = await listAvailableDrivers();
  return drivers.map((driver) => ({
    id: driver.userId,
    driverName: driver.driverName,
    phone: driver.phone,
    vehicleType: driver.vehicleType,
    plateNumber: driver.plateNumber,
    seatCount: driver.seatCount,
    availableSeats: driver.availableSeats,
    serviceArea: driver.serviceArea,
    vehiclePhoto: driver.vehiclePhoto,
    driverPhoto: driver.driverPhoto,
    description: driver.description,
    rating: driver.rating ?? 5
  }));
}
