import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SectionCard } from '@/components/section-card';
import { StatusBadge } from '@/components/status-badge';
import { BookingHistory } from '@/components/booking-history';
import { AdminActionButton } from '@/components/admin/action-buttons';
import { requireAdminSession } from '@/lib/auth/admin';
import { getBooking } from '@/lib/services/rides';

const bookingStatuses = ['confirmed', 'matching', 'driver_assigned', 'on_the_way', 'completed', 'cancelled'] as const;

export default async function AdminBookingDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminSession();
  const { id } = await params;
  const booking = await getBooking(id);

  if (!booking) {
    notFound();
  }

  return (
    <SectionCard title="Chi tiết chuyến đi" description="Thông tin khách hàng, tài xế, xe và dòng thời gian trạng thái.">
      <div className="space-y-5 text-sm text-slate-300">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-base font-semibold text-white">{booking.customerName}</p>
            <p>{booking.phone}</p>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="mb-2 text-base font-semibold text-white">Thông tin khách hàng</p>
            <p>
              <strong className="text-white">Tên:</strong> {booking.customerSnapshot?.name ?? booking.customerName}
            </p>
            <p>
              <strong className="text-white">Điện thoại:</strong> {booking.customerSnapshot?.phone ?? booking.phone}
            </p>
            <p>
              <strong className="text-white">Tên đăng nhập:</strong> {booking.customerSnapshot?.username ?? 'Không có'}
            </p>
            <p>
              <strong className="text-white">Giá ước tính:</strong>{' '}
              {booking.estimatedFare ? `${booking.estimatedFare.toLocaleString()} VND` : 'Không có'}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="mb-2 text-base font-semibold text-white">Thông tin tài xế</p>
            <p>
              <strong className="text-white">Tên:</strong> {booking.driverSnapshot?.driverName ?? 'Chưa phân công'}
            </p>
            <p>
              <strong className="text-white">Điện thoại:</strong> {booking.driverSnapshot?.phone ?? 'Không có'}
            </p>
            <p>
              <strong className="text-white">Khu vực hoạt động:</strong> {booking.driverSnapshot?.serviceArea ?? 'Không có'}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="mb-2 text-base font-semibold text-white">Thông tin xe</p>
            <p>
              <strong className="text-white">Loại:</strong> {booking.vehicleSnapshot?.vehicleType ?? 'Không có'}
            </p>
            <p>
              <strong className="text-white">Biển số:</strong> {booking.vehicleSnapshot?.plateNumber ?? 'Không có'}
            </p>
            <p>
              <strong className="text-white">Số ghế:</strong> {booking.vehicleSnapshot?.seatCount ?? 'Không có'}
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <p>
            <strong className="text-white">Điểm đón:</strong> {booking.pickupLocation}
          </p>
          <p>
            <strong className="text-white">Điểm đến:</strong> {booking.dropoffLocation}
          </p>
          <p>
            <strong className="text-white">Khoảng cách:</strong> {booking.estimatedDistanceKm ?? 'Không có'} km
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

        <div className="flex flex-wrap gap-2">
          {bookingStatuses.map((status) => (
            <AdminActionButton
              key={status}
              label={status.replace('_', ' ')}
              endpoint={`/api/admin/bookings/${booking.id}`}
              payload={{ status }}
            />
          ))}
        </div>

        <div>
          <Link href="/admin/bookings" className="inline-flex text-sm font-semibold text-emerald-300">
            Quay lại danh sách chuyến
          </Link>
        </div>
      </div>
    </SectionCard>
  );
}
