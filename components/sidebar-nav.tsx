'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function SidebarNav({
  role,
  title,
  description,
  notificationCount = 0
}: {
  role: string;
  title: string;
  description: string;
  notificationCount?: number;
}) {
  const pathname = usePathname();
  const items =
    role === 'Customer'
      ? [
          { href: '/customer', label: 'Home' },
          { href: '/vehicles', label: 'Vehicles' },
          { href: '/customer/book', label: 'Book Ride' },
          { href: '/customer/my-trips', label: 'My Trips' },
          { href: '/notifications', label: 'Notifications' },
          { href: '/customer/profile', label: 'Profile' }
        ]
      : role === 'Driver'
        ? [
          { href: '/driver', label: 'Home' },
          { href: '/driver/bookings', label: 'Bookings' },
          { href: '/notifications', label: 'Notifications' },
          { href: '/driver/trips', label: 'Trips' }
        ]
        : [
            { href: '/admin/dashboard', label: 'Dashboard' },
            { href: '/admin/notifications', label: 'Notifications' },
            { href: '/admin/ai-dispatch', label: 'AI Dispatch' },
            { href: '/admin/bookings', label: 'Bookings' },
            { href: '/admin/trips', label: 'Trips' },
            { href: '/admin/payments', label: 'Payments' },
            { href: '/admin/drivers', label: 'Drivers' },
            { href: '/admin/vehicles', label: 'Vehicles' },
            { href: '/admin/map', label: 'Map' }
          ];

  return (
    <div className="glass flex h-full flex-col rounded-[1.75rem] p-4">
      <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-5">
        <p className="text-sm uppercase tracking-[0.22em] text-emerald-300">{role}</p>
        <h2 className="mt-1 text-xl font-black text-white">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
      </div>
      <div className="mt-4 space-y-2">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative block rounded-2xl px-4 py-3 text-sm font-medium transition',
                active ? 'bg-emerald-400 text-slate-950' : 'bg-white/5 text-slate-200 hover:bg-white/10'
              )}
            >
              {item.label}
              {item.href.endsWith('/notifications') && notificationCount > 0 ? (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-rose-400 px-2 py-0.5 text-xs font-bold text-white">
                  {notificationCount}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
