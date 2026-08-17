import { Button, Heading, Text } from "@react-email/components";
import { EmailLayout } from "../components/email-layout";
import { emailColors } from "../components/colors";

interface DeleteAccountProps {
  userName: string;
  deleteUrl: string;
}

export default function DeleteAccount({
  userName,
  deleteUrl,
}: DeleteAccountProps) {
  return (
    <EmailLayout preview="Confirm account deletion">
      <Heading style={heading}>Confirm account deletion</Heading>
      <Text style={text}>Hi {userName},</Text>
      <Text style={text}>
        You requested to permanently delete your account. This action cannot be
        undone — all of your data will be lost.
      </Text>
      <Text style={text}>
        If you didn&apos;t request this, ignore this email and your account will
        remain unchanged.
      </Text>
      <Button style={button} href={deleteUrl}>
        Permanently delete my account
      </Button>
      <Text style={smallText}>
        Or copy and paste this link into your browser:
      </Text>
      <Text style={linkText}>{deleteUrl}</Text>
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
  backgroundColor: emailColors.destructive,
  borderRadius: "8px",
  color: emailColors.destructiveForeground,
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
