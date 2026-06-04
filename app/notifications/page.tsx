import { redirect } from 'next/navigation';
import { RoleShell } from '@/components/role-shell';
import { SectionCard } from '@/components/section-card';
import { NotificationInbox } from '@/components/notification-inbox';
import { getSessionFromCookies } from '@/lib/auth/session';
import { countUnreadNotifications, listNotifications } from '@/lib/services/notifications';

export default async function NotificationsPage() {
  const session = await getSessionFromCookies();

  if (!session) {
    redirect('/auth');
  }

  if (session.role === 'admin' || session.role === 'super_admin') {
    redirect('/admin/notifications');
  }

  const notifications = await listNotifications({ userId: session.userId, role: session.role });
  const unreadCount = await countUnreadNotifications({ userId: session.userId, role: session.role });
  const roleLabel = session.role === 'driver' ? 'Tài xế' : 'Khách hàng';
  const mobileNav =
    session.role === 'driver'
      ? [
          { href: '/driver', label: 'Trang chủ' },
          { href: '/driver/bookings', label: 'Chuyến đi' },
          { href: '/notifications', label: 'Thông báo' },
          { href: '/driver/trips', label: 'Lịch chạy' }
        ]
      : [
          { href: '/customer', label: 'Trang chủ' },
          { href: '/vehicles', label: 'Xe' },
          { href: '/customer/book', label: 'Đặt xe' },
          { href: '/customer/my-trips', label: 'Chuyến đi của tôi' },
          { href: '/notifications', label: 'Thông báo' },
          { href: '/customer/profile', label: 'Hồ sơ' }
        ];

  return (
    <RoleShell
      role={roleLabel}
      title="Thông báo"
      description="Cảnh báo chuyến đi và cập nhật trạng thái."
      notificationCount={unreadCount}
      mobileNav={mobileNav}
    >
      <SectionCard title="Hộp thư" description="Đọc thông báo về chuyến đi và trạng thái.">
        <NotificationInbox notifications={notifications} role={session.role} />
      </SectionCard>
    </RoleShell>
  );
}
