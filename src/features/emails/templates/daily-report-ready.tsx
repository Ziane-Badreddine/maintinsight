// src/emails/daily-report-ready.tsx
import {
  Button,
  Heading,
  Text,
  Section,
  Row,
  Column,
} from "@react-email/components";
import { EmailLayout } from "../components/email-layout";
import { emailColors } from "../components/colors";

interface DailyReportReadyEmailProps {
  cityName: string;
  reportDateLabel: string; // e.g. "Friday 23 August 2026"
  reportUrl: string;
  trigger: "MANUAL" | "AUTO";
  summary?: {
    equipment: number;
    healthRate: number;
    criticalEquipment: number;
    alarms: number;
  };
}

export default function DailyReportReadyEmail({
  cityName,
  reportDateLabel,
  reportUrl,
  trigger,
  summary,
}: DailyReportReadyEmailProps) {
  return (
    <EmailLayout preview={`Daily report — ${cityName} — ${reportDateLabel}`}>
      <Heading style={heading}>Daily report — {cityName}</Heading>
      <Text style={dateText}>{reportDateLabel}</Text>

      <Text style={text}>
        {trigger === "AUTO"
          ? "This report was generated automatically following inspection activity detected in this city today."
          : "This report was generated manually from the MaintInsight dashboard."}
      </Text>

      {summary && (
        <Section style={summaryBox}>
          <Row>
            <Column style={summaryCell}>
              <Text style={summaryLabel}>Equipment</Text>
              <Text style={summaryValue}>{summary.equipment}</Text>
            </Column>
            <Column style={summaryCell}>
              <Text style={summaryLabel}>Health rate</Text>
              <Text style={summaryValue}>{summary.healthRate}%</Text>
            </Column>
          </Row>
          <Row>
            <Column style={summaryCell}>
              <Text style={summaryLabel}>Critical equipment</Text>
              <Text style={{ ...summaryValue, color: emailColors.destructive }}>
                {summary.criticalEquipment}
              </Text>
            </Column>
            <Column style={summaryCell}>
              <Text style={summaryLabel}>Alarms</Text>
              <Text style={{ ...summaryValue, color: emailColors.destructive }}>
                {summary.alarms}
              </Text>
            </Column>
          </Row>
        </Section>
      )}

      <Button style={button} href={reportUrl}>
        Download the report (PDF)
      </Button>

      <Text style={smallText}>Or copy this link into your browser:</Text>
      <Text style={linkText}>{reportUrl}</Text>
    </EmailLayout>
  );
}

const heading = {
  fontSize: "20px",
  fontWeight: 700,
  color: emailColors.foreground,
  marginBottom: "4px",
};

const dateText = {
  fontSize: "13px",
  color: emailColors.mutedForeground,
  marginBottom: "16px",
};

const text = {
  fontSize: "14px",
  color: emailColors.mutedForeground,
  lineHeight: "22px",
  marginBottom: "16px",
};

const summaryBox = {
  backgroundColor: emailColors.muted,
  borderRadius: "8px",
  padding: "16px",
  marginBottom: "20px",
};

const summaryCell = {
  width: "50%",
  paddingBottom: "12px",
};

const summaryLabel = {
  fontSize: "11px",
  color: emailColors.mutedForeground,
  margin: 0,
  marginBottom: "2px",
};

const summaryValue = {
  fontSize: "18px",
  fontWeight: 700,
  color: emailColors.foreground,
  margin: 0,
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
