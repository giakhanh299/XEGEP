import type { UserRole } from '@/lib/types';

export function getRoleHomePath(role?: UserRole | null) {
  if (role === 'driver') {
    return '/driver';
  }

  if (role === 'admin' || role === 'super_admin') {
    return '/admin/dashboard';
  }

  return '/customer/book';
}
