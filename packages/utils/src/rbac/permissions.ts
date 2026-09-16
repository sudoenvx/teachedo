import { Role } from "./roles";

export enum Permission {
  CourseView = "course:view",
  CourseCreate = "course:create",
  CourseEdit = "course:edit",
  CourseDelete = "course:delete",
  CoursePublish = "course:publish",

  EnrollmentManage = "enrollment:manage",

  AssignmentSubmit = "assignment:submit",
  AssignmentGrade = "assignment:grade",

  QuizTake = "quiz:take",
  QuizAuthor = "quiz:author",

  UserInvite = "user:invite",
  UserRemove = "user:remove",
  UserManageRoles = "user:manage_roles",

  TenantSettingsEdit = "tenant:settings_edit",
  TenantBilling = "tenant:billing",
}

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.Student]: [Permission.CourseView, Permission.AssignmentSubmit, Permission.QuizTake],
  [Role.Instructor]: [
    Permission.CourseView,
    Permission.CourseCreate,
    Permission.CourseEdit,
    Permission.CoursePublish,
    Permission.EnrollmentManage,
    Permission.AssignmentGrade,
    Permission.QuizAuthor,
  ],
  [Role.TenantAdmin]: [
    Permission.CourseView,
    Permission.CourseCreate,
    Permission.CourseEdit,
    Permission.CourseDelete,
    Permission.CoursePublish,
    Permission.EnrollmentManage,
    Permission.AssignmentGrade,
    Permission.QuizAuthor,
    Permission.UserInvite,
    Permission.UserRemove,
    Permission.UserManageRoles,
    Permission.TenantSettingsEdit,
    Permission.TenantBilling,
  ],
  [Role.SuperAdmin]: Object.values(Permission),
};

export function permissionsForRole(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function permissionsForRoles(roles: Role[]): Set<Permission> {
  return new Set(roles.flatMap(permissionsForRole));
}