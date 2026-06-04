import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SectionCard } from '@/components/section-card';
import { StatusBadge } from '@/components/status-badge';
import { BookingHistory } from '@/components/booking-history';
import { AdminActionButton } from '@/components/admin/action-buttons';
import { requireAdminSession } from '@/lib/auth/admin';
import { getBooking } from '@/lib/services/rides';

const bookingStatuses = ['confirmed', 'matching', 'driver_assigned', 'on_the_way', 'completed', 'cancelled'] as const;

export default async function AdminBookingDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminSession();
  const { id } = await params;
  const booking = await getBooking(id);

  if (!booking) {
    notFound();
  }

  return (
    <SectionCard title="Booking detail" description="Customer, driver, vehicle, and status timeline.">
      <div className="space-y-5 text-sm text-slate-300">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-base font-semibold text-white">{booking.customerName}</p>
            <p>{booking.phone}</p>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="mb-2 text-base font-semibold text-white">Customer info</p>
            <p>
              <strong className="text-white">Name:</strong> {booking.customerSnapshot?.name ?? booking.customerName}
            </p>
            <p>
              <strong className="text-white">Phone:</strong> {booking.customerSnapshot?.phone ?? booking.phone}
            </p>
            <p>
              <strong className="text-white">Username:</strong> {booking.customerSnapshot?.username ?? 'N/A'}
            </p>
            <p>
              <strong className="text-white">Estimated fare:</strong>{' '}
              {booking.estimatedFare ? `${booking.estimatedFare.toLocaleString()} VND` : 'N/A'}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="mb-2 text-base font-semibold text-white">Driver info</p>
            <p>
              <strong className="text-white">Name:</strong> {booking.driverSnapshot?.driverName ?? 'Unassigned'}
            </p>
            <p>
              <strong className="text-white">Phone:</strong> {booking.driverSnapshot?.phone ?? 'N/A'}
            </p>
            <p>
              <strong className="text-white">Service area:</strong> {booking.driverSnapshot?.serviceArea ?? 'N/A'}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="mb-2 text-base font-semibold text-white">Vehicle info</p>
            <p>
              <strong className="text-white">Type:</strong> {booking.vehicleSnapshot?.vehicleType ?? 'N/A'}
            </p>
            <p>
              <strong className="text-white">Plate:</strong> {booking.vehicleSnapshot?.plateNumber ?? 'N/A'}
            </p>
            <p>
              <strong className="text-white">Seats:</strong> {booking.vehicleSnapshot?.seatCount ?? 'N/A'}
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <p>
            <strong className="text-white">Pickup:</strong> {booking.pickupLocation}
          </p>
          <p>
            <strong className="text-white">Destination:</strong> {booking.dropoffLocation}
          </p>
          <p>
            <strong className="text-white">Distance:</strong> {booking.estimatedDistanceKm ?? 'N/A'} km
          </p>
          <p>
            <strong className="text-white">Travel time:</strong> {booking.travelTime ?? booking.bookingTime ?? 'N/A'}
          </p>
          <p>
            <strong className="text-white">Notes:</strong> {booking.notes ?? 'None'}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="mb-3 text-base font-semibold text-white">Status history</p>
          <BookingHistory history={booking.statusHistory ?? []} />
        </div>

        <div className="flex flex-wrap gap-2">
          {bookingStatuses.map((status) => (
            <AdminActionButton
              key={status}
              label={status.replace('_', ' ')}
              endpoint={`/api/admin/bookings/${booking.id}`}
              payload={{ status }}
            />
          ))}
        </div>

        <div>
          <Link href="/admin/bookings" className="inline-flex text-sm font-semibold text-emerald-300">
            Back to bookings
          </Link>
        </div>
      </div>
    </SectionCard>
  );
}
