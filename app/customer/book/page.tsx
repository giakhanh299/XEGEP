import Link from 'next/link';
import { BookingForm } from '@/components/booking-form';
import { SectionCard } from '@/components/section-card';
import { getSessionFromCookies } from '@/lib/auth/session';
import { getCustomerByUserId } from '@/lib/services/accounts';
import { listVehicleSelections } from '@/lib/services/rides';

export default async function CustomerBookPage({
  searchParams
}: {
  searchParams?: Promise<{ driverId?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const session = await getSessionFromCookies();
  const customer = session?.role === 'customer' ? await getCustomerByUserId(session.userId) : null;
  const drivers = await listVehicleSelections();

  return (
    <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
      <BookingForm
        customer={
          customer
            ? {
                name: customer.fullName,
                phone: customer.phone,
                address: customer.address,
                username: customer.username
              }
            : null
        }
        selectedDriverId={params.driverId ?? null}
        drivers={drivers}
      />
      <SectionCard title="Quy tắc đặt xe" description="Các giới hạn vận hành cho bản phát hành đầu tiên.">
        <ul className="space-y-3 text-sm leading-6 text-slate-300">
          <li>Thông tin khách hàng sẽ được lấy từ tài khoản đang đăng nhập.</li>
          <li>Tài xế có thể xem và xử lý các chuyến đến từ bảng điều khiển.</li>
          <li>Ảnh xe sẽ dùng ảnh thay thế nếu chưa có URL ảnh.</li>
          <li>Bạn có thể xem các nhóm xe ghép còn chỗ tại mục Xe ghép.</li>
          <li>Hỗ trợ tải ảnh có thể chuyển sang R2 sau này mà không cần đổi giao diện.</li>
        </ul>
        <div className="mt-4">
          <Link href="/shared-rides" className="inline-flex rounded-2xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950">
            Xem xe ghép
          </Link>
        </div>
      </SectionCard>
    </div>
  );
}
