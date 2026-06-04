import { VehicleType } from '@/lib/types';

export function getVehicleMultiplier(vehicleType?: VehicleType | string | null) {
  return vehicleType === '7-seat vehicle' ? 1.2 : 1;
}

export function estimateFare(input: {
  distanceKm: number;
  baseFare: number;
  pricePerKm: number;
  vehicleType?: VehicleType | string | null;
}) {
  const multiplier = getVehicleMultiplier(input.vehicleType);
  const raw = (Math.max(0, input.baseFare) + Math.max(0, input.distanceKm) * Math.max(0, input.pricePerKm)) * multiplier;
  return Math.round(raw);
}
