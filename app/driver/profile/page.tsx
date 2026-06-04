import { SectionCard } from '@/components/section-card';
import { DriverProfileForm } from '@/components/profile-form';
import { getSessionFromCookies } from '@/lib/auth/session';
import { getDriverByUserId } from '@/lib/services/accounts';
import Link from 'next/link';

export default async function DriverProfilePage() {
  const session = await getSessionFromCookies();
  const driver = session?.role === 'driver' ? await getDriverByUserId(session.userId) : null;

  if (!session || session.role !== 'driver' || !driver) {
    return (
      <SectionCard title="Hồ sơ tài xế" description="Đăng nhập bằng tài khoản tài xế để quản lý hồ sơ xe.">
        <Link href="/auth" className="inline-flex rounded-2xl bg-emerald-400 px-4 py-3 font-semibold text-slate-950">
          Đi đến đăng nhập
        </Link>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Hồ sơ tài xế" description="Cập nhật xe, ảnh và khu vực hoạt động.">
      <DriverProfileForm driver={driver} />
    </SectionCard>
  );
}
