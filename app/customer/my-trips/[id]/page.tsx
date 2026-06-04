import { notFound } from 'next/navigation';
import { SectionCard } from '@/components/section-card';
import { StatusBadge } from '@/components/status-badge';
import { getSessionFromCookies } from '@/lib/auth/session';
import { BookingHistory } from '@/components/booking-history';
import { getBookingForActor } from '@/lib/services/rides';

export default async function CustomerTripDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSessionFromCookies();
  const booking = await getBookingForActor(id, session ? { userId: session.userId, role: session.role } : null);

  if (!booking || session?.role !== 'customer') {
    notFound();
  }

  return (
    <SectionCard
      title={`${booking.pickupLocation} to ${booking.dropoffLocation}`}
      description="Booking snapshot and live status."
    >
      <div className="space-y-3 text-sm text-slate-300">
        <StatusBadge status={booking.status} />
        <p>
          Driver: <span className="text-white">{booking.driverSnapshot?.driverName ?? 'Pending assignment'}</span>
        </p>
        <p>
          Vehicle: <span className="text-white">{booking.vehicleSnapshot?.vehicleType ?? 'Pending assignment'}</span>
        </p>
        <p>
          Estimated fare: <span className="text-white">{booking.estimatedFare ? `${booking.estimatedFare.toLocaleString()} VND` : 'N/A'}</span>
        </p>
        <p>
          Booking time: <span className="text-white">{booking.bookingTime ?? booking.createdAt}</span>
        </p>
        <p>
          Notes: <span className="text-white">{booking.notes ?? 'None'}</span>
        </p>
        <div className="pt-2">
          <p className="mb-3 text-base font-semibold text-white">Status history</p>
          <BookingHistory history={booking.statusHistory ?? []} />
        </div>
      </div>
    </SectionCard>
  );
}
