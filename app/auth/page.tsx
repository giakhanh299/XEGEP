import { AuthForm } from '@/components/auth-form';
import { SectionCard } from '@/components/section-card';

export default function AuthPage() {
  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <SectionCard title="Account access" description="Create a customer or driver account and sign in securely.">
          <div className="space-y-4 text-sm leading-6 text-slate-300">
            <p>Use customer registration for booking access and booking history.</p>
            <p>Use driver registration to manage vehicles, service areas, and incoming bookings.</p>
            <p>Passwords are hashed before storage and a signed session cookie is issued on login.</p>
          </div>
        </SectionCard>
        <AuthForm />
      </div>
    </main>
  );
}
