import type { BookingRecord, BookingStatus, RouteType, UserRole, VehicleType } from '@/lib/types';
import { listAllDriversAdmin } from '@/lib/services/accounts';
import { listBookings } from '@/lib/services/rides';

const ACTIVE_SEAT_STATUSES = new Set<BookingStatus>(['pending', 'accepted', 'confirmed']);

export type SharedRideBookingItem = {
  id: string;
  customerName: string;
  passengerCount: number;
  pickupLocation: string;
  dropoffLocation: string;
  status: BookingStatus;
  bookingTime?: string | null;
  createdAt: string;
};

export type SharedRideGroup = {
  groupKey: string;
  driverId: string | null;
  vehicleId: string | null;
  routeType: RouteType;
  routeLabel: string;
  departureTime: string;
  departureLabel: string;
  driverName: string;
  driverPhoto: string | null;
  vehiclePhoto: string | null;
  vehicleType: VehicleType;
  plateNumber: string;
  seatCount: number;
  bookedSeats: number;
  remainingSeats: number;
  occupancyLabel: string;
  statusLabel: 'Còn chỗ' | 'Sắp đủ' | 'Đã đủ khách';
  pickupSummary: string;
  destinationSummary: string;
  bookings: SharedRideBookingItem[];
};

export type SharedRideViewer = {
  role: UserRole;
  userId?: string | null;
};

function routeLabel(routeType: RouteType) {
  return routeType === 'da_nang_to_dai_loc' ? 'Đà Nẵng → Đại Lộc' : 'Đại Lộc → Đà Nẵng';
}

function departureLabel(booking: BookingRecord) {
  const raw = booking.bookingTime ?? (booking.travelDate ? `${booking.travelDate}T${booking.travelTime ?? '00:00'}` : booking.createdAt);
  const date = new Date(raw);

  if (Number.isNaN(date.getTime())) {
    return raw;
  }

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(date);
}

function groupStatusLabel(remainingSeats: number): SharedRideGroup['statusLabel'] {
  if (remainingSeats <= 0) {
    return 'Đã đủ khách';
  }

  if (remainingSeats <= 2) {
    return 'Sắp đủ';
  }

  return 'Còn chỗ';
}

function activeShareBookingCount(status: BookingStatus) {
  return ACTIVE_SEAT_STATUSES.has(status) ? 1 : 0;
}

async function loadViewerBookings(viewer?: SharedRideViewer) {
  if (!viewer || viewer.role === 'admin' || viewer.role === 'super_admin') {
    return listBookings();
  }

  if (viewer.role === 'driver') {
    return listBookings({ userId: viewer.userId ?? '', role: 'driver' });
  }

  return listBookings();
}

export async function getSharedRideGroups(viewer?: SharedRideViewer): Promise<SharedRideGroup[]> {
  const [bookings, drivers] = await Promise.all([loadViewerBookings(viewer), listAllDriversAdmin()]);
  const driverMap = new Map(drivers.map((driver) => [driver.userId, driver]));
  const groups = new Map<string, SharedRideGroup & { hasActiveBooking: boolean }>();

  for (const booking of bookings) {
    const driver = booking.driverId ? driverMap.get(booking.driverId) ?? null : null;
    if (viewer?.role === 'customer' && (!driver || !driver.active || driver.approvalStatus !== 'approved' || driver.archivedAt)) {
      continue;
    }

    const departureTime = booking.bookingTime ?? (booking.travelDate ? `${booking.travelDate}T${booking.travelTime ?? '00:00'}` : booking.createdAt);
    const groupKey = `${booking.driverId ?? 'unassigned'}|${booking.routeType}|${departureTime}`;
    const existing = groups.get(groupKey);
    const vehicleType = driver?.vehicleType ?? booking.vehicleSnapshot?.vehicleType ?? '4-seat vehicle';
    const seatCount = driver?.seatCount ?? booking.vehicleSnapshot?.seatCount ?? 4;
    const bookingItem: SharedRideBookingItem = {
      id: booking.id,
      customerName: booking.customerName,
      passengerCount: booking.passengerCount,
      pickupLocation: booking.pickupLocation,
      dropoffLocation: booking.dropoffLocation,
      status: booking.status,
      bookingTime: booking.bookingTime ?? null,
      createdAt: booking.createdAt
    };

    if (!existing) {
      groups.set(groupKey, {
        groupKey,
        driverId: booking.driverId ?? null,
        vehicleId: driver?.userId ?? booking.driverId ?? null,
        routeType: booking.routeType,
        routeLabel: routeLabel(booking.routeType),
        departureTime,
        departureLabel: departureLabel(booking),
        driverName: driver?.driverName ?? booking.driverSnapshot?.driverName ?? 'Chưa phân công',
        driverPhoto: driver?.driverPhoto ?? booking.driverSnapshot?.driverPhoto ?? null,
        vehiclePhoto: driver?.vehiclePhoto ?? booking.vehicleSnapshot?.vehiclePhoto ?? null,
        vehicleType,
        plateNumber: driver?.plateNumber ?? booking.vehicleSnapshot?.plateNumber ?? 'Chưa có',
        seatCount,
        bookedSeats: activeShareBookingCount(booking.status) * booking.passengerCount,
        remainingSeats: 0,
        occupancyLabel: '',
        statusLabel: 'Còn chỗ',
        pickupSummary: booking.pickupLocation,
        destinationSummary: booking.dropoffLocation,
        bookings: [bookingItem],
        hasActiveBooking: ACTIVE_SEAT_STATUSES.has(booking.status)
      });
      continue;
    }

    existing.bookings.push(bookingItem);
    existing.pickupSummary = existing.pickupSummary || booking.pickupLocation;
    existing.destinationSummary = booking.dropoffLocation;
    if (ACTIVE_SEAT_STATUSES.has(booking.status)) {
      existing.bookedSeats += booking.passengerCount;
      existing.hasActiveBooking = true;
    }
    if (!existing.driverPhoto) {
      existing.driverPhoto = driver?.driverPhoto ?? booking.driverSnapshot?.driverPhoto ?? null;
    }
    if (!existing.vehiclePhoto) {
      existing.vehiclePhoto = driver?.vehiclePhoto ?? booking.vehicleSnapshot?.vehiclePhoto ?? null;
    }
    if (!existing.driverName || existing.driverName === 'Chưa phân công') {
      existing.driverName = driver?.driverName ?? booking.driverSnapshot?.driverName ?? existing.driverName;
    }
    if (!existing.plateNumber || existing.plateNumber === 'Chưa có') {
      existing.plateNumber = driver?.plateNumber ?? booking.vehicleSnapshot?.plateNumber ?? existing.plateNumber;
    }
    if (!existing.vehicleType) {
      existing.vehicleType = vehicleType;
    }
    if (!existing.seatCount) {
      existing.seatCount = seatCount;
    }
  }

  const grouped = Array.from(groups.values())
    .filter((group) => group.hasActiveBooking)
    .map((group) => {
      const remainingSeats = Math.max(0, group.seatCount - group.bookedSeats);
      return {
        ...group,
        remainingSeats,
        occupancyLabel: `Đã đặt ${group.bookedSeats}/${group.seatCount} ghế`,
        statusLabel: groupStatusLabel(remainingSeats),
        bookings: group.bookings.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      };
    })
    .filter((group) => {
      if (viewer?.role === 'driver') {
        return group.driverId === viewer.userId;
      }

      if (viewer?.role === 'customer') {
        return group.remainingSeats > 0;
      }

      return true;
    })
    .sort((a, b) => a.departureTime.localeCompare(b.departureTime));

  return grouped;
}

export async function getSharedRideSummary(viewer?: SharedRideViewer) {
  const groups = await getSharedRideGroups(viewer);
  return {
    groups,
    totalGroups: groups.length,
    fullGroups: groups.filter((group) => group.remainingSeats === 0).length,
    totalRemainingSeats: groups.reduce((sum, group) => sum + group.remainingSeats, 0)
  };
}
