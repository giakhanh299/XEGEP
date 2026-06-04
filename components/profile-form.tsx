'use client';

import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DriverProfileRecord, CustomerRecord } from '@/lib/types';

export function CustomerProfileForm({ customer }: { customer: CustomerRecord }) {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: customer.fullName,
    phone: customer.phone,
    address: customer.address ?? '',
    telegramChatId: customer.telegramChatId ?? ''
  });
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch('/api/customer/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const data = await response.json().catch(() => null);
    setMessage(response.ok ? 'Customer profile updated.' : data?.error ?? 'Unable to update profile');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
      <label className="space-y-2 text-sm sm:col-span-1">
        <span className="text-slate-200">Username</span>
        <input value={customer.username} readOnly className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-300" />
      </label>
      <label className="space-y-2 text-sm sm:col-span-1">
        <span className="text-slate-200">Full name</span>
        <input
          required
          value={form.fullName}
          onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
          className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none focus:border-emerald-400/40"
        />
      </label>
      <label className="space-y-2 text-sm sm:col-span-1">
        <span className="text-slate-200">Phone number</span>
        <input
          required
          value={form.phone}
          onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
          className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none focus:border-emerald-400/40"
        />
      </label>
      <label className="space-y-2 text-sm sm:col-span-2">
        <span className="text-slate-200">Address</span>
        <input
          value={form.address}
          onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
          className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none focus:border-emerald-400/40"
        />
      </label>
      <label className="space-y-2 text-sm sm:col-span-2">
        <span className="text-slate-200">Telegram chat ID</span>
        <input
          value={form.telegramChatId}
          onChange={(event) => setForm((prev) => ({ ...prev, telegramChatId: event.target.value }))}
          placeholder="Optional"
          className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none focus:border-emerald-400/40"
        />
      </label>
      <button type="submit" className="sm:col-span-2 rounded-2xl bg-emerald-400 px-4 py-3 font-semibold text-slate-950">
        Save changes
      </button>
      {message ? <p className="sm:col-span-2 text-sm text-slate-300">{message}</p> : null}
    </form>
  );
}

export function DriverProfileForm({ driver }: { driver: DriverProfileRecord }) {
  const router = useRouter();
  const [form, setForm] = useState({
    driverName: driver.driverName,
    phone: driver.phone,
    vehicleType: driver.vehicleType,
    plateNumber: driver.plateNumber,
    seatCount: String(driver.seatCount),
    availableSeats: String(driver.availableSeats),
    serviceArea: driver.serviceArea,
    telegramChatId: driver.telegramChatId ?? '',
    vehiclePhoto: driver.vehiclePhoto ?? '',
    driverPhoto: driver.driverPhoto ?? '',
    description: driver.description ?? ''
  });
  const [vehiclePreview, setVehiclePreview] = useState(driver.vehiclePhoto ?? '');
  const [driverPreview, setDriverPreview] = useState(driver.driverPhoto ?? '');
  const [uploading, setUploading] = useState<'vehicle' | 'driver' | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setVehiclePreview(form.vehiclePhoto || '');
  }, [form.vehiclePhoto]);

  useEffect(() => {
    setDriverPreview(form.driverPhoto || '');
  }, [form.driverPhoto]);

  async function uploadImage(kind: 'vehicle' | 'driver', file: File) {
    const previewUrl = URL.createObjectURL(file);
    if (kind === 'vehicle') {
      setVehiclePreview(previewUrl);
    } else {
      setDriverPreview(previewUrl);
    }

    setUploading(kind);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('kind', kind);

      const response = await fetch('/api/uploads', {
        method: 'POST',
        body: formData
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error ?? 'Upload failed');
      }

      const nextUrl = String(data.url ?? '');
      if (kind === 'vehicle') {
        setForm((prev) => ({ ...prev, vehiclePhoto: nextUrl }));
        setVehiclePreview(nextUrl);
      } else {
        setForm((prev) => ({ ...prev, driverPhoto: nextUrl }));
        setDriverPreview(nextUrl);
      }
      setMessage('Image uploaded successfully.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Upload failed');
      if (kind === 'vehicle') {
        setVehiclePreview(form.vehiclePhoto);
      } else {
        setDriverPreview(form.driverPhoto);
      }
    } finally {
      setUploading(null);
      URL.revokeObjectURL(previewUrl);
    }
  }

  function handleFileChange(kind: 'vehicle' | 'driver', event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    void uploadImage(kind, file);
    event.target.value = '';
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch('/api/driver/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const data = await response.json().catch(() => null);
    setMessage(response.ok ? 'Driver profile updated.' : data?.error ?? 'Unable to update profile');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
      <label className="space-y-2 text-sm sm:col-span-1">
        <span className="text-slate-200">Username</span>
        <input value={driver.username} readOnly className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-300" />
      </label>
      <label className="space-y-2 text-sm sm:col-span-1">
        <span className="text-slate-200">Driver name</span>
        <input
          required
          value={form.driverName}
          onChange={(event) => setForm((prev) => ({ ...prev, driverName: event.target.value }))}
          className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none focus:border-emerald-400/40"
        />
      </label>
      <label className="space-y-2 text-sm sm:col-span-1">
        <span className="text-slate-200">Phone number</span>
        <input
          required
          value={form.phone}
          onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
          className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none focus:border-emerald-400/40"
        />
      </label>
      <label className="space-y-2 text-sm sm:col-span-1">
        <span className="text-slate-200">Vehicle type</span>
        <select
          value={form.vehicleType}
          onChange={(event) => setForm((prev) => ({ ...prev, vehicleType: event.target.value as DriverProfileRecord['vehicleType'] }))}
          className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none focus:border-emerald-400/40"
        >
          <option value="4-seat vehicle">4-seat vehicle</option>
          <option value="7-seat vehicle">7-seat vehicle</option>
        </select>
      </label>
      <label className="space-y-2 text-sm sm:col-span-1">
        <span className="text-slate-200">Plate number</span>
        <input
          required
          value={form.plateNumber}
          onChange={(event) => setForm((prev) => ({ ...prev, plateNumber: event.target.value }))}
          className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none focus:border-emerald-400/40"
        />
      </label>
      <label className="space-y-2 text-sm sm:col-span-1">
        <span className="text-slate-200">Seat count</span>
        <select
          value={form.seatCount}
          onChange={(event) =>
            setForm((prev) => ({
              ...prev,
              seatCount: event.target.value,
              availableSeats: String(
                Math.min(Number(event.target.value) || 4, Number(prev.availableSeats) || Number(event.target.value) || 4)
              )
            }))
          }
          className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none focus:border-emerald-400/40"
        >
          <option value="4">4</option>
          <option value="7">7</option>
        </select>
      </label>
      <label className="space-y-2 text-sm sm:col-span-1">
        <span className="text-slate-200">Available seats</span>
        <select
          value={form.availableSeats}
          onChange={(event) => setForm((prev) => ({ ...prev, availableSeats: event.target.value }))}
          className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none focus:border-emerald-400/40"
        >
          {Array.from({ length: Number(form.seatCount) + 1 }, (_, index) => index).map((seatCount) => (
            <option key={seatCount} value={seatCount}>
              {seatCount}
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-2 text-sm sm:col-span-2">
        <span className="text-slate-200">Service area</span>
        <input
          required
          value={form.serviceArea}
          onChange={(event) => setForm((prev) => ({ ...prev, serviceArea: event.target.value }))}
          className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none focus:border-emerald-400/40"
        />
      </label>
      <label className="space-y-2 text-sm sm:col-span-2">
        <span className="text-slate-200">Telegram chat ID</span>
        <input
          value={form.telegramChatId}
          onChange={(event) => setForm((prev) => ({ ...prev, telegramChatId: event.target.value }))}
          placeholder="Optional"
          className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none focus:border-emerald-400/40"
        />
      </label>
      <label className="space-y-2 text-sm sm:col-span-2">
        <span className="text-slate-200">Vehicle photo URL</span>
        <input
          value={form.vehiclePhoto}
          onChange={(event) => setForm((prev) => ({ ...prev, vehiclePhoto: event.target.value }))}
          className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none focus:border-emerald-400/40"
        />
      </label>
      <div className="sm:col-span-2 grid gap-3 sm:grid-cols-2">
        <label className="space-y-2 text-sm">
          <span className="text-slate-200">Upload vehicle photo</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => handleFileChange('vehicle', event)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-slate-300 file:mr-4 file:rounded-xl file:border-0 file:bg-emerald-400 file:px-4 file:py-2 file:font-semibold file:text-slate-950"
          />
          <p className="text-xs text-slate-400">JPG, PNG, or WEBP up to 5 MB.</p>
        </label>
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          {vehiclePreview ? (
            <img src={vehiclePreview} alt="Vehicle preview" className="h-40 w-full object-cover" />
          ) : (
            <div className="flex h-40 items-center justify-center text-sm text-slate-400">No vehicle image</div>
          )}
        </div>
      </div>
      <label className="space-y-2 text-sm sm:col-span-2">
        <span className="text-slate-200">Driver photo URL</span>
        <input
          value={form.driverPhoto}
          onChange={(event) => setForm((prev) => ({ ...prev, driverPhoto: event.target.value }))}
          className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none focus:border-emerald-400/40"
        />
      </label>
      <div className="sm:col-span-2 grid gap-3 sm:grid-cols-2">
        <label className="space-y-2 text-sm">
          <span className="text-slate-200">Upload driver photo</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => handleFileChange('driver', event)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-slate-300 file:mr-4 file:rounded-xl file:border-0 file:bg-cyan-400 file:px-4 file:py-2 file:font-semibold file:text-slate-950"
          />
          <p className="text-xs text-slate-400">JPG, PNG, or WEBP up to 5 MB.</p>
        </label>
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          {driverPreview ? (
            <img src={driverPreview} alt="Driver preview" className="h-40 w-full object-cover" />
          ) : (
            <div className="flex h-40 items-center justify-center text-sm text-slate-400">No driver image</div>
          )}
        </div>
      </div>
      <label className="space-y-2 text-sm sm:col-span-2">
        <span className="text-slate-200">Description</span>
        <textarea
          rows={4}
          value={form.description}
          onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
          className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none focus:border-emerald-400/40"
        />
      </label>
      <button type="submit" className="sm:col-span-2 rounded-2xl bg-emerald-400 px-4 py-3 font-semibold text-slate-950">
        Save changes
      </button>
      {uploading ? <p className="sm:col-span-2 text-sm text-slate-400">Uploading {uploading} image...</p> : null}
      {message ? <p className="sm:col-span-2 text-sm text-slate-300">{message}</p> : null}
    </form>
  );
}
