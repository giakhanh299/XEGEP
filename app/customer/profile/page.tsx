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
      <SectionCard title="Customer profile" description="Sign in as a customer to manage your account.">
        <Link href="/auth" className="inline-flex rounded-2xl bg-emerald-400 px-4 py-3 font-semibold text-slate-950">
          Go to sign in
        </Link>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Customer profile" description="Update your contact details used for bookings.">
      <CustomerProfileForm customer={customer} />
    </SectionCard>
  );
}
