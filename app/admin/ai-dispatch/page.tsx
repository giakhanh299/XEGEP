import { SectionCard } from '@/components/section-card';
import { calculateTripScore, groupBookingsIntoTrips, recommendDepartureTime } from '@/lib/ai/dispatchEngine';
import { predictRouteDemand } from '@/lib/ai/demandPredictor';
import { formatDemandLevel, formatRouteType } from '@/lib/display-labels';
import { mockBookings, mockTrips } from '@/lib/mock-data';

export default function AdminAiDispatchPage() {
  const suggestions = groupBookingsIntoTrips(mockBookings);
  const routeDemand = predictRouteDemand('dai_loc_to_da_nang', new Date().toISOString());

  return (
    <div className="grid gap-4">
      <SectionCard title="Gợi ý điều phối AI" description="Xem trước việc ghép chuyến và gợi ý một cách xác định.">
        <div className="space-y-3">
          {suggestions.map((trip, index) => (
            <div key={trip.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">Chuyến gợi ý {index + 1}</p>
                  <p className="text-sm text-slate-400">
                    {formatRouteType(trip.routeType)} - {trip.passengerCount}/{trip.maxCapacity} ghế
                  </p>
                </div>
                <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                  Điểm {calculateTripScore(trip)}
                </span>
              </div>
              <div className="mt-3 text-sm text-slate-300">
                Gợi ý giờ khởi hành: {recommendDepartureTime(mockBookings)}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Chỉ số điều phối" description="Gợi ý vận hành cho quy trình duyệt của quản trị.">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
            Chuyến gợi ý: {suggestions.length}
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
            Chuyến hiện có: {mockTrips.length}
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
            Nhu cầu tuyến: {formatDemandLevel(routeDemand.demandLevel)} ({routeDemand.confidence})
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
