'use client';

import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DriverProfileRecord } from '@/lib/types';

type DriverRow = DriverProfileRecord & {
  pendingVehicleUrl: string;
  pendingDriverUrl: string;
};

function statusClass(status: DriverProfileRecord['approvalStatus']) {
  switch (status) {
    case 'approved':
      return 'bg-emerald-400/10 text-emerald-200';
    case 'rejected':
      return 'bg-rose-400/10 text-rose-200';
    default:
      return 'bg-amber-400/10 text-amber-100';
  }
}

function statusLabel(status: DriverProfileRecord['approvalStatus']) {
  return status === 'pending' ? 'Pending' : status === 'approved' ? 'Approved' : 'Rejected';
}

function actionLabel(action: 'approve' | 'reject' | 'activate' | 'deactivate' | 'archive') {
  switch (action) {
    case 'approve':
      return 'approved';
    case 'reject':
      return 'rejected';
    case 'activate':
      return 'activated';
    case 'deactivate':
      return 'deactivated';
    case 'archive':
      return 'archived';
  }
}

function activeClass(active: boolean) {
  return active ? 'bg-cyan-400/10 text-cyan-100' : 'bg-slate-200/10 text-slate-300';
}

function previewLabel(url: string, fallback: string) {
  return url || fallback;
}

export function AdminDriverManagement({ drivers }: { drivers: DriverProfileRecord[] }) {
  const router = useRouter();
  const [rows, setRows] = useState<DriverRow[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    setRows(
      drivers.map((driver) => ({
        ...driver,
        pendingVehicleUrl: '',
        pendingDriverUrl: ''
      }))
    );
  }, [drivers]);

  const stats = useMemo(
    () => ({
      total: rows.length,
      pending: rows.filter((row) => row.approvalStatus === 'pending').length,
      approved: rows.filter((row) => row.approvalStatus === 'approved').length,
      rejected: rows.filter((row) => row.approvalStatus === 'rejected').length
    }),
    [rows]
  );

  async function uploadImage(file: File, kind: 'driver' | 'vehicle') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('kind', kind);
    const response = await fetch('/api/uploads', { method: 'POST', body: formData });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(data?.error ?? 'Upload failed');
    }
    return String(data.url ?? '');
  }

  async function updateRow(id: string, patch: Partial<DriverProfileRecord>) {
    setBusyId(id);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/drivers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', ...patch })
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error ?? 'Unable to update driver');
      }
      setRows((current) =>
        current.map((row) => (row.userId === id ? { ...row, ...data.driver, pendingVehicleUrl: '', pendingDriverUrl: '' } : row))
      );
      router.refresh();
      setMessage('Driver updated.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to update driver');
    } finally {
      setBusyId(null);
    }
  }

  async function performAction(
    id: string,
    action: 'approve' | 'reject' | 'activate' | 'deactivate' | 'archive',
    rejectedReason?: string
  ) {
    setBusyId(id);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/drivers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, rejectedReason })
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error ?? 'Unable to update driver');
      }
      setRows((current) =>
        current.map((row) => (row.userId === id ? { ...row, ...data.driver, pendingVehicleUrl: '', pendingDriverUrl: '' } : row))
      );
      router.refresh();
      setMessage(`Driver ${actionLabel(action)}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Action failed');
    } finally {
      setBusyId(null);
    }
  }

  function updateLocalRow(id: string, patch: Partial<DriverRow>) {
    setRows((current) => current.map((row) => (row.userId === id ? { ...row, ...patch } : row)));
  }

  function handleFileChange(id: string, kind: 'driver' | 'vehicle', event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const existing = rows.find((row) => row.userId === id);
    const previewUrl = URL.createObjectURL(file);
    updateLocalRow(id, kind === 'driver' ? { pendingDriverUrl: previewUrl } : { pendingVehicleUrl: previewUrl });
    void (async () => {
      try {
        const url = await uploadImage(file, kind);
        updateLocalRow(id, kind === 'driver' ? { driverPhoto: url } : { vehiclePhoto: url });
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Upload failed');
        updateLocalRow(
          id,
          kind === 'driver'
            ? { pendingDriverUrl: existing?.driverPhoto ?? '' }
            : { pendingVehicleUrl: existing?.vehiclePhoto ?? '' }
        );
      } finally {
        URL.revokeObjectURL(previewUrl);
      }
    })();
    event.target.value = '';
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-slate-400">Total drivers</p>
          <p className="mt-2 text-3xl font-black text-white">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-slate-400">Pending</p>
          <p className="mt-2 text-3xl font-black text-amber-200">{stats.pending}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-slate-400">Approved</p>
          <p className="mt-2 text-3xl font-black text-emerald-200">{stats.approved}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-slate-400">Rejected</p>
          <p className="mt-2 text-3xl font-black text-rose-200">{stats.rejected}</p>
        </div>
      </div>

      {message ? <p className="text-sm text-slate-300">{message}</p> : null}

      <div className="grid gap-4 xl:grid-cols-2">
        {rows.map((driver) => (
          <article key={driver.userId} className="glass rounded-[1.75rem] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-white">{driver.driverName}</h3>
                <p className="text-sm text-slate-400">{driver.phone}</p>
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(driver.approvalStatus)}`}>
                  {statusLabel(driver.approvalStatus)}
                </span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${activeClass(driver.active)}`}>
                  {driver.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr]">
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                {previewLabel(driver.pendingDriverUrl, driver.driverPhoto ?? '') ? (
                  <img
                    src={driver.pendingDriverUrl || driver.driverPhoto || ''}
                    alt={`${driver.driverName} photo`}
                    className="h-40 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-40 items-center justify-center text-sm text-slate-400">No driver image</div>
                )}
              </div>
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                {previewLabel(driver.pendingVehicleUrl, driver.vehiclePhoto ?? '') ? (
                  <img
                    src={driver.pendingVehicleUrl || driver.vehiclePhoto || ''}
                    alt={`${driver.vehicleType} photo`}
                    className="h-40 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-40 items-center justify-center text-sm text-slate-400">No vehicle image</div>
                )}
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="space-y-2 text-sm">
                <span className="text-slate-200">Driver name</span>
                <input
                  value={driver.driverName}
                  onChange={(event) => updateLocalRow(driver.userId, { driverName: event.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none"
                />
              </label>
              <label className="space-y-2 text-sm">
                <span className="text-slate-200">Phone</span>
                <input
                  value={driver.phone}
                  onChange={(event) => updateLocalRow(driver.userId, { phone: event.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none"
                />
              </label>
              <label className="space-y-2 text-sm">
                <span className="text-slate-200">Vehicle type</span>
                <select
                  value={driver.vehicleType}
                  onChange={(event) =>
                    updateLocalRow(driver.userId, {
                      vehicleType: event.target.value as DriverProfileRecord['vehicleType']
                    })
                  }
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none"
                >
                  <option value="4-seat vehicle">4-seat vehicle</option>
                  <option value="7-seat vehicle">7-seat vehicle</option>
                </select>
              </label>
              <label className="space-y-2 text-sm">
                <span className="text-slate-200">Plate number</span>
                <input
                  value={driver.plateNumber}
                  onChange={(event) => updateLocalRow(driver.userId, { plateNumber: event.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none"
                />
              </label>
              <label className="space-y-2 text-sm">
                <span className="text-slate-200">Seat count</span>
                <select
                  value={String(driver.seatCount)}
                  onChange={(event) =>
                    updateLocalRow(driver.userId, { seatCount: Number(event.target.value) as 4 | 7 })
                  }
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none"
                >
                  <option value="4">4</option>
                  <option value="7">7</option>
                </select>
              </label>
              <label className="space-y-2 text-sm">
                <span className="text-slate-200">Service area</span>
                <input
                  value={driver.serviceArea}
                  onChange={(event) => updateLocalRow(driver.userId, { serviceArea: event.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none"
                />
              </label>
              <label className="space-y-2 text-sm sm:col-span-2">
                <span className="text-slate-200">Rejected reason</span>
                <input
                  value={driver.rejectedReason ?? ''}
                  onChange={(event) => updateLocalRow(driver.userId, { rejectedReason: event.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none"
                />
              </label>
              <label className="space-y-2 text-sm sm:col-span-2">
                <span className="text-slate-200">Vehicle photo URL</span>
                <input
                  value={driver.vehiclePhoto ?? ''}
                  onChange={(event) => updateLocalRow(driver.userId, { vehiclePhoto: event.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none"
                />
              </label>
              <label className="space-y-2 text-sm sm:col-span-2">
                <span className="text-slate-200">Driver photo URL</span>
                <input
                  value={driver.driverPhoto ?? ''}
                  onChange={(event) => updateLocalRow(driver.userId, { driverPhoto: event.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none"
                />
              </label>
              <label className="space-y-2 text-sm sm:col-span-2">
                <span className="text-slate-200">Description</span>
                <textarea
                  rows={3}
                  value={driver.description ?? ''}
                  onChange={(event) => updateLocalRow(driver.userId, { description: event.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none"
                />
              </label>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="space-y-2 text-sm">
                <span className="text-slate-200">Upload vehicle photo</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => handleFileChange(driver.userId, 'vehicle', event)}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-slate-300 file:mr-4 file:rounded-xl file:border-0 file:bg-emerald-400 file:px-4 file:py-2 file:font-semibold file:text-slate-950"
                />
              </label>
              <label className="space-y-2 text-sm">
                <span className="text-slate-200">Upload driver photo</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => handleFileChange(driver.userId, 'driver', event)}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-slate-300 file:mr-4 file:rounded-xl file:border-0 file:bg-cyan-400 file:px-4 file:py-2 file:font-semibold file:text-slate-950"
                />
              </label>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busyId === driver.userId}
                onClick={() =>
                  updateRow(driver.userId, {
                    driverName: driver.driverName,
                    phone: driver.phone,
                    vehicleType: driver.vehicleType,
                    plateNumber: driver.plateNumber,
                    seatCount: driver.seatCount,
                    serviceArea: driver.serviceArea,
                    vehiclePhoto: driver.vehiclePhoto ?? null,
                    driverPhoto: driver.driverPhoto ?? null,
                    description: driver.description ?? null,
                    active: driver.active,
                    approvalStatus: driver.approvalStatus,
                    rejectedReason: driver.rejectedReason ?? null
                  })
                }
                className="rounded-2xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60"
              >
                {busyId === driver.userId ? 'Saving...' : 'Save changes'}
              </button>
              <button
                type="button"
                disabled={busyId === driver.userId}
                onClick={() => performAction(driver.userId, 'approve')}
                className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-100 disabled:opacity-60"
              >
                Approve
              </button>
              <button
                type="button"
                disabled={busyId === driver.userId}
                onClick={() => performAction(driver.userId, 'reject', driver.rejectedReason ?? 'Rejected by admin')}
                className="rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-2 text-sm font-medium text-rose-100 disabled:opacity-60"
              >
                Reject
              </button>
              <button
                type="button"
                disabled={busyId === driver.userId}
                onClick={() => performAction(driver.userId, driver.active ? 'deactivate' : 'activate')}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {driver.active ? 'Deactivate' : 'Activate'}
              </button>
              <button
                type="button"
                disabled={busyId === driver.userId}
                onClick={() => performAction(driver.userId, 'archive')}
                className="rounded-2xl border border-slate-400/30 bg-slate-400/10 px-4 py-2 text-sm font-medium text-slate-100 disabled:opacity-60"
              >
                Archive
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
