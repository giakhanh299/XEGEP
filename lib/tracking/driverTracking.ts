import { randomUUID } from 'crypto';
import { DriverLocationRecord } from '@/lib/types';

const locations: DriverLocationRecord[] = [];

export function recordDriverLocation(input: Omit<DriverLocationRecord, 'id' | 'recordedAt'>) {
  const record: DriverLocationRecord = {
    id: randomUUID(),
    recordedAt: new Date().toISOString(),
    ...input
  };
  locations.unshift(record);
  return record;
}

export function listActiveDriverLocations() {
  return locations;
}

export function estimateArrivalFromLocation(location: DriverLocationRecord) {
  return {
    etaMinutes: Math.max(5, Math.round((location.accuracy ?? 50) / 10)),
    confidence: 0.72
  };
}
