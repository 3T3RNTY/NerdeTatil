import type { ReactNode } from 'react'

type PageShellProps = {
  children: ReactNode
  className?: string
}

export function PageShell({ children, className = '' }: PageShellProps) {
  return (
    <div
      className={`mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 md:py-8 lg:px-10 xl:px-12 ${className}`}
    >
      {children}
    </div>
  )
}
