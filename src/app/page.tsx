export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center bg-gradient-to-br from-emerald-50 to-amber-50 px-4 font-sans dark:from-zinc-950 dark:to-zinc-900">
      <main className="flex w-full max-w-xl flex-col items-center gap-6 text-center">
        <span className="text-6xl" aria-hidden="true">
          🛒
        </span>
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
          Azhar Karyana Shop
        </h1>
        <p className="rounded-full bg-emerald-600 px-4 py-1 text-sm font-semibold uppercase tracking-widest text-white">
          Coming Soon
        </p>
        <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          Rozana ka saman, ab online. Hamari website jald aa rahi hai.
        </p>
      </main>
    </div>
  );
}
