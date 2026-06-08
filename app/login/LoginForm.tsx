'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSupabaseBrowser } from '@/lib/supabaseBrowser';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = useMemo(() => searchParams.get('next') || '/finance', [searchParams]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    const supabase = getSupabaseBrowser();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    router.push(nextPath);
    router.refresh();
  }

  return (
    <form className="checkout-form" onSubmit={login}>
      <label className="field-label">Email</label>
      <input className="field" required type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
      <label className="field-label">Password</label>
      <input className="field" required type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
      <button className="button primary submit-button" type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
      {message && <div className="result-box error">{message}</div>}
    </form>
  );
}
