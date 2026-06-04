import { BookingStatus, PaymentMethod, PaymentStatus, RouteType, TripStatus, UserRole } from '@/lib/types';

export function validatePhoneNumber(phone: string) {
  return /^\+?[0-9\s-]{8,20}$/.test(phone.trim());
}

export function validatePassengerCount(count: number) {
  return Number.isInteger(count) && count >= 1 && count <= 7;
}

export function validateRouteType(routeType: string): routeType is RouteType {
  return routeType === 'dai_loc_to_da_nang' || routeType === 'da_nang_to_dai_loc';
}

export function validateBookingStatus(status: string): status is BookingStatus {
  return ['pending', 'accepted', 'confirmed', 'matching', 'driver_assigned', 'on_the_way', 'completed', 'cancelled'].includes(status);
}

export function validateTripStatus(status: string): status is TripStatus {
  return ['draft', 'ready', 'boarding', 'scheduled', 'in_progress', 'completed', 'cancelled'].includes(status);
}

export function validatePaymentStatus(status: string): status is PaymentStatus {
  return ['unpaid', 'pending', 'paid', 'refunded', 'cancelled'].includes(status);
}

export function validatePaymentMethod(method: string): method is PaymentMethod {
  return ['cash', 'bank_transfer', 'qr_code'].includes(method);
}

export function validateUserRole(role: string): role is UserRole {
  return ['customer', 'driver', 'admin', 'super_admin'].includes(role);
}

export function validateUsername(username: string) {
  return /^[a-zA-Z0-9_.-]{3,32}$/.test(username.trim());
}

export function validatePassword(password: string) {
  return password.length >= 8;
}

export function validateNonEmpty(value: string) {
  return value.trim().length > 0;
}

export function validateSeatCount(value: number) {
  return value === 4 || value === 7;
}

export function validateAvailableSeatCount(value: number) {
  return Number.isInteger(value) && value >= 0 && value <= 7;
}

export function validateApprovalStatus(status: string) {
  return ['pending', 'approved', 'rejected'].includes(status);
}

export function validatePositiveNumber(value: number) {
  return Number.isFinite(value) && value > 0;
}
