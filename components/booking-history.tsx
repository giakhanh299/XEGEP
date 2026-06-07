import { BookingStatusHistoryEntry } from '@/lib/types';
import { formatBookingStatus, formatRoleLabel } from '@/lib/display-labels';

export function BookingHistory({ history }: { history: BookingStatusHistoryEntry[] }) {
  if (!history.length) {
    return <p className="text-sm text-slate-400">Chưa có lịch sử trạng thái.</p>;
  }

  return (
    <div className="space-y-3">
      {history.map((entry, index) => (
        <div key={`${entry.status}-${entry.timestamp}-${index}`} className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-white">{formatBookingStatus(entry.status)}</p>
              <p className="text-sm text-slate-400">{entry.timestamp}</p>
            </div>
            <span className="rounded-full border border-white/10 bg-slate-950/50 px-3 py-1 text-xs text-slate-200">
              {formatRoleLabel(entry.actorRole)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
