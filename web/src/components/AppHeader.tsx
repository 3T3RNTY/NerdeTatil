import { Link } from 'react-router-dom'

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-nt-border/80 bg-nt-surface/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[800px] items-center gap-3 px-4 py-3.5 sm:px-6 md:max-w-4xl md:gap-4 lg:max-w-6xl lg:px-8">
        <label className="sr-only" htmlFor="app-search">
          Arama
        </label>
        <div className="relative min-h-0 min-w-0 flex-1">
          <span
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-nt-muted"
            aria-hidden
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </span>
          <input
            id="app-search"
            type="search"
            placeholder="Mekan, şehir veya tatil ara…"
            className="min-h-11 w-full rounded-2xl border border-nt-border bg-nt-bg py-2.5 pl-11 pr-4 text-sm text-nt-ink outline-none ring-nt-primary/30 transition placeholder:text-nt-muted focus:border-nt-primary/40 focus:bg-nt-surface focus:ring-2 sm:text-base"
          />
        </div>
        <Link
          to="/profil"
          className="group flex shrink-0 items-center gap-2 rounded-2xl border border-transparent bg-nt-bg px-2 py-1.5 transition hover:border-nt-border hover:bg-nt-surface sm:gap-2.5 sm:px-3"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-nt-primary to-teal-700 text-white shadow-sm ring-2 ring-white/30 transition group-hover:ring-nt-primary/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5"
              aria-hidden
            >
              <path
                fillRule="evenodd"
                d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.645z"
                clipRule="evenodd"
              />
            </svg>
          </span>
          <span className="hidden text-sm font-semibold text-nt-ink sm:inline">Profil</span>
        </Link>
      </div>
    </header>
  )
}
