import type { Role } from "@prisma/client";

export type Permission =
  | "cms:read"
  | "cms:create"
  | "cms:write"
  | "cms:publish"
  | "cms:delete"
  | "product:read"
  | "product:create"
  | "product:write"
  | "product:delete"
  | "order:read"
  | "customer:read"
  | "admin:access";

const ROLE_MATRIX: Record<Role, Permission[]> = {
  CUSTOMER: [],
  VIEWER: ["cms:read", "product:read", "order:read", "customer:read", "admin:access"],
  CONTRIBUTOR: [
    "cms:read",
    "cms:create",
    "product:read",
    "product:create",
    "order:read",
    "customer:read",
    "admin:access",
  ],
  EDITOR: [
    "cms:read",
    "cms:write",
    "cms:publish",
    "product:read",
    "product:write",
    "order:read",
    "customer:read",
    "admin:access",
  ],
  ADMIN: [
    "cms:read",
    "cms:write",
    "cms:publish",
    "cms:delete",
    "product:read",
    "product:write",
    "product:delete",
    "order:read",
    "customer:read",
    "admin:access",
  ],
  SUPERADMIN: [
    "cms:read",
    "cms:write",
    "cms:publish",
    "cms:delete",
    "product:read",
    "product:write",
    "product:delete",
    "order:read",
    "customer:read",
    "admin:access",
  ],
};

export function can(role: Role | undefined | null, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_MATRIX[role]?.includes(permission) ?? false;
}

/** New CMS documents only (no editing existing pages). Full editors also satisfy via `cms:write`. */
export function canCreateCms(role: Role | undefined | null): boolean {
  return can(role, "cms:create") || can(role, "cms:write");
}

/** Edit or publish existing CMS content. */
export function canEditCms(role: Role | undefined | null): boolean {
  return can(role, "cms:write");
}

/** New catalog rows only (no editing existing products). Full editors also satisfy via `product:write`. */
export function canCreateProducts(role: Role | undefined | null): boolean {
  return can(role, "product:create") || can(role, "product:write");
}

/** Update existing products. */
export function canEditProducts(role: Role | undefined | null): boolean {
  return can(role, "product:write");
}

export function isStaffRole(role: Role | undefined | null): boolean {
  return (
    role === "VIEWER" ||
    role === "CONTRIBUTOR" ||
    role === "EDITOR" ||
    role === "ADMIN" ||
    role === "SUPERADMIN"
  );
}

export function isSuperAdmin(role: Role | undefined | null): boolean {
  return role === "SUPERADMIN";
}

export const ROLE_LABELS: Record<Role, string> = {
  CUSTOMER: "Customer",
  VIEWER: "CMS Viewer",
  CONTRIBUTOR: "Contributor (create-only)",
  EDITOR: "CMS Editor",
  ADMIN: "Administrator",
  SUPERADMIN: "Super admin",
};
