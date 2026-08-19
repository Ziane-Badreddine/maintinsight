import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin as adminPlugin } from "better-auth/plugins";
import { lastLoginMethod } from "better-auth/plugins";
import { after } from "next/server"; // ← Next.js 15+ built-in

import { prisma } from "./prisma";
import { ac, admin, manager, inspector, viewer } from "./permissions";
import {
  sendChangeEmailConfirmation,
  sendDeleteAccountVerification,
  sendForgotPasswordEmail,
  sendVerificationEmail,
} from "./email";
import { passkey } from "@better-auth/passkey";
import { magicLink } from "better-auth/plugins";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      after(() =>
        sendVerificationEmail({
          to: user.email,
          userName: user.name ?? "there",
          verificationUrl: url,
        }),
      );
    },

    sendOnSignIn: true,
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
  },

  user: {
    changeEmail: {
      enabled: true,
      sendChangeEmailConfirmation: async ({ user, newEmail, url }) => {
        after(() =>
          sendChangeEmailConfirmation({
            to: user.email,
            userName: user.name ?? "there",
            currentEmail: user.email,
            newEmail,
            confirmUrl: url,
          }),
        );
      },
    },

    deleteUser: {
      enabled: true,
      sendDeleteAccountVerification: async ({ user, url }) => {
        after(() =>
          sendDeleteAccountVerification({
            to: user.email,
            userName: user.name ?? "there",
            deleteUrl: url,
          }),
        );
      },
      // beforeDelete: async (user) => {
      //   if (user.role! === "admin") {
      //     throw new Error("Admin accounts can't be deleted this way.");
      //   }
      // },
    },
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    disableSignUp: true,

    sendResetPassword: async ({ user, url }) => {
      after(() =>
        sendForgotPasswordEmail({
          to: user.email,
          userName: user.name ?? "there",
          resetUrl: url,
        }),
      );
    },
    onPasswordReset: async ({ user }) => {
      // your logic here
      console.log(`Password for user ${user.email} has been reset.`);
    },
  },

  plugins: [
    adminPlugin({
      ac,
      roles: { admin, manager, inspector, viewer },
      defaultRole: "viewer",
      adminRoles: ["admin"],
    }),
    passkey(),
    lastLoginMethod(),
    magicLink({
      sendMagicLink: async ({ email, token, url, metadata }, ctx) => {
        // send email to user
      },
    }),
  ],
});
