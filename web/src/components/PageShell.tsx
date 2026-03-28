import type { ReactNode } from 'react'

type PageShellProps = {
  children: ReactNode
  className?: string
}

export function PageShell({ children, className = '' }: PageShellProps) {
  return (
    <div
      className={`mx-auto w-full max-w-[800px] px-4 py-4 sm:px-6 md:max-w-4xl md:py-6 lg:max-w-6xl lg:px-8 ${className}`}
    >
      {children}
    </div>
  )
}
