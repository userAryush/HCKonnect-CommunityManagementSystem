import apiClient from '../../../shared/services/apiClient';

export async function fetchFeed({ page = 1, pageSize = 20, filter = 'all' } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });

  if (filter && filter !== 'all') {
    params.set('type', filter);
  }

  const response = await apiClient.get(`/contents/feed/?${params.toString()}`);
  return response.data;
}

export const CONTENT_TYPES = ['all', 'announcement', 'event', 'discussion', 'post', 'vacancy'];

