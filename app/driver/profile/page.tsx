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
      <SectionCard title="Driver profile" description="Sign in as a driver to manage your vehicle profile.">
        <Link href="/auth" className="inline-flex rounded-2xl bg-emerald-400 px-4 py-3 font-semibold text-slate-950">
          Go to sign in
        </Link>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Driver profile" description="Update your vehicle, photos, and service area.">
      <DriverProfileForm driver={driver} />
    </SectionCard>
  );
}
