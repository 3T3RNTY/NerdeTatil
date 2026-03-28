import { Link } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
import { ImagePlaceholder } from '../components/ImagePlaceholder'
import { PageShell } from '../components/PageShell'

const MOCK_ITEMS = [
  { id: '1', title: 'Başlık', description: 'Açıklama', puan: '4.5' },
  { id: '2', title: 'Başlık', description: 'Açıklama', puan: '4.2' },
  { id: '3', title: 'Başlık', description: 'Açıklama', puan: '5.0' },
  { id: '4', title: 'Başlık', description: 'Açıklama', puan: '3.8' },
]

export function HomePage() {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <PageShell>
        <div className="mb-8 md:mb-10">
          <h1 className="text-2xl font-bold tracking-tight text-nt-ink md:text-3xl">Keşfet</h1>
          <p className="mt-1 max-w-lg text-sm text-nt-muted md:text-base">
            Sıradaki tatilini seçmek için kaydır veya ara.
          </p>
        </div>

        <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {MOCK_ITEMS.map((item) => (
            <li key={item.id}>
              <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-nt-border bg-nt-surface shadow-sm shadow-slate-900/5 transition hover:border-teal-200/80 hover:shadow-md hover:shadow-teal-900/5">
                <div className="flex flex-1 flex-col sm:flex-row">
                  <Link
                    to={`/detay/${item.id}`}
                    className="relative block aspect-[16/10] w-full shrink-0 overflow-hidden sm:aspect-auto sm:h-auto sm:w-[38%] sm:max-w-[140px]"
                  >
                    <ImagePlaceholder className="h-full min-h-[120px] w-full rounded-none transition duration-300 group-hover:scale-[1.02] sm:aspect-auto sm:min-h-[140px]" />
                    <span className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition group-hover:opacity-100" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col justify-between gap-4 p-4 sm:p-5">
                    <div>
                      <h2 className="text-lg font-semibold leading-snug text-nt-ink">{item.title}</h2>
                      <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-nt-muted">
                        {item.description}
                      </p>
                      <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-200/80">
                        <span aria-hidden className="text-amber-500">
                          ★
                        </span>
                        {item.puan}
                      </div>
                    </div>
                    <div className="flex justify-end border-t border-nt-border/60 pt-3 sm:border-0 sm:pt-0">
                      <Link
                        to={`/detay/${item.id}`}
                        className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-nt-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-nt-primary-hover sm:min-h-0 sm:w-auto"
                      >
                        İncele
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </PageShell>
    </div>
  )
}
