import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { getSupabaseServer } from '@/lib/supabaseServer';

export type OrganizerRole = 'admin' | 'finance' | 'checkin' | 'marketing';

type AuthorizedOrganizer = {
  email: string;
  role: OrganizerRole;
};

export type OrganizerAuthResult =
  | { authorized: true; organizer: AuthorizedOrganizer }
  | { authorized: false; response: NextResponse };

export async function requireOrganizerRole(allowedRoles: OrganizerRole[]): Promise<OrganizerAuthResult> {
  const supabase = await getSupabaseServer();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user?.email) {
    return {
      authorized: false,
      response: NextResponse.json({ error: 'Organizer login required.' }, { status: 401 })
    };
  }

  const role = await getOrganizerRole(user.email, allowedRoles);

  if (!role) {
    return {
      authorized: false,
      response: NextResponse.json({ error: 'You do not have access to this organizer area.' }, { status: 403 })
    };
  }

  return {
    authorized: true,
    organizer: {
      email: user.email,
      role
    }
  };
}

export async function getOrganizerRole(email: string, allowedRoles: OrganizerRole[]) {
  const normalizedEmail = email.trim().toLowerCase();
  const acceptedRoles = ['admin', ...allowedRoles];
  const supabase = getSupabaseAdmin();

  const primary = await supabase
    .from('user_role')
    .select('role')
    .eq('email', normalizedEmail)
    .in('role', acceptedRoles)
    .limit(1)
    .maybeSingle();

  if (primary.data?.role) {
    return primary.data.role as OrganizerRole;
  }

  if (primary.error && primary.error.message.includes('user_role')) {
    const fallback = await supabase
      .from('user_roles')
      .select('role')
      .eq('email', normalizedEmail)
      .in('role', acceptedRoles)
      .limit(1)
      .maybeSingle();

    if (fallback.data?.role) {
      return fallback.data.role as OrganizerRole;
    }
  }

  return null;
}
