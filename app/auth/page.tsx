import { AuthForm } from '@/components/auth-form';
import { SectionCard } from '@/components/section-card';
import { getRoleHomePath } from '@/lib/auth/paths';
import { getSessionFromCookies } from '@/lib/auth/session';
import { redirect } from 'next/navigation';

export default async function AuthPage() {
  const session = await getSessionFromCookies();
  if (session) {
    redirect(getRoleHomePath(session.role));
  }

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <SectionCard title="Truy cập tài khoản" description="Tạo tài khoản khách hàng hoặc tài xế và đăng nhập an toàn.">
          <div className="space-y-4 text-sm leading-6 text-slate-300">
            <p>Dùng đăng ký khách hàng để đặt xe và xem lịch sử chuyến đi.</p>
            <p>Dùng đăng ký tài xế để quản lý xe, khu vực hoạt động và các chuyến đến.</p>
            <p>Mật khẩu được băm trước khi lưu và cookie phiên đăng nhập sẽ được tạo khi đăng nhập.</p>
          </div>
        </SectionCard>
        <AuthForm />
      </div>
    </main>
  );
}
