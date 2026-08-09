import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

import { ac, admin, manager, inspector, viewer } from "./permissions";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_NEON_AUTH_URL ?? process.env.VITE_NEON_AUTH_URL,
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
  ],
});
