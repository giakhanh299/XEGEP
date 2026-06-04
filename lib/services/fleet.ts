import { randomUUID } from 'crypto';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { DriverRecord, TripRecord, VehicleRecord } from '@/lib/types';

const driverStore: DriverRecord[] = [];
const vehicleStore: VehicleRecord[] = [];
const tripStore: TripRecord[] = [];

type DriverRow = {
  id: string;
  full_name: string;
  phone: string;
  active: boolean;
  created_at: string;
  updated_at: string;
};

type VehicleRow = {
  id: string;
  plate_number: string;
  vehicle_type: VehicleRecord['vehicleType'];
  capacity: VehicleRecord['capacity'];
  active: boolean;
  created_at: string;
  updated_at: string;
};

type TripRow = {
  id: string;
  route_type: TripRecord['routeType'];
  vehicle_id?: string | null;
  driver_id?: string | null;
  passenger_count: number;
  max_capacity: number;
  trip_status: TripRecord['tripStatus'];
  estimated_departure?: string | null;
  actual_departure?: string | null;
  estimated_arrival?: string | null;
  completed_at?: string | null;
  total_revenue: number;
  created_at: string;
};

function mapDriver(row: DriverRow): DriverRecord {
  return {
    id: row.id,
    fullName: row.full_name,
    phone: row.phone,
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapVehicle(row: VehicleRow): VehicleRecord {
  return {
    id: row.id,
    plateNumber: row.plate_number,
    vehicleType: row.vehicle_type,
    capacity: row.capacity,
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapTrip(row: TripRow): TripRecord {
  return {
    id: row.id,
    routeType: row.route_type,
    vehicleId: row.vehicle_id ?? null,
    driverId: row.driver_id ?? null,
    passengerCount: row.passenger_count,
    maxCapacity: row.max_capacity,
    tripStatus: row.trip_status,
    estimatedDeparture: row.estimated_departure ?? null,
    actualDeparture: row.actual_departure ?? null,
    estimatedArrival: row.estimated_arrival ?? null,
    completedAt: row.completed_at ?? null,
    totalRevenue: row.total_revenue,
    createdAt: row.created_at
  };
}

export async function listDrivers() {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    const { data, error } = await supabase.from('drivers').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      return data.map((row) => mapDriver(row as DriverRow));
    }
  }

  return driverStore;
}

export async function createDriver(input: Partial<DriverRecord>) {
  const driver: DriverRecord = {
    id: randomUUID(),
    fullName: input.fullName ?? 'Unnamed driver',
    phone: input.phone ?? '',
    active: input.active ?? true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const supabase = getSupabaseServerClient();
  if (supabase) {
    const { error } = await supabase.from('drivers').insert({
      id: driver.id,
      full_name: driver.fullName,
      phone: driver.phone,
      active: driver.active,
      created_at: driver.createdAt,
      updated_at: driver.updatedAt
    });
    if (!error) {
      return driver;
    }
  }

  driverStore.unshift(driver);
  return driver;
}

export async function updateDriver(id: string, patch: Partial<DriverRecord>) {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    const { error } = await supabase
      .from('drivers')
      .update({
        full_name: patch.fullName,
        phone: patch.phone,
        active: patch.active,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    if (!error) {
      return true;
    }
  }

  const driver = driverStore.find((item) => item.id === id);
  if (!driver) {
    return false;
  }
  Object.assign(driver, patch, { updatedAt: new Date().toISOString() });
  return true;
}

export async function listVehicles() {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    const { data, error } = await supabase.from('vehicles').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      return data.map((row) => mapVehicle(row as VehicleRow));
    }
  }

  return vehicleStore;
}

export async function createVehicle(input: Partial<VehicleRecord>) {
  const vehicle: VehicleRecord = {
    id: randomUUID(),
    plateNumber: input.plateNumber ?? '',
    vehicleType: input.vehicleType ?? '4-seat vehicle',
    capacity: input.capacity ?? 4,
    active: input.active ?? true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const supabase = getSupabaseServerClient();
  if (supabase) {
    const { error } = await supabase.from('vehicles').insert({
      id: vehicle.id,
      plate_number: vehicle.plateNumber,
      vehicle_type: vehicle.vehicleType,
      capacity: vehicle.capacity,
      active: vehicle.active,
      created_at: vehicle.createdAt,
      updated_at: vehicle.updatedAt
    });
    if (!error) {
      return vehicle;
    }
  }

  vehicleStore.unshift(vehicle);
  return vehicle;
}

export async function updateVehicle(id: string, patch: Partial<VehicleRecord>) {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    const { error } = await supabase
      .from('vehicles')
      .update({
        plate_number: patch.plateNumber,
        vehicle_type: patch.vehicleType,
        capacity: patch.capacity,
        active: patch.active,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    if (!error) {
      return true;
    }
  }

  const vehicle = vehicleStore.find((item) => item.id === id);
  if (!vehicle) {
    return false;
  }
  Object.assign(vehicle, patch, { updatedAt: new Date().toISOString() });
  return true;
}

export async function listTrips() {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    const { data, error } = await supabase.from('trips').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      return data.map((row) => mapTrip(row as TripRow));
    }
  }

  return tripStore;
}

export async function getTrip(id: string) {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    const { data, error } = await supabase.from('trips').select('*').eq('id', id).maybeSingle();
    if (!error && data) {
      return mapTrip(data as TripRow);
    }
  }

  return tripStore.find((item) => item.id === id) ?? null;
}

export async function createTrip(input: Partial<TripRecord>) {
  const trip: TripRecord = {
    id: randomUUID(),
    routeType: input.routeType ?? 'dai_loc_to_da_nang',
    routeLabel: input.routeLabel,
    vehicleId: input.vehicleId ?? null,
    vehicle: input.vehicle,
    driverId: input.driverId ?? null,
    driver: input.driver,
    passengerCount: input.passengerCount ?? 0,
    maxCapacity: input.maxCapacity ?? 4,
    tripStatus: input.tripStatus ?? 'draft',
    schedule: input.schedule,
    estimatedDeparture: input.estimatedDeparture ?? null,
    actualDeparture: input.actualDeparture ?? null,
    estimatedArrival: input.estimatedArrival ?? null,
    completedAt: input.completedAt ?? null,
    totalRevenue: input.totalRevenue ?? 0,
    createdAt: new Date().toISOString()
  };

  const supabase = getSupabaseServerClient();
  if (supabase) {
    const { error } = await supabase.from('trips').insert({
      id: trip.id,
      route_type: trip.routeType,
      vehicle_id: trip.vehicleId,
      driver_id: trip.driverId,
      passenger_count: trip.passengerCount,
      max_capacity: trip.maxCapacity,
      trip_status: trip.tripStatus,
      estimated_departure: trip.estimatedDeparture,
      actual_departure: trip.actualDeparture,
      estimated_arrival: trip.estimatedArrival,
      completed_at: trip.completedAt,
      total_revenue: trip.totalRevenue,
      created_at: trip.createdAt
    });
    if (!error) {
      return trip;
    }
  }

  tripStore.unshift(trip);
  return trip;
}

export async function updateTrip(id: string, patch: Partial<TripRecord>) {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    const { error } = await supabase
      .from('trips')
      .update({
        route_type: patch.routeType,
        vehicle_id: patch.vehicleId,
        driver_id: patch.driverId,
        passenger_count: patch.passengerCount,
        max_capacity: patch.maxCapacity,
        trip_status: patch.tripStatus,
        estimated_departure: patch.estimatedDeparture,
        actual_departure: patch.actualDeparture,
        estimated_arrival: patch.estimatedArrival,
        completed_at: patch.completedAt,
        total_revenue: patch.totalRevenue
      })
      .eq('id', id);
    if (!error) {
      return true;
    }
  }

  const trip = tripStore.find((item) => item.id === id);
  if (!trip) {
    return false;
  }
  Object.assign(trip, patch);
  return true;
}
