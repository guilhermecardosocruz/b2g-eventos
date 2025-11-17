import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500 text-xs font-semibold text-white">
            EV
          </span>
          <span className="text-sm font-semibold tracking-tight sm:text-base">
            Eventos PWA
          </span>
        </Link>

        <nav className="flex items-center gap-3 text-xs sm:text-sm">
          <Link
            href="/eventos"
            className="rounded-full px-3 py-1 text-slate-200 hover:bg-slate-800"
          >
            Explorar eventos
          </Link>
          <Link
            href="/login"
            className="hidden rounded-full border border-slate-700 px-3 py-1 text-slate-200 hover:border-blue-500 hover:text-blue-400 sm:inline-flex"
          >
            Entrar
          </Link>
        </nav>
      </div>
    </header>
  );
}
