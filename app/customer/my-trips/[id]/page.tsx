import { notFound } from 'next/navigation';
import { SectionCard } from '@/components/section-card';
import { StatusBadge } from '@/components/status-badge';
import { getSessionFromCookies } from '@/lib/auth/session';
import { BookingHistory } from '@/components/booking-history';
import { formatVehicleType } from '@/lib/display-labels';
import { getBookingForActor } from '@/lib/services/rides';

export default async function CustomerTripDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSessionFromCookies();
  const booking = await getBookingForActor(id, session ? { userId: session.userId, role: session.role } : null);

  if (!booking || session?.role !== 'customer') {
    notFound();
  }

  return (
    <SectionCard
      title={`${booking.pickupLocation} → ${booking.dropoffLocation}`}
      description="Tóm tắt chuyến đi và trạng thái hiện tại."
    >
      <div className="space-y-3 text-sm text-slate-300">
        <StatusBadge status={booking.status} />
        <p>
          Tài xế: <span className="text-white">{booking.driverSnapshot?.driverName ?? 'Đang chờ phân công'}</span>
        </p>
        <p>
          Xe: <span className="text-white">{booking.vehicleSnapshot?.vehicleType ? formatVehicleType(booking.vehicleSnapshot.vehicleType) : 'Đang chờ phân công'}</span>
        </p>
        <p>
          Giá ước tính: <span className="text-white">{booking.estimatedFare ? `${booking.estimatedFare.toLocaleString()} VND` : 'Không có'}</span>
        </p>
        <p>
          Thời gian đặt: <span className="text-white">{booking.bookingTime ?? booking.createdAt}</span>
        </p>
        <p>
          Ghi chú: <span className="text-white">{booking.notes ?? 'Không có'}</span>
        </p>
        <div className="pt-2">
          <p className="mb-3 text-base font-semibold text-white">Lịch sử trạng thái</p>
          <BookingHistory history={booking.statusHistory ?? []} />
        </div>
      </div>
    </SectionCard>
  );
}
