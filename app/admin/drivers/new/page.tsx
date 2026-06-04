import { SectionCard } from '@/components/section-card';
import { AdminDriverCreateForm } from '@/components/admin/driver-create-form';
import { requireAdminSession } from '@/lib/auth/admin';

export default async function AdminDriverCreatePage() {
  await requireAdminSession();

  return (
    <SectionCard
      title="Create driver"
      description="Manually add a driver account, profile, and vehicle media."
      className="max-w-5xl"
    >
      <AdminDriverCreateForm />
    </SectionCard>
  );
}
