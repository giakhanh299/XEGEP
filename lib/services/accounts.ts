import { randomUUID } from 'crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import {
  BookingSnapshot,
  CustomerRecord,
  DriverProfileRecord,
  UserAccountRecord,
  UserRole,
  VehicleType
} from '@/lib/types';

type UserRow = {
  id: string;
  username: string;
  password_hash: string;
  role: UserRole;
  full_name?: string;
  phone?: string;
  address?: string | null;
  created_at: string;
};

type CustomerRow = {
  user_id: string;
  full_name: string;
  phone: string;
  address?: string | null;
  telegram_chat_id?: string | null;
  created_at: string;
  updated_at: string;
};

type DriverRow = {
  user_id: string;
  driver_name: string;
  phone: string;
  vehicle_type: VehicleType;
  plate_number: string;
  seat_count: 4 | 7;
  available_seats?: number;
  service_area: string;
  telegram_chat_id?: string | null;
  approval_status?: DriverProfileRecord['approvalStatus'];
  rejected_reason?: string | null;
  archived_at?: string | null;
  vehicle_photo?: string | null;
  driver_photo?: string | null;
  description?: string | null;
  rating?: number | null;
  active: boolean;
  created_at: string;
  updated_at: string;
};

type AccountBundle = {
  user: UserAccountRecord;
  customer?: CustomerRecord | null;
  driver?: DriverProfileRecord | null;
};

type DemoAccount = {
  user: Omit<UserAccountRecord, 'passwordHash' | 'createdAt'> & {
    password: string;
    createdAt?: string;
  };
  customer?: Omit<CustomerRecord, 'createdAt' | 'updatedAt'>;
  driver?: Omit<DriverProfileRecord, 'createdAt' | 'updatedAt'>;
};

const usersStore: UserAccountRecord[] = [];
const customersStore: CustomerRecord[] = [];
const driversStore: DriverProfileRecord[] = [];
let supabaseDemoAccountsEnsured = false;

const seededAt = '2026-06-01T00:00:00.000Z';

const demoAccounts: DemoAccount[] = [
  {
    user: {
      id: '00000000-0000-4000-8000-000000000101',
      username: 'test_passenger_01@example.com',
      password: '1',
      role: 'customer',
      fullName: 'Test Passenger 01',
      phone: '0901000001',
      address: 'Dai Loc, Quang Nam'
    },
    customer: {
      userId: '00000000-0000-4000-8000-000000000101',
      username: 'test_passenger_01@example.com',
      fullName: 'Test Passenger 01',
      phone: '0901000001',
      address: 'Dai Loc, Quang Nam',
      telegramChatId: null
    }
  },
  {
    user: {
      id: '00000000-0000-4000-8000-000000000201',
      username: 'test_driver_01@example.com',
      password: '1',
      role: 'driver',
      fullName: 'Test Driver 01',
      phone: '0902000001',
      address: ''
    },
    driver: {
      userId: '00000000-0000-4000-8000-000000000201',
      username: 'test_driver_01@example.com',
      fullName: 'Test Driver 01',
      phone: '0902000001',
      address: '',
      driverName: 'Test Driver 01',
      vehicleType: '7-seat vehicle',
      plateNumber: 'TEST-DRV-01',
      seatCount: 7,
      availableSeats: 7,
      serviceArea: 'Dai Loc - Da Nang',
      telegramChatId: null,
      approvalStatus: 'approved',
      rejectedReason: null,
      archivedAt: null,
      vehiclePhoto: '/test-vehicles/test-car-01.svg',
      driverPhoto: '/test-vehicles/test-car-02.svg',
      description: 'Approved demo driver with a visible vehicle image.',
      rating: 5,
      active: true
    }
  },
  {
    user: {
      id: '00000000-0000-4000-8000-000000000301',
      username: 'test_admin_01@example.com',
      password: '1',
      role: 'admin',
      fullName: 'Test Admin 01',
      phone: '0903000001',
      address: ''
    }
  },
  {
    user: {
      id: '00000000-0000-4000-8000-000000000111',
      username: 'demo_customer',
      password: 'password123',
      role: 'customer',
      fullName: 'Pham Minh Tuan',
      phone: '0901234567',
      address: 'Dai Loc, Quang Nam'
    },
    customer: {
      userId: '00000000-0000-4000-8000-000000000111',
      username: 'demo_customer',
      fullName: 'Pham Minh Tuan',
      phone: '0901234567',
      address: 'Dai Loc, Quang Nam',
      telegramChatId: null
    }
  },
  {
    user: {
      id: '00000000-0000-4000-8000-000000000211',
      username: 'demo_driver',
      password: 'password123',
      role: 'driver',
      fullName: 'Nguyen Van A',
      phone: '0909111222',
      address: ''
    },
    driver: {
      userId: '00000000-0000-4000-8000-000000000211',
      username: 'demo_driver',
      fullName: 'Nguyen Van A',
      phone: '0909111222',
      address: '',
      driverName: 'Nguyen Van A',
      vehicleType: '7-seat vehicle',
      plateNumber: '43A-12345',
      seatCount: 7,
      availableSeats: 7,
      serviceArea: 'Dai Loc - Da Nang',
      telegramChatId: null,
      approvalStatus: 'approved',
      rejectedReason: null,
      archivedAt: null,
      vehiclePhoto: '/test-vehicles/test-car-03.svg',
      driverPhoto: null,
      description: 'Experienced driver serving the Dai Loc corridor.',
      rating: 4.9,
      active: true
    }
  },
  {
    user: {
      id: '00000000-0000-4000-8000-000000000311',
      username: 'demo_admin',
      password: 'password123',
      role: 'admin',
      fullName: 'Demo Admin',
      phone: '0900000000',
      address: ''
    }
  }
];

function now() {
  return new Date().toISOString();
}

function shouldAutoApproveDrivers() {
  return String(process.env.AUTO_APPROVE_DRIVERS ?? '').toLowerCase() === 'true';
}

function normalizeIdentifier(identifier: string) {
  return identifier.trim().toLowerCase();
}

function mapUser(row: UserRow): UserAccountRecord {
  return {
    id: row.id,
    username: row.username,
    passwordHash: row.password_hash,
    role: row.role,
    fullName: row.full_name ?? undefined,
    phone: row.phone ?? undefined,
    address: row.address ?? undefined,
    createdAt: row.created_at
  };
}

function mapCustomer(row: CustomerRow): CustomerRecord {
  return {
    userId: row.user_id,
    username: '',
    fullName: row.full_name,
    phone: row.phone,
    address: row.address ?? '',
    telegramChatId: row.telegram_chat_id ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapDriver(row: DriverRow): DriverProfileRecord {
  return {
    userId: row.user_id,
    username: '',
    fullName: row.driver_name,
    phone: row.phone,
    address: '',
    driverName: row.driver_name,
    vehicleType: row.vehicle_type,
    plateNumber: row.plate_number,
    seatCount: row.seat_count,
    availableSeats: row.available_seats ?? row.seat_count,
    serviceArea: row.service_area,
    telegramChatId: row.telegram_chat_id ?? null,
    approvalStatus: row.approval_status ?? (row.active ? 'approved' : 'pending'),
    rejectedReason: row.rejected_reason ?? null,
    archivedAt: row.archived_at ?? null,
    vehiclePhoto: row.vehicle_photo ?? null,
    driverPhoto: row.driver_photo ?? null,
    description: row.description ?? null,
    rating: row.rating ?? null,
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function toMemoryUser(account: DemoAccount): UserAccountRecord {
  return {
    id: account.user.id,
    username: account.user.username,
    passwordHash: hashPassword(account.user.password),
    role: account.user.role,
    fullName: account.user.fullName,
    phone: account.user.phone,
    address: account.user.address,
    createdAt: account.user.createdAt ?? seededAt
  };
}

function seedDemoData() {
  if (usersStore.length > 0 || customersStore.length > 0 || driversStore.length > 0) {
    return;
  }

  for (const account of demoAccounts) {
    const user = toMemoryUser(account);
    usersStore.push(user);

    if (account.customer) {
      customersStore.push({
        ...account.customer,
        createdAt: seededAt,
        updatedAt: seededAt
      });
    }

    if (account.driver) {
      driversStore.push({
        ...account.driver,
        createdAt: seededAt,
        updatedAt: seededAt
      });
    }
  }
}

async function ensureDemoAccounts(supabase: SupabaseClient) {
  if (supabaseDemoAccountsEnsured) {
    return;
  }

  for (const account of demoAccounts) {
    const username = normalizeIdentifier(account.user.username);
    const { data: existing } = await supabase.from('users').select('id').eq('username', username).maybeSingle();
    const userId = existing?.id ?? account.user.id;
    const userPayload = {
      id: userId,
      username,
      password_hash: hashPassword(account.user.password),
      role: account.user.role,
      full_name: account.user.fullName,
      phone: account.user.phone,
      address: account.user.address,
      active: true,
      updated_at: now()
    };

    if (existing?.id) {
      await supabase.from('users').update(userPayload).eq('id', existing.id);
    } else {
      await supabase.from('users').insert({
        ...userPayload,
        created_at: account.user.createdAt ?? seededAt
      });
    }

    if (account.customer) {
      await supabase.from('customers').upsert({
        user_id: userId,
        full_name: account.customer.fullName,
        phone: account.customer.phone,
        address: account.customer.address,
        telegram_chat_id: account.customer.telegramChatId,
        created_at: seededAt,
        updated_at: now()
      });
    }

    if (account.driver) {
      await supabase.from('drivers').upsert({
        user_id: userId,
        driver_name: account.driver.driverName,
        phone: account.driver.phone,
        vehicle_type: account.driver.vehicleType,
        plate_number: account.driver.plateNumber,
        seat_count: account.driver.seatCount,
        available_seats: account.driver.availableSeats,
        service_area: account.driver.serviceArea,
        telegram_chat_id: account.driver.telegramChatId,
        approval_status: account.driver.approvalStatus,
        rejected_reason: account.driver.rejectedReason,
        archived_at: account.driver.archivedAt,
        vehicle_photo: account.driver.vehiclePhoto,
        driver_photo: account.driver.driverPhoto,
        description: account.driver.description,
        rating: account.driver.rating,
        active: account.driver.active,
        created_at: seededAt,
        updated_at: now()
      });
    }
  }

  supabaseDemoAccountsEnsured = true;
}

async function loadUsers() {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    await ensureDemoAccounts(supabase);
    const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    if (data?.length) {
      return data.map((row) => mapUser(row as UserRow));
    }
  }

  seedDemoData();
  return usersStore;
}

async function loadUsersById() {
  const users = await loadUsers();
  return new Map(users.map((user) => [user.id, user]));
}

async function loadCustomers() {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    await ensureDemoAccounts(supabase);
    const { data } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
    if (data?.length) {
      const usersById = await loadUsersById();
      return data.map((row) => {
        const customer = mapCustomer(row as CustomerRow);
        customer.username = usersById.get(customer.userId)?.username ?? '';
        return customer;
      });
    }
  }

  seedDemoData();
  return customersStore;
}

async function loadDrivers() {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    await ensureDemoAccounts(supabase);
    const { data } = await supabase.from('drivers').select('*').order('created_at', { ascending: false });
    if (data?.length) {
      const usersById = await loadUsersById();
      return data.map((row) => {
        const driver = mapDriver(row as DriverRow);
        driver.username = usersById.get(driver.userId)?.username ?? '';
        return driver;
      });
    }
  }

  seedDemoData();
  return driversStore;
}

export async function listAdminUsers() {
  const users = await loadUsers();
  return users.filter((user) => user.role === 'admin' || user.role === 'super_admin');
}

function toProfileSnapshot(customer?: CustomerRecord | null, driver?: DriverProfileRecord | null): BookingSnapshot | null {
  if (customer) {
    return {
      name: customer.fullName,
      phone: customer.phone,
      address: customer.address,
      username: customer.username
    };
  }

  if (driver) {
    return {
      name: driver.driverName,
      phone: driver.phone,
      username: driver.username,
      vehicleType: driver.vehicleType,
      plateNumber: driver.plateNumber,
      seatCount: driver.seatCount,
      serviceArea: driver.serviceArea,
      vehiclePhoto: driver.vehiclePhoto,
      driverPhoto: driver.driverPhoto,
      driverName: driver.driverName,
      description: driver.description
    };
  }

  return null;
}

export async function getUserById(userId: string) {
  const users = await loadUsers();
  return users.find((item) => item.id === userId) ?? null;
}

export async function getUserByUsername(username: string) {
  const identifier = normalizeIdentifier(username);
  const users = await loadUsers();
  return users.find((item) => item.username.toLowerCase() === identifier) ?? null;
}

export async function getCustomerByUserId(userId: string) {
  const customers = await loadCustomers();
  const customer = customers.find((item) => item.userId === userId) ?? null;
  if (!customer) {
    return null;
  }

  const user = await getUserById(userId);
  return {
    ...customer,
    username: user?.username ?? customer.username
  };
}

export async function getDriverByUserId(userId: string) {
  const drivers = await loadDrivers();
  const driver = drivers.find((item) => item.userId === userId) ?? null;
  if (!driver) {
    return null;
  }

  const user = await getUserById(userId);
  return {
    ...driver,
    username: user?.username ?? driver.username
  };
}

export async function listAvailableDrivers() {
  const drivers = await loadDrivers();
  return drivers.filter(
    (driver) => driver.active && driver.approvalStatus === 'approved' && !driver.archivedAt && driver.availableSeats > 0
  );
}

export async function listAllDriversAdmin() {
  return loadDrivers();
}

export async function registerAccount(input: {
  role: UserRole;
  username: string;
  password: string;
  fullName: string;
  phone: string;
  address?: string;
  telegramChatId?: string | null;
  driverName?: string;
  vehicleType?: VehicleType;
  plateNumber?: string;
  seatCount?: 4 | 7;
  availableSeats?: number;
  serviceArea?: string;
  vehiclePhoto?: string | null;
  driverPhoto?: string | null;
  description?: string | null;
  approvalStatus?: DriverProfileRecord['approvalStatus'];
  active?: boolean;
  rejectedReason?: string | null;
}) {
  if (input.role !== 'customer' && input.role !== 'driver') {
    throw new Error('Only passenger and driver self-registration is supported');
  }

  const username = normalizeIdentifier(input.username);
  const existing = await getUserByUsername(username);
  if (existing) {
    throw new Error('Account already exists');
  }

  const user: UserAccountRecord = {
    id: randomUUID(),
    username,
    passwordHash: hashPassword(input.password),
    role: input.role,
    fullName: input.fullName.trim(),
    phone: input.phone.trim(),
    address: input.address?.trim(),
    createdAt: now()
  };

  const supabase = getSupabaseServerClient();

  if (input.role === 'customer') {
    const customer: CustomerRecord = {
      userId: user.id,
      username: user.username,
      fullName: input.fullName.trim(),
      phone: input.phone.trim(),
      address: (input.address ?? '').trim(),
      telegramChatId: input.telegramChatId?.trim() || null,
      createdAt: now(),
      updatedAt: now()
    };

    if (supabase) {
      const { error: userError } = await supabase.from('users').insert({
        id: user.id,
        username: user.username,
        password_hash: user.passwordHash,
        role: user.role,
        full_name: user.fullName,
        phone: user.phone,
        address: user.address,
        active: true,
        created_at: user.createdAt,
        updated_at: now()
      });

      if (userError) {
        throw new Error(userError.message);
      }

      const { error: profileError } = await supabase.from('customers').insert({
        user_id: customer.userId,
        full_name: customer.fullName,
        phone: customer.phone,
        address: customer.address,
        telegram_chat_id: customer.telegramChatId,
        created_at: customer.createdAt,
        updated_at: customer.updatedAt
      });

      if (profileError) {
        throw new Error(profileError.message);
      }

      return { user, customer } satisfies AccountBundle;
    }

    usersStore.unshift(user);
    customersStore.unshift(customer);
    return { user, customer } satisfies AccountBundle;
  }

  const autoApproveDrivers = shouldAutoApproveDrivers();
  const driverApprovalStatus = input.approvalStatus ?? (autoApproveDrivers ? 'approved' : 'pending');
  const driverActive = input.active ?? autoApproveDrivers;

  const driver: DriverProfileRecord = {
    userId: user.id,
    username: user.username,
    fullName: input.fullName.trim(),
    phone: input.phone.trim(),
    address: '',
    driverName: (input.driverName ?? input.fullName).trim(),
    vehicleType: input.vehicleType ?? '4-seat vehicle',
    plateNumber: (input.plateNumber ?? '').trim(),
    seatCount: input.seatCount ?? 4,
    availableSeats: input.availableSeats ?? input.seatCount ?? 4,
    serviceArea: (input.serviceArea ?? '').trim(),
    telegramChatId: input.telegramChatId?.trim() || null,
    approvalStatus: driverApprovalStatus,
    rejectedReason: driverApprovalStatus === 'rejected' ? input.rejectedReason ?? 'Rejected by admin' : null,
    archivedAt: null,
    vehiclePhoto: input.vehiclePhoto ?? '/test-vehicles/test-car-01.svg',
    driverPhoto: input.driverPhoto ?? null,
    description: input.description ?? null,
    rating: 5,
    active: driverActive,
    createdAt: now(),
    updatedAt: now()
  };

  if (supabase) {
    const { error: userError } = await supabase.from('users').insert({
      id: user.id,
      username: user.username,
      password_hash: user.passwordHash,
      role: user.role,
      full_name: user.fullName,
      phone: user.phone,
      address: user.address,
      active: true,
      created_at: user.createdAt,
      updated_at: now()
    });

    if (userError) {
      throw new Error(userError.message);
    }

    const { error: profileError } = await supabase.from('drivers').insert({
      user_id: driver.userId,
      driver_name: driver.driverName,
      phone: driver.phone,
      vehicle_type: driver.vehicleType,
      plate_number: driver.plateNumber,
      seat_count: driver.seatCount,
      available_seats: driver.availableSeats,
      service_area: driver.serviceArea,
      telegram_chat_id: driver.telegramChatId,
      approval_status: driver.approvalStatus,
      rejected_reason: driver.rejectedReason,
      archived_at: driver.archivedAt,
      vehicle_photo: driver.vehiclePhoto,
      driver_photo: driver.driverPhoto,
      description: driver.description,
      rating: driver.rating,
      active: driver.active,
      created_at: driver.createdAt,
      updated_at: driver.updatedAt
    });

    if (profileError) {
      throw new Error(profileError.message);
    }

    return { user, driver } satisfies AccountBundle;
  }

  usersStore.unshift(user);
  driversStore.unshift(driver);
  return { user, driver } satisfies AccountBundle;
}

export async function authenticateAccount(username: string, password: string) {
  const user = await getUserByUsername(username);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return null;
  }

  if (user.role === 'customer') {
    return {
      user,
      customer: await getCustomerByUserId(user.id)
    };
  }

  if (user.role === 'driver') {
    return {
      user,
      driver: await getDriverByUserId(user.id)
    };
  }

  return { user };
}

export async function updateCustomerProfile(userId: string, patch: Partial<CustomerRecord>) {
  const existing = await getCustomerByUserId(userId);
  if (!existing) {
    throw new Error('Customer profile not found');
  }

  const next: CustomerRecord = {
    ...existing,
    fullName: patch.fullName?.trim() || existing.fullName,
    phone: patch.phone?.trim() || existing.phone,
    address: patch.address !== undefined ? patch.address.trim() : existing.address,
    telegramChatId:
      patch.telegramChatId !== undefined ? patch.telegramChatId?.trim() || null : existing.telegramChatId ?? null,
    updatedAt: now()
  };

  const supabase = getSupabaseServerClient();
  if (supabase) {
    await supabase
      .from('customers')
      .update({
        full_name: next.fullName,
        phone: next.phone,
        address: next.address,
        telegram_chat_id: next.telegramChatId,
        updated_at: next.updatedAt
      })
      .eq('user_id', userId);
  }

  const index = customersStore.findIndex((item) => item.userId === userId);
  if (index >= 0) {
    customersStore[index] = next;
  }

  return next;
}

export async function updateDriverProfile(userId: string, patch: Partial<DriverProfileRecord>) {
  const existing = await getDriverByUserId(userId);
  if (!existing) {
    throw new Error('Driver profile not found');
  }

  const next: DriverProfileRecord = {
    ...existing,
    driverName: patch.driverName?.trim() || existing.driverName,
    fullName: patch.fullName?.trim() || patch.driverName?.trim() || existing.fullName,
    phone: patch.phone?.trim() || existing.phone,
    vehicleType: patch.vehicleType || existing.vehicleType,
    plateNumber: patch.plateNumber?.trim() || existing.plateNumber,
    seatCount: patch.seatCount || existing.seatCount,
    availableSeats:
      patch.availableSeats !== undefined
        ? Math.max(0, Math.min(patch.availableSeats, patch.seatCount ?? existing.seatCount))
        : Math.max(0, Math.min(existing.availableSeats, patch.seatCount ?? existing.seatCount)),
    serviceArea: patch.serviceArea?.trim() || existing.serviceArea,
    telegramChatId:
      patch.telegramChatId !== undefined ? patch.telegramChatId?.trim() || null : existing.telegramChatId ?? null,
    approvalStatus: patch.approvalStatus ?? existing.approvalStatus,
    rejectedReason: patch.rejectedReason !== undefined ? patch.rejectedReason : existing.rejectedReason,
    archivedAt: patch.archivedAt !== undefined ? patch.archivedAt : existing.archivedAt,
    vehiclePhoto: patch.vehiclePhoto !== undefined ? patch.vehiclePhoto : existing.vehiclePhoto,
    driverPhoto: patch.driverPhoto !== undefined ? patch.driverPhoto : existing.driverPhoto,
    description: patch.description !== undefined ? patch.description : existing.description,
    rating: patch.rating ?? existing.rating,
    active: patch.active ?? existing.active,
    updatedAt: now()
  };

  const supabase = getSupabaseServerClient();
  if (supabase) {
    await supabase
      .from('drivers')
      .update({
        driver_name: next.driverName,
        phone: next.phone,
        vehicle_type: next.vehicleType,
        plate_number: next.plateNumber,
        seat_count: next.seatCount,
        available_seats: next.availableSeats,
        service_area: next.serviceArea,
        telegram_chat_id: next.telegramChatId,
        approval_status: next.approvalStatus,
        rejected_reason: next.rejectedReason,
        archived_at: next.archivedAt,
        vehicle_photo: next.vehiclePhoto,
        driver_photo: next.driverPhoto,
        description: next.description,
        rating: next.rating,
        active: next.active,
        updated_at: next.updatedAt
      })
      .eq('user_id', userId);
  }

  const index = driversStore.findIndex((item) => item.userId === userId);
  if (index >= 0) {
    driversStore[index] = next;
  }

  return next;
}

export async function setDriverApproval(
  userId: string,
  approvalStatus: DriverProfileRecord['approvalStatus'],
  rejectedReason?: string | null
) {
  return updateDriverProfile(userId, {
    approvalStatus,
    rejectedReason: approvalStatus === 'rejected' ? rejectedReason ?? 'Rejected by admin' : null,
    active: approvalStatus === 'approved'
  });
}

export async function setDriverActiveState(userId: string, active: boolean) {
  return updateDriverProfile(userId, { active });
}

export async function archiveDriver(userId: string) {
  return updateDriverProfile(userId, {
    active: false,
    archivedAt: now()
  });
}

export async function getBookingActorSnapshot(userId: string, role: UserRole) {
  if (role === 'customer') {
    const customer = await getCustomerByUserId(userId);
    return toProfileSnapshot(customer, null);
  }

  if (role === 'driver') {
    const driver = await getDriverByUserId(userId);
    return toProfileSnapshot(null, driver);
  }

  return null;
}
