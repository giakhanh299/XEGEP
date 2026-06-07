'use client';

import Link from 'next/link';
import { Bookmark, Star } from 'lucide-react';
import { formatVehicleType } from '@/lib/display-labels';

type VehicleCard = {
  id: string;
  driverName: string;
  phone: string;
  vehicleType: string;
  plateNumber: string;
  seatCount: number;
  availableSeats: number;
  serviceArea: string;
  vehiclePhoto?: string | null;
  driverPhoto?: string | null;
  description?: string | null;
  rating: number;
};

function Avatar({ src, label }: { src?: string | null; label: string }) {
  if (src) {
    return <img src={src} alt={label} className="h-full w-full object-cover" />;
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-400/35 via-cyan-400/20 to-slate-900 text-3xl font-black text-white">
      {label.charAt(0)}
    </div>
  );
}

export function VehicleBrowser({ vehicles }: { vehicles: VehicleCard[] }) {
  if (vehicles.length === 0) {
    return (
      <div className="rounded-[1.75rem] border border-amber-400/20 bg-amber-400/10 p-5 text-sm leading-6 text-amber-100">
        Chưa có xe nào sẵn sàng. Vui lòng quay lại sau hoặc liên hệ quản trị viên.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {vehicles.map((vehicle) => (
        <article key={vehicle.id} className="glass overflow-hidden rounded-[1.75rem]">
          <div className="grid grid-cols-[1.5fr_0.8fr] gap-3 p-4">
            <div className="relative min-h-44 overflow-hidden rounded-[1.35rem] border border-white/10 bg-white/5">
              <Avatar src={vehicle.vehiclePhoto} label={formatVehicleType(vehicle.vehicleType)} />
            </div>
            <div className="space-y-3">
              <div className="h-24 overflow-hidden rounded-[1.25rem] border border-white/10 bg-white/5">
                <Avatar src={vehicle.driverPhoto} label={vehicle.driverName} />
              </div>
              <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/45 p-3 text-xs text-slate-300">
                <p className="font-semibold text-white">{vehicle.driverName}</p>
                <p>{vehicle.phone}</p>
              </div>
            </div>
          </div>
          <div className="space-y-3 px-4 pb-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-bold text-white">{formatVehicleType(vehicle.vehicleType)}</p>
                <p className="text-sm text-slate-400">{vehicle.plateNumber}</p>
              </div>
              <div className="flex items-center gap-1 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs text-amber-100">
                <Star className="h-3.5 w-3.5 fill-current" />
                {vehicle.rating.toFixed(1)}
              </div>
            </div>
            <div className="grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
              <p>
                <strong className="text-white">Số ghế:</strong> {vehicle.seatCount}
              </p>
              <p>
                <strong className="text-white">Còn trống:</strong> {vehicle.availableSeats}
              </p>
              <p>
                <strong className="text-white">Khu vực:</strong> {vehicle.serviceArea}
              </p>
            </div>
            {vehicle.description ? <p className="text-sm leading-6 text-slate-300">{vehicle.description}</p> : null}
            <Link
              href={`/customer/book?driverId=${vehicle.id}`}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-4 py-3 font-semibold text-slate-950"
            >
              <Bookmark className="h-4 w-4" />
              Đặt xe
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
