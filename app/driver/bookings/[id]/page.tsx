import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SectionCard } from '@/components/section-card';
import { StatusBadge } from '@/components/status-badge';
import { BookingHistory } from '@/components/booking-history';
import { DriverBookingActions } from '@/components/driver-booking-actions';
import { getSessionFromCookies } from '@/lib/auth/session';
import { getBookingForActor } from '@/lib/services/rides';

export default async function DriverBookingDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSessionFromCookies();
  const booking = await getBookingForActor(id, session ? { userId: session.userId, role: session.role } : null);

  if (!booking || session?.role !== 'driver') {
    notFound();
  }

  return (
    <SectionCard title="Chi tiết chuyến đi" description="Xem yêu cầu khách hàng và cập nhật trạng thái.">
      <div className="space-y-4 text-sm text-slate-300">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-base font-semibold text-white">{booking.customerName}</p>
            <p>{booking.phone}</p>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <p>
            <strong className="text-white">Điểm đón:</strong> {booking.pickupLocation}
          </p>
          <p>
            <strong className="text-white">Điểm đến:</strong> {booking.dropoffLocation}
          </p>
          <p>
            <strong className="text-white">Giá ước tính:</strong>{' '}
            {booking.estimatedFare ? `${booking.estimatedFare.toLocaleString()} VND` : 'Không có'}
          </p>
          <p>
            <strong className="text-white">Thời gian đi:</strong> {booking.travelTime ?? booking.bookingTime ?? 'Không có'}
          </p>
          <p>
            <strong className="text-white">Ghi chú:</strong> {booking.notes ?? 'Không có'}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="mb-3 text-base font-semibold text-white">Lịch sử trạng thái</p>
          <BookingHistory history={booking.statusHistory ?? []} />
        </div>

        <DriverBookingActions bookingId={booking.id} />

        <div>
          <Link href="/driver/bookings" className="inline-flex text-sm font-semibold text-emerald-300">
            Quay lại danh sách chuyến
          </Link>
        </div>
      </div>
    </SectionCard>
  );
}
