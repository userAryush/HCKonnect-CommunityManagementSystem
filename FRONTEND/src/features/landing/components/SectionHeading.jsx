/**
 * Shared landing section title block: centered, consistent type scale.
 * Global base styles force headings to `text-surface-dark`; pass theme="dark" on dark bands.
 */
function SectionHeading({ label, title, description, theme = 'light', className = '' }) {
  const isDark = theme === 'dark'

  return (
    <header className={['mx-auto max-w-2xl text-center', className].filter(Boolean).join(' ')}>
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">{label}</p>
      <h2
        className={`mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl ${
          isDark ? 'text-white' : 'text-surface-dark'
        }`}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={`mt-3 text-sm leading-relaxed sm:text-base ${
            isDark ? 'text-white/70' : 'text-surface-body'
          }`}
        >
          {description}
        </p>
      ) : null}
    </header>
  )
}

export default SectionHeading
