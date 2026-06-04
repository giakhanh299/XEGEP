import type { ReactNode } from 'react';
import { getSessionFromCookies } from '@/lib/auth/session';
import { countUnreadNotifications } from '@/lib/services/notifications';
import { RoleShell } from '@/components/role-shell';

export default async function DriverLayout({ children }: Readonly<{ children: ReactNode }>) {
  const session = await getSessionFromCookies();
  const notificationCount = session?.role ? await countUnreadNotifications({ userId: session.userId, role: session.role }) : 0;

  return (
    <RoleShell
      role="Driver"
      title="Driver app"
      description="Handle assigned trips and pickup workflow."
      notificationCount={notificationCount}
      mobileNav={[
        { href: '/driver', label: 'Home' },
        { href: '/driver/bookings', label: 'Bookings' },
        { href: '/notifications', label: 'Notifications' },
        { href: '/driver/trips', label: 'Trips' }
      ]}
    >
      {children}
    </RoleShell>
  );
}
