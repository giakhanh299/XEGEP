'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { NotificationRecord, UserRole } from '@/lib/types';

function bookingHref(role: UserRole, bookingId?: string | null) {
  if (!bookingId) {
    return null;
  }

  if (role === 'customer') {
    return `/customer/my-trips/${bookingId}`;
  }

  if (role === 'driver') {
    return `/driver/bookings/${bookingId}`;
  }

  return `/admin/bookings/${bookingId}`;
}

export function NotificationInbox({
  notifications,
  role,
  adminView = false
}: {
  notifications: NotificationRecord[];
  role: UserRole;
  adminView?: boolean;
}) {
  const router = useRouter();
  const endpointBase = adminView ? '/api/admin/notifications' : '/api/notifications';

  async function markRead(id: string) {
    await fetch(`${endpointBase}/${id}`, { method: 'PATCH' });
    router.refresh();
  }

  async function markAllRead() {
    await fetch(endpointBase, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'mark_all_read' })
    });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-300">
          {notifications.filter((notification) => !notification.isRead).length} thông báo chưa đọc
        </p>
        <button
          type="button"
          onClick={markAllRead}
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white"
        >
          Đánh dấu tất cả đã đọc
        </button>
      </div>

      {notifications.length === 0 ? <p className="text-sm text-slate-300">Chưa có thông báo.</p> : null}

      <div className="space-y-3">
        {notifications.map((notification) => {
          const href = bookingHref(role, notification.relatedBookingId);

          return (
            <article
              key={notification.id}
              className={`rounded-2xl border p-4 ${notification.isRead ? 'border-white/10 bg-white/5' : 'border-emerald-400/20 bg-emerald-400/5'}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-white">{notification.title}</p>
                    {!notification.isRead ? (
                      <span className="rounded-full bg-rose-400 px-2 py-0.5 text-[10px] font-bold text-white">
                        Mới
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-slate-300">{notification.message}</p>
                  <p className="mt-2 text-xs text-slate-500">{notification.createdAt}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {href ? (
                    <Link
                      href={href}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white"
                    >
                      Xem chuyến đi
                    </Link>
                  ) : null}
                  {!notification.isRead ? (
                    <button
                      type="button"
                      onClick={() => markRead(notification.id)}
                      className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-100"
                    >
                      Đánh dấu đã đọc
                    </button>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
