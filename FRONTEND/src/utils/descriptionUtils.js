import {
  DESCRIPTION_COLLAPSED_MAX_CHARS,
  DESCRIPTION_COLLAPSED_MAX_LINES,
  DESCRIPTION_MAX_LENGTH,
} from '../shared/constants/descriptionLimits';

export {
  DESCRIPTION_MAX_LENGTH,
  DESCRIPTION_COLLAPSED_MAX_CHARS,
  DESCRIPTION_COLLAPSED_MAX_LINES,
};

/**
 * Truncate plain text for collapsed preview (word-aware when possible).
 */
export function truncateToChars(text, maxChars = DESCRIPTION_COLLAPSED_MAX_CHARS) {
  if (!text || text.length <= maxChars) return text ?? '';
  const slice = text.slice(0, maxChars);
  const lastSpace = slice.lastIndexOf(' ');
  const cut = lastSpace > maxChars * 0.6 ? slice.slice(0, lastSpace) : slice;
  return cut.trimEnd();
}

export function clampToMaxLength(value, maxLength = DESCRIPTION_MAX_LENGTH) {
  if (value == null) return '';
  return String(value).slice(0, maxLength);
}

export function exceedsCharLimit(text, maxChars = DESCRIPTION_COLLAPSED_MAX_CHARS) {
  return Boolean(text && text.length > maxChars);
}

export function exceedsLineLimit(lineCount, maxLines = DESCRIPTION_COLLAPSED_MAX_LINES) {
  return lineCount > maxLines;
}
