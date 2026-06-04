import { BookingStatus, TripStatus } from '@/types/domain';

export function StatusBadge({ status }: { status: BookingStatus | TripStatus }) {
  const styles: Record<string, string> = {
    pending: 'bg-slate-200/10 text-slate-200',
    accepted: 'bg-emerald-400/10 text-emerald-200',
    matching: 'bg-cyan-400/10 text-cyan-200',
    confirmed: 'bg-emerald-400/10 text-emerald-200',
    driver_assigned: 'bg-amber-400/10 text-amber-200',
    on_the_way: 'bg-sky-400/10 text-sky-200',
    completed: 'bg-emerald-500/10 text-emerald-100',
    cancelled: 'bg-rose-400/10 text-rose-200',
    draft: 'bg-slate-200/10 text-slate-200',
    boarding: 'bg-amber-400/10 text-amber-200',
    scheduled: 'bg-cyan-400/10 text-cyan-200',
    ready: 'bg-emerald-400/10 text-emerald-200',
    in_progress: 'bg-sky-400/10 text-sky-200'
  };

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${styles[status] ?? styles.pending}`}>
      {status.replaceAll('_', ' ')}
    </span>
  );
}
