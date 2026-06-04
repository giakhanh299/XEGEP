import { randomUUID } from 'crypto';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { NotificationRecord, UserRole } from '@/lib/types';

type NotificationRow = {
  id: string;
  user_id?: string | null;
  role: UserRole;
  title: string;
  message?: string | null;
  body?: string | null;
  type: string;
  is_read?: boolean | null;
  related_booking_id?: string | null;
  created_at: string;
};

type NotificationContext = {
  userId?: string | null;
  role: UserRole;
};

type NotificationInput = {
  userId?: string | null;
  role: UserRole;
  title: string;
  message: string;
  type: string;
  relatedBookingId?: string | null;
  isRead?: boolean;
};

const notificationStore: NotificationRecord[] = [];

function now() {
  return new Date().toISOString();
}

function mapRow(row: NotificationRow): NotificationRecord {
  return {
    id: row.id,
    userId: row.user_id ?? null,
    role: row.role,
    title: row.title,
    message: row.message ?? row.body ?? '',
    type: row.type,
    isRead: row.is_read ?? false,
    relatedBookingId: row.related_booking_id ?? null,
    createdAt: row.created_at
  };
}

function matchesContext(notification: NotificationRecord, context: NotificationContext) {
  if (context.role === 'admin' || context.role === 'super_admin') {
    return notification.role === 'admin' || notification.role === 'super_admin';
  }

  return notification.role === context.role && notification.userId === context.userId;
}

async function persistNotification(notification: NotificationRecord) {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    const { error } = await supabase.from('notifications').insert({
      id: notification.id,
      user_id: notification.userId,
      role: notification.role,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      is_read: notification.isRead,
      related_booking_id: notification.relatedBookingId,
      created_at: notification.createdAt
    });

    if (!error) {
      return true;
    }
  }

  return false;
}

async function loadNotifications() {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      return data.map((row) => mapRow(row as NotificationRow));
    }
  }

  return notificationStore.slice();
}

export async function createNotification(input: NotificationInput) {
  const notification: NotificationRecord = {
    id: randomUUID(),
    userId: input.userId ?? null,
    role: input.role,
    title: input.title,
    message: input.message,
    type: input.type,
    isRead: input.isRead ?? false,
    relatedBookingId: input.relatedBookingId ?? null,
    createdAt: now()
  };

  const persisted = await persistNotification(notification);
  if (!persisted) {
    notificationStore.unshift(notification);
  }

  return notification;
}

export async function createNotifications(inputs: NotificationInput[]) {
  const created: NotificationRecord[] = [];
  for (const input of inputs) {
    created.push(await createNotification(input));
  }
  return created;
}

export async function listNotifications(context?: NotificationContext) {
  const notifications = await loadNotifications();
  if (!context) {
    return notifications;
  }

  return notifications.filter((notification) => matchesContext(notification, context));
}

export async function countUnreadNotifications(context?: NotificationContext) {
  const notifications = await listNotifications(context);
  return notifications.filter((notification) => !notification.isRead).length;
}

export async function getNotificationById(id: string) {
  const notifications = await listNotifications();
  return notifications.find((notification) => notification.id === id) ?? null;
}

export async function markNotificationRead(id: string, context: NotificationContext) {
  const notification = await getNotificationById(id);
  if (!notification || !matchesContext(notification, context)) {
    return null;
  }

  const next = { ...notification, isRead: true };
  const supabase = getSupabaseServerClient();
  if (supabase) {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  } else {
    const index = notificationStore.findIndex((item) => item.id === id);
    if (index >= 0) {
      notificationStore[index] = next;
    }
  }

  return next;
}

export async function markAllNotificationsRead(context: NotificationContext) {
  const notifications = await listNotifications(context);
  const unread = notifications.filter((notification) => !notification.isRead);

  const supabase = getSupabaseServerClient();
  if (supabase) {
    if (context.role === 'admin' || context.role === 'super_admin') {
      await supabase.from('notifications').update({ is_read: true }).in('role', ['admin', 'super_admin']);
    } else if (context.userId) {
      await supabase.from('notifications').update({ is_read: true }).eq('user_id', context.userId).eq('role', context.role);
    }
  } else {
    for (const notification of unread) {
      const index = notificationStore.findIndex((item) => item.id === notification.id);
      if (index >= 0) {
        notificationStore[index] = { ...notificationStore[index], isRead: true };
      }
    }
  }

  return unread.length;
}

export function buildNotificationPayload(input: {
  role: UserRole;
  userId?: string | null;
  title: string;
  message: string;
  type: string;
  relatedBookingId?: string | null;
}): NotificationInput {
  return {
    role: input.role,
    userId: input.userId ?? null,
    title: input.title,
    message: input.message,
    type: input.type,
    relatedBookingId: input.relatedBookingId ?? null
  };
}
