import { Suspense } from 'react';
import { LoginForm } from '@/app/login/LoginForm';

export default function LoginPage() {
  return (
    <main>
      <header className="header">
        <nav className="container nav">
          <a className="logo" href="/">Owanbe in Europe</a>
          <a className="button secondary compact" href="/">Public Site</a>
        </nav>
      </header>
      <section className="section checkout-section">
        <div className="container grid two">
          <div>
            <p className="kicker">Organizer Login</p>
            <h1 className="section-title">Secure organizer access.</h1>
            <p className="muted">Finance and check-in tools are restricted to approved organizer accounts.</p>
          </div>
          <Suspense fallback={<div className="result-box">Loading login...</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
