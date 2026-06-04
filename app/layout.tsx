import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Xe Ghép Đại Lộc',
  description: 'Nền tảng đặt xe ghép cho các tuyến Đại Lộc và Đà Nẵng.',
  manifest: '/manifest.json'
};

export const viewport: Viewport = {
  themeColor: '#0f172a'
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
