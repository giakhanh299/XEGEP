import { SectionCard } from '@/components/section-card';
import { NotificationInbox } from '@/components/notification-inbox';
import { requireAdminSession } from '@/lib/auth/admin';
import { countUnreadNotifications, listNotifications } from '@/lib/services/notifications';

export default async function AdminNotificationsPage() {
  const session = await requireAdminSession();
  const notifications = await listNotifications({ userId: session.userId, role: session.role });
  const unreadCount = await countUnreadNotifications({ userId: session.userId, role: session.role });

  return (
    <SectionCard title="Notifications" description="Shared admin inbox for booking alerts and status changes.">
      <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
        Unread notifications: {unreadCount}
      </div>
      <NotificationInbox notifications={notifications} role={session.role} adminView />
    </SectionCard>
  );
}
