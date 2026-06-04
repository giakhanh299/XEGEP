import { NextResponse } from 'next/server';
import { getSessionFromCookies } from '@/lib/auth/session';
import { getCustomerByUserId, getDriverByUserId, getUserById } from '@/lib/services/accounts';

type SafeUser = {
  id: string;
  username: string;
  role: string;
  createdAt: string;
  fullName?: string;
  phone?: string;
  address?: string;
};

function publicUser(user: SafeUser | null) {
  return user
    ? {
        id: user.id,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt,
        fullName: user.fullName,
        phone: user.phone,
        address: user.address
      }
    : null;
}

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ user: null });
  }

  const user = await getUserById(session.userId);
  if (!user) {
    return NextResponse.json({ user: null });
  }

  const customer = user.role === 'customer' ? await getCustomerByUserId(user.id) : null;
  const driver = user.role === 'driver' ? await getDriverByUserId(user.id) : null;

  return NextResponse.json({ user: publicUser(user), customer, driver, session });
}
