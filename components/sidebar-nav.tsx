'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { formatRoleLabel } from '@/lib/display-labels';

function getNavKind(role: string) {
  const normalized = role.toLowerCase();
  if (normalized.includes('khách') || normalized.includes('khach') || normalized.includes('customer')) {
    return 'customer';
  }
  if (normalized.includes('tài') || normalized.includes('tai') || normalized.includes('driver')) {
    return 'driver';
  }
  return 'admin';
}

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
  const navKind = getNavKind(role);
  const items =
    navKind === 'customer'
      ? [
          { href: '/customer', label: 'Trang chủ' },
          { href: '/vehicles', label: 'Xe' },
          { href: '/shared-rides', label: 'Xe ghép' },
          { href: '/customer/book', label: 'Đặt xe' },
          { href: '/customer/my-trips', label: 'Chuyến đi của tôi' },
          { href: '/notifications', label: 'Thông báo' },
          { href: '/customer/profile', label: 'Hồ sơ' }
        ]
      : navKind === 'driver'
        ? [
            { href: '/driver', label: 'Trang chủ' },
            { href: '/driver/bookings', label: 'Chuyến đi' },
            { href: '/shared-rides', label: 'Quản lý xe ghép' },
            { href: '/notifications', label: 'Thông báo' },
            { href: '/driver/trips', label: 'Lịch chạy' }
          ]
        : [
            { href: '/admin/dashboard', label: 'Bảng điều khiển' },
            { href: '/admin/notifications', label: 'Thông báo' },
            { href: '/admin/ai-dispatch', label: 'Điều phối AI' },
            { href: '/admin/bookings', label: 'Chuyến đi' },
            { href: '/shared-rides', label: 'Quản lý xe ghép' },
            { href: '/admin/trips', label: 'Lượt chạy' },
            { href: '/admin/payments', label: 'Thanh toán' },
            { href: '/admin/drivers', label: 'Tài xế' },
            { href: '/admin/vehicles', label: 'Xe' },
            { href: '/admin/map', label: 'Bản đồ' }
          ];

  return (
    <div className="glass flex h-full flex-col rounded-[1.75rem] p-4">
      <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-5">
        <p className="text-sm uppercase tracking-[0.22em] text-emerald-300">{formatRoleLabel(role)}</p>
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
