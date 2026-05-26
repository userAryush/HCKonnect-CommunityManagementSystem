import { useState, useRef, useLayoutEffect, useId } from 'react';
import {
  DESCRIPTION_COLLAPSED_MAX_CHARS,
  DESCRIPTION_COLLAPSED_MAX_LINES,
} from '../../constants/descriptionLimits';
import { truncateToChars } from '../../../utils/descriptionUtils';

/**
 * Inline expand/collapse for long plain text (descriptions, comments, etc.).
 * Collapsed limits are configurable; defaults match card descriptions.
 */
export default function ExpandableDescription({
  text,
  className = '',
  forceExpanded = false,
  as: Component = 'div',
  collapsedMaxChars = DESCRIPTION_COLLAPSED_MAX_CHARS,
  collapsedMaxLines = DESCRIPTION_COLLAPSED_MAX_LINES,
  collapsedMaxHeightClass = 'max-h-[7.5rem]',
  toggleClassName = 'mt-1 inline-block text-sm font-semibold text-surface-muted transition-colors hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm',
  /** Optional renderer: (text, className) => ReactNode. Defaults to plain text. */
  renderText = null,
}) {
  const [expanded, setExpanded] = useState(false);
  const [showToggle, setShowToggle] = useState(false);
  const measureRef = useRef(null);
  const contentId = useId();

  const content = text?.trim() ? text : '';

  useLayoutEffect(() => {
    if (forceExpanded || !content) {
      setShowToggle(false);
      return;
    }

    const measureEl = measureRef.current;
    if (!measureEl) return;

    const style = getComputedStyle(measureEl);
    const lineHeight = parseFloat(style.lineHeight) || 20;
    const lines = Math.max(1, Math.round(measureEl.scrollHeight / lineHeight));
    const exceedsLines = lines > collapsedMaxLines;
    const exceedsChars = content.length > collapsedMaxChars;
    setShowToggle(exceedsLines || exceedsChars);
  }, [content, forceExpanded, collapsedMaxChars, collapsedMaxLines]);

  if (!content) return null;

  if (forceExpanded) {
    return (
      <Component className={`whitespace-pre-wrap leading-relaxed ${className}`}>
        {renderText ? renderText(content, '') : content}
      </Component>
    );
  }

  const isExpanded = expanded;
  const charLimited = content.length > collapsedMaxChars;
  const displayText = isExpanded
    ? content
    : charLimited
      ? truncateToChars(content, collapsedMaxChars)
      : content;

  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setExpanded((prev) => !prev);
  };

  return (
    <div
      className={`relative ${className}`}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      {/* Off-screen clone for line measurement (same typography as visible block) */}
      <div
        ref={measureRef}
        aria-hidden
        className="pointer-events-none absolute -left-[9999px] top-0 w-full max-w-full whitespace-pre-wrap leading-relaxed opacity-0"
      >
        {content}
      </div>

      <Component
        id={contentId}
        className={`overflow-hidden whitespace-pre-wrap leading-relaxed transition-[max-height] duration-300 ease-in-out ${
          isExpanded ? 'max-h-[8000px]' : collapsedMaxHeightClass
        }`}
      >
        {renderText ? renderText(displayText, '') : displayText}
      </Component>

      {showToggle && (
        <button
          type="button"
          onClick={handleToggle}
          aria-expanded={isExpanded}
          aria-controls={contentId}
          className={toggleClassName}
        >
          {isExpanded ? 'show less' : '…more'}
        </button>
      )}
    </div>
  );
}
