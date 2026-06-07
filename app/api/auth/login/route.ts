import { NextResponse } from 'next/server';
import { setSessionCookie } from '@/lib/auth/session';
import { authenticateAccount } from '@/lib/services/accounts';
import { validateLoginIdentifier, validatePassword } from '@/lib/validation';

function publicUser(user: { id: string; username: string; role: string; createdAt: string }) {
  return {
    id: user.id,
    username: user.username,
    email: user.username,
    role: user.role,
    createdAt: user.createdAt
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = String(body.email ?? body.username ?? '').trim().toLowerCase();
    const password = String(body.password ?? '');

    if (!validateLoginIdentifier(username) || !validatePassword(password)) {
      return NextResponse.json({ error: 'Thông tin đăng nhập không hợp lệ' }, { status: 400 });
    }

    const bundle = await authenticateAccount(username, password);
    if (!bundle) {
      return NextResponse.json({ error: 'Tên đăng nhập hoặc mật khẩu không đúng' }, { status: 401 });
    }

    const response = NextResponse.json({
      user: publicUser(bundle.user),
      customer: bundle.customer ?? null,
      driver: bundle.driver ?? null
    });

    setSessionCookie(response, {
      userId: bundle.user.id,
      username: bundle.user.username,
      role: bundle.user.role,
      issuedAt: Date.now()
    }, request);

    return response;
  } catch {
    return NextResponse.json({ error: 'Không thể đăng nhập' }, { status: 500 });
  }
}
