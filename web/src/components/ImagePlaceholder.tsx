type ImagePlaceholderProps = {
  className?: string
}

export function ImagePlaceholder({ className = '' }: ImagePlaceholderProps) {
  return (
    <div
      className={`flex aspect-square items-center justify-center bg-gradient-to-br from-slate-200 via-slate-100 to-teal-100/50 text-teal-600/40 ${className}`}
      role="img"
      aria-label="Görsel yer tutucu"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-10 w-10 sm:h-12 sm:w-12"
        aria-hidden
      >
        <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>
  )
}
