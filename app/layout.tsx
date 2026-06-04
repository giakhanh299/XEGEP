import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dai Loc Ride Share',
  description: 'Shared taxi booking platform for Dai Loc and Da Nang routes.',
  manifest: '/manifest.json'
};

export const viewport: Viewport = {
  themeColor: '#0f172a'
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
