'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { estimateFare, getVehicleMultiplier } from '@/lib/business/fare';
import { BookingSnapshot } from '@/lib/types';

type DriverOption = {
  id: string;
  driverName: string;
  phone: string;
  vehicleType: string;
  plateNumber: string;
  seatCount: number;
  availableSeats: number;
  serviceArea: string;
  vehiclePhoto?: string | null;
  driverPhoto?: string | null;
  description?: string | null;
  rating?: number;
};

const initial = {
  pickupLocation: '',
  dropoffLocation: '',
  bookingTime: '',
  notes: '',
  driverId: '',
  passengerCount: '1',
  estimatedDistanceKm: '',
  fareBase: '90000',
  farePerKm: '15000'
};

function parsePositiveNumber(value: string) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : null;
}

export function BookingForm({
  customer,
  selectedDriverId,
  drivers
}: {
  customer: BookingSnapshot | null;
  selectedDriverId?: string | null;
  drivers: DriverOption[];
}) {
  const [form, setForm] = useState({ ...initial, driverId: selectedDriverId ?? '' });
  const [message, setMessage] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setForm((prev) => ({ ...prev, driverId: selectedDriverId ?? prev.driverId }));
  }, [selectedDriverId]);

  const update = (key: keyof typeof initial, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const selectedDriver = drivers.find((driver) => driver.id === form.driverId);
  const passengerCount = Math.max(1, Math.min(7, Math.floor(parsePositiveNumber(form.passengerCount) ?? 1)));
  const eligibleDrivers = drivers.filter((driver) => driver.availableSeats >= passengerCount);
  const eligibleSelectedDriver = selectedDriver && selectedDriver.availableSeats >= passengerCount ? selectedDriver : null;
  const effectiveDriver = eligibleSelectedDriver ?? eligibleDrivers[0] ?? null;
  const vehicleType = effectiveDriver?.vehicleType ?? '4-seat vehicle';
  const vehicleMultiplier = getVehicleMultiplier(vehicleType);
  const estimatedDistanceKm = parsePositiveNumber(form.estimatedDistanceKm);
  const fareBase = parsePositiveNumber(form.fareBase);
  const farePerKm = parsePositiveNumber(form.farePerKm);
  const estimatedPrice =
    estimatedDistanceKm !== null && fareBase !== null && farePerKm !== null
      ? estimateFare({
          distanceKm: estimatedDistanceKm,
          baseFare: fareBase,
          pricePerKm: farePerKm,
          vehicleType
        })
      : null;

  useEffect(() => {
    setForm((prev) => {
      if (!prev.driverId) {
        return prev;
      }

      const currentDriver = drivers.find((driver) => driver.id === prev.driverId);
      if (currentDriver && currentDriver.availableSeats >= passengerCount) {
        return prev;
      }

      return {
        ...prev,
        driverId: eligibleDrivers[0]?.id ?? ''
      };
    });
  }, [drivers, eligibleDrivers, passengerCount]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    setBookingId(null);

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          passengerCount,
          estimatedDistanceKm: estimatedDistanceKm ?? 0,
          fareBase: fareBase ?? 0,
          farePerKm: farePerKm ?? 0
        })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? 'Unable to create booking');
      }

      const payload = await response.json().catch(() => null);
      setBookingId(payload?.booking?.id ?? null);
      setMessage('Booking submitted. The driver can now accept or reject it.');
      setForm({ ...initial, driverId: selectedDriverId ?? '', passengerCount: '1' });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass space-y-4 rounded-[1.75rem] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-lg font-semibold text-white">New booking</p>
          <p className="text-sm text-slate-400">Customer details load from your account automatically.</p>
        </div>
        {customer ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-right text-xs text-slate-300">
            <p className="font-semibold text-white">{customer.name}</p>
            <p>{customer.phone}</p>
          </div>
        ) : null}
      </div>

      {!customer ? (
        <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
          Please sign in as a customer before booking a ride.
          <div className="mt-3">
            <Link href="/auth" className="inline-flex rounded-2xl bg-amber-300 px-4 py-2 font-semibold text-slate-950">
              Go to login
            </Link>
          </div>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-2 text-sm sm:col-span-2">
          <span className="text-slate-200">Driver / Vehicle</span>
          <select
            value={form.driverId}
            onChange={(event) => update('driverId', event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none ring-0 focus:border-emerald-400/40"
          >
            <option value="">Any available driver</option>
            {eligibleDrivers.map((driver) => (
              <option key={driver.id} value={driver.id}>
                {driver.driverName} - {driver.vehicleType} - {driver.plateNumber} - {driver.availableSeats} seats left
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-400">
            {eligibleDrivers.length > 0
              ? `${eligibleDrivers.length} vehicle${eligibleDrivers.length === 1 ? '' : 's'} can handle ${passengerCount} seat${passengerCount === 1 ? '' : 's'}.`
              : `No available vehicles can handle ${passengerCount} seats right now.`}
          </p>
        </label>
        <label className="space-y-2 text-sm">
          <span className="text-slate-200">Seats / passengers</span>
          <input
            required
            type="number"
            min="1"
            max="7"
            step="1"
            value={form.passengerCount}
            onChange={(event) => update('passengerCount', event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none ring-0 placeholder:text-slate-500 focus:border-emerald-400/40"
          />
        </label>
        <label className="space-y-2 text-sm">
          <span className="text-slate-200">Pickup location</span>
          <input
            required
            value={form.pickupLocation}
            onChange={(event) => update('pickupLocation', event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none ring-0 placeholder:text-slate-500 focus:border-emerald-400/40"
          />
        </label>
        <label className="space-y-2 text-sm">
          <span className="text-slate-200">Destination</span>
          <input
            required
            value={form.dropoffLocation}
            onChange={(event) => update('dropoffLocation', event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none ring-0 placeholder:text-slate-500 focus:border-emerald-400/40"
          />
        </label>
        <label className="space-y-2 text-sm">
          <span className="text-slate-200">Distance (km)</span>
          <input
            required
            type="number"
            min="0.1"
            step="0.1"
            value={form.estimatedDistanceKm}
            onChange={(event) => update('estimatedDistanceKm', event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none ring-0 placeholder:text-slate-500 focus:border-emerald-400/40"
          />
        </label>
        <label className="space-y-2 text-sm">
          <span className="text-slate-200">Base fare</span>
          <input
            required
            type="number"
            min="0"
            step="1000"
            value={form.fareBase}
            onChange={(event) => update('fareBase', event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none ring-0 placeholder:text-slate-500 focus:border-emerald-400/40"
          />
        </label>
        <label className="space-y-2 text-sm">
          <span className="text-slate-200">Price per km</span>
          <input
            required
            type="number"
            min="0"
            step="1000"
            value={form.farePerKm}
            onChange={(event) => update('farePerKm', event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none ring-0 placeholder:text-slate-500 focus:border-emerald-400/40"
          />
        </label>
        <label className="space-y-2 text-sm sm:col-span-2">
          <span className="text-slate-200">Travel date and time</span>
          <input
            required
            type="datetime-local"
            value={form.bookingTime}
            onChange={(event) => update('bookingTime', event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none ring-0 focus:border-emerald-400/40"
          />
        </label>
        <label className="space-y-2 text-sm sm:col-span-2">
          <span className="text-slate-200">Notes</span>
          <textarea
            rows={4}
            value={form.notes}
            onChange={(event) => update('notes', event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none ring-0 placeholder:text-slate-500 focus:border-emerald-400/40"
          />
        </label>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-sm uppercase tracking-[0.2em] text-emerald-300">Fare estimate</p>
        <div className="mt-3 grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
          <p>
            <strong className="text-white">Vehicle type:</strong> {vehicleType}
          </p>
          <p>
            <strong className="text-white">Multiplier:</strong> {vehicleMultiplier.toFixed(2)}x
          </p>
          <p>
            <strong className="text-white">Distance:</strong> {estimatedDistanceKm ?? 'N/A'} km
          </p>
          <p>
            <strong className="text-white">Seats:</strong> {passengerCount}
          </p>
          <p>
            <strong className="text-white">Estimated fare:</strong> {estimatedPrice ? `${estimatedPrice.toLocaleString()} VND` : 'Enter fare inputs'}
          </p>
          {eligibleSelectedDriver ? (
            <p className="sm:col-span-2 text-emerald-200">
              Selected vehicle has {eligibleSelectedDriver.availableSeats} seats remaining.
            </p>
          ) : form.driverId ? (
            <p className="sm:col-span-2 text-amber-200">
              Selected vehicle does not have enough seats for this booking.
            </p>
          ) : null}
        </div>
      </div>

      <button
        type="submit"
        disabled={
          isSubmitting ||
          !customer ||
          estimatedPrice === null ||
          eligibleDrivers.length === 0 ||
          (form.driverId ? !eligibleSelectedDriver : false)
        }
        className="w-full rounded-2xl bg-emerald-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? 'Submitting...' : 'Book now'}
      </button>
      {message ? <p className="text-sm text-slate-300">{message}</p> : null}
      {bookingId ? (
        <Link href={`/customer/my-trips/${bookingId}`} className="inline-flex text-sm font-semibold text-emerald-300">
          View booking details
        </Link>
      ) : null}
    </form>
  );
}
