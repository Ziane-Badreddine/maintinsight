// src/emails/verify-email.tsx
import { Button, Heading, Text } from "@react-email/components";
import { EmailLayout } from "../components/email-layout";
import { emailColors } from "../components/colors";

interface VerifyEmailProps {
  userName: string;
  verificationUrl: string;
}

export default function VerifyEmail({
  userName,
  verificationUrl,
}: VerifyEmailProps) {
  return (
    <EmailLayout preview="Verify your email address">
      <Heading style={heading}>Verify your email</Heading>
      <Text style={text}>Hi {userName},</Text>
      <Text style={text}>
        Confirm your email address to finish setting up your account.
      </Text>
      <Button style={button} href={verificationUrl}>
        Verify email address
      </Button>
      <Text style={smallText}>
        Or copy and paste this link into your browser:
      </Text>
      <Text style={linkText}>{verificationUrl}</Text>
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
