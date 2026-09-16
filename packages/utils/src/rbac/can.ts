import { Role } from "./roles";
import { Permission, permissionsForRoles } from "./permissions";

export interface AuthSubject {
  roles: Role[];
  /** id of the tenant this subject's roles apply to */
  tenantId: string;
  /** for ownership checks, e.g. an instructor editing their own course */
  userId: string;
}

interface CanOptions {
  /** resource owner's user id, for "own resource" style checks */
  resourceOwnerId?: string;
  /** resource's tenant id — if it doesn't match subject.tenantId, access is denied outright */
  resourceTenantId?: string;
}

/**
 * Central authorization check. Denies cross-tenant access by default —
 * a subject can never act on a resource belonging to a different tenant,
 * regardless of role, unless they're a SuperAdmin.
 */
export function can(subject: AuthSubject, permission: Permission, options: CanOptions = {}): boolean {
  const isSuperAdmin = subject.roles.includes(Role.SuperAdmin);

  if (options.resourceTenantId && options.resourceTenantId !== subject.tenantId && !isSuperAdmin) {
    return false;
  }

  const perms = permissionsForRoles(subject.roles);
  return perms.has(permission);
}

/** Convenience for "can edit if admin/instructor OR they own it" patterns (e.g. own course draft). */
export function canOrOwns(
  subject: AuthSubject,
  permission: Permission,
  resourceOwnerId: string,
  options: CanOptions = {}
): boolean {
  if (subject.userId === resourceOwnerId) return true;
  return can(subject, permission, { ...options, resourceOwnerId });
}