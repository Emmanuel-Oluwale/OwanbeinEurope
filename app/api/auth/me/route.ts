import { NextResponse } from 'next/server';
import { getOrganizerRole, type OrganizerRole } from '@/lib/organizerAuth';
import { getSupabaseServer } from '@/lib/supabaseServer';

const roleGroups: Record<string, OrganizerRole[]> = {
  admin: ['admin'],
  finance: ['finance'],
  checkin: ['checkin'],
  organizer: ['finance', 'checkin', 'marketing']
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const area = url.searchParams.get('area') || 'organizer';
  const allowedRoles = roleGroups[area] || roleGroups.organizer;
  const supabase = await getSupabaseServer();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user?.email) {
    return NextResponse.json({ authenticated: false, authorized: false }, { status: 401 });
  }

  const role = await getOrganizerRole(user.email, allowedRoles);

  if (!role) {
    return NextResponse.json({ authenticated: true, authorized: false, email: user.email }, { status: 403 });
  }

  return NextResponse.json({ authenticated: true, authorized: true, email: user.email, role });
}
