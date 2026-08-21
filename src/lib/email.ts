import { resend, EMAIL_FROM } from "./resend";
import VerifyEmail from "@/features/emails/templates/verify-email";
import ChangeEmail from "@/features/emails/templates/change-email";
import DeleteAccount from "@/features/emails/templates/delete-account";
import ForgotPasswordEmail from "@/features/emails/templates/forgot-password";
import InviteUserEmail from "@/features/emails/templates/invite-user";

import MagicLink from "@/features/emails/templates/magic-link";

interface SendMagicLinkEmailParams {
  to: string;
  userName: string;
  magicLinkUrl: string;
}

interface SendDeleteAccountVerificationParams {
  to: string;
  userName: string;
  deleteUrl: string;
}

interface SendVerificationEmailParams {
  to: string;
  userName: string;
  verificationUrl: string;
}

interface SendForgotPasswordEmailParams {
  to: string;
  userName: string;
  resetUrl: string;
}

interface SendInviteEmailParams {
  to: string;
  userName: string;
  inviterName?: string;
  role: string;
  inviteUrl: string;
}

export async function sendVerificationEmail({
  to,
  userName,
  verificationUrl,
}: SendVerificationEmailParams) {
  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject: "Verify your email address",
    react: VerifyEmail({ userName, verificationUrl }),
  });

  if (error) {
    console.error("Failed to send verification email:", error);
  }
}

interface SendChangeEmailConfirmationParams {
  to: string;
  userName: string;
  currentEmail: string;
  newEmail: string;
  confirmUrl: string;
}

export async function sendChangeEmailConfirmation({
  to,
  userName,
  currentEmail,
  newEmail,
  confirmUrl,
}: SendChangeEmailConfirmationParams) {
  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject: "Confirm your email address change",
    react: ChangeEmail({ userName, currentEmail, newEmail, confirmUrl }),
  });

  if (error) {
    console.error("Failed to send change-email confirmation:", error);
  }
}

export async function sendDeleteAccountVerification({
  to,
  userName,
  deleteUrl,
}: SendDeleteAccountVerificationParams) {
  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject: "Confirm account deletion",
    react: DeleteAccount({ userName, deleteUrl }),
  });

  if (error) {
    console.error("Failed to send delete-account verification:", error);
  }
}

export async function sendForgotPasswordEmail({
  to,
  userName,
  resetUrl,
}: SendForgotPasswordEmailParams) {
  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject: "Reset your password",
    react: ForgotPasswordEmail({ userName, resetUrl }),
  });

  if (error) {
    console.error("Failed to send forgot-password email:", error);
  }
}

export async function sendInviteEmail({
  to,
  userName,
  inviterName,
  role,
  inviteUrl,
}: SendInviteEmailParams) {
  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject: "You've been invited to MaintInsight",
    react: InviteUserEmail({ userName, inviterName, role, inviteUrl }),
  });

  if (error) {
    console.error("Failed to send invite email:", error);
  }
}

export async function sendMagicLinkEmail({
  to,
  userName,
  magicLinkUrl,
}: SendMagicLinkEmailParams) {
  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject: "Sign in to MaintInsight",
    react: MagicLink({
      userName,
      magicLinkUrl,
    }),
  });

  if (error) {
    console.error("Failed to send magic link email:", error);
  }
}
