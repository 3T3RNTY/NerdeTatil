import { Link } from 'react-router-dom'
import { PageShell } from '../components/PageShell'

export function ProfilePage() {
  return (
    <div className="min-h-screen bg-white">
      <PageShell className="flex flex-col gap-8">
        <section className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-8 md:gap-10">
          <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-[#444444] text-white sm:h-32 sm:w-32">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-14 w-14 sm:h-16 sm:w-16"
              aria-hidden
            >
              <path
                fillRule="evenodd"
                d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.645z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <p className="text-center text-lg font-semibold text-neutral-900 sm:text-left sm:text-xl">
            Kullanıcı Adı
          </p>
        </section>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-8">
          <section>
            <div className="flex min-h-[72px] items-center justify-center rounded border border-black px-4 py-4 text-center font-medium text-neutral-900">
              Profil Detayı
            </div>
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                className="rounded-lg bg-[#444444] px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 sm:px-6"
              >
                Düzenle
              </button>
            </div>
          </section>

          <section>
            <div className="flex min-h-[120px] items-center justify-center rounded border border-black px-4 py-6 text-center font-medium text-neutral-900 sm:min-h-[140px]">
              Paylaşımlar
            </div>
            <div className="mt-3 flex justify-end">
              <Link
                to="/yeni-paylasim"
                className="inline-flex flex-col items-center justify-center rounded-lg bg-[#444444] px-4 py-2.5 text-center text-sm font-medium leading-tight text-white transition-opacity hover:opacity-90 sm:px-6"
              >
                <span>Yeni</span>
                <span>Paylaşım</span>
              </Link>
            </div>
          </section>
        </div>
      </PageShell>

      <nav className="mx-auto mt-8 max-w-[800px] px-4 pb-8 text-center sm:px-6 md:max-w-4xl lg:max-w-6xl">
        <Link to="/" className="text-sm text-neutral-600 underline hover:text-neutral-900">
          Ana Sayfaya dön
        </Link>
      </nav>
    </div>
  )
}
