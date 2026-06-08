import { getSupabaseAdmin } from './supabaseAdmin';

const QR_BUCKET = process.env.QR_STORAGE_BUCKET || 'event-media';

export async function uploadQrDataUrl(dataUrl: string | null, path: string) {
  if (!dataUrl) return null;

  const match = dataUrl.match(/^data:image\/png;base64,(.+)$/);
  if (!match) return null;

  const supabase = getSupabaseAdmin();
  const buffer = Buffer.from(match[1], 'base64');

  const { error } = await supabase.storage
    .from(QR_BUCKET)
    .upload(path, buffer, {
      contentType: 'image/png',
      upsert: true
    });

  if (error) {
    console.error('QR upload failed', error);
    return null;
  }

  const { data } = supabase.storage.from(QR_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export function safeFilePart(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
