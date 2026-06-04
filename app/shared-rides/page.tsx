import { redirect } from 'next/navigation';
import { RoleShell } from '@/components/role-shell';
import { SectionCard } from '@/components/section-card';
import { SharedRideGroups } from '@/components/shared-ride-groups';
import { getSessionFromCookies } from '@/lib/auth/session';
import { countUnreadNotifications } from '@/lib/services/notifications';
import { getSharedRideSummary } from '@/lib/services/shared-rides';

export default async function SharedRidesPage() {
  const session = await getSessionFromCookies();
  if (!session) {
    redirect('/auth');
  }

  const summary = await getSharedRideSummary({ role: session.role, userId: session.userId });
  const notificationCount = await countUnreadNotifications({ userId: session.userId, role: session.role });
  const roleLabel =
    session.role === 'driver' ? 'Tài xế' : session.role === 'admin' || session.role === 'super_admin' ? 'Quản trị' : 'Khách hàng';
  const title = session.role === 'customer' ? 'Xe ghép' : 'Quản lý xe ghép';
  const description =
    session.role === 'customer'
      ? 'Xem các nhóm xe ghép đang còn chỗ để đặt thêm ghế.'
      : 'Theo dõi các nhóm xe ghép theo tuyến, giờ khởi hành và số ghế còn lại.';
  const mobileNav =
    session.role === 'driver'
      ? [
          { href: '/driver', label: 'Trang chủ' },
          { href: '/driver/bookings', label: 'Chuyến đi' },
          { href: '/shared-rides', label: 'Quản lý xe ghép' },
          { href: '/notifications', label: 'Thông báo' },
          { href: '/driver/trips', label: 'Lịch chạy' }
        ]
      : session.role === 'customer'
        ? [
            { href: '/customer', label: 'Trang chủ' },
            { href: '/vehicles', label: 'Xe' },
            { href: '/shared-rides', label: 'Xe ghép' },
            { href: '/customer/book', label: 'Đặt xe' },
            { href: '/customer/my-trips', label: 'Chuyến đi của tôi' },
            { href: '/notifications', label: 'Thông báo' },
            { href: '/customer/profile', label: 'Hồ sơ' }
          ]
        : [
            { href: '/admin/dashboard', label: 'Bảng điều khiển' },
            { href: '/admin/notifications', label: 'Thông báo' },
            { href: '/admin/ai-dispatch', label: 'Điều phối AI' },
            { href: '/admin/bookings', label: 'Chuyến đi' },
            { href: '/shared-rides', label: 'Quản lý xe ghép' },
            { href: '/admin/trips', label: 'Lượt chạy' },
            { href: '/admin/payments', label: 'Thanh toán' },
            { href: '/admin/drivers', label: 'Tài xế' },
            { href: '/admin/vehicles', label: 'Xe' },
            { href: '/admin/map', label: 'Bản đồ' }
          ];

  return (
    <RoleShell role={roleLabel} title={title} description={description} notificationCount={notificationCount} mobileNav={mobileNav}>
      <SectionCard
        title={title}
        description={`Tổng nhóm: ${summary.totalGroups} | Sắp đầy: ${summary.groups.filter((group) => group.statusLabel === 'Sắp đủ').length} | Đủ khách: ${summary.fullGroups}`}
      >
        <SharedRideGroups groups={summary.groups} role={session.role} />
      </SectionCard>
    </RoleShell>
  );
}
