import { existsSync, mkdirSync, promises as fsPromises } from 'fs';
import { dirname, join } from 'path';
import { randomUUID } from 'crypto';
import { getCloudflareContext } from '@opennextjs/cloudflare';

const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp'
};

export type ImageUploadKind = 'driver' | 'vehicle';

async function getCloudflareBucket() {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return env.R2_MEDIA ?? env.MEDIA_BUCKET ?? env.R2_BUCKET ?? null;
  } catch {
    return null;
  }
}

export function validateImageFile(file: File) {
  if (!ALLOWED_TYPES.has(file.type)) {
    return 'Only JPG, JPEG, PNG, and WEBP images are allowed.';
  }

  if (file.size > MAX_UPLOAD_SIZE) {
    return 'Image must be 5 MB or smaller.';
  }

  return null;
}

async function writeLocalFile(storagePath: string, buffer: Buffer) {
  const absolutePath = join(process.cwd(), 'public', 'uploads', storagePath);
  mkdirSync(dirname(absolutePath), { recursive: true });
  await fsPromises.writeFile(absolutePath, buffer);
  return `/api/uploads/${storagePath.replaceAll('\\', '/')}`;
}

function bufferToDataUrl(file: File, buffer: Buffer) {
  return `data:${file.type};base64,${buffer.toString('base64')}`;
}

export async function uploadImageFile(file: File, kind: ImageUploadKind) {
  const validationError = validateImageFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const extension = EXTENSIONS[file.type] ?? 'bin';
  const storageKey = `${kind}/${randomUUID()}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const bucket = await getCloudflareBucket();

  if (bucket) {
    await bucket.put(storageKey, buffer, {
      httpMetadata: {
        contentType: file.type
      }
    });
    return { url: `/api/uploads/${storageKey}`, storageKey, storage: 'r2' as const };
  }

  try {
    const url = await writeLocalFile(storageKey, buffer);
    return { url, storageKey, storage: 'local' as const };
  } catch {
    return { url: bufferToDataUrl(file, buffer), storageKey, storage: 'inline' as const };
  }
}

export async function serveUploadedImage(storageKey: string) {
  const bucket = await getCloudflareBucket();
  if (bucket) {
    const object = await bucket.get(storageKey);
    if (!object) {
      return null;
    }

    return {
      body: await object.arrayBuffer(),
      contentType: object.httpMetadata?.contentType ?? 'application/octet-stream'
    };
  }

  const absolutePath = join(process.cwd(), 'public', 'uploads', storageKey);
  if (!existsSync(absolutePath)) {
    return null;
  }

  const body = await fsPromises.readFile(absolutePath);
  const contentType =
    storageKey.endsWith('.jpg') || storageKey.endsWith('.jpeg')
      ? 'image/jpeg'
      : storageKey.endsWith('.png')
        ? 'image/png'
        : 'image/webp';

  return { body, contentType };
}
