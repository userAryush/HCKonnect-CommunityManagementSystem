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
