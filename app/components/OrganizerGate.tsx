'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowser } from '@/lib/supabaseBrowser';

type OrganizerGateProps = {
  area: 'admin' | 'finance' | 'checkin';
  nextPath?: string;
  children: React.ReactNode;
};

export function OrganizerGate({ area, nextPath, children }: OrganizerGateProps) {
  const router = useRouter();
  const [status, setStatus] = useState<'checking' | 'authorized' | 'blocked'>('checking');
  const [message, setMessage] = useState('Checking organizer access...');

  useEffect(() => {
    async function checkAccess() {
      const response = await fetch(`/api/auth/me?area=${area}`);

      if (response.status === 401) {
        router.replace(`/login?next=${encodeURIComponent(nextPath || `/${area}`)}`);
        return;
      }

      if (response.status === 403) {
        setStatus('blocked');
        setMessage('Your account is signed in, but it is not approved for this organizer area.');
        return;
      }

      if (!response.ok) {
        setStatus('blocked');
        setMessage('Could not verify organizer access.');
        return;
      }

      setStatus('authorized');
    }

    checkAccess();
  }, [area, nextPath, router]);

  async function signOut() {
    const supabase = getSupabaseBrowser();
    await supabase.auth.signOut();
    router.replace(`/login?next=${encodeURIComponent(nextPath || `/${area}`)}`);
  }

  if (status === 'checking') {
    return <div className="container section"><div className="result-box">{message}</div></div>;
  }

  if (status === 'blocked') {
    return (
      <div className="container section">
        <div className="result-box error">{message}</div>
        <button className="button secondary" type="button" onClick={signOut}>Sign out</button>
      </div>
    );
  }

  return (
    <>
      <div className="organizer-session">
        <button className="button secondary compact" type="button" onClick={signOut}>Sign out</button>
      </div>
      {children}
    </>
  );
}
