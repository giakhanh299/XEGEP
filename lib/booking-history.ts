import { BookingRecord, BookingStatusHistoryEntry } from '@/lib/types';

export function getLatestBookingHistoryEntry(history?: BookingStatusHistoryEntry[] | null) {
  if (!history || history.length === 0) {
    return null;
  }

  return history[history.length - 1];
}

export function getLatestBookingStatusLabel(booking: Pick<BookingRecord, 'status' | 'statusHistory' | 'updatedAt'>) {
  const latest = getLatestBookingHistoryEntry(booking.statusHistory);
  return {
    status: latest?.status ?? booking.status,
    timestamp: latest?.timestamp ?? booking.updatedAt
  };
}
