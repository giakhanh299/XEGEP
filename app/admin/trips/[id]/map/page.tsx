import { SectionCard } from '@/components/section-card';

export default async function AdminTripMapPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <SectionCard title="Trip route preview" description={`Route map placeholder for trip ${id}.`}>
      <div className="grid min-h-[420px] place-items-center rounded-[1.5rem] border border-dashed border-emerald-400/30 bg-slate-950/40 text-slate-300">
        Google Maps route preview will render here once API keys are configured.
      </div>
    </SectionCard>
  );
}
