import type { BookingRecord, BookingStatus, UserRole } from '@/lib/types';
import { getCustomerByUserId, getDriverByUserId, listAdminUsers } from '@/lib/services/accounts';
import { buildNotificationPayload, createNotifications } from '@/lib/services/notifications';
import { notifyTelegramAdmin, notifyTelegramRecipient } from '@/lib/telegram/notify';

type BookingNotificationPayload = {
  bookingId: string;
  status: 'created' | BookingStatus;
  actorRole: UserRole;
  actorId?: string | null;
  customerName?: string;
  driverName?: string | null;
};

function statusLabel(status: 'created' | BookingStatus) {
  switch (status) {
    case 'created':
      return 'đã được tạo';
    case 'pending':
      return 'chờ xử lý';
    case 'accepted':
      return 'đã nhận chuyến';
    case 'cancelled':
      return 'đã hủy';
    case 'completed':
      return 'hoàn thành';
    case 'confirmed':
      return 'đã xác nhận';
    case 'matching':
      return 'đang ghép chuyến';
    case 'driver_assigned':
      return 'đã phân tài xế';
    case 'on_the_way':
      return 'đang trên đường';
    default:
      return status;
  }
}

function bookingSummary(booking: BookingRecord) {
  return `${booking.customerName} đặt xe từ ${booking.pickupLocation} đến ${booking.dropoffLocation}`;
}

async function sendBookingTelegramNotifications(booking: BookingRecord, payload: BookingNotificationPayload) {
  const summary = bookingSummary(booking);

  if (payload.status === 'created') {
    await notifyTelegramAdmin(
      `Đã tạo chuyến mới\n${summary}\nTài xế: ${booking.driverSnapshot?.driverName ?? 'chưa phân công'}\nMã chuyến: ${booking.id}`,
      payload
    );

    if (booking.driverId) {
      const driver = await getDriverByUserId(booking.driverId);
      await notifyTelegramRecipient(
        driver?.telegramChatId,
        `Chuyến mới đã được phân công\n${summary}\nSố ghế: ${booking.passengerCount}\nMã chuyến: ${booking.id}`,
        payload
      );
    }
    return;
  }

  const label = statusLabel(payload.status);
  if (booking.customerId) {
    const customer = await getCustomerByUserId(booking.customerId);
    await notifyTelegramRecipient(
      customer?.telegramChatId,
      `Chuyến đi ${label}\n${summary}\nMã chuyến: ${booking.id}`,
      payload
    );
  }

  if (booking.driverId) {
    const driver = await getDriverByUserId(booking.driverId);
    await notifyTelegramRecipient(
      driver?.telegramChatId,
      `Chuyến đi ${label}\n${summary}\nMã chuyến: ${booking.id}`,
      payload
    );
  }

  const adminPayload = `Chuyến của ${booking.customerName} ${label}\n${summary}\nMã chuyến: ${booking.id}`;
  await notifyTelegramAdmin(adminPayload, payload);
}

export async function notifyBookingCreated(booking: BookingRecord, actorRole: UserRole, actorId?: string | null) {
  const payload: BookingNotificationPayload = {
    bookingId: booking.id,
    status: 'created',
    actorRole,
    actorId,
    customerName: booking.customerName,
    driverName: booking.driverSnapshot?.driverName ?? null
  };

  await sendBookingTelegramNotifications(booking, payload);

  const recipients = [];
  if (booking.driverId) {
    recipients.push(
      buildNotificationPayload({
        role: 'driver',
        userId: booking.driverId,
        title: 'Chuyến mới được phân công',
        message: `${booking.customerName} đã đặt chuyến từ ${booking.pickupLocation} đến ${booking.dropoffLocation}.`,
        type: 'booking_created',
        relatedBookingId: booking.id
      })
    );
  }

  const adminUsers = await listAdminUsers();
  for (const admin of adminUsers) {
    recipients.push(
      buildNotificationPayload({
        role: admin.role,
        userId: admin.id,
        title: 'Đã tạo chuyến mới',
        message: `${booking.customerName} đã đặt chuyến từ ${booking.pickupLocation} đến ${booking.dropoffLocation}.`,
        type: 'booking_created',
        relatedBookingId: booking.id
      })
    );
  }

  if (recipients.length > 0) {
    await createNotifications(recipients);
  }
}

export async function notifyBookingStatusChanged(
  booking: BookingRecord,
  status: BookingStatus,
  actorRole: UserRole,
  actorId?: string | null
) {
  const payload: BookingNotificationPayload = {
    bookingId: booking.id,
    status,
    actorRole,
    actorId,
    customerName: booking.customerName,
    driverName: booking.driverSnapshot?.driverName ?? null
  };

  await sendBookingTelegramNotifications(booking, payload);

  const label = statusLabel(status);
  const recipients = [
    ...(booking.customerId
      ? [
          buildNotificationPayload({
            role: 'customer',
            userId: booking.customerId,
            title: `Chuyến đi ${label}`,
            message: `Chuyến đi từ ${booking.pickupLocation} đến ${booking.dropoffLocation} của bạn đã được cập nhật thành ${label}.`,
            type: 'booking_status_changed',
            relatedBookingId: booking.id
          })
        ]
      : [])
  ];

  if (booking.driverId) {
    recipients.push(
      buildNotificationPayload({
        role: 'driver',
        userId: booking.driverId,
        title: `Chuyến đi ${label}`,
        message: `Chuyến từ ${booking.pickupLocation} đến ${booking.dropoffLocation} đã được cập nhật thành ${label}.`,
        type: 'booking_status_changed',
        relatedBookingId: booking.id
      })
    );
  }

  const adminUsers = await listAdminUsers();
  for (const admin of adminUsers) {
    recipients.push(
      buildNotificationPayload({
        role: admin.role,
        userId: admin.id,
        title: `Chuyến đi ${label}`,
        message: `Chuyến của ${booking.customerName} từ ${booking.pickupLocation} đến ${booking.dropoffLocation} đã được cập nhật thành ${label}.`,
        type: 'booking_status_changed',
        relatedBookingId: booking.id
      })
    );
  }

  await createNotifications(recipients);
}
