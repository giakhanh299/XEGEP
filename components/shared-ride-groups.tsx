import Link from 'next/link';
import { MapPin, Users } from 'lucide-react';
import { StatusBadge } from '@/components/status-badge';
import type { SharedRideGroup } from '@/lib/services/shared-rides';

function groupBadgeClass(statusLabel: SharedRideGroup['statusLabel']) {
  switch (statusLabel) {
    case 'Đã đủ khách':
      return 'bg-rose-400/10 text-rose-200';
    case 'Sắp đủ':
      return 'bg-amber-400/10 text-amber-100';
    default:
      return 'bg-emerald-400/10 text-emerald-200';
  }
}

export function SharedRideGroups({
  groups,
  role
}: {
  groups: SharedRideGroup[];
  role: 'customer' | 'driver' | 'admin' | 'super_admin';
}) {
  if (groups.length === 0) {
    return (
      <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
        Chưa có nhóm xe ghép nào đang hoạt động.
      </div>
    );
  }

  const isCustomer = role === 'customer';
  const bookingLink = isCustomer ? '/customer/book' : null;

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {groups.map((group) => {
        const progress = group.seatCount > 0 ? Math.min(100, Math.round((group.bookedSeats / group.seatCount) * 100)) : 0;
        const routeSummary = `${group.pickupSummary} → ${group.destinationSummary}`;

        return (
          <article key={group.groupKey} className="glass overflow-hidden rounded-[1.75rem] border border-white/10">
            <div className="grid gap-4 p-5 md:grid-cols-[1.05fr_1.4fr]">
              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-[1fr_1fr]">
                  <div className="overflow-hidden rounded-[1.35rem] border border-white/10 bg-white/5">
                    {group.vehiclePhoto ? (
                      <img src={group.vehiclePhoto} alt={group.vehicleType} className="h-36 w-full object-cover" />
                    ) : (
                      <div className="flex h-36 items-center justify-center bg-slate-950/40 text-slate-400">Chưa có ảnh xe</div>
                    )}
                  </div>
                  <div className="overflow-hidden rounded-[1.35rem] border border-white/10 bg-white/5">
                    {group.driverPhoto ? (
                      <img src={group.driverPhoto} alt={group.driverName} className="h-36 w-full object-cover" />
                    ) : (
                      <div className="flex h-36 items-center justify-center bg-slate-950/40 text-slate-400">Chưa có ảnh tài xế</div>
                    )}
                  </div>
                </div>

                <div className="rounded-[1.35rem] border border-white/10 bg-slate-950/45 p-4 text-sm text-slate-300">
                  <p className="text-lg font-bold text-white">{group.driverName}</p>
                  <p>{group.vehicleType}</p>
                  <p>{group.plateNumber}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xl font-black text-white">
                      {group.vehicleType} - {group.seatCount} ghế
                    </p>
                    <p className="text-sm text-slate-400">{group.routeLabel}</p>
                    <p className="text-sm text-slate-400">Khởi hành: {group.departureLabel}</p>
                    <p className="mt-2 text-sm text-slate-300">{routeSummary}</p>
                  </div>
                  <div className={`rounded-full px-3 py-1 text-xs font-semibold ${groupBadgeClass(group.statusLabel)}`}>{group.statusLabel}</div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between text-sm text-slate-300">
                    <span>{group.occupancyLabel}</span>
                    <span>Còn lại {group.remainingSeats} ghế</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-slate-900">
                    <div
                      className="h-2 rounded-full bg-emerald-400 transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-sm text-slate-300">
                    <Users className="h-4 w-4 text-emerald-300" />
                    <span>Đã đặt {group.bookedSeats}/{group.seatCount} ghế</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <MapPin className="h-4 w-4 text-cyan-300" />
                    Danh sách chuyến trong nhóm
                  </div>
                  <div className="space-y-2">
                    {group.bookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm"
                      >
                        <div>
                          <p className="font-semibold text-white">
                            {booking.customerName} - {booking.passengerCount} ghế
                          </p>
                          <p className="text-slate-400">
                            {booking.pickupLocation} → {booking.dropoffLocation}
                          </p>
                        </div>
                        <StatusBadge status={booking.status} />
                        {role === 'driver' ? (
                          <Link href={`/driver/bookings/${booking.id}`} className="text-sm font-semibold text-cyan-300">
                            Xem
                          </Link>
                        ) : role === 'admin' || role === 'super_admin' ? (
                          <Link href={`/admin/bookings/${booking.id}`} className="text-sm font-semibold text-cyan-300">
                            Xem
                          </Link>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>

                {isCustomer && bookingLink && group.remainingSeats > 0 ? (
                  <Link
                    href={`${bookingLink}?driverId=${group.driverId ?? ''}`}
                    className="inline-flex rounded-2xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950"
                  >
                    Đặt xe
                  </Link>
                ) : null}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
