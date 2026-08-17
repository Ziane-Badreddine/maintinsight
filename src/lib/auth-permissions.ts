import { headers } from "next/headers";

import { auth } from "./auth";
import type { statements } from "./permissions";

export type PermissionCheck = {
  [K in keyof typeof statements]?: (typeof statements)[K][number][];
};

export async function hasSessionPermission(
  permissions: PermissionCheck,
  requestHeaders?: Headers,
) {
  const result = await auth.api.userHasPermission({
    headers: requestHeaders ?? (await headers()),
    body: { permissions },
  });

  return result.success;
}
