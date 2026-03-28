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
        <div className="mb-8 md:mb-12">
          <h1 className="text-2xl font-bold tracking-tight text-nt-ink md:text-3xl lg:text-4xl">Keşfet</h1>
          <p className="mt-2 max-w-2xl text-sm text-nt-muted md:text-base lg:text-lg">
            Sıradaki tatilini seçmek için kaydır veya ara.
          </p>
        </div>

        <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:gap-10">
          {MOCK_ITEMS.map((item) => (
            <li key={item.id}>
              <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-nt-border bg-nt-surface shadow-md shadow-slate-900/5 transition hover:border-teal-200/80 hover:shadow-lg hover:shadow-teal-900/10 md:rounded-3xl">
                <div className="flex flex-1 flex-col md:flex-row">
                  <Link
                    to={`/detay/${item.id}`}
                    className="relative block aspect-[16/9] w-full shrink-0 overflow-hidden md:aspect-auto md:h-auto md:w-[44%] md:max-w-[380px] lg:max-w-[420px]"
                  >
                    <ImagePlaceholder className="h-full min-h-[160px] w-full rounded-none transition duration-300 group-hover:scale-[1.02] md:min-h-[200px] lg:min-h-[220px]" />
                    <span className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition group-hover:opacity-100" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col justify-between gap-5 p-5 sm:p-6 md:gap-6 md:p-7 lg:p-8">
                    <div>
                      <h2 className="text-xl font-semibold leading-snug text-nt-ink md:text-2xl">{item.title}</h2>
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-nt-muted md:text-base">
                        {item.description}
                      </p>
                      <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-800 ring-1 ring-amber-200/80">
                        <span aria-hidden className="text-amber-500">
                          ★
                        </span>
                        {item.puan}
                      </div>
                    </div>
                    <div className="flex justify-end border-t border-nt-border/60 pt-4 md:border-0 md:pt-0">
                      <Link
                        to={`/detay/${item.id}`}
                        className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-nt-primary px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-nt-primary-hover md:min-h-0 md:w-auto md:px-8 md:py-3.5"
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
