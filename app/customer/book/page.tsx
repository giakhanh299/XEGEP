import { BookingForm } from '@/components/booking-form';
import { SectionCard } from '@/components/section-card';
import { getSessionFromCookies } from '@/lib/auth/session';
import { getCustomerByUserId } from '@/lib/services/accounts';
import { listVehicleSelections } from '@/lib/services/rides';

export default async function CustomerBookPage({
  searchParams
}: {
  searchParams?: Promise<{ driverId?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const session = await getSessionFromCookies();
  const customer = session?.role === 'customer' ? await getCustomerByUserId(session.userId) : null;
  const drivers = await listVehicleSelections();

  return (
    <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
      <BookingForm
        customer={
          customer
            ? {
                name: customer.fullName,
                phone: customer.phone,
                address: customer.address,
                username: customer.username
              }
            : null
        }
        selectedDriverId={params.driverId ?? null}
        drivers={drivers}
      />
      <SectionCard title="Booking rules" description="Operational guardrails for the first release.">
        <ul className="space-y-3 text-sm leading-6 text-slate-300">
          <li>Customer details are loaded from your signed-in account.</li>
          <li>Drivers can review and manage incoming bookings from their dashboard.</li>
          <li>Vehicle images fall back to a placeholder if no photo URL is set.</li>
          <li>Image upload support can be swapped to R2 later without changing the UI.</li>
        </ul>
      </SectionCard>
    </div>
  );
}
