import { SectionCard } from '@/components/section-card';
import { CustomerProfileForm } from '@/components/profile-form';
import { getSessionFromCookies } from '@/lib/auth/session';
import { getCustomerByUserId } from '@/lib/services/accounts';
import Link from 'next/link';

export default async function CustomerProfilePage() {
  const session = await getSessionFromCookies();
  const customer = session?.role === 'customer' ? await getCustomerByUserId(session.userId) : null;

  if (!session || session.role !== 'customer' || !customer) {
    return (
      <SectionCard title="Hồ sơ khách hàng" description="Đăng nhập bằng tài khoản khách hàng để quản lý hồ sơ.">
        <Link href="/auth" className="inline-flex rounded-2xl bg-emerald-400 px-4 py-3 font-semibold text-slate-950">
          Đi đến đăng nhập
        </Link>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Hồ sơ khách hàng" description="Cập nhật thông tin liên hệ dùng khi đặt xe.">
      <CustomerProfileForm customer={customer} />
    </SectionCard>
  );
}
