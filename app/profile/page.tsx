import { redirect } from 'next/navigation';
import { getSessionFromCookies } from '@/lib/auth/session';

export default async function ProfilePage() {
  const session = await getSessionFromCookies();
  if (session?.role === 'driver') {
    redirect('/driver/profile');
  }

  redirect('/customer/profile');
}
