import { NextResponse } from 'next/server';
import { uploadImageFile } from '@/lib/uploads';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const kind = String(formData.get('kind') ?? 'driver');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (kind !== 'driver' && kind !== 'vehicle') {
      return NextResponse.json({ error: 'Invalid upload kind' }, { status: 400 });
    }

    const result = await uploadImageFile(file, kind);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Upload failed' }, { status: 400 });
  }
}
