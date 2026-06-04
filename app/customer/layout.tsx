import type { ReactNode } from 'react';
import { getSessionFromCookies } from '@/lib/auth/session';
import { countUnreadNotifications } from '@/lib/services/notifications';
import { RoleShell } from '@/components/role-shell';

export default async function CustomerLayout({ children }: Readonly<{ children: ReactNode }>) {
  const session = await getSessionFromCookies();
  const notificationCount = session?.role ? await countUnreadNotifications({ userId: session.userId, role: session.role }) : 0;

  return (
    <RoleShell
      role="Khách hàng"
      title="Ứng dụng khách hàng"
      description="Đặt chuyến xe chung và theo dõi chuyến hiện tại."
      notificationCount={notificationCount}
      mobileNav={[
        { href: '/customer', label: 'Trang chủ' },
        { href: '/vehicles', label: 'Xe' },
        { href: '/shared-rides', label: 'Xe ghép' },
        { href: '/customer/book', label: 'Đặt xe' },
        { href: '/customer/my-trips', label: 'Chuyến đi của tôi' },
        { href: '/notifications', label: 'Thông báo' },
        { href: '/customer/profile', label: 'Hồ sơ' }
      ]}
    >
      {children}
    </RoleShell>
  );
}
