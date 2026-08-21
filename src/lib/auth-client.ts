import { createAuthClient } from "better-auth/react";
import { adminClient, magicLinkClient } from "better-auth/client/plugins";
import { passkeyClient } from "@better-auth/passkey/client";
import { lastLoginMethodClient } from "better-auth/client/plugins";

import {
  ac,
  admin,
  manager,
  inspector,
  viewer,
  statements,
} from "./permissions";

export type PermissionCheck = {
  [K in keyof typeof statements]?: (typeof statements)[K][number][];
};

export const authClient = createAuthClient({
  plugins: [
    adminClient({
      ac,
      roles: {
        admin,
        manager,
        inspector,
        viewer,
      },
    }),
    passkeyClient(),
    lastLoginMethodClient(),
    magicLinkClient(),
  ],
});

export function roleHasPermission(
  role: string | null | undefined,
  permissions: PermissionCheck,
) {
  if (!role) return false;

  return authClient.admin.checkRolePermission({
    role: role as "admin" | "manager" | "inspector" | "viewer",
    permissions,
  });
}

export type CheckRolePermissionArgs = Parameters<
  typeof authClient.admin.checkRolePermission
>[0];
export type Role = CheckRolePermissionArgs["role"];
export type Permissions = CheckRolePermissionArgs["permissions"];
