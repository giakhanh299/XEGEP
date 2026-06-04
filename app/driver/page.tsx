import Link from 'next/link';
import { SectionCard } from '@/components/section-card';
import { StatCard } from '@/components/stat-card';
import { getSessionFromCookies } from '@/lib/auth/session';
import { getDriverDashboardBookings } from '@/lib/services/rides';

export default async function DriverHomePage() {
  const session = await getSessionFromCookies();
  const bookings = session?.role === 'driver' ? await getDriverDashboardBookings(session.userId) : [];
  const activeBookings = bookings.filter((booking) => booking.status !== 'completed' && booking.status !== 'cancelled');

  return (
    <div className="grid gap-4">
      <SectionCard title="Chuyến đến" description="Các chuyến đang chờ bạn xử lý.">
        <div className="space-y-3">
          {bookings.slice(0, 2).map((booking) => (
            <div key={booking.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">
                    {booking.pickupLocation} to {booking.dropoffLocation}
                  </p>
                  <p className="text-sm text-slate-400">{booking.bookingTime ?? booking.createdAt}</p>
                  <p className="text-sm text-slate-400">
                    Giá ước tính: {booking.estimatedFare ? `${booking.estimatedFare.toLocaleString()} VND` : 'Không có'}
                  </p>
                </div>
                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
                  {booking.status}
                </span>
              </div>
              <Link href="/driver/bookings" className="mt-3 inline-flex text-sm font-semibold text-emerald-300">
                Xem thao tác
              </Link>
            </div>
          ))}
          {bookings.length === 0 ? <p className="text-sm text-slate-300">Chưa có chuyến đến.</p> : null}
        </div>
      </SectionCard>

      <SectionCard title="Theo dõi trực tiếp" description="Điều khiển chia sẻ vị trí cho chuyến đang chạy.">
        <div className="grid gap-3 sm:grid-cols-2">
          <button type="button" className="rounded-2xl bg-emerald-400 px-4 py-4 font-semibold text-slate-950">
            Bắt đầu chia sẻ vị trí
          </button>
          <button type="button" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 font-semibold text-white">
            Dừng chia sẻ vị trí
          </button>
        </div>
      </SectionCard>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Chuyến đi" value={String(bookings.length)} detail="Các chuyến được phân công và lịch sử." />
        <StatCard label="Đang hoạt động" value={String(activeBookings.length)} detail="Chuyến chờ xử lý hoặc đang chạy." />
        <StatCard label="Tài xế" value={session?.username ?? 'Khách'} detail="Tài khoản đang đăng nhập." />
      </div>
    </div>
  );
}
