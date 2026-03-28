import { useParams } from 'react-router-dom'
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
    <div className="min-h-screen bg-white pb-24">
      <AppHeader />
      <PageShell>
        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:gap-8 lg:items-start">
          <div className="space-y-4">
            <div
              className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-neutral-400 [&::-webkit-scrollbar-track]:bg-neutral-200"
              role="region"
              aria-label="Görsel galerisi"
            >
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-[min(50%,280px)] shrink-0 snap-center sm:w-[min(45%,320px)]"
                >
                  <ImagePlaceholder className="rounded-sm" />
                </div>
              ))}
            </div>
            <p className="sr-only">Öğe kimliği: {id ?? '—'}</p>
            <div className="min-h-[120px] rounded border border-black p-4 text-center text-neutral-700 sm:min-h-[140px] sm:p-6">
              Açıklama
            </div>
          </div>

          <div className="space-y-4 lg:sticky lg:top-24">
            <div className="flex items-center gap-4 rounded border border-black p-4 sm:p-5">
              <span className="text-4xl text-amber-500 sm:text-5xl" aria-hidden>
                ★
              </span>
              <span className="text-lg font-medium text-neutral-900 sm:text-xl">Puan</span>
            </div>

            <section aria-labelledby="yorumlar-baslik">
              <h2 id="yorumlar-baslik" className="sr-only">
                Yorumlar
              </h2>
              <ul className="space-y-3">
                {MOCK_COMMENTS.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-stretch gap-2 rounded border border-black p-2 sm:gap-3 sm:p-3"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#444444] text-white sm:h-12 sm:w-12">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-6 w-6"
                        aria-hidden
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.645z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                      <div className="shrink-0 rounded border border-black px-2 py-1.5 text-center text-sm sm:px-3">
                        {c.user}
                      </div>
                      <div className="min-h-[44px] flex-1 rounded border border-black px-2 py-2 text-sm text-neutral-700 sm:px-3">
                        {c.text}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </PageShell>

      <footer className="fixed bottom-0 left-0 right-0 z-10 border-t border-neutral-300 bg-white p-3 sm:p-4">
        <div className="mx-auto flex max-w-[800px] items-center gap-2 px-1 sm:px-4 md:max-w-4xl lg:max-w-6xl">
          <label className="sr-only" htmlFor="yorum-ekle">
            Yorum Ekle
          </label>
          <input
            id="yorum-ekle"
            type="text"
            placeholder="Yorum Ekle"
            className="min-h-12 min-w-0 flex-1 rounded border border-black px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#444444] sm:text-base"
          />
          <button
            type="button"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded border border-black bg-[#444444] text-2xl font-light text-white transition-opacity hover:opacity-90"
            aria-label="Yorum gönder"
          >
            +
          </button>
        </div>
      </footer>
    </div>
  )
}
