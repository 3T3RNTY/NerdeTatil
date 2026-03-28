import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
import { PageShell } from '../components/PageShell'

const PROFILE = {
  displayName: 'Kullanıcı Adı',
  fullName: 'Emirhan Bayrak',
  email: 'emirhan.bayrak@ornek.com',
  phone: '+90 532 000 00 00',
  location: 'İstanbul, Türkiye',
  bio: 'Hafta sonu kaçamakları ve Ege kıyılarını keşfetmeyi seviyorum. Önerilerime göz atabilirsin.',
  memberSince: 'Mart 2024',
}

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <dt className="text-xs font-semibold uppercase tracking-wide text-nt-muted">{label}</dt>
      <dd className="text-base text-nt-ink md:text-lg">{children}</dd>
    </div>
  )
}

export function ProfilePage() {
  return (
    <div className="min-h-screen">
      <AppHeader />

      <div className="border-b border-nt-border bg-gradient-to-b from-teal-600/10 via-nt-bg to-nt-bg">
        <PageShell className="pb-8 pt-4 md:pb-10 md:pt-6">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
              <div className="relative">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-teal-400 to-teal-700 opacity-70 blur-sm" aria-hidden />
                <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-nt-primary to-teal-800 text-white shadow-lg ring-4 ring-nt-surface sm:h-32 sm:w-32">
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
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-2xl font-bold tracking-tight text-nt-ink md:text-3xl">{PROFILE.displayName}</h1>
                <p className="mt-1 text-sm text-nt-muted">Tatil önerilerini paylaş</p>
              </div>
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl border border-nt-border bg-nt-surface px-4 py-2.5 text-sm font-semibold text-nt-ink shadow-sm transition hover:border-teal-200 hover:bg-teal-50/50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              Ana sayfa
            </Link>
          </div>
        </PageShell>
      </div>

      <PageShell className="pt-8">
        <div className="flex flex-col gap-8 md:gap-10">
          <section
            aria-labelledby="profil-detay-baslik"
            className="rounded-2xl border border-nt-border bg-nt-surface p-7 shadow-md md:rounded-3xl md:p-8 lg:p-10"
          >
            <div className="flex flex-col gap-4 border-b border-nt-border pb-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 id="profil-detay-baslik" className="text-xl font-bold text-nt-ink md:text-2xl">
                  Profil Detayı
                </h2>
                <p className="mt-1 text-sm text-nt-muted">Bilgilerin uygulamada nasıl göründüğünü buradan kontrol edebilirsin.</p>
              </div>
              <button
                type="button"
                className="shrink-0 rounded-xl bg-nt-primary px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-nt-primary-hover sm:px-8"
              >
                Düzenle
              </button>
            </div>

            <dl className="mt-8 grid gap-8 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-8">
              <DetailRow label="Ad Soyad">{PROFILE.fullName}</DetailRow>
              <DetailRow label="E-posta">
                <a href={`mailto:${PROFILE.email}`} className="text-nt-primary underline-offset-2 hover:underline">
                  {PROFILE.email}
                </a>
              </DetailRow>
              <DetailRow label="Telefon">
                <a href={`tel:${PROFILE.phone.replace(/\s/g, '')}`} className="text-nt-primary underline-offset-2 hover:underline">
                  {PROFILE.phone}
                </a>
              </DetailRow>
              <DetailRow label="Konum">{PROFILE.location}</DetailRow>
              <div className="space-y-1.5 sm:col-span-2">
                <dt className="text-xs font-semibold uppercase tracking-wide text-nt-muted">Hakkımda</dt>
                <dd className="text-base leading-relaxed text-nt-ink md:text-lg">{PROFILE.bio}</dd>
              </div>
              <DetailRow label="Üyelik">{PROFILE.memberSince}</DetailRow>
            </dl>
          </section>

          <section className="rounded-2xl border border-nt-border bg-nt-surface p-7 shadow-md md:rounded-3xl md:p-8 lg:p-10">
            <div className="flex min-h-[200px] items-center justify-center rounded-2xl bg-nt-bg/80 py-12 text-center md:min-h-[220px]">
              <p className="text-lg font-medium text-nt-muted md:text-xl">Paylaşımlar</p>
            </div>
            <div className="mt-6 flex justify-end md:mt-8">
              <Link
                to="/yeni-paylasim"
                className="inline-flex flex-col items-center justify-center rounded-xl bg-nt-primary px-6 py-3.5 text-center text-base font-semibold leading-tight text-white shadow-sm transition hover:bg-nt-primary-hover sm:flex-row sm:gap-1.5"
              >
                <span>Yeni</span>
                <span>Paylaşım</span>
              </Link>
            </div>
          </section>
        </div>
      </PageShell>
    </div>
  )
}
