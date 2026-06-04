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
      role="Admin"
      title="Admin console"
      description="Dispatch, bookings, trips, drivers, and map operations."
      notificationCount={notificationCount}
      mobileNav={[
        { href: '/admin/dashboard', label: 'Dashboard' },
        { href: '/admin/notifications', label: 'Notifications' },
        { href: '/admin/ai-dispatch', label: 'AI Dispatch' },
        { href: '/admin/bookings', label: 'Bookings' },
        { href: '/admin/trips', label: 'Trips' },
        { href: '/admin/payments', label: 'Payments' },
        { href: '/admin/drivers', label: 'Drivers' },
        { href: '/admin/vehicles', label: 'Vehicles' },
        { href: '/admin/map', label: 'Map' }
      ]}
    >
      {children}
    </RoleShell>
  );
}
