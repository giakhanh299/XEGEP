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

function bookingSummary(booking: BookingRecord) {
  return `${booking.customerName} booked ${booking.pickupLocation} to ${booking.dropoffLocation}`;
}

async function sendBookingTelegramNotifications(booking: BookingRecord, payload: BookingNotificationPayload) {
  const summary = bookingSummary(booking);

  if (payload.status === 'created') {
    await notifyTelegramAdmin(
      `New booking created\n${summary}\nDriver: ${booking.driverSnapshot?.driverName ?? 'unassigned'}\nBooking ID: ${booking.id}`,
      payload
    );

    if (booking.driverId) {
      const driver = await getDriverByUserId(booking.driverId);
      await notifyTelegramRecipient(
        driver?.telegramChatId,
        `New booking assigned\n${summary}\nSeats: ${booking.passengerCount}\nBooking ID: ${booking.id}`,
        payload
      );
    }
    return;
  }

  const statusLabel = payload.status;
  if (booking.customerId) {
    const customer = await getCustomerByUserId(booking.customerId);
    await notifyTelegramRecipient(
      customer?.telegramChatId,
      `Booking ${statusLabel}\n${summary}\nBooking ID: ${booking.id}`,
      payload
    );
  }

  if (booking.driverId) {
    const driver = await getDriverByUserId(booking.driverId);
    await notifyTelegramRecipient(
      driver?.telegramChatId,
      `Booking ${statusLabel}\n${summary}\nBooking ID: ${booking.id}`,
      payload
    );
  }

  const adminPayload = `${booking.customerName}'s booking ${statusLabel}\n${summary}\nBooking ID: ${booking.id}`;
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
        title: 'New booking assigned',
        message: `${booking.customerName} created a booking from ${booking.pickupLocation} to ${booking.dropoffLocation}.`,
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
        title: 'New booking created',
        message: `${booking.customerName} created a booking from ${booking.pickupLocation} to ${booking.dropoffLocation}.`,
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

  const recipients = [
    ...(booking.customerId
      ? [
          buildNotificationPayload({
            role: 'customer',
            userId: booking.customerId,
            title: `Booking ${status}`,
            message: `Your booking from ${booking.pickupLocation} to ${booking.dropoffLocation} was updated to ${status}.`,
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
        title: `Booking ${status}`,
        message: `Booking from ${booking.pickupLocation} to ${booking.dropoffLocation} was updated to ${status}.`,
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
        title: `Booking ${status}`,
        message: `${booking.customerName}'s booking from ${booking.pickupLocation} to ${booking.dropoffLocation} was updated to ${status}.`,
        type: 'booking_status_changed',
        relatedBookingId: booking.id
      })
    );
  }

  await createNotifications(recipients);
}
