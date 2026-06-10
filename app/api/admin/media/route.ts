import { NextResponse } from 'next/server';
import { safeFilePart } from '@/lib/qrStorage';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { requireOrganizerRole } from '@/lib/organizerAuth';

const MEDIA_BUCKET = process.env.EVENT_MEDIA_BUCKET || process.env.QR_STORAGE_BUCKET || 'event-media';
const FOLDERS = new Set(['hero', 'flyers', 'sponsors', 'gallery', 'uploads']);
const MAX_FILE_SIZE = 25 * 1024 * 1024;

export async function GET() {
  const auth = await requireOrganizerRole(['admin']);
  if (!auth.authorized) return auth.response;

  const supabase = getSupabaseAdmin();
  const files = [];

  for (const folder of FOLDERS) {
    const { data, error } = await supabase.storage
      .from(MEDIA_BUCKET)
      .list(folder, { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });

    if (error) {
      return NextResponse.json({ error: `Could not list ${folder} media.` }, { status: 500 });
    }

    for (const item of data || []) {
      if (!item.name || item.name === '.emptyFolderPlaceholder') continue;
      const path = `${folder}/${item.name}`;
      const { data: publicData } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
      files.push({
        name: item.name,
        folder,
        path,
        publicUrl: publicData.publicUrl,
        size: item.metadata?.size || null,
        updatedAt: item.updated_at || item.created_at || null
      });
    }
  }

  return NextResponse.json({ bucket: MEDIA_BUCKET, files });
}

export async function POST(request: Request) {
  const auth = await requireOrganizerRole(['admin']);
  if (!auth.authorized) return auth.response;

  const formData = await request.formData();
  const file = formData.get('file');
  const rawFolder = String(formData.get('folder') || 'uploads');
  const folder = FOLDERS.has(rawFolder) ? rawFolder : 'uploads';

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Choose a file to upload.' }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'File is too large. Maximum upload size is 25 MB.' }, { status: 413 });
  }

  const extension = file.name.includes('.') ? file.name.split('.').pop() : '';
  const baseName = safeFilePart(file.name.replace(/\.[^.]+$/, '')) || 'media';
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
  const path = `${folder}/${timestamp}-${baseName}${extension ? `.${extension.toLowerCase()}` : ''}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, buffer, {
      contentType: file.type || 'application/octet-stream',
      upsert: false
    });

  if (error) {
    return NextResponse.json({ error: 'Could not upload media file.' }, { status: 500 });
  }

  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  return NextResponse.json({ ok: true, path, publicUrl: data.publicUrl });
}

export async function DELETE(request: Request) {
  const auth = await requireOrganizerRole(['admin']);
  if (!auth.authorized) return auth.response;

  const payload = await request.json() as { path?: string };
  const path = payload.path?.trim();
  const folder = path?.split('/')[0];

  if (!path || !folder || !FOLDERS.has(folder)) {
    return NextResponse.json({ error: 'Valid media path is required.' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage.from(MEDIA_BUCKET).remove([path]);

  if (error) {
    return NextResponse.json({ error: 'Could not delete media file.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
