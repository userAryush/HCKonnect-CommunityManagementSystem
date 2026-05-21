/**
 * Unified utility functions for handling user and community display data.
 * Ensures consistency across Navbar, MiniProfileCard, and Content Cards.
 */

/**
 * Returns the best display name for a user or community.
 * For communities, uses community_name.
 * For students, uses full name (first + last), falling back to username.
 */
export const getDisplayName = (user) => {
  if (!user) return 'User';
  
  const role = user.role || user.author_role;
  const communityName = user.community_name || user.author_community_name || user.author_community;
  
  // If it's a community account, ALWAYS show community name
  if (role === 'community') {
    return communityName || user.author_name || user.username || 'Community';
  }
  
  // If role is missing but we only have community name, treat as community
  if (!role && communityName && !user.full_name && !user.author_full_name) {
    return communityName;
  }
  
  // For students and others, prefer full name
  const fullName = user.author_full_name || user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim();
  if (fullName) return fullName;
  
  return user.author_name || user.username || user.email || 'User';
};

/**
 * Returns initials from EVERY word in a name.
 * Example: "Aryush Khatri" -> "AK", "AI Learners Community" -> "ALC"
 */
export const getInitials = (name) => {
  if (!name) return 'U';
  
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0)
    .map(word => word[0])
    .join('')
    .toUpperCase();
    
  return initials || 'U';
};

/** Whether the item represents a community author (not a student profile). */
export function isCommunityAuthor(user) {
  if (!user) return false;
  const role = user.role || user.author_role;
  if (role === 'community') return true;
  const communityName =
    user.community_name || user.author_community_name || user.author_community;
  if (!role && communityName && !user.full_name && !user.author_full_name) {
    return true;
  }
  return false;
}

/**
 * Returns the correct profile image or logo for a user/community.
 */
export const getProfileImage = (user) => {
  if (!user) return null;
  return user.author_image || user.community_logo || user.logo || user.profile_image || null;
};

/**
 * Determines the role label for a user, including community membership.
 */
export const getRoleLabel = (user) => {
  if (!user) return '';
  
  const role = user.role || user.author_role;
  const communityName = user.community_name || user.author_community_name || user.author_community;
  
  if (role === 'community') {
    if (user.is_platform_community || user.author_is_platform_community) {
      return 'Platform Organization';
    }
    return 'Community Admin';
  }
  
  // If it's a student (or role missing) but they belong to a community
  const memberOf = user.membership?.community_name || (role !== 'community' ? communityName : null);
  if (memberOf) {
    return `Member of ${memberOf}`;
  }
  
  if (role === 'student') return 'Student';
  
  // Implicitly treat as Community Admin if no role but communityName exists (fallback for some cards)
  if (!role && communityName) return 'Community Admin';
  
  return role || 'Student';
};

/**
 * Maps a post or discussion comment/reply API object into the shape expected by UserInfo.
 */
export function commentAuthorItem(reply) {
  if (!reply) return null;
  const a = reply.author;
  const c = reply.created_by;
  let id = null;
  if (a != null && typeof a === 'object' && 'id' in a) id = a.id;
  else if (c != null && typeof c === 'object' && 'id' in c) id = c.id;
  else id = a ?? c ?? null;

  return {
    author: id,
    created_by: id,
    author_name: reply.author_name,
    author_image: reply.author_image,
    author_role: reply.author_role,
    author_community: reply.author_community,
    community: reply.community,
  };
}

/** Maps vacancy API payloads to the shape expected by UserInfo / CardHeader. */
export function vacancyAuthorItem(vacancy) {
  if (!vacancy) return vacancy;
  const communityId =
    vacancy.community_id ?? vacancy.author ?? vacancy.community?.id ?? vacancy.community;
  const logo = vacancy.community_logo ?? vacancy.author_image ?? null;
  return {
    ...vacancy,
    author_role: vacancy.author_role ?? 'community',
    author: vacancy.author ?? communityId,
    community_id: communityId,
    community_name: vacancy.community_name ?? vacancy.author_community_name,
    community_logo: logo,
    author_image: vacancy.author_image ?? logo,
  };
}

/** Maps resource API payloads to the shape expected by UserInfo / CardHeader. */
export function resourceAuthorItem(resource) {
  if (!resource) return resource;
  const communityId =
    resource.community_id ?? resource.community?.id ?? resource.community;
  const logo = resource.community_logo ?? resource.author_image ?? null;
  return {
    ...resource,
    author_role: resource.author_role ?? 'community',
    author: resource.author ?? communityId,
    created_by: resource.created_by_user ?? resource.created_by,
    community_id: communityId,
    community:
      resource.community ??
      (communityId ? { id: communityId, name: resource.community_name } : undefined),
    community_name: resource.community_name ?? resource.author_community_name,
    community_logo: logo,
    author_image: resource.author_image ?? logo,
    author_name: resource.author_name,
    created_at: resource.created_at ?? resource.createdAt,
  };
}

/** Maps the logged-in session user to the same item shape as cards / UserInfo. */
export function sessionUserAsItem(user) {
  if (!user) return null;
  return {
    ...user,
    author: user.id,
    created_by: user.id,
  };
}
