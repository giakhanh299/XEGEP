export type UserRole = 'customer' | 'driver' | 'admin' | 'super_admin';
export type BookingStatus =
  | 'pending'
  | 'accepted'
  | 'confirmed'
  | 'matching'
  | 'driver_assigned'
  | 'on_the_way'
  | 'completed'
  | 'cancelled';
export type TripStatus = 'draft' | 'ready' | 'boarding' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type RouteType = 'dai_loc_to_da_nang' | 'da_nang_to_dai_loc';
export type VehicleType = '4-seat vehicle' | '7-seat vehicle';
export type PaymentStatus = 'unpaid' | 'pending' | 'paid' | 'refunded' | 'cancelled';
export type PaymentMethod = 'cash' | 'bank_transfer' | 'qr_code';

export type AccountProfile = {
  username: string;
  fullName: string;
  phone: string;
  address?: string;
};

export type UserAccountRecord = {
  id: string;
  username: string;
  passwordHash: string;
  role: UserRole;
  fullName?: string;
  phone?: string;
  address?: string;
  createdAt: string;
};

export type CustomerRecord = AccountProfile & {
  userId: string;
  createdAt: string;
  updatedAt: string;
  telegramChatId?: string | null;
};

export type DriverProfileRecord = AccountProfile & {
  userId: string;
  driverName: string;
  vehicleType: VehicleType;
  plateNumber: string;
  seatCount: 4 | 7;
  availableSeats: number;
  serviceArea: string;
  telegramChatId?: string | null;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  rejectedReason?: string | null;
  archivedAt?: string | null;
  vehiclePhoto?: string | null;
  driverPhoto?: string | null;
  description?: string | null;
  rating?: number | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type BookingSnapshot = {
  name: string;
  phone: string;
  address?: string;
  username?: string;
  vehicleType?: VehicleType;
  plateNumber?: string;
  seatCount?: 4 | 7;
  availableSeats?: number;
  serviceArea?: string;
  vehiclePhoto?: string | null;
  driverPhoto?: string | null;
  driverName?: string;
  description?: string | null;
};

export type BookingStatusHistoryEntry = {
  status: 'created' | BookingStatus;
  timestamp: string;
  actorRole: UserRole;
  actorId?: string | null;
};

export type BookingRecord = {
  id: string;
  customerName: string;
  phone: string;
  pickupLocation: string;
  dropoffLocation: string;
  travelDate?: string;
  travelTime?: string;
  pickupLat?: number | null;
  pickupLng?: number | null;
  dropoffLat?: number | null;
  dropoffLng?: number | null;
  passengerCount: number;
  notes?: string | null;
  status: BookingStatus;
  routeType: RouteType;
  estimatedDistanceKm?: number | null;
  fareBase?: number | null;
  farePerKm?: number | null;
  fareMultiplier?: number | null;
  estimatedFare?: number | null;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  tripId?: string | null;
  customerId?: string | null;
  driverId?: string | null;
  bookingTime?: string | null;
  customerSnapshot?: BookingSnapshot | null;
  driverSnapshot?: BookingSnapshot | null;
  vehicleSnapshot?: BookingSnapshot | null;
  statusHistory?: BookingStatusHistoryEntry[];
  createdAt: string;
  updatedAt: string;
};

export type TripRecord = {
  id: string;
  routeType: RouteType;
  routeLabel?: string;
  vehicleId?: string | null;
  vehicle?: string;
  driverId?: string | null;
  driver?: string;
  passengerCount: number;
  maxCapacity: number;
  tripStatus: TripStatus;
  schedule?: string;
  estimatedDeparture?: string | null;
  actualDeparture?: string | null;
  estimatedArrival?: string | null;
  completedAt?: string | null;
  totalRevenue: number;
  createdAt: string;
};

export type DriverLocationRecord = {
  id: string;
  driverId: string;
  tripId?: string | null;
  lat: number;
  lng: number;
  accuracy?: number | null;
  speed?: number | null;
  heading?: number | null;
  recordedAt: string;
};

export type PaymentRecord = {
  id: string;
  bookingId: string;
  tripId?: string | null;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
};

export type DriverPayoutRecord = {
  id: string;
  driverId: string;
  tripId?: string | null;
  amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  createdAt: string;
  updatedAt: string;
};

export type DriverRecord = {
  id: string;
  fullName: string;
  phone: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type VehicleRecord = {
  id: string;
  plateNumber: string;
  vehicleType: VehicleType;
  capacity: 4 | 7;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AuditLogRecord = {
  id: string;
  actorRole: UserRole;
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

export type NotificationRecord = {
  id: string;
  userId?: string | null;
  role: UserRole;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  relatedBookingId?: string | null;
  createdAt: string;
};
