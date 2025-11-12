//User role constants, Must match backend Role enum

export enum Role {
  ADMIN = 'admin',
  DANCER = 'dancer',
  CLIENT = 'client',
  INSTRUCTOR = 'instructor',
  ORGANIZER = 'organizer',
}

//User type for authentication (simplified)
export enum UserType {
  USER = 'user',    // For dancer/client/instructor
  ADMIN = 'admin',
}

//Check if user has a specific role
export const hasRole = (userRoles: string[] | undefined, role: Role): boolean => {
  if (!userRoles || !Array.isArray(userRoles)) return false;
  return userRoles.includes(role);
};

//Check if user has any of the specified roles
export const hasAnyRole = (userRoles: string[] | undefined, roles: Role[]): boolean => {
  if (!userRoles || !Array.isArray(userRoles)) return false;
  return roles.some(role => userRoles.includes(role));
};

//Check if user has all of the specified roles
// export const hasAllRoles = (userRoles: string[] | undefined, roles: Role[]): boolean => {
//   if (!userRoles || !Array.isArray(userRoles)) return false;
//   return roles.every(role => userRoles.includes(role));
// };

//Get display name for role
export const getRoleDisplayName = (role: Role): string => {
  const displayNames: Record<Role, string> = {
    [Role.ADMIN]: 'Admin',
    [Role.DANCER]: 'Dancer',
    [Role.CLIENT]: 'Client',
    [Role.INSTRUCTOR]: 'Instructor',
    [Role.ORGANIZER]: 'Organizer',
  };
  return displayNames[role] || role;
};