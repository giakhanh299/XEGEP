import Link from 'next/link';
import { SectionCard } from '@/components/section-card';

export default function OfflinePage() {
  return (
    <SectionCard title="Bạn đang ngoại tuyến" description="Ứng dụng sẽ đồng bộ lại khi có kết nối.">
      <div className="space-y-4 text-sm text-slate-300">
        <p>Trang dự phòng khi không có mạng cho khung PWA.</p>
        <Link href="/" className="inline-flex rounded-2xl bg-emerald-400 px-4 py-3 font-semibold text-slate-950">
          Về trang chủ
        </Link>
      </div>
    </SectionCard>
  );
}
