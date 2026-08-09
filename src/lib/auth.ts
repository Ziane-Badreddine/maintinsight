import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { admin as adminPlugin } from "better-auth/plugins";

import { ac, admin, manager, inspector, viewer } from "./permissions";
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),
  emailAndPassword: {
    enabled: true,
  },

  plugins: [
    adminPlugin({
      ac,

      roles: {
        admin,
        manager,
        inspector,
        viewer,
      },

      defaultRole: "viewer",
    }),
  ],
});
