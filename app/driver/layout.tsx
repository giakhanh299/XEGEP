import type { ReactNode } from 'react';
import { requireRole } from '@/lib/auth/guards';
import { countUnreadNotifications } from '@/lib/services/notifications';
import { RoleShell } from '@/components/role-shell';

export default async function DriverLayout({ children }: Readonly<{ children: ReactNode }>) {
  const session = await requireRole('driver');
  const notificationCount = await countUnreadNotifications({ userId: session.userId, role: session.role });

  return (
    <RoleShell
      role="Tài xế"
      title="Ứng dụng tài xế"
      description="Xử lý các chuyến được giao và quy trình đón khách."
      notificationCount={notificationCount}
      mobileNav={[
        { href: '/driver', label: 'Trang chủ' },
        { href: '/driver/bookings', label: 'Chuyến đi' },
        { href: '/shared-rides', label: 'Quản lý xe ghép' },
        { href: '/notifications', label: 'Thông báo' },
        { href: '/driver/trips', label: 'Lịch chạy' }
      ]}
    >
      {children}
    </RoleShell>
  );
}
