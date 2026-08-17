// src/emails/change-email.tsx
import { Button, Heading, Text } from "@react-email/components";
import { EmailLayout } from "../components/email-layout";
import { emailColors } from "../components/colors";

interface ChangeEmailProps {
  userName: string;
  currentEmail: string;
  newEmail: string;
  confirmUrl: string;
}

export default function ChangeEmail({
  userName,
  currentEmail,
  newEmail,
  confirmUrl,
}: ChangeEmailProps) {
  return (
    <EmailLayout preview="Confirm your email address change">
      <Heading style={heading}>Confirm email change</Heading>
      <Text style={text}>Hi {userName},</Text>
      <Text style={text}>
        You requested to change your account email from{" "}
        <strong style={{ color: emailColors.foreground }}>
          {currentEmail}
        </strong>{" "}
        to <strong style={{ color: emailColors.foreground }}>{newEmail}</strong>
        .
      </Text>
      <Text style={text}>
        Click the button below to confirm this change. If you didn&apos;t
        request this, you can safely ignore this email.
      </Text>
      <Button style={button} href={confirmUrl}>
        Confirm email change
      </Button>
      <Text style={smallText}>
        Or copy and paste this link into your browser:
      </Text>
      <Text style={linkText}>{confirmUrl}</Text>
    </EmailLayout>
  );
}

const heading = {
  fontSize: "20px",
  fontWeight: 700,
  color: emailColors.foreground,
  marginBottom: "16px",
};

const text = {
  fontSize: "14px",
  color: emailColors.mutedForeground,
  lineHeight: "22px",
  marginBottom: "16px",
};

const button = {
  backgroundColor: emailColors.primary,
  borderRadius: "8px",
  color: emailColors.primaryForeground,
  fontSize: "14px",
  fontWeight: 600,
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px 20px",
  marginBottom: "16px",
};

const smallText = {
  fontSize: "12px",
  color: emailColors.mutedForeground,
  marginBottom: "4px",
};

const linkText = {
  fontSize: "12px",
  color: emailColors.primary,
  wordBreak: "break-all" as const,
};
