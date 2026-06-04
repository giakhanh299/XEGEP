import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { RoleShell } from '@/components/role-shell';
import { getAdminSession } from '@/lib/auth/admin';
import { countUnreadNotifications } from '@/lib/services/notifications';

export default async function AdminLayout({ children }: Readonly<{ children: ReactNode }>) {
  const session = await getAdminSession();
  if (!session) {
    redirect('/auth');
  }
  const notificationCount = await countUnreadNotifications({ userId: session.userId, role: session.role });

  return (
    <RoleShell
      role="Quản trị"
      title="Bảng điều khiển quản trị"
      description="Điều phối, chuyến đi, tài xế và bản đồ."
      notificationCount={notificationCount}
      mobileNav={[
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
      ]}
    >
      {children}
    </RoleShell>
  );
}
