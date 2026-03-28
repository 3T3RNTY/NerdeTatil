import { Link } from 'react-router-dom'

export function AppHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-neutral-300 bg-white">
      <div className="mx-auto flex w-full max-w-[800px] items-center gap-3 px-4 py-3 sm:px-6 md:max-w-4xl md:gap-4 lg:max-w-6xl lg:px-8">
        <label className="sr-only" htmlFor="app-search">
          Arama
        </label>
        <input
          id="app-search"
          type="search"
          placeholder="Arama Çubuğu"
          className="min-h-11 min-w-0 flex-1 rounded border border-black px-3 py-2 text-sm outline-none ring-[#444444] placeholder:text-neutral-500 focus:ring-2 sm:text-base"
        />
        <Link
          to="/profil"
          className="flex shrink-0 items-center gap-2 rounded border border-black px-2 py-1.5 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-100 sm:px-3 sm:text-base"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#444444] text-white">
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
          <span className="hidden sm:inline">Profil</span>
        </Link>
      </div>
    </header>
  )
}
