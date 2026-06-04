import { SectionCard } from '@/components/section-card';

export default function AdminMapPage() {
  return (
    <SectionCard title="Map" description="Google Maps placeholder for future route optimization.">
      <div className="grid min-h-[420px] place-items-center rounded-[1.5rem] border border-dashed border-emerald-400/30 bg-slate-950/40 text-center text-slate-300">
        <div className="max-w-sm space-y-3 p-8">
          <p className="text-lg font-semibold text-white">Map canvas reserved</p>
          <p className="text-sm leading-6">
            This page is ready for Google Maps overlays, route clustering, and pickup-order optimization.
          </p>
        </div>
      </div>
    </SectionCard>
  );
}
