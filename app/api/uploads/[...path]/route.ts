import { NextResponse } from 'next/server';
import { serveUploadedImage } from '@/lib/uploads';

export const runtime = 'nodejs';

export async function GET(_: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const storageKey = path.join('/');
  const file = await serveUploadedImage(storageKey);

  if (!file) {
    return NextResponse.json({ error: 'Image not found' }, { status: 404 });
  }

  return new NextResponse(file.body, {
    headers: {
      'Content-Type': file.contentType,
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  });
}
