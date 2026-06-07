import type { BookingStatus, PaymentMethod, PaymentStatus, RouteType, TripStatus, UserRole } from '@/lib/types';

export function formatRoleLabel(role?: string | null) {
  const labels: Record<UserRole, string> = {
    customer: 'Khách hàng',
    driver: 'Tài xế',
    admin: 'Quản trị',
    super_admin: 'Quản trị cấp cao'
  };
  return role && role in labels ? labels[role as UserRole] : role || 'Không có';
}

export function formatVehicleType(vehicleType?: string | null) {
  if (vehicleType === '4-seat vehicle') return 'Xe 4 chỗ';
  if (vehicleType === '7-seat vehicle') return 'Xe 7 chỗ';
  return vehicleType || 'Không có';
}

export function formatBookingStatus(status?: string | null) {
  const labels: Record<BookingStatus | 'created', string> = {
    created: 'Đã tạo',
    pending: 'Chờ xử lý',
    accepted: 'Đã nhận chuyến',
    confirmed: 'Đã xác nhận',
    matching: 'Đang ghép chuyến',
    driver_assigned: 'Đã phân tài xế',
    on_the_way: 'Đang trên đường',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy'
  };
  return status && status in labels ? labels[status as BookingStatus | 'created'] : status || 'Không có';
}

export function formatTripStatus(status?: string | null) {
  const labels: Record<TripStatus, string> = {
    draft: 'Nháp',
    ready: 'Sẵn sàng',
    boarding: 'Đang đón khách',
    scheduled: 'Đã lên lịch',
    in_progress: 'Đang thực hiện',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy'
  };
  return status && status in labels ? labels[status as TripStatus] : status || 'Không có';
}

export function formatApprovalStatus(status?: string | null) {
  if (status === 'pending') return 'Chờ xử lý';
  if (status === 'approved') return 'Đã duyệt';
  if (status === 'rejected') return 'Bị từ chối';
  return status || 'Không có';
}

export function formatPaymentMethod(method?: string | null) {
  const labels: Record<PaymentMethod, string> = {
    cash: 'Tiền mặt',
    bank_transfer: 'Chuyển khoản',
    qr_code: 'Thanh toán QR'
  };
  return method && method in labels ? labels[method as PaymentMethod] : method || 'Không có';
}

export function formatPaymentStatus(status?: string | null) {
  const labels: Record<PaymentStatus, string> = {
    unpaid: 'Chưa thanh toán',
    pending: 'Chờ xử lý',
    paid: 'Đã thanh toán',
    refunded: 'Đã hoàn tiền',
    cancelled: 'Đã hủy'
  };
  return status && status in labels ? labels[status as PaymentStatus] : status || 'Không có';
}

export function formatRouteType(routeType?: string | null) {
  const labels: Record<RouteType, string> = {
    dai_loc_to_da_nang: 'Đại Lộc → Đà Nẵng',
    da_nang_to_dai_loc: 'Đà Nẵng → Đại Lộc'
  };
  return routeType && routeType in labels ? labels[routeType as RouteType] : routeType || 'Không có';
}

export function formatDemandLevel(level?: string | null) {
  if (level === 'high') return 'Cao';
  if (level === 'medium') return 'Trung bình';
  if (level === 'low') return 'Thấp';
  return level || 'Không có';
}

export function formatUploadKind(kind?: string | null) {
  if (kind === 'driver') return 'tài xế';
  if (kind === 'vehicle') return 'xe';
  return kind || 'tệp';
}
