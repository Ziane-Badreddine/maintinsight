import {
  EquipmentStatus,
  MeasurementType,
} from "../../../prisma/generated/prisma/enums";

export type ReportSection =
  | "summary"
  | "charts"
  | "plants"
  | "criticalEquipment"
  | "inspections"
  | "measurements"
  | "alerts";

export const REPORT_SECTIONS: { id: ReportSection; label: string }[] = [
  { id: "summary", label: "Summary" },
  { id: "charts", label: "Charts" },
  { id: "plants", label: "Plants" },
  { id: "criticalEquipment", label: "Critical equipment" },
  { id: "inspections", label: "Inspections" },
  { id: "measurements", label: "Measurements" },
  { id: "alerts", label: "Alerts & alarms" },
];

export type ReportPeriod = "today" | "last24h";

export type DailyCityReport = {
  city: { id: number; name: string; code: string };

  period: { date: string; generatedAt: string; mode: ReportPeriod };

  summary: {
    plants: number;
    equipment: number;
    healthRate: number;
    criticalEquipment: number;
    openInspections: number;
    alerts: number;
    alarms: number;
    measurementsToday: number;
  };

  equipmentStatus: { status: EquipmentStatus; count: number }[];

  plants: {
    id: number;
    name: string;
    equipmentCount: number;
    healthRate: number;
    critical: number;
    inspections: number;
  }[];

  criticalEquipment: {
    id: number;
    code: string | null;
    name: string;
    plantName: string;
    status: EquipmentStatus;
    healthRate: number;
    lastInspection: Date | null;
  }[];

  inspections: {
    completed: number;
    pending: number;
    critical: number;
    recent: {
      id: number;
      reference: string | null;
      inspectionDate: Date;
      performedBy: string;
      status: string;
      equipmentCount: number;
    }[];
  };

  measurements: { type: MeasurementType; count: number; abnormal: number }[];

  alerts: { type: "ALERT" | "ALARM"; count: number }[];

  recommendations: string[];

  sections: ReportSection[];
};
