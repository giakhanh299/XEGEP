import { UserRole } from '@/lib/types';

const permissions: Record<UserRole, string[]> = {
  customer: ['booking:read_own', 'booking:create'],
  driver: ['trip:read_assigned', 'location:update'],
  admin: ['booking:read_all', 'booking:update', 'trip:update', 'driver:update', 'vehicle:update'],
  super_admin: ['*']
};

export function hasPermission(role: UserRole, permission: string) {
  return permissions[role].includes('*') || permissions[role].includes(permission);
}

export function canViewAllBookings(role: UserRole) {
  return role === 'admin' || role === 'super_admin';
}
