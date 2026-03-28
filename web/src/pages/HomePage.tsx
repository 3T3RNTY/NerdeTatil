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
    <div className="min-h-screen bg-white">
      <AppHeader />
      <PageShell>
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {MOCK_ITEMS.map((item) => (
            <li key={item.id}>
              <article className="flex gap-3 rounded border border-black p-3 sm:gap-4 sm:p-4">
                <Link
                  to={`/detay/${item.id}`}
                  className="block w-[28%] max-w-[110px] shrink-0 sm:max-w-[130px]"
                >
                  <ImagePlaceholder className="h-full w-full rounded-sm" />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
                  <div>
                    <h2 className="text-base font-semibold text-neutral-900 sm:text-lg">
                      {item.title}
                    </h2>
                    <p className="mt-1 line-clamp-2 text-sm text-neutral-700 sm:text-base">
                      {item.description}
                    </p>
                    <p className="mt-2 text-sm font-medium text-neutral-800 sm:text-base">
                      Puan: {item.puan}
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <Link
                      to={`/detay/${item.id}`}
                      className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#444444] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 sm:min-h-0"
                    >
                      İncele
                    </Link>
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
