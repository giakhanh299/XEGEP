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
  const roleLabel = session.role === 'driver' ? 'Driver' : 'Customer';
  const mobileNav =
    session.role === 'driver'
      ? [
          { href: '/driver', label: 'Home' },
          { href: '/driver/bookings', label: 'Bookings' },
          { href: '/notifications', label: 'Notifications' },
          { href: '/driver/trips', label: 'Trips' }
        ]
      : [
          { href: '/customer', label: 'Home' },
          { href: '/vehicles', label: 'Vehicles' },
          { href: '/customer/book', label: 'Book Ride' },
          { href: '/customer/my-trips', label: 'My Trips' },
          { href: '/notifications', label: 'Notifications' },
          { href: '/customer/profile', label: 'Profile' }
        ];

  return (
    <RoleShell
      role={roleLabel}
      title="Notifications"
      description="Booking alerts and status updates."
      notificationCount={unreadCount}
      mobileNav={mobileNav}
    >
      <SectionCard title="Inbox" description="Read booking and status notifications.">
        <NotificationInbox notifications={notifications} role={session.role} />
      </SectionCard>
    </RoleShell>
  );
}
