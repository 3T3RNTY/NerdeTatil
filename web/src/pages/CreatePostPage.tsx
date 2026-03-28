import { AppHeader } from '../components/AppHeader'
import { ImagePlaceholder } from '../components/ImagePlaceholder'
import { PageShell } from '../components/PageShell'

export function CreatePostPage() {
  return (
    <div className="min-h-screen pb-32">
      <AppHeader />
      <PageShell>
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-nt-ink md:text-3xl">Yeni paylaşım</h1>
          <p className="mt-1 text-sm text-nt-muted md:text-base">
            Fotoğrafları ekle ve deneyimini anlat.
          </p>
        </div>

        <div className="flex flex-col gap-10 lg:grid lg:grid-cols-2 lg:gap-12 xl:gap-14 lg:items-start">
          <div className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-nt-muted sm:text-sm">Görseller</p>
            <div className="grid grid-cols-2 gap-4 sm:gap-5 md:gap-6">
              <ImagePlaceholder className="rounded-2xl shadow-inner md:rounded-3xl" />
              <ImagePlaceholder className="rounded-2xl shadow-inner md:rounded-3xl" />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl border border-dashed border-teal-300 bg-teal-50/50 px-4 py-2.5 text-sm font-semibold text-nt-primary transition hover:border-teal-400 hover:bg-teal-50"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Resim Ekle
              </button>
            </div>
          </div>

          <div className="flex flex-col">
            <label htmlFor="aciklama" className="text-xs font-semibold uppercase tracking-wider text-nt-muted">
              Açıklama
            </label>
            <textarea
              id="aciklama"
              className="mt-2 min-h-[260px] w-full resize-y rounded-2xl border border-nt-border bg-nt-surface p-5 text-base leading-relaxed text-nt-ink shadow-md outline-none ring-nt-primary/20 transition placeholder:text-nt-muted focus:border-teal-300 focus:ring-2 sm:min-h-[300px] md:rounded-3xl md:p-6 md:text-lg lg:min-h-[340px]"
              placeholder="Nerede kaldın, ne yaptın, ne önerirsin?"
              rows={8}
            />
          </div>
        </div>
      </PageShell>

      <footer className="fixed bottom-0 left-0 right-0 z-20 border-t border-nt-border bg-nt-surface/95 p-3 shadow-[0_-4px_24px_rgba(15,23,42,0.06)] backdrop-blur-md sm:p-4">
        <div className="mx-auto flex max-w-[1400px] items-stretch gap-3 sm:px-4 lg:px-10 xl:px-12">
          <button
            type="button"
            className="min-h-12 flex-1 rounded-2xl bg-nt-primary px-4 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-nt-primary-hover"
          >
            Paylaş
          </button>
          <button
            type="button"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-nt-border bg-nt-bg text-2xl font-light text-nt-ink transition hover:border-teal-200 hover:bg-teal-50/80"
            aria-label="Ekle"
          >
            +
          </button>
        </div>
      </footer>
    </div>
  )
}
