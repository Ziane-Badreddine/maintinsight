import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { emailColors } from "../components/colors";

interface ForgotPasswordEmailProps {
  userName: string;
  resetUrl: string;
}

export default function ForgotPasswordEmail({
  userName,
  resetUrl,
}: ForgotPasswordEmailProps) {
  return (
    <Html>
      <Head />

      <Preview>Reset your password</Preview>

      <Body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: emailColors.background,
          color: emailColors.foreground,
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <Container
          style={{
            maxWidth: "480px",
            margin: "40px auto",
            padding: "40px",
            backgroundColor: emailColors.card,
            border: `1px solid ${emailColors.border}`,
            borderRadius: "8px",
          }}
        >
          <Heading
            style={{
              margin: "0 0 16px",
              padding: 0,
              fontSize: "24px",
              lineHeight: "32px",
              fontWeight: 600,
              color: emailColors.cardForeground,
            }}
          >
            Reset your password
          </Heading>

          <Text
            style={{
              margin: "0 0 16px",
              fontSize: "14px",
              lineHeight: "24px",
              color: emailColors.foreground,
            }}
          >
            Hi {userName},
          </Text>

          <Text
            style={{
              margin: "0 0 16px",
              fontSize: "14px",
              lineHeight: "24px",
              color: emailColors.mutedForeground,
            }}
          >
            We received a request to reset the password for your account. Click
            the button below to choose a new one. This link expires in 1 hour.
          </Text>

          <Section
            style={{
              margin: "24px 0",
              textAlign: "center",
            }}
          >
            <Button
              href={resetUrl}
              style={{
                display: "inline-block",
                padding: "12px 20px",
                borderRadius: "6px",
                backgroundColor: emailColors.primary,
                color: emailColors.primaryForeground,
                fontSize: "14px",
                lineHeight: "20px",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Reset password
            </Button>
          </Section>

          <Text
            style={{
              margin: "0 0 24px",
              fontSize: "14px",
              lineHeight: "24px",
              color: emailColors.mutedForeground,
            }}
          >
            If you didn&apos;t request a password reset, you can safely ignore
            this email — your password won&apos;t be changed.
          </Text>

          <Hr
            style={{
              margin: "24px 0",
              border: 0,
              borderTop: `1px solid ${emailColors.border}`,
            }}
          />

          <Text
            style={{
              margin: 0,
              fontSize: "12px",
              lineHeight: "20px",
              color: emailColors.mutedForeground,
            }}
          >
            If the button above doesn&apos;t work, copy and paste this URL into
            your browser:
            <br />
            <span
              style={{
                color: emailColors.primary,
                wordBreak: "break-all",
              }}
            >
              {resetUrl}
            </span>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
