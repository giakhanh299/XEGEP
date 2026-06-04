import { AdminDriverManagement } from '@/components/admin/driver-management';
import { SectionCard } from '@/components/section-card';
import { requireAdminSession } from '@/lib/auth/admin';
import { listAllDriversAdmin } from '@/lib/services/accounts';
import Link from 'next/link';

export default async function AdminDriversPage() {
  await requireAdminSession();
  const drivers = await listAllDriversAdmin();

  return (
    <div className="grid gap-4">
      <div className="flex justify-end">
        <Link
          href="/admin/drivers/new"
          className="rounded-2xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950"
        >
          Tạo tài xế
        </Link>
      </div>
      <SectionCard title="Quản lý tài xế và xe" description="Duyệt, cập nhật, kích hoạt hoặc lưu trữ hồ sơ tài xế.">
        <AdminDriverManagement drivers={drivers} />
      </SectionCard>
    </div>
  );
}
