import { Permissions } from "@/lib/auth-client";
import { admin, manager, inspector, viewer } from "@/lib/permissions"; // adapte le chemin vers ton fichier ac.ts

export type HeaderSession = { role?: string | null } | null;

const roles = {
  admin,
  manager,
  inspector,
  viewer,
} as const;

type RoleName = keyof typeof roles;

export function hasPermission(
  session: HeaderSession,
  permission?: Permissions,
): boolean {
  if (!permission) return true;

  const roleNames = (session?.role?.split(",") ?? []) as RoleName[];

  return roleNames.some((roleName) => {
    const role = roles[roleName];
    if (!role) return false;

    // authorize() valide que le rôle possède TOUTES les actions demandées
    const result = role.authorize(permission);
    return result.success;
  });
}
