import { Button, Heading, Text } from "@react-email/components";

import { EmailLayout } from "../components/email-layout";
import { emailColors } from "../components/colors";

interface InviteUserEmailProps {
  inviteUrl: string;
}

export default function InviteUserEmail({ inviteUrl }: InviteUserEmailProps) {
  return (
    <EmailLayout preview="You've been invited to MaintInsight">
      <Heading style={heading}>You&apos;re invited</Heading>

      <Text style={text}>You&apos;ve been invited to join MaintInsight.</Text>

      <Text style={text}>
        Click the button below to accept your invitation and create your
        account. You&apos;ll be able to set up your password and complete your
        profile during onboarding.
      </Text>

      <Button style={button} href={inviteUrl}>
        Accept invitation
      </Button>

      <Text style={smallText}>This invitation link expires in 24 hours.</Text>

      <Text style={smallText}>
        Or copy and paste this link into your browser:
      </Text>

      <Text style={linkText}>{inviteUrl}</Text>
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
  lineHeight: "18px",
  marginBottom: "8px",
};

const linkText = {
  fontSize: "12px",
  color: emailColors.primary,
  wordBreak: "break-all" as const,
};
