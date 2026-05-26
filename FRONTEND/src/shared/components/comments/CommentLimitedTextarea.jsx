import { useId, forwardRef } from 'react';
import { COMMENT_MAX_LENGTH } from '../../constants/commentLimits';
import { clampToMaxLength } from '../../../utils/descriptionUtils';

/**
 * Compact textarea for comment composers with live counter and 1,500 char cap.
 * Forwards a ref to the underlying <textarea> so callers can read selectionStart/End.
 */
const CommentLimitedTextarea = forwardRef(function CommentLimitedTextarea({
  value,
  onChange,
  onKeyDown,
  maxLength = COMMENT_MAX_LENGTH,
  rows = 2,
  placeholder,
  className = '',
  autoFocus = false,
  disabled = false,
}, ref) {
  const counterId = useId();
  const length = (value ?? '').length;
  const atLimit = length >= maxLength;

  const handleChange = (e) => {
    onChange(clampToMaxLength(e.target.value, maxLength));
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
    <div className={className}>
      <textarea
        ref={ref}
        value={value ?? ''}
        onChange={handleChange}
        onPaste={handlePaste}
        onKeyDown={onKeyDown}
        maxLength={maxLength}
        rows={rows}
        placeholder={placeholder}
        autoFocus={autoFocus}
        disabled={disabled}
        className="w-full bg-transparent border-none outline-none resize-none text-[var(--app-text)] placeholder-[color:var(--surface-muted-text)]"
        aria-describedby={counterId}
      />
      <div className="flex items-center justify-between gap-2 px-3 pb-1 pt-0.5">
        {atLimit ? (
          <p className="text-[11px] text-amber-600" role="status">
            Maximum length reached
          </p>
        ) : (
          <span className="text-[11px] text-transparent select-none" aria-hidden>
            —
          </span>
        )}
        <p
          id={counterId}
          className={`text-[11px] tabular-nums ${
            atLimit ? 'font-medium text-amber-600' : 'text-[var(--surface-muted-text)]'
          }`}
          aria-live="polite"
        >
          {length} / {maxLength}
        </p>
      </div>
    </div>
  );
});

export default CommentLimitedTextarea;
