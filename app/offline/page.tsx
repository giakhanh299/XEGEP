import Link from 'next/link';
import { SectionCard } from '@/components/section-card';

export default function OfflinePage() {
  return (
    <SectionCard title="You are offline" description="The app will sync again when connectivity returns.">
      <div className="space-y-4 text-sm text-slate-300">
        <p>Offline fallback page for the PWA shell.</p>
        <Link href="/" className="inline-flex rounded-2xl bg-emerald-400 px-4 py-3 font-semibold text-slate-950">
          Return home
        </Link>
      </div>
    </SectionCard>
  );
}
