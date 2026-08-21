// src/emails/magic-link.tsx
import { Button, Heading, Text } from "@react-email/components";
import { EmailLayout } from "../components/email-layout";
import { emailColors } from "../components/colors";

interface MagicLinkProps {
  userName: string;
  magicLinkUrl: string;
}

export default function MagicLink({ userName, magicLinkUrl }: MagicLinkProps) {
  return (
    <EmailLayout preview="Sign in to MaintInsight">
      <Heading style={heading}>Sign in to MaintInsight</Heading>

      <Text style={text}>Hi {userName},</Text>

      <Text style={text}>
        We received a request to sign in to your MaintInsight account. Click the
        button below to securely access your account.
      </Text>

      <Button style={button} href={magicLinkUrl}>
        Sign in to MaintInsight
      </Button>

      <Text style={smallText}>
        This link will expire soon for your security.
      </Text>

      <Text style={smallText}>
        Or copy and paste this link into your browser:
      </Text>

      <Text style={linkText}>{magicLinkUrl}</Text>

      <Text style={smallText}>
        If you didn&apos;t request this sign-in link, you can safely ignore this
        email.
      </Text>
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
  marginBottom: "16px",
};
