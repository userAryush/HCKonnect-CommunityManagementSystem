import api from './api';

export async function fetchFeed({ page = 1, filter = 'all', hiddenTypes = [], hiddenCommunities = [] } = {}) {

  const results = [];

  // Fetch Announcements
  if (filter === 'all' || filter === 'announcement') {
    if (!hiddenTypes.includes('announcement')) {
      try {
        const res = await api.get('/communities/announcements/');
        // Backend currently lacks pagination in views, so we fetch all and slice locally or assume limited set
        // Ideally backend should support ?page=
        const announcements = res.data.map(item => ({
          id: `ann-${item.id}`,
          type: 'announcement',
          title: item.title,
          description: item.description,
          community: {
            name: item.community_name,
            logoText: item.community_name.slice(0, 2).toUpperCase(), // Backup if no logo
            logo: item.community_logo
          },
          author: item.uploaded_by,
          likes: 0, // Not implemented yet
          comments: 0, // Not implemented yet
          created_at: item.created_at,
          image: item.image,
          time_since_posted: item.time_since_posted
        }));
        results.push(...announcements);
      } catch (e) {
        console.error("Failed to fetch announcements", e);
      }
    }
  }

  // Fetch Events
  if (filter === 'all' || filter === 'event') {
    if (!hiddenTypes.includes('event')) {
      try {
        const res = await api.get('/communities/events/');
        const events = res.data.map(item => ({
          id: `evt-${item.id}`,
          type: 'event',
          title: item.title,
          description: item.description,
          community: {
            name: item.community_name,
            logoText: item.community_name.slice(0, 2).toUpperCase(),
            logo: item.community_logo
          },
          author: item.created_by, // Might need name processing in serializer
          likes: 0,
          comments: 0,
          created_at: item.date + 'T' + item.time, // Rough timestamp for sorting
          image: item.image,
          date: item.date,
          time: item.time,
          location: item.location,
          format: item.format
        }));
        results.push(...events);
      } catch (e) {
        console.error("Failed to fetch events", e);
      }
    }
  }

  // Client-side filtering for hiddenCommunities (if applicable)
  let filteredResults = results;
  if (hiddenCommunities.length) {
    const set = new Set(hiddenCommunities);
    filteredResults = results.filter(it => !set.has(it.community.name));
  }

  // Sort by date desc
  filteredResults.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  // Client-side pagination (mock behavior on existing list)
  // Since real backend returns ALL by default (ListAPIView), we slice here?
  // Or we just return all if pagination not strictly supported by backend yet.
  // For now, let's just return all as 'results'

  return { results: filteredResults, nextPage: null };
}

export const CONTENT_TYPES = ['all', 'announcement', 'event', 'discussion'];

