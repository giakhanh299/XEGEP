'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export type NavItem = {
  href: string;
  label: string;
};

export function BottomNav({ items, notificationCount = 0 }: { items: NavItem[]; notificationCount?: number }) {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-slate-950/80 px-3 py-3 backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-3xl gap-2 overflow-x-auto">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex min-w-0 flex-1 items-center justify-center rounded-2xl px-3 py-3 text-center text-sm font-medium',
                active ? 'bg-emerald-400 text-slate-950' : 'bg-white/5 text-slate-200'
              )}
            >
              <span className="truncate">{item.label}</span>
              {item.href.endsWith('/notifications') && notificationCount > 0 ? (
                <span className="absolute right-2 top-2 rounded-full bg-rose-400 px-2 py-0.5 text-[10px] font-bold text-white">
                  {notificationCount}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
