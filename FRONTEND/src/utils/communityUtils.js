/**
 * Platform communities (e.g. Herald DevCorps) are official college-wide organizations.
 * They use role=community but skip membership, recruitment, and private content.
 */

export const isPlatformCommunity = (community) =>
  Boolean(community?.is_platform_community);

/** Tabs hidden on platform community profiles */
export const PLATFORM_HIDDEN_TABS = ['Members', 'Vacancies'];

export const filterCommunityTabs = (tabs, community) => {
  if (!isPlatformCommunity(community)) return tabs;
  return tabs.filter((tab) => !PLATFORM_HIDDEN_TABS.includes(tab));
};
