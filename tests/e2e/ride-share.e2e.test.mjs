import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';

const baseUrl = process.env.E2E_BASE_URL ?? 'http://127.0.0.1:3100';
const runId = (process.env.E2E_RUN_ID ?? Date.now().toString(36)).replace(/[^a-z0-9]/gi, '').slice(-8);
const phoneSeed = String(Date.now()).slice(-5).padStart(5, '0');
const password = 'testpass1';
const plates = ['TEST-001', 'TEST-002', 'TEST-003'];
const imagePaths = [
  '/test-vehicles/test-car-01.svg',
  '/test-vehicles/test-car-02.svg',
  '/test-vehicles/test-car-03.svg'
];

const ctx = {
  admin: null,
  passengers: [],
  drivers: [],
  booking: null
};

const passengerInputs = [1, 2, 3].map((index) => ({
  username: `test_p_${runId}_${String(index).padStart(2, '0')}`,
  password,
  fullName: `TEST Passenger ${String(index).padStart(2, '0')}`,
  phone: `090${phoneSeed}${String(index).padStart(2, '0')}`,
  address: `TEST address passenger ${String(index).padStart(2, '0')}`
}));

const driverInputs = [
  {
    username: `test_d_${runId}_01`,
    driverName: 'TEST Driver 01',
    phone: `091${phoneSeed}01`,
    vehicleType: '4-seat vehicle',
    plateNumber: 'TEST-001',
    seatCount: 4,
    availableSeats: 4,
    serviceArea: 'TEST Dai Loc - Da Nang',
    vehiclePhoto: imagePaths[0],
    description: `TEST/DEMO 4-seat car for run ${runId}.`
  },
  {
    username: `test_d_${runId}_02`,
    driverName: 'TEST Driver 02',
    phone: `091${phoneSeed}02`,
    vehicleType: '7-seat vehicle',
    plateNumber: 'TEST-002',
    seatCount: 7,
    availableSeats: 7,
    serviceArea: 'TEST Da Nang - Dai Loc',
    vehiclePhoto: imagePaths[1],
    description: `TEST/DEMO 7-seat car for run ${runId}.`
  },
  {
    username: `test_d_${runId}_03`,
    driverName: 'TEST Driver 03',
    phone: `091${phoneSeed}03`,
    vehicleType: '4-seat vehicle',
    plateNumber: 'TEST-003',
    seatCount: 4,
    availableSeats: 4,
    serviceArea: 'TEST supported vehicle fallback',
    vehiclePhoto: imagePaths[2],
    description: `TEST/DEMO third supported vehicle for run ${runId}.`
  }
].map((driver) => ({ ...driver, password }));

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

function cookieHeaders(session) {
  return session?.cookie ? { Cookie: session.cookie } : undefined;
}

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method ?? 'GET',
    headers: options.json ? jsonHeaders(options.session) : cookieHeaders(options.session),
    body: options.json ? JSON.stringify(options.json) : options.body,
    redirect: options.redirect ?? 'follow'
  });
  options.session?.capture(response);

  const contentType = response.headers.get('content-type') ?? '';
  const text = await response.text();
  const data = contentType.includes('application/json') && text ? JSON.parse(text) : null;

  if (options.ok !== false && !response.ok) {
    throw new Error(`${options.method ?? 'GET'} ${path} failed with ${response.status}: ${text}`);
  }

  return { response, data, text, contentType };
}

async function requestForm(path, formData, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method ?? 'POST',
    headers: cookieHeaders(options.session),
    body: formData
  });
  options.session?.capture(response);

  const contentType = response.headers.get('content-type') ?? '';
  const text = await response.text();
  const data = contentType.includes('application/json') && text ? JSON.parse(text) : null;

  if (options.ok !== false && !response.ok) {
    throw new Error(`${options.method ?? 'POST'} ${path} failed with ${response.status}: ${text}`);
  }

  return { response, data, text, contentType };
}

async function waitForServer() {
  const deadline = Date.now() + 60_000;
  let lastError = null;

  while (Date.now() < deadline) {
    try {
      const result = await request('/auth', { ok: false });
      if (result.response.status >= 200 && result.response.status < 500) {
        return;
      }
    } catch (error) {
      lastError = error;
    }
    await delay(1_000);
  }

  throw new Error(
    `E2E server is not reachable at ${baseUrl}. Start it with: npm run dev -- -p 3100. Last error: ${lastError?.message ?? 'none'}`
  );
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

  await request('/api/auth/me', { session: demoCustomer.session, ok: false });
  await request('/api/customer/profile', { session: demoCustomer.session, ok: false });
  await request('/api/driver/profile', { session: demoDriver.session, ok: false });
  const adminDrivers = await request('/api/admin/drivers', { session: admin.session, ok: false });
  const adminDemoDriver = adminDrivers.data?.drivers?.find((driver) => driver.username === 'demo_driver');
  if (adminDemoDriver) {
    await request(`/api/admin/drivers/${adminDemoDriver.userId}`, { session: admin.session, ok: false });
  }
  await request('/api/admin/vehicles', { session: admin.session, ok: false });
  await request('/api/vehicles', { ok: false });
  await request('/api/bookings', { session: demoCustomer.session, ok: false });
  await request('/api/driver/bookings', { session: demoDriver.session, ok: false });
  await request('/vehicles', { ok: false });
  await request('/customer/my-trips', { session: demoCustomer.session, ok: false });
  await request('/admin/drivers', { session: admin.session, ok: false });
  await request('/admin/vehicles', { session: admin.session, ok: false });
  await request('/admin/bookings', { session: admin.session, ok: false });
  await request('/driver/bookings', { session: demoDriver.session, ok: false });

  const uploadWarmup = new FormData();
  uploadWarmup.append('kind', 'vehicle');
  uploadWarmup.append('file', new Blob(['<svg xmlns="http://www.w3.org/2000/svg" />'], { type: 'image/svg+xml' }), 'warmup.svg');
  await requestForm('/api/uploads', uploadWarmup, { ok: false });
}

async function registerCustomer(input) {
  const session = new Session(input.username);
  const result = await request('/api/auth/register', {
    method: 'POST',
    session,
    json: { role: 'customer', ...input }
  });
  return { session, user: result.data.user, customer: result.data.customer };
}

async function registerDriver(input) {
  const session = new Session(input.username);
  const register = await request('/api/auth/register', {
    method: 'POST',
    session,
    json: { role: 'driver', ...input }
  });
  const profile = await request('/api/driver/profile', {
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
  return { session, user: register.data.user, registeredDriver: register.data.driver, driver: profile.data.driver };
}

async function approveDriver(userId) {
  return request(`/api/admin/drivers/${userId}`, {
    method: 'PATCH',
    session: ctx.admin.session,
    json: { action: 'approve' }
  });
}

function filterTestDrivers(drivers) {
  const usernames = new Set(driverInputs.map((driver) => driver.username));
  return drivers.filter((driver) => usernames.has(driver.username));
}

function filterTestVehicles(vehicles) {
  const ids = new Set(ctx.drivers.map((driver) => driver.driver.userId));
  return vehicles.filter((vehicle) => ids.has(vehicle.id));
}

function containsAll(text, values) {
  return values.every((value) => text.includes(value));
}

test('setup warms routes and logs in admin', async () => {
  await waitForServer();
  const warmAdmin = await loginAdmin();
  await warmRoutes(warmAdmin);
  ctx.admin = await loginAdmin();
  assert.equal(ctx.admin.user.role, 'admin');
});

test('driver registration flow keeps new drivers pending until approval', async () => {
  for (const input of driverInputs) {
    const driver = await registerDriver(input);
    ctx.drivers.push(driver);
    assert.equal(driver.registeredDriver.approvalStatus, 'pending');
    assert.equal(driver.registeredDriver.active, false);
  }

  const beforeApprovalVehicles = await request('/api/vehicles');
  const hiddenRows = filterTestVehicles(beforeApprovalVehicles.data.vehicles);
  assert.equal(hiddenRows.length, 0, 'Pending/inactive TEST drivers should not be public vehicle selections');

  for (const driver of ctx.drivers) {
    const approved = await approveDriver(driver.driver.userId);
    assert.equal(approved.data.driver.approvalStatus, 'approved');
    assert.equal(approved.data.driver.active, true);
  }

  const adminDrivers = await request('/api/admin/drivers', { session: ctx.admin.session });
  const testRows = filterTestDrivers(adminDrivers.data.drivers);
  assert.equal(testRows.length, 3);
  assert.ok(testRows.every((driver) => driver.approvalStatus === 'approved' && driver.active));

  const afterApprovalVehicles = await request('/api/vehicles');
  const publicRows = filterTestVehicles(afterApprovalVehicles.data.vehicles);
  assert.equal(publicRows.length, 3, 'Approved active TEST drivers should appear in public vehicle selections');
});

test('vehicle flow exposes TEST-001, TEST-002, and TEST-003 in API and pages', async () => {
  for (const driver of driverInputs) {
    const created = await request('/api/admin/vehicles', {
      method: 'POST',
      session: ctx.admin.session,
      json: {
        plateNumber: driver.plateNumber,
        vehicleType: driver.vehicleType,
        capacity: driver.seatCount,
        active: true
      },
      ok: false
    });
    assert.equal(created.response.status, 201);
  }

  const vehicles = await request('/api/vehicles');
  const publicRows = filterTestVehicles(vehicles.data.vehicles);
  assert.deepEqual(new Set(publicRows.map((vehicle) => vehicle.plateNumber)), new Set(plates));

  const vehiclesPage = await request('/vehicles');
  assert.ok(containsAll(vehiclesPage.text, plates), '/vehicles should render all TEST plates');

  const adminVehiclesPage = await request('/admin/vehicles', { session: ctx.admin.session });
  assert.ok(containsAll(adminVehiclesPage.text, plates), '/admin/vehicles should render all TEST plates');
});

test('passenger booking flow creates booking and shows it to passenger, admin, and driver', async () => {
  for (const input of passengerInputs) {
    ctx.passengers.push(await registerCustomer(input));
  }

  const vehicles = await request('/api/vehicles');
  const bookingVehicle = filterTestVehicles(vehicles.data.vehicles).find((vehicle) => vehicle.plateNumber === 'TEST-001');
  assert.ok(bookingVehicle, 'TEST-001 should be available before booking');

  const booking = await request('/api/bookings', {
    method: 'POST',
    session: ctx.passengers[0].session,
    json: {
      pickupLocation: 'TEST pickup Dai Loc',
      dropoffLocation: 'TEST dropoff Da Nang',
      bookingTime: '2026-06-07T09:00',
      notes: `TEST booking created by ride-share.e2e.test.mjs run ${runId}`,
      driverId: bookingVehicle.id,
      routeType: 'dai_loc_to_da_nang',
      passengerCount: 2,
      estimatedDistanceKm: 32,
      fareBase: 90000,
      farePerKm: 15000
    }
  });
  ctx.booking = booking.data.booking;
  assert.ok(ctx.booking.id);
  assert.equal(ctx.booking.driverId, bookingVehicle.id);

  const passengerBookings = await request('/api/bookings', { session: ctx.passengers[0].session });
  assert.ok(
    passengerBookings.data.bookings.some((item) => item.id === ctx.booking.id),
    'Booking disappeared after route access. In local fallback mode this usually means a previously cold route compiled after data creation and reset module-level stores in lib/services/accounts.ts, lib/services/rides.ts, or lib/services/fleet.ts.'
  );

  const passengerTripsPage = await request('/customer/my-trips', { session: ctx.passengers[0].session });
  assert.ok(passengerTripsPage.text.includes(ctx.booking.id));

  const adminBookings = await request('/api/bookings', { session: ctx.admin.session });
  assert.ok(adminBookings.data.bookings.some((item) => item.id === ctx.booking.id));

  const adminBookingsPage = await request('/admin/bookings', { session: ctx.admin.session });
  assert.ok(adminBookingsPage.text.includes(ctx.booking.id));

  const bookingDriver = ctx.drivers.find((driver) => driver.driver.userId === bookingVehicle.id);
  assert.ok(bookingDriver);
  const driverBookings = await request('/api/driver/bookings', { session: bookingDriver.session });
  assert.ok(driverBookings.data.bookings.some((item) => item.id === ctx.booking.id));

  const driverBookingsPage = await request('/driver/bookings', { session: bookingDriver.session });
  assert.ok(driverBookingsPage.text.includes(ctx.booking.id));
});

test('image fixture flow serves SVG placeholders and rejects SVG uploads', async () => {
  for (const imagePath of imagePaths) {
    const result = await request(imagePath);
    assert.equal(result.response.status, 200);
    assert.match(result.contentType, /image\/svg\+xml/);
    assert.match(result.text, /<svg[\s>]/);
  }

  const svgText = await readFile('public/test-vehicles/test-car-01.svg', 'utf8');
  const formData = new FormData();
  formData.append('kind', 'vehicle');
  formData.append('file', new Blob([svgText], { type: 'image/svg+xml' }), 'test-car-01.svg');
  const upload = await requestForm('/api/uploads', formData, { ok: false });
  assert.equal(upload.response.status, 400);
  assert.match(upload.data?.error ?? upload.text, /JPG|PNG|WEBP|allowed/i);
});

test('data visibility regression keeps booking and TEST data visible after route access', async () => {
  assert.ok(ctx.booking?.id, 'Booking must be created before visibility regression test');

  await request('/vehicles');
  await request('/admin/drivers', { session: ctx.admin.session });
  await request('/admin/vehicles', { session: ctx.admin.session });
  await request('/api/auth/me', { session: ctx.passengers[0].session });
  await request('/api/auth/me', { session: ctx.drivers[0].session });

  const passengerBookings = await request('/api/bookings', { session: ctx.passengers[0].session });
  assert.ok(passengerBookings.data.bookings.some((item) => item.id === ctx.booking.id));

  const publicVehicles = await request('/api/vehicles');
  assert.equal(filterTestVehicles(publicVehicles.data.vehicles).length, 3);

  const adminDrivers = await request('/api/admin/drivers', { session: ctx.admin.session });
  assert.equal(filterTestDrivers(adminDrivers.data.drivers).length, 3);

  const adminBookingsPage = await request('/admin/bookings', { session: ctx.admin.session });
  assert.ok(adminBookingsPage.text.includes(ctx.booking.id));
});

test('passenger registration accepts one-character passwords', async () => {
  const session = new Session(`short_passenger_${runId}`);
  const result = await request('/api/auth/register', {
    method: 'POST',
    session,
    json: {
      role: 'customer',
      username: `short_p_${runId}`,
      password: '1',
      fullName: 'TEST Short Password Passenger',
      phone: `092${phoneSeed}01`,
      address: 'TEST short password address'
    },
    ok: false
  });

  assert.equal(
    result.response.status,
    200,
    `Expected passenger password "1" to be accepted. Current backend rejects it in app/api/auth/register/route.ts via validatePassword from lib/validation.ts:39. Response: ${result.response.status} ${result.text}`
  );
});

test('driver registration accepts one-character passwords', async () => {
  const session = new Session(`short_driver_${runId}`);
  const result = await request('/api/auth/register', {
    method: 'POST',
    session,
    json: {
      role: 'driver',
      username: `short_d_${runId}`,
      password: '1',
      driverName: 'TEST Short Password Driver',
      phone: `093${phoneSeed}01`,
      vehicleType: '4-seat vehicle',
      plateNumber: `SP-${runId.slice(-4)}`,
      seatCount: 4,
      serviceArea: 'TEST short password service area',
      vehiclePhoto: imagePaths[0],
      description: 'TEST short password driver.'
    },
    ok: false
  });

  assert.equal(
    result.response.status,
    200,
    `Expected driver password "1" to be accepted. Current backend rejects it in app/api/auth/register/route.ts via validatePassword from lib/validation.ts:39. Response: ${result.response.status} ${result.text}`
  );
});
