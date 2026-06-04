import { SectionCard } from '@/components/section-card';
import { DriverBookingsBoard } from '@/components/driver-bookings-board';
import { getSessionFromCookies } from '@/lib/auth/session';
import { getDriverDashboardBookings } from '@/lib/services/rides';
import Link from 'next/link';

export default async function DriverBookingsPage() {
  const session = await getSessionFromCookies();
  const bookings = session?.role === 'driver' ? await getDriverDashboardBookings(session.userId) : [];

  if (!session || session.role !== 'driver') {
    return (
      <SectionCard title="Chuyến của tài xế" description="Đăng nhập bằng tài khoản tài xế để xử lý các chuyến đến.">
        <Link href="/auth" className="inline-flex rounded-2xl bg-emerald-400 px-4 py-3 font-semibold text-slate-950">
          Đi đến đăng nhập
        </Link>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Chuyến của tài xế" description="Nhận, từ chối hoặc hoàn thành các chuyến được giao.">
      <DriverBookingsBoard bookings={bookings} />
    </SectionCard>
  );
}
