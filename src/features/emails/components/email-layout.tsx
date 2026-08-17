// src/emails/components/email-layout.tsx
import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { emailColors } from "./colors";

interface EmailLayoutProps {
  preview: string;
  children: React.ReactNode;
}

export function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={logo}>MaintInsight</Text>
          <Section style={content}>{children}</Section>
          <Hr style={hr} />
          <Text style={footer}>
            If you didn&apos;t request this, you can safely ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: emailColors.muted,
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "32px 24px",
  maxWidth: "480px",
};

const logo = {
  fontSize: "18px",
  fontWeight: 700,
  color: emailColors.primary,
  marginBottom: "24px",
};

const content = {
  backgroundColor: emailColors.card,
  borderRadius: "12px",
  padding: "32px",
  border: `1px solid ${emailColors.border}`,
};

const hr = {
  borderColor: emailColors.border,
  margin: "24px 0 16px",
};

const footer = {
  fontSize: "12px",
  color: emailColors.mutedForeground,
  lineHeight: "18px",
};
