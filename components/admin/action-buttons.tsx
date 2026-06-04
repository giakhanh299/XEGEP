'use client';

import { useState } from 'react';

type ActionButtonProps = {
  label: string;
  endpoint: string;
  payload: Record<string, unknown>;
};

async function sendPatch(endpoint: string, payload: Record<string, unknown>) {
  const response = await fetch(endpoint, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Yêu cầu thất bại');
  }
}

export function AdminActionButton({ label, endpoint, payload }: ActionButtonProps) {
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        try {
          await sendPatch(endpoint, payload);
          window.location.reload();
        } finally {
          setPending(false);
        }
      }}
      className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
    >
      {pending ? 'Đang lưu...' : label}
    </button>
  );
}
