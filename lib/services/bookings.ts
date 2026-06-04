import { randomUUID } from 'crypto';
import { notifyNewBooking } from '@/lib/telegram/notify';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { BookingRecord } from '@/lib/types';

const memoryStore: BookingRecord[] = [];

type BookingRow = {
  id: string;
  customer_name: string;
  phone: string;
  pickup_location: string;
  dropoff_location: string;
  travel_date?: string | null;
  travel_time?: string | null;
  pickup_lat?: number | null;
  pickup_lng?: number | null;
  dropoff_lat?: number | null;
  dropoff_lng?: number | null;
  passenger_count: number;
  notes?: string | null;
  status: BookingRecord['status'];
  route_type: BookingRecord['routeType'];
  payment_status?: BookingRecord['paymentStatus'];
  payment_method?: BookingRecord['paymentMethod'];
  trip_id?: string | null;
  created_at: string;
  updated_at: string;
};

function mapRow(row: BookingRow): BookingRecord {
  return {
    id: row.id,
    customerName: row.customer_name,
    phone: row.phone,
    pickupLocation: row.pickup_location,
    dropoffLocation: row.dropoff_location,
    travelDate: row.travel_date ?? undefined,
    travelTime: row.travel_time ?? undefined,
    pickupLat: row.pickup_lat ?? null,
    pickupLng: row.pickup_lng ?? null,
    dropoffLat: row.dropoff_lat ?? null,
    dropoffLng: row.dropoff_lng ?? null,
    passengerCount: row.passenger_count,
    notes: row.notes ?? null,
    status: row.status,
    routeType: row.route_type,
    paymentStatus: row.payment_status,
    paymentMethod: row.payment_method,
    tripId: row.trip_id ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function listBookings() {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    const { data, error } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      return data.map((row) => mapRow(row as BookingRow));
    }
  }

  return memoryStore;
}

export async function getBooking(id: string) {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    const { data, error } = await supabase.from('bookings').select('*').eq('id', id).maybeSingle();
    if (!error && data) {
      return mapRow(data as BookingRow);
    }
  }

  return memoryStore.find((item) => item.id === id) ?? null;
}

export async function createBooking(input: Partial<BookingRecord>) {
  const booking: BookingRecord = {
    id: randomUUID(),
    customerName: input.customerName ?? 'Unknown customer',
    phone: input.phone ?? '',
    pickupLocation: input.pickupLocation ?? '',
    dropoffLocation: input.dropoffLocation ?? '',
    travelDate: input.travelDate,
    travelTime: input.travelTime,
    pickupLat: input.pickupLat ?? null,
    pickupLng: input.pickupLng ?? null,
    dropoffLat: input.dropoffLat ?? null,
    dropoffLng: input.dropoffLng ?? null,
    passengerCount: input.passengerCount ?? 1,
    notes: input.notes ?? null,
    status: input.status ?? 'pending',
    routeType: input.routeType ?? 'dai_loc_to_da_nang',
    paymentStatus: input.paymentStatus,
    paymentMethod: input.paymentMethod,
    tripId: input.tripId ?? null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const supabase = getSupabaseServerClient();
  if (supabase) {
    const { error } = await supabase.from('bookings').insert({
      id: booking.id,
      customer_name: booking.customerName,
      phone: booking.phone,
      pickup_location: booking.pickupLocation,
      dropoff_location: booking.dropoffLocation,
      travel_date: booking.travelDate,
      travel_time: booking.travelTime,
      pickup_lat: booking.pickupLat,
      pickup_lng: booking.pickupLng,
      dropoff_lat: booking.dropoffLat,
      dropoff_lng: booking.dropoffLng,
      passenger_count: booking.passengerCount,
      notes: booking.notes,
      status: booking.status,
      route_type: booking.routeType,
      payment_status: booking.paymentStatus,
      payment_method: booking.paymentMethod,
      trip_id: booking.tripId,
      created_at: booking.createdAt,
      updated_at: booking.updatedAt
    });

    if (!error) {
      await notifyNewBooking(booking);
      return booking;
    }
  }

  memoryStore.unshift(booking);
  await notifyNewBooking(booking);
  return booking;
}

export async function updateBooking(id: string, patch: Partial<BookingRecord>) {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    const { error } = await supabase
      .from('bookings')
      .update({
        customer_name: patch.customerName,
        phone: patch.phone,
        pickup_location: patch.pickupLocation,
        dropoff_location: patch.dropoffLocation,
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
        payment_status: patch.paymentStatus,
        payment_method: patch.paymentMethod,
        trip_id: patch.tripId,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    if (!error) {
      return true;
    }
  }

  const booking = memoryStore.find((item) => item.id === id);
  if (!booking) {
    return false;
  }
  Object.assign(booking, patch, { updatedAt: new Date().toISOString() });
  return true;
}
