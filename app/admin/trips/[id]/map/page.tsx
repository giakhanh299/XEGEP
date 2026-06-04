import { SectionCard } from '@/components/section-card';

export default async function AdminTripMapPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <SectionCard title="Xem trước tuyến chuyến" description={`Khung bản đồ tuyến cho chuyến ${id}.`}>
      <div className="grid min-h-[420px] place-items-center rounded-[1.5rem] border border-dashed border-emerald-400/30 bg-slate-950/40 text-slate-300">
        Bản đồ Google Maps cho tuyến sẽ hiển thị tại đây sau khi cấu hình khóa API.
      </div>
    </SectionCard>
  );
}
