import { NextResponse } from 'next/server';
import { createSessionCookieValue } from '@/lib/auth/session';
import { authenticateAccount } from '@/lib/services/accounts';
import { validatePassword, validateUsername } from '@/lib/validation';

function publicUser(user: { id: string; username: string; role: string; createdAt: string }) {
  return {
    id: user.id,
    username: user.username,
    role: user.role,
    createdAt: user.createdAt
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = String(body.username ?? '').trim();
    const password = String(body.password ?? '');

    if (!validateUsername(username) || !validatePassword(password)) {
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

    response.cookies.set('ride_session', createSessionCookieValue({
      userId: bundle.user.id,
      username: bundle.user.username,
      role: bundle.user.role,
      issuedAt: Date.now()
    }), {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 14
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Không thể đăng nhập' }, { status: 500 });
  }
}
