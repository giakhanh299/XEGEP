import { VehicleBrowser } from '@/components/vehicle-browser';
import { SectionCard } from '@/components/section-card';
import { listVehicleSelections } from '@/lib/services/rides';

export default async function VehiclesPage() {
  const vehicles = await listVehicleSelections();

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <SectionCard title="Available vehicles" description="Browse drivers, vehicles, seat count, and service areas before booking.">
          <VehicleBrowser vehicles={vehicles} />
        </SectionCard>
      </div>
    </main>
  );
}
