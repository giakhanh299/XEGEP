import { NextResponse } from 'next/server';
import { listVehicleSelections } from '@/lib/services/rides';

export async function GET() {
  const vehicles = await listVehicleSelections();
  return NextResponse.json({ vehicles });
}
