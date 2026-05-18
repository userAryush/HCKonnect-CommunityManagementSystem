/**
 * Only unaffiliated students may apply to community vacancies.
 * Community accounts, admins, and students already in any community cannot apply.
 */
export function canApplyToVacancy(user) {
  if (!user) return false;
  if (user.role !== 'student') return false;
  if (user.membership) return false;
  return true;
}

export function vacancyApplyBlockedReason(user) {
  if (!user) return 'Sign in as a student to apply.';
  if (user.role === 'community') {
    return 'Community accounts cannot apply to vacancies.';
  }
  if (user.role === 'admin') {
    return 'Admin accounts cannot apply to vacancies.';
  }
  if (user.role !== 'student') {
    return 'Only students can apply to vacancies.';
  }
  if (user.membership) {
    return 'You are already in a community and cannot apply to other vacancies.';
  }
  return null;
}
