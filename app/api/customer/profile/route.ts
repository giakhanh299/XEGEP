import { NextResponse } from 'next/server';
import { getSessionFromCookies } from '@/lib/auth/session';
import { getCustomerByUserId, updateCustomerProfile } from '@/lib/services/accounts';
import { validateNonEmpty, validatePhoneNumber } from '@/lib/validation';

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session || session.role !== 'customer') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const customer = await getCustomerByUserId(session.userId);
  return NextResponse.json({ customer });
}

export async function PUT(request: Request) {
  const session = await getSessionFromCookies();
  if (!session || session.role !== 'customer') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  if (
    !validateNonEmpty(String(body.fullName ?? '')) ||
    !validatePhoneNumber(String(body.phone ?? ''))
  ) {
    return NextResponse.json({ error: 'Invalid customer profile' }, { status: 400 });
  }

  const customer = await updateCustomerProfile(session.userId, {
    fullName: String(body.fullName),
    phone: String(body.phone),
    address: String(body.address ?? ''),
    telegramChatId: String(body.telegramChatId ?? '')
  });

  return NextResponse.json({ customer });
}
