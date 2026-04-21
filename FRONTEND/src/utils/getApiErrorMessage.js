export default function getApiErrorMessage(error, fallback = 'Something went wrong.') {
  const data = error?.response?.data;

  if (!data) return fallback;
  if (typeof data === 'string') return data;
  if (data.detail && typeof data.detail === 'string') return data.detail;
  if (data.error && typeof data.error === 'string') return data.error;
  if (Array.isArray(data.non_field_errors) && data.non_field_errors.length > 0) {
    return data.non_field_errors[0];
  }

  const firstValue = Object.values(data)[0];
  if (Array.isArray(firstValue) && firstValue.length > 0) return firstValue[0];
  if (typeof firstValue === 'string') return firstValue;

  return fallback;
}
