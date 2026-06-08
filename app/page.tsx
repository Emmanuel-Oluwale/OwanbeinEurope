export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-20">
        <p className="mb-4 text-sm uppercase tracking-[0.4em] text-yellow-400">Premium Nigerian Owanbe Experiences</p>
        <h1 className="max-w-4xl text-5xl font-bold tracking-tight md:text-7xl">Owanbe in Europe</h1>
        <p className="mt-6 max-w-2xl text-lg text-zinc-300 md:text-2xl">Naija to Prague. Live music, dance, food, fashion, culture, and premium celebration in the heart of Europe.</p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <a href="/events/naija-to-prague-2026" className="rounded-full bg-yellow-400 px-8 py-4 text-center font-semibold text-black">View Event</a>
          <a href="/my-ticket" className="rounded-full border border-yellow-400 px-8 py-4 text-center font-semibold text-yellow-400">Find My Ticket</a>
        </div>
      </section>
    </main>
  );
}
