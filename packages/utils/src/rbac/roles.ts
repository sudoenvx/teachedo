/** Ordered low -> high. Used for hierarchical checks (e.g. Admin inherits Instructor perms). */
export enum Role {
  Student = "student",
  Instructor = "instructor",
  TenantAdmin = "tenant_admin",
  SuperAdmin = "super_admin", // platform-level, crosses tenants
}

const ROLE_RANK: Record<Role, number> = {
  [Role.Student]: 0,
  [Role.Instructor]: 1,
  [Role.TenantAdmin]: 2,
  [Role.SuperAdmin]: 3,
};

export function roleAtLeast(role: Role, minimum: Role): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[minimum];
}

export function highestRole(roles: Role[]): Role | undefined {
  return roles.sort((a, b) => ROLE_RANK[b] - ROLE_RANK[a])[0];
}