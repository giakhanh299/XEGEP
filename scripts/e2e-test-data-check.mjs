const baseUrl = process.env.E2E_BASE_URL ?? 'http://127.0.0.1:3100';
const password = 'testpass1';

const passengers = [
  {
    username: 'test_passenger_01',
    password,
    fullName: 'TEST Passenger 01',
    phone: '0900001001',
    address: 'TEST address passenger 01'
  },
  {
    username: 'test_passenger_02',
    password,
    fullName: 'TEST Passenger 02',
    phone: '0900001002',
    address: 'TEST address passenger 02'
  },
  {
    username: 'test_passenger_03',
    password,
    fullName: 'TEST Passenger 03',
    phone: '0900001003',
    address: 'TEST address passenger 03'
  }
];

const drivers = [
  {
    username: 'test_driver_01',
    password,
    driverName: 'TEST Driver 01',
    phone: '0900002001',
    vehicleType: '4-seat vehicle',
    plateNumber: 'TEST-001',
    seatCount: 4,
    availableSeats: 4,
    serviceArea: 'TEST Dai Loc - Da Nang',
    vehiclePhoto: '/test-vehicles/test-car-01.svg',
    description: 'TEST/DEMO 4-seat car. Safe to remove.'
  },
  {
    username: 'test_driver_02',
    password,
    driverName: 'TEST Driver 02',
    phone: '0900002002',
    vehicleType: '7-seat vehicle',
    plateNumber: 'TEST-002',
    seatCount: 7,
    availableSeats: 7,
    serviceArea: 'TEST Da Nang - Dai Loc',
    vehiclePhoto: '/test-vehicles/test-car-02.svg',
    description: 'TEST/DEMO 7-seat car. Safe to remove.'
  },
  {
    username: 'test_driver_03',
    password,
    driverName: 'TEST Driver 03',
    phone: '0900002003',
    vehicleType: '4-seat vehicle',
    plateNumber: 'TEST-003',
    seatCount: 4,
    availableSeats: 4,
    serviceArea: 'TEST supported vehicle fallback',
    vehiclePhoto: '/test-vehicles/test-car-03.svg',
    description: 'TEST/DEMO third vehicle. Motorbike is not supported by current schema. Safe to remove.'
  }
];

const standaloneVehicles = drivers.map((driver) => ({
  plateNumber: driver.plateNumber,
  vehicleType: driver.vehicleType,
  capacity: driver.seatCount,
  active: true
}));

class Session {
  constructor(label) {
    this.label = label;
    this.cookie = '';
  }

  capture(response) {
    const getSetCookie = response.headers.getSetCookie?.bind(response.headers);
    const cookies = getSetCookie ? getSetCookie() : [response.headers.get('set-cookie')].filter(Boolean);
    const pairs = cookies.map((cookie) => cookie.split(';')[0]).filter(Boolean);
    if (pairs.length > 0) {
      this.cookie = pairs.join('; ');
    }
  }
}

function jsonHeaders(session) {
  const headers = { 'Content-Type': 'application/json' };
  if (session?.cookie) {
    headers.Cookie = session.cookie;
  }
  return headers;
}

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method ?? 'GET',
    headers: options.json ? jsonHeaders(options.session) : options.session?.cookie ? { Cookie: options.session.cookie } : undefined,
    body: options.json ? JSON.stringify(options.json) : undefined,
    redirect: options.redirect ?? 'follow'
  });
  options.session?.capture(response);
  const contentType = response.headers.get('content-type') ?? '';
  const text = await response.text();
  const data = contentType.includes('application/json') && text ? JSON.parse(text) : null;
  if (options.ok !== false && !response.ok) {
    throw new Error(`${options.method ?? 'GET'} ${path} failed with ${response.status}: ${text}`);
  }
  return { response, data, text };
}

async function registerOrLoginCustomer(input) {
  const session = new Session(input.username);
  const register = await request('/api/auth/register', {
    method: 'POST',
    session,
    json: { role: 'customer', ...input },
    ok: false
  });

  if (register.response.ok) {
    return { session, user: register.data.user, customer: register.data.customer, created: true };
  }

  const login = await request('/api/auth/login', {
    method: 'POST',
    session,
    json: { username: input.username, password: input.password }
  });
  return { session, user: login.data.user, customer: login.data.customer, created: false };
}

async function registerOrLoginDriver(input) {
  const session = new Session(input.username);
  const register = await request('/api/auth/register', {
    method: 'POST',
    session,
    json: { role: 'driver', ...input },
    ok: false
  });

  let data = register.data;
  let created = register.response.ok;
  if (!register.response.ok) {
    const login = await request('/api/auth/login', {
      method: 'POST',
      session,
      json: { username: input.username, password: input.password }
    });
    data = login.data;
    created = false;
  }

  const update = await request('/api/driver/profile', {
    method: 'PUT',
    session,
    json: {
      driverName: input.driverName,
      phone: input.phone,
      vehicleType: input.vehicleType,
      plateNumber: input.plateNumber,
      seatCount: input.seatCount,
      availableSeats: input.availableSeats,
      serviceArea: input.serviceArea,
      vehiclePhoto: input.vehiclePhoto,
      driverPhoto: '',
      description: input.description
    }
  });

  return { session, user: data.user, driver: update.data.driver, created };
}

async function loginAccount(username, accountPassword) {
  const session = new Session(username);
  const login = await request('/api/auth/login', {
    method: 'POST',
    session,
    json: { username, password: accountPassword }
  });
  return { session, user: login.data.user, customer: login.data.customer, driver: login.data.driver };
}

async function loginAdmin() {
  return loginAccount('demo_admin', 'password123');
}

async function warmRoutes(admin) {
  const demoCustomer = await loginAccount('demo_customer', 'password123');
  const demoDriver = await loginAccount('demo_driver', 'password123');

  await request('/api/auth/me', { session: demoCustomer.session });
  await request('/api/customer/profile', { session: demoCustomer.session });
  await request('/api/driver/profile', { session: demoDriver.session });
  const adminDrivers = await request('/api/admin/drivers', { session: admin.session });
  const adminDemoDriver = adminDrivers.data.drivers.find((driver) => driver.username === 'demo_driver');
  if (adminDemoDriver) {
    await request(`/api/admin/drivers/${adminDemoDriver.userId}`, { session: admin.session, ok: false });
  }
  await request('/api/admin/vehicles', { session: admin.session });
  await request('/api/vehicles');
  await request('/api/bookings', { session: demoCustomer.session });
  await request('/api/driver/bookings', { session: demoDriver.session });
  await request('/vehicles');
  await request('/customer/my-trips', { session: demoCustomer.session });
  await request('/admin/drivers', { session: admin.session });
  await request('/admin/vehicles', { session: admin.session });
  await request('/admin/bookings', { session: admin.session });
  await request('/driver/bookings', { session: demoDriver.session });
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function containsAll(text, values) {
  return values.every((value) => text.includes(value));
}

async function main() {
  await request('/auth');

  const admin = await loginAdmin();
  await warmRoutes(admin);

  const passengerResults = [];
  for (const passenger of passengers) {
    passengerResults.push(await registerOrLoginCustomer(passenger));
  }

  const driverResults = [];
  for (const driver of drivers) {
    const result = await registerOrLoginDriver(driver);
    driverResults.push(result);
    await request(`/api/admin/drivers/${result.driver.userId}`, {
      method: 'PATCH',
      session: admin.session,
      json: { action: 'approve' }
    });
  }

  const standaloneVehicleResults = [];
  for (const vehicle of standaloneVehicles) {
    const result = await request('/api/admin/vehicles', {
      method: 'POST',
      session: admin.session,
      json: vehicle,
      ok: false
    });
    standaloneVehicleResults.push({
      plateNumber: vehicle.plateNumber,
      ok: result.response.ok,
      status: result.response.status,
      vehicle: result.data?.vehicle ?? null,
      error: result.data?.error ?? null
    });
  }

  const adminDrivers = await request('/api/admin/drivers', { session: admin.session });
  const adminDriverRows = adminDrivers.data.drivers.filter((driver) =>
    drivers.some((testDriver) => testDriver.username === driver.username)
  );
  assert(adminDriverRows.length === 3, `Expected 3 TEST drivers in admin drivers, found ${adminDriverRows.length}`);
  assert(adminDriverRows.every((driver) => driver.approvalStatus === 'approved' && driver.active), 'A TEST driver is not approved and active');

  const publicVehicles = await request('/api/vehicles');
  const publicVehicleRows = publicVehicles.data.vehicles.filter((vehicle) =>
    drivers.some((driver) => driver.plateNumber === vehicle.plateNumber)
  );
  assert(publicVehicleRows.length === 3, `Expected 3 TEST vehicles in public vehicle selections, found ${publicVehicleRows.length}`);

  const bookingDriver = publicVehicleRows.find((vehicle) => vehicle.plateNumber === 'TEST-001');
  assert(bookingDriver, 'Could not find TEST-001 as a bookable vehicle');

  const booking = await request('/api/bookings', {
    method: 'POST',
    session: passengerResults[0].session,
    json: {
      pickupLocation: 'TEST pickup Dai Loc',
      dropoffLocation: 'TEST dropoff Da Nang',
      bookingTime: '2026-06-07T09:00',
      notes: 'TEST booking created by e2e-test-data-check.mjs',
      driverId: bookingDriver.id,
      routeType: 'dai_loc_to_da_nang',
      passengerCount: 2,
      estimatedDistanceKm: 32,
      fareBase: 90000,
      farePerKm: 15000
    }
  });
  const bookingId = booking.data.booking.id;

  const passengerBookings = await request('/api/bookings', { session: passengerResults[0].session });
  const adminBookings = await request('/api/bookings', { session: admin.session });
  const driverSession = driverResults.find((driver) => driver.driver.userId === bookingDriver.id)?.session;
  assert(driverSession, 'Could not find driver session for booked TEST vehicle');
  const driverBookings = await request('/api/driver/bookings', { session: driverSession });

  const passengerBookingFound = passengerBookings.data.bookings.some((item) => item.id === bookingId);
  const adminBookingFound = adminBookings.data.bookings.some((item) => item.id === bookingId);
  const driverBookingFound = driverBookings.data.bookings.some((item) => item.id === bookingId);

  const pages = {
    vehicles: await request('/vehicles'),
    passengerTrips: await request('/customer/my-trips', { session: passengerResults[0].session }),
    adminDrivers: await request('/admin/drivers', { session: admin.session }),
    adminVehicles: await request('/admin/vehicles', { session: admin.session }),
    adminBookings: await request('/admin/bookings', { session: admin.session }),
    driverBookings: await request('/driver/bookings', { session: driverSession })
  };

  const adminVehiclesApi = await request('/api/admin/vehicles', { session: admin.session });
  const adminVehicleApiRows = adminVehiclesApi.data.vehicles.filter((vehicle) =>
    drivers.some((driver) => driver.plateNumber === vehicle.plateNumber)
  );

  const report = {
    baseUrl,
    backend: 'local in-memory fallback; Supabase environment variables were not present in this workspace',
    constraints: {
      username: 'Current validation rejects email addresses; TEST usernames omit @.',
      password: 'Current validation requires at least 8 characters; password used is testpass1.',
      vehicleTypes: 'Current schema supports only 4-seat vehicle and 7-seat vehicle; motorbike is unsupported.'
    },
    testAccounts: {
      passengers: passengerResults.map((result) => ({
        username: result.user.username,
        password,
        createdThisRun: result.created,
        id: result.user.id
      })),
      drivers: driverResults.map((result) => ({
        username: result.driver.username,
        password,
        createdThisRun: result.created,
        id: result.driver.userId,
        initialApprovalStatus: result.driver.approvalStatus,
        initialActive: result.driver.active,
        finalApprovalStatus: adminDriverRows.find((driver) => driver.userId === result.driver.userId)?.approvalStatus ?? null,
        finalActive: adminDriverRows.find((driver) => driver.userId === result.driver.userId)?.active ?? null
      }))
    },
    testVehicles: publicVehicleRows.map((vehicle) => ({
      driverId: vehicle.id,
      driverName: vehicle.driverName,
      plateNumber: vehicle.plateNumber,
      vehicleType: vehicle.vehicleType,
      seatCount: vehicle.seatCount,
      availableSeats: vehicle.availableSeats,
      vehiclePhoto: vehicle.vehiclePhoto
    })),
    standaloneVehicleApiCreates: standaloneVehicleResults,
    booking: {
      id: bookingId,
      driverId: booking.data.booking.driverId,
      passengerFoundInApi: passengerBookingFound,
      adminFoundInApi: adminBookingFound,
      driverFoundInApi: driverBookingFound
    },
    listings: {
      publicVehiclesApiCount: publicVehicleRows.length,
      adminDriversApiCount: adminDriverRows.length,
      adminVehiclesApiCount: adminVehicleApiRows.length,
      vehiclesPageHasTestPlates: containsAll(pages.vehicles.text, ['TEST-001', 'TEST-002', 'TEST-003']),
      passengerTripsPageHasBooking: pages.passengerTrips.text.includes(bookingId),
      adminDriversPageHasTestDrivers: containsAll(pages.adminDrivers.text, ['TEST Driver 01', 'TEST Driver 02', 'TEST Driver 03']),
      adminVehiclesPageHasTestPlates: containsAll(pages.adminVehicles.text, ['TEST-001', 'TEST-002', 'TEST-003']),
      adminBookingsPageHasBooking: pages.adminBookings.text.includes(bookingId),
      driverBookingsPageHasBooking: pages.driverBookings.text.includes(bookingId)
    },
    results: {
      bookingFlow: passengerBookingFound && adminBookingFound && driverBookingFound ? 'PASS' : 'FAIL',
      driverRegistrationFlow: adminDriverRows.length === 3 && adminDriverRows.every((driver) => driver.approvalStatus === 'approved' && driver.active) ? 'PASS' : 'FAIL',
      vehicleListingFlow: publicVehicleRows.length === 3 && containsAll(pages.vehicles.text, ['TEST-001', 'TEST-002', 'TEST-003']) ? 'PASS' : 'FAIL',
      adminListingFlow:
        adminDriverRows.length === 3 &&
        containsAll(pages.adminDrivers.text, ['TEST Driver 01', 'TEST Driver 02', 'TEST Driver 03']) &&
        containsAll(pages.adminVehicles.text, ['TEST-001', 'TEST-002', 'TEST-003']) &&
        pages.adminBookings.text.includes(bookingId)
          ? 'PASS'
          : 'FAIL'
    }
  };

  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
});
