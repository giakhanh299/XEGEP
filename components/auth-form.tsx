'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getRoleHomePath } from '@/lib/auth/paths';
import type { UserRole } from '@/lib/types';

type AuthMode = 'login' | 'customer' | 'driver';

const loginInitial = {
  email: '',
  password: ''
};

const customerInitial = {
  email: '',
  fullName: '',
  phone: '',
  address: '',
  password: ''
};

const driverInitial = {
  email: '',
  driverName: '',
  phone: '',
  vehicleType: '7-seat vehicle',
  plateNumber: '',
  seatCount: '7',
  serviceArea: '',
  vehiclePhoto: '/test-vehicles/test-car-01.svg',
  driverPhoto: '',
  description: '',
  password: ''
};

function nextPathFor(mode: AuthMode, role?: UserRole) {
  if (mode === 'driver') {
    return '/driver/profile';
  }

  return getRoleHomePath(role);
}

export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('login');
  const [customerForm, setCustomerForm] = useState(customerInitial);
  const [driverForm, setDriverForm] = useState(driverInitial);
  const [loginForm, setLoginForm] = useState(loginInitial);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const payload =
        mode === 'login'
          ? loginForm
          : mode === 'customer'
            ? {
                role: 'customer',
                ...customerForm
              }
            : {
                role: 'driver',
                ...driverForm,
                seatCount: Number(driverForm.seatCount)
              };

      const response = await fetch(mode === 'login' ? '/api/auth/login' : '/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error ?? 'Authentication failed');
      }

      router.push(nextPathFor(mode, data?.user?.role));
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form method="post" onSubmit={handleSubmit} className="glass space-y-5 rounded-[1.75rem] p-5" autoComplete="on">
      <div className="grid gap-2 sm:grid-cols-3">
        {[
          ['login', 'Login'],
          ['customer', 'Passenger register'],
          ['driver', 'Driver register']
        ].map(([item, label]) => (
          <button
            key={item}
            type="button"
            onClick={() => setMode(item as AuthMode)}
            className={`rounded-2xl px-4 py-2 text-sm font-semibold ${
              mode === item ? 'bg-emerald-400 text-slate-950' : 'bg-white/5 text-slate-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === 'login' ? (
        <div className="grid gap-3">
          <label className="space-y-2 text-sm" htmlFor="login-email">
            <span className="text-slate-200">Email</span>
            <input
              id="login-email"
              required
              type="email"
              name="email"
              autoComplete="email"
              value={loginForm.email}
              onChange={(event) => setLoginForm((prev) => ({ ...prev, email: event.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none focus:border-emerald-400/40"
            />
          </label>
          <label className="space-y-2 text-sm" htmlFor="login-password">
            <span className="text-slate-200">Password</span>
            <input
              id="login-password"
              required
              type="password"
              name="password"
              autoComplete="current-password"
              value={loginForm.password}
              onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none focus:border-emerald-400/40"
            />
          </label>
        </div>
      ) : mode === 'customer' ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <input type="hidden" name="role" value="customer" />
          <label className="space-y-2 text-sm sm:col-span-2" htmlFor="customer-email">
            <span className="text-slate-200">Email</span>
            <input
              id="customer-email"
              required
              type="email"
              name="email"
              autoComplete="email"
              value={customerForm.email}
              onChange={(event) => setCustomerForm((prev) => ({ ...prev, email: event.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none focus:border-emerald-400/40"
            />
          </label>
          <label className="space-y-2 text-sm" htmlFor="customer-full-name">
            <span className="text-slate-200">Full name</span>
            <input
              id="customer-full-name"
              required
              type="text"
              name="fullName"
              autoComplete="name"
              value={customerForm.fullName}
              onChange={(event) => setCustomerForm((prev) => ({ ...prev, fullName: event.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none focus:border-emerald-400/40"
            />
          </label>
          <label className="space-y-2 text-sm" htmlFor="customer-phone">
            <span className="text-slate-200">Phone</span>
            <input
              id="customer-phone"
              required
              type="tel"
              name="phone"
              autoComplete="tel"
              value={customerForm.phone}
              onChange={(event) => setCustomerForm((prev) => ({ ...prev, phone: event.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none focus:border-emerald-400/40"
            />
          </label>
          <label className="space-y-2 text-sm" htmlFor="customer-address">
            <span className="text-slate-200">Address</span>
            <input
              id="customer-address"
              type="text"
              name="address"
              autoComplete="street-address"
              value={customerForm.address}
              onChange={(event) => setCustomerForm((prev) => ({ ...prev, address: event.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none focus:border-emerald-400/40"
            />
          </label>
          <label className="space-y-2 text-sm" htmlFor="customer-password">
            <span className="text-slate-200">Password</span>
            <input
              id="customer-password"
              required
              type="password"
              name="password"
              autoComplete="new-password"
              value={customerForm.password}
              onChange={(event) => setCustomerForm((prev) => ({ ...prev, password: event.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none focus:border-emerald-400/40"
            />
          </label>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <input type="hidden" name="role" value="driver" />
          <label className="space-y-2 text-sm sm:col-span-2" htmlFor="driver-email">
            <span className="text-slate-200">Email</span>
            <input
              id="driver-email"
              required
              type="email"
              name="email"
              autoComplete="email"
              value={driverForm.email}
              onChange={(event) => setDriverForm((prev) => ({ ...prev, email: event.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none focus:border-emerald-400/40"
            />
          </label>
          <label className="space-y-2 text-sm" htmlFor="driver-name">
            <span className="text-slate-200">Driver name</span>
            <input
              id="driver-name"
              required
              type="text"
              name="driverName"
              autoComplete="name"
              value={driverForm.driverName}
              onChange={(event) => setDriverForm((prev) => ({ ...prev, driverName: event.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none focus:border-emerald-400/40"
            />
          </label>
          <label className="space-y-2 text-sm" htmlFor="driver-phone">
            <span className="text-slate-200">Phone</span>
            <input
              id="driver-phone"
              required
              type="tel"
              name="phone"
              autoComplete="tel"
              value={driverForm.phone}
              onChange={(event) => setDriverForm((prev) => ({ ...prev, phone: event.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none focus:border-emerald-400/40"
            />
          </label>
          <label className="space-y-2 text-sm" htmlFor="driver-plate">
            <span className="text-slate-200">Plate number</span>
            <input
              id="driver-plate"
              required
              type="text"
              name="plateNumber"
              value={driverForm.plateNumber}
              onChange={(event) => setDriverForm((prev) => ({ ...prev, plateNumber: event.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none focus:border-emerald-400/40"
            />
          </label>
          <label className="space-y-2 text-sm" htmlFor="driver-service-area">
            <span className="text-slate-200">Service area</span>
            <input
              id="driver-service-area"
              required
              type="text"
              name="serviceArea"
              value={driverForm.serviceArea}
              onChange={(event) => setDriverForm((prev) => ({ ...prev, serviceArea: event.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none focus:border-emerald-400/40"
            />
          </label>
          <label className="space-y-2 text-sm" htmlFor="driver-vehicle-type">
            <span className="text-slate-200">Vehicle type</span>
            <select
              id="driver-vehicle-type"
              name="vehicleType"
              value={driverForm.vehicleType}
              onChange={(event) => setDriverForm((prev) => ({ ...prev, vehicleType: event.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none focus:border-emerald-400/40"
            >
              <option value="4-seat vehicle">4-seat vehicle</option>
              <option value="7-seat vehicle">7-seat vehicle</option>
            </select>
          </label>
          <label className="space-y-2 text-sm" htmlFor="driver-seat-count">
            <span className="text-slate-200">Seats</span>
            <select
              id="driver-seat-count"
              name="seatCount"
              value={driverForm.seatCount}
              onChange={(event) => setDriverForm((prev) => ({ ...prev, seatCount: event.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none focus:border-emerald-400/40"
            >
              <option value="4">4</option>
              <option value="7">7</option>
            </select>
          </label>
          <label className="space-y-2 text-sm" htmlFor="driver-vehicle-photo">
            <span className="text-slate-200">Vehicle image URL</span>
            <input
              id="driver-vehicle-photo"
              type="text"
              name="vehiclePhoto"
              value={driverForm.vehiclePhoto}
              onChange={(event) => setDriverForm((prev) => ({ ...prev, vehiclePhoto: event.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none focus:border-emerald-400/40"
            />
          </label>
          <label className="space-y-2 text-sm" htmlFor="driver-photo">
            <span className="text-slate-200">Driver image URL</span>
            <input
              id="driver-photo"
              type="text"
              name="driverPhoto"
              value={driverForm.driverPhoto}
              onChange={(event) => setDriverForm((prev) => ({ ...prev, driverPhoto: event.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none focus:border-emerald-400/40"
            />
          </label>
          <label className="space-y-2 text-sm" htmlFor="driver-password">
            <span className="text-slate-200">Password</span>
            <input
              id="driver-password"
              required
              type="password"
              name="password"
              autoComplete="new-password"
              value={driverForm.password}
              onChange={(event) => setDriverForm((prev) => ({ ...prev, password: event.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none focus:border-emerald-400/40"
            />
          </label>
          <label className="space-y-2 text-sm sm:col-span-2" htmlFor="driver-description">
            <span className="text-slate-200">Description</span>
            <textarea
              id="driver-description"
              rows={3}
              name="description"
              value={driverForm.description}
              onChange={(event) => setDriverForm((prev) => ({ ...prev, description: event.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none focus:border-emerald-400/40"
            />
          </label>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-2xl bg-emerald-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? 'Submitting...' : mode === 'login' ? 'Login' : 'Create account'}
      </button>

      {message ? <p className="text-sm text-slate-300">{message}</p> : null}
    </form>
  );
}
