import { DESCRIPTION_MAX_LENGTH } from '../../constants/descriptionLimits';
import { clampToMaxLength } from '../../../utils/descriptionUtils';

/**
 * Textarea with live character counter and hard cap at DESCRIPTION_MAX_LENGTH.
 */
export default function LimitedTextarea({
  value,
  onChange,
  maxLength = DESCRIPTION_MAX_LENGTH,
  rows = 5,
  className = '',
  placeholder,
  id,
  name,
  disabled = false,
  required = false,
  label,
  helperText,
}) {
  const length = (value ?? '').length;
  const atLimit = length >= maxLength;

  const handleChange = (e) => {
    const next = clampToMaxLength(e.target.value, maxLength);
    onChange(next);
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    const el = e.target;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const merged =
      (value ?? '').slice(0, start) + pasted + (value ?? '').slice(end);
    onChange(clampToMaxLength(merged, maxLength));
  };

  return (
    <div>
      {label && (
        <label htmlFor={id} className="mb-2 block text-body text-surface-dark">
          {label}
        </label>
      )}
      <textarea
        id={id}
        name={name}
        rows={rows}
        value={value ?? ''}
        onChange={handleChange}
        onPaste={handlePaste}
        maxLength={maxLength}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        className={`w-full resize-y input-standard ${className}`}
        aria-describedby={id ? `${id}-counter` : undefined}
      />
      <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
        {helperText && (
          <p className="text-xs text-surface-muted">{helperText}</p>
        )}
        <p
          id={id ? `${id}-counter` : undefined}
          className={`ml-auto text-xs tabular-nums ${
            atLimit ? 'font-medium text-amber-600' : 'text-surface-muted'
          }`}
          aria-live="polite"
        >
          {length} / {maxLength}
        </p>
      </div>
      {atLimit && (
        <p className="mt-1 text-xs text-amber-600" role="status">
          Maximum length reached ({maxLength} characters).
        </p>
      )}
    </div>
  );
}
