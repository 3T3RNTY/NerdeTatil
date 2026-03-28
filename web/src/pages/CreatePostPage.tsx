import { AppHeader } from '../components/AppHeader'
import { ImagePlaceholder } from '../components/ImagePlaceholder'
import { PageShell } from '../components/PageShell'

export function CreatePostPage() {
  return (
    <div className="min-h-screen bg-white pb-28">
      <AppHeader />
      <PageShell>
        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:gap-8 lg:items-start">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <ImagePlaceholder className="rounded-sm" />
              <ImagePlaceholder className="rounded-sm" />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                className="rounded-lg bg-[#444444] px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                Resim Ekle
              </button>
            </div>
          </div>

          <div className="flex min-h-[200px] items-center justify-center rounded border border-black p-4 text-neutral-600 sm:min-h-[240px] lg:min-h-[280px]">
            <label className="flex h-full w-full cursor-text flex-col">
              <span className="sr-only">Açıklama</span>
              <textarea
                className="min-h-[180px] w-full resize-y rounded border-0 bg-transparent p-2 text-center text-base text-neutral-900 outline-none placeholder:text-neutral-500 sm:min-h-[200px] lg:min-h-[240px]"
                placeholder="Açıklama"
                rows={6}
              />
            </label>
          </div>
        </div>
      </PageShell>

      <footer className="fixed bottom-0 left-0 right-0 z-10 border-t border-neutral-300 bg-white p-3 sm:p-4">
        <div className="mx-auto flex max-w-[800px] items-stretch gap-2 sm:px-4 md:max-w-4xl lg:max-w-6xl">
          <button
            type="button"
            className="min-h-12 flex-1 rounded-lg bg-[#444444] px-4 py-3 text-base font-medium text-white transition-opacity hover:opacity-90"
          >
            Paylaş
          </button>
          <button
            type="button"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-black bg-white text-2xl font-light text-neutral-900 transition-colors hover:bg-neutral-100"
            aria-label="Ekle"
          >
            +
          </button>
        </div>
      </footer>
    </div>
  )
}
