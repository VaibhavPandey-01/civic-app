export const ROLE_CITIZEN = 'citizen' as const;
export const ROLE_ADMIN = 'admin' as const;

export type UserRole = typeof ROLE_CITIZEN | typeof ROLE_ADMIN;
