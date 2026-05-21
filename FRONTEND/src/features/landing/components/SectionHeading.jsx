/**
 * Shared landing section title block.
 * `label` (or `title` if provided) renders as the bold display heading; `accent` sets its color.
 */
function SectionHeading({
  label,
  title,
  description,
  theme = 'light',
  accent = 'communities',
  className = '',
}) {
  const isDark = theme === 'dark'
  const displayTitle = title ?? label

  return (
    <header
      className={['mx-auto w-full max-w-6xl text-center', className].filter(Boolean).join(' ')}
    >
      {title && label ? (
        <p
          className={`text-xs font-bold uppercase tracking-[0.3em] ${
            isDark ? 'text-white/85' : 'text-primary'
          }`}
        >
          {label}
        </p>
      ) : null}
      <h2 className={`landing-section-title landing-section-title--${accent} ${title && label ? 'mt-4' : ''}`}>
        {displayTitle}
      </h2>
      {description ? (
        <p
          className={`mx-auto mt-5 max-w-2xl text-sm leading-relaxed sm:text-base ${
            isDark ? 'text-white/75' : 'text-surface-body'
          }`}
        >
          {description}
        </p>
      ) : null}
    </header>
  )
}

export default SectionHeading
