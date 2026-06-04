import { SectionCard } from '@/components/section-card';
import { AdminDriverCreateForm } from '@/components/admin/driver-create-form';
import { requireAdminSession } from '@/lib/auth/admin';

export default async function AdminDriverCreatePage() {
  await requireAdminSession();

  return (
    <SectionCard
      title="Tạo tài xế"
      description="Thêm thủ công tài khoản tài xế, hồ sơ và ảnh xe."
      className="max-w-5xl"
    >
      <AdminDriverCreateForm />
    </SectionCard>
  );
}
