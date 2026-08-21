import { Button, Heading, Text } from "@react-email/components";
import { EmailLayout } from "../components/email-layout";
import { emailColors } from "../components/colors";

interface InviteUserEmailProps {
  userName: string;
  inviterName?: string;
  role: string;
  inviteUrl: string;
}

const ROLE_LABELS: Record<string, string> = {
  viewer: "Viewer",
  inspector: "Inspector",
  manager: "Manager",
  admin: "Admin",
};

export default function InviteUserEmail({
  userName,
  inviterName,
  role,
  inviteUrl,
}: InviteUserEmailProps) {
  const roleLabel = ROLE_LABELS[role] ?? role;

  return (
    <EmailLayout preview="You've been invited to MaintInsight">
      <Heading style={heading}>You&apos;re invited</Heading>
      <Text style={text}>Hi {userName},</Text>
      <Text style={text}>
        {inviterName ? (
          <>
            <strong style={{ color: emailColors.foreground }}>
              {inviterName}
            </strong>{" "}
            has invited you
          </>
        ) : (
          "You've been invited"
        )}{" "}
        to join MaintInsight as{" "}
        <strong style={{ color: emailColors.primary }}>{roleLabel}</strong>.
      </Text>
      <Text style={text}>
        Click the button below to accept the invitation and set up your account.
        This link expires in 24 hours.
      </Text>
      <Button style={button} href={inviteUrl}>
        Accept invitation
      </Button>
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
  marginBottom: "4px",
};

const linkText = {
  fontSize: "12px",
  color: emailColors.primary,
  wordBreak: "break-all" as const,
};
