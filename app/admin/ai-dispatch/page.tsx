import { SectionCard } from '@/components/section-card';
import { calculateTripScore, groupBookingsIntoTrips, recommendDepartureTime } from '@/lib/ai/dispatchEngine';
import { predictRouteDemand } from '@/lib/ai/demandPredictor';
import { mockBookings, mockTrips } from '@/lib/mock-data';

export default function AdminAiDispatchPage() {
  const suggestions = groupBookingsIntoTrips(mockBookings);
  const routeDemand = predictRouteDemand('dai_loc_to_da_nang', new Date().toISOString());

  return (
    <div className="grid gap-4">
      <SectionCard title="AI dispatch suggestions" description="Deterministic grouping and recommendation preview.">
        <div className="space-y-3">
          {suggestions.map((trip, index) => (
            <div key={trip.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">Suggested trip {index + 1}</p>
                  <p className="text-sm text-slate-400">
                    {trip.routeType} - {trip.passengerCount}/{trip.maxCapacity} seats
                  </p>
                </div>
                <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                  Score {calculateTripScore(trip)}
                </span>
              </div>
              <div className="mt-3 text-sm text-slate-300">
                Departure recommendation: {recommendDepartureTime(mockBookings)}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Dispatch metrics" description="Operational hints for the admin review flow.">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
            Suggested trips: {suggestions.length}
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
            Current trips: {mockTrips.length}
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
            Route demand: {routeDemand.demandLevel} ({routeDemand.confidence})
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
