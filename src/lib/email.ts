import { resend, EMAIL_FROM } from "./resend";
import VerifyEmail from "@/features/emails/templates/verify-email";
import ChangeEmail from "@/features/emails/templates/change-email";
import DeleteAccount from "@/features/emails/templates/delete-account";

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
  const { data, error } = await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject: "Confirm account deletion",
    react: DeleteAccount({ userName, deleteUrl }),
  });

  if (error) {
    console.error("Failed to send delete-account verification:", error);
  } else {
    console.log("Delete-account verification sent:", data?.id);
  }
}
