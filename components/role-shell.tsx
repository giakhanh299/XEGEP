import { ReactNode } from 'react';
import { BottomNav, type NavItem } from '@/components/bottom-nav';
import { SidebarNav } from '@/components/sidebar-nav';

export function RoleShell({
  children,
  role,
  title,
  description,
  mobileNav,
  notificationCount = 0
}: {
  children: ReactNode;
  role: string;
  title: string;
  description: string;
  mobileNav: NavItem[];
  notificationCount?: number;
}) {
  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-7xl gap-4 px-3 py-3 sm:px-6 lg:px-8">
        <aside className="hidden w-72 shrink-0 lg:block">
          <SidebarNav role={role} title={title} description={description} notificationCount={notificationCount} />
        </aside>
        <main className="flex min-w-0 flex-1 flex-col gap-4 pb-28 lg:pb-6">
          <header className="glass rounded-[1.75rem] px-5 py-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-emerald-300">{role}</p>
                <h1 className="text-2xl font-black text-white">{title}</h1>
                <p className="mt-1 text-sm text-slate-300">{description}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">
                Đặt xe Đại Lộc
              </div>
            </div>
          </header>
          {children}
        </main>
      </div>
      <BottomNav items={mobileNav} notificationCount={notificationCount} />
    </div>
  );
}
