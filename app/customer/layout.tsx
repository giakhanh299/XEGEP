import type { ReactNode } from 'react';
import { getSessionFromCookies } from '@/lib/auth/session';
import { countUnreadNotifications } from '@/lib/services/notifications';
import { RoleShell } from '@/components/role-shell';

export default async function CustomerLayout({ children }: Readonly<{ children: ReactNode }>) {
  const session = await getSessionFromCookies();
  const notificationCount = session?.role ? await countUnreadNotifications({ userId: session.userId, role: session.role }) : 0;

  return (
    <RoleShell
      role="Customer"
      title="Customer app"
      description="Book a shared ride and track your current trip."
      notificationCount={notificationCount}
      mobileNav={[
        { href: '/customer', label: 'Home' },
        { href: '/vehicles', label: 'Vehicles' },
        { href: '/customer/book', label: 'Book Ride' },
        { href: '/customer/my-trips', label: 'My Trips' },
        { href: '/notifications', label: 'Notifications' },
        { href: '/customer/profile', label: 'Profile' }
      ]}
    >
      {children}
    </RoleShell>
  );
}
