import Link from 'next/link';
import { SectionCard } from '@/components/section-card';
import { StatCard } from '@/components/stat-card';
import { getSessionFromCookies } from '@/lib/auth/session';
import { getCustomerDashboardBookings } from '@/lib/services/rides';

export default async function CustomerHomePage() {
  const session = await getSessionFromCookies();
  const bookings = session?.role === 'customer' ? await getCustomerDashboardBookings(session.userId) : [];
  const activeBookings = bookings.filter((booking) => booking.status !== 'completed' && booking.status !== 'cancelled');

  return (
    <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      <SectionCard title="Chuyến hiện tại" description="Yêu cầu xe gần nhất của bạn.">
        <div className="space-y-4">
          {bookings[0] ? (
            <>
              <div className="flex items-center justify-between">
                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
                  {bookings[0].status}
                </span>
                <span className="text-sm text-slate-400">{bookings[0].bookingTime ?? bookings[0].createdAt}</span>
              </div>
              <div className="space-y-2 text-sm text-slate-200">
                <p>
                  <strong className="text-white">Từ:</strong> {bookings[0].pickupLocation}
                </p>
                <p>
                  <strong className="text-white">Đến:</strong> {bookings[0].dropoffLocation}
                </p>
                <p>
                  <strong className="text-white">Tài xế:</strong> {bookings[0].driverSnapshot?.driverName ?? 'Đang chờ phân công'}
                </p>
                <p>
                  <strong className="text-white">Giá ước tính:</strong>{' '}
                  {bookings[0].estimatedFare ? `${bookings[0].estimatedFare.toLocaleString()} VND` : 'Không có'}
                </p>
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-300">Bạn chưa có chuyến nào đang hoạt động.</p>
          )}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            Xem xe, kiểm tra lịch sử chuyến đi và cập nhật hồ sơ để đặt xe nhanh hơn.
          </div>
          <Link href="/customer/book" className="inline-flex rounded-2xl bg-emerald-400 px-4 py-3 font-semibold text-slate-950">
            Đặt chuyến khác
          </Link>
        </div>
      </SectionCard>

      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          <StatCard label="Tổng chuyến" value={String(bookings.length)} detail="Tất cả yêu cầu xe trong lịch sử." />
          <StatCard label="Chuyến đang hoạt động" value={String(activeBookings.length)} detail="Các chuyến chờ xử lý hoặc đang chạy." />
          <StatCard label="Đã đăng nhập" value={session?.username ?? 'Khách'} detail="Lấy từ cookie phiên đăng nhập." />
        </div>
        <SectionCard title="Thao tác nhanh" description="Các thao tác thường dùng cho khách hàng.">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <Link href="/vehicles" className="rounded-2xl border border-white/10 bg-white/5 p-4">
              Xem xe
            </Link>
            <Link href="/customer/my-trips" className="rounded-2xl border border-white/10 bg-white/5 p-4">
              Xem chuyến đi của tôi
            </Link>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
