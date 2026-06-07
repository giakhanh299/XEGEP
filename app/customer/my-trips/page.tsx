import Link from 'next/link';
import { SectionCard } from '@/components/section-card';
import { StatusBadge } from '@/components/status-badge';
import { getLatestBookingStatusLabel } from '@/lib/booking-history';
import { formatBookingStatus } from '@/lib/display-labels';
import { getSessionFromCookies } from '@/lib/auth/session';
import { getCustomerDashboardBookings } from '@/lib/services/rides';

export default async function CustomerTripsPage() {
  const session = await getSessionFromCookies();
  const bookings = session?.role === 'customer' ? await getCustomerDashboardBookings(session.userId) : [];

  return (
      <SectionCard title="Chuyến đi của tôi" description="Các chuyến xe gần đây và đang hoạt động.">
        <div className="space-y-3">
        {bookings.length === 0 ? <p className="text-sm text-slate-300">Bạn chưa có chuyến nào.</p> : null}
        {bookings.map((booking) => {
          const latestUpdate = getLatestBookingStatusLabel(booking);

          return (
            <div key={booking.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                <p className="font-semibold text-white">
                  {booking.pickupLocation} → {booking.dropoffLocation}
                </p>
                <p className="text-sm text-slate-400">{booking.bookingTime ?? booking.createdAt}</p>
                <p className="text-xs text-slate-500">
                  Giá ước tính: {booking.estimatedFare ? `${booking.estimatedFare.toLocaleString()} VND` : 'Không có'}
                </p>
              </div>
                <StatusBadge status={booking.status} />
              </div>
              <div className="mt-3 grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
                <p>
                  <strong className="text-white">Điện thoại:</strong> {booking.phone}
                </p>
                <p>
                  <strong className="text-white">Tài xế:</strong> {booking.driverSnapshot?.driverName ?? 'Đang chờ phân công'}
                </p>
                <p className="sm:col-span-2">
                  <strong className="text-white">Cập nhật gần nhất:</strong> {formatBookingStatus(latestUpdate.status)} lúc {latestUpdate.timestamp}
                </p>
              </div>
              <Link href={`/customer/my-trips/${booking.id}`} className="mt-4 inline-flex text-sm font-semibold text-emerald-300">
                Xem chi tiết chuyến đi
              </Link>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
