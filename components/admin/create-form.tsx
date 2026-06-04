'use client';

import { FormEvent, useState } from 'react';

type Field = {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
};

export function AdminCreateForm({
  title,
  endpoint,
  fields
}: {
  title: string;
  endpoint: string;
  fields: Field[];
}) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    try {
      const formData = new FormData(event.currentTarget);
      const payload = Object.fromEntries(formData.entries());
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        throw new Error('Create failed');
      }
      event.currentTarget.reset();
      setMessage(`${title} saved`);
      window.location.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Request failed');
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass space-y-4 rounded-[1.75rem] p-5">
      <div>
        <p className="text-lg font-semibold text-white">{title}</p>
        <p className="text-sm text-slate-400">Create or refresh operational records.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map((field) => (
          <label key={field.name} className="space-y-2 text-sm">
            <span className="text-slate-200">{field.label}</span>
            <input
              name={field.name}
              type={field.type ?? 'text'}
              placeholder={field.placeholder}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none"
            />
          </label>
        ))}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-2xl bg-emerald-400 px-4 py-3 font-semibold text-slate-950 disabled:opacity-60"
      >
        {pending ? 'Saving...' : 'Save'}
      </button>
      {message ? <p className="text-sm text-slate-300">{message}</p> : null}
    </form>
  );
}
