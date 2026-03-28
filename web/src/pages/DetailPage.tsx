import { Link, useParams } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
import { ImagePlaceholder } from '../components/ImagePlaceholder'
import { PageShell } from '../components/PageShell'

const MOCK_COMMENTS = [
  { id: '1', user: 'K. Adı', text: 'Yorum + Puan' },
  { id: '2', user: 'K. Adı', text: 'Yorum + Puan' },
]

export function DetailPage() {
  const { id } = useParams()

  return (
    <div className="min-h-screen pb-28">
      <AppHeader />
      <PageShell>
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-nt-muted transition hover:text-nt-primary"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Ana sayfa
        </Link>

        <div className="flex flex-col gap-8 lg:grid lg:grid-cols-2 lg:gap-10 lg:items-start">
          <div className="space-y-5">
            <div
              className="-mx-1 overflow-hidden rounded-2xl border border-nt-border bg-nt-surface p-2 shadow-sm sm:mx-0"
              role="region"
              aria-label="Görsel galerisi"
            >
              <div
                className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 pl-1 [-ms-overflow-style:none] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-teal-300/80 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-slate-100"
              >
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-[min(72%,280px)] shrink-0 snap-center sm:w-[min(55%,300px)]"
                  >
                    <ImagePlaceholder className="rounded-xl" />
                  </div>
                ))}
              </div>
            </div>
            <p className="sr-only">Öğe kimliği: {id ?? '—'}</p>

            <div className="rounded-2xl border border-nt-border bg-nt-surface p-5 shadow-sm sm:p-6">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-nt-muted">Açıklama</h2>
              <p className="mt-3 text-base leading-relaxed text-nt-ink">
                Burada mekân veya deneyim hakkında açıklama metni yer alacak. Şu an wireframe metni gösteriliyor.
              </p>
            </div>
          </div>

          <div className="space-y-5 lg:sticky lg:top-28">
            <div className="flex items-center gap-4 rounded-2xl border border-nt-border bg-gradient-to-br from-nt-surface to-teal-50/40 p-5 shadow-sm sm:p-6">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-3xl text-amber-500 shadow-inner" aria-hidden>
                ★
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-nt-muted">Puan</p>
                <p className="mt-0.5 text-2xl font-bold text-nt-ink">4.8</p>
                <p className="text-sm text-nt-muted">128 değerlendirme</p>
              </div>
            </div>

            <section aria-labelledby="yorumlar-baslik" className="rounded-2xl border border-nt-border bg-nt-surface p-4 shadow-sm sm:p-5">
              <h2 id="yorumlar-baslik" className="text-sm font-semibold text-nt-ink">
                Yorumlar
              </h2>
              <ul className="mt-4 space-y-3">
                {MOCK_COMMENTS.map((c) => (
                  <li
                    key={c.id}
                    className="flex gap-3 rounded-xl bg-nt-bg/80 p-3 ring-1 ring-nt-border/60"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-nt-primary to-teal-700 text-white shadow-sm">
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
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-nt-ink">{c.user}</p>
                      <p className="mt-1 text-sm leading-relaxed text-nt-muted">{c.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </PageShell>

      <footer className="fixed bottom-0 left-0 right-0 z-20 border-t border-nt-border bg-nt-surface/95 p-3 shadow-[0_-4px_24px_rgba(15,23,42,0.06)] backdrop-blur-md sm:p-4">
        <div className="mx-auto flex max-w-[800px] items-center gap-2 sm:px-4 md:max-w-4xl lg:max-w-6xl">
          <label className="sr-only" htmlFor="yorum-ekle">
            Yorum Ekle
          </label>
          <input
            id="yorum-ekle"
            type="text"
            placeholder="Yorumunu yaz…"
            className="min-h-12 min-w-0 flex-1 rounded-2xl border border-nt-border bg-nt-bg px-4 py-2.5 text-sm text-nt-ink outline-none ring-nt-primary/25 transition placeholder:text-nt-muted focus:border-teal-300 focus:bg-nt-surface focus:ring-2 sm:text-base"
          />
          <button
            type="button"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-nt-primary text-xl font-light text-white shadow-sm transition hover:bg-nt-primary-hover"
            aria-label="Yorum gönder"
          >
            +
          </button>
        </div>
      </footer>
    </div>
  )
}
