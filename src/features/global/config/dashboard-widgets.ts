// features/global/config/dashboard-widgets.ts
export type DashboardWidgetId =
  | "stat-cards"
  | "status-summary"
  | "equipment-by-plant"
  | "equipment-status-chart"
  | "city-summary-table"
  | "city-attention-cards"
  | "status-history-chart"
  | "inspection-coverage"
  | "measurement-breakdown"
  | "measurement-trend"
  | "equipment-status-overview"
  | "plants-overview"
  | "workshops-overview";

export const DEFAULT_WIDGET_ORDER: DashboardWidgetId[] = [
  "stat-cards",
  "status-summary",
  "equipment-by-plant",
  "equipment-status-chart",
  "city-summary-table",
  "city-attention-cards",
  "status-history-chart",
  "inspection-coverage",
  "measurement-breakdown",
  "measurement-trend",
  "plants-overview",
  "workshops-overview",
  "equipment-status-overview",
];

export const WIDGET_SPAN: Record<DashboardWidgetId, string> = {
  "stat-cards": "lg:col-span-3",
  "status-summary": "lg:col-span-3",
  "equipment-by-plant": "lg:col-span-2",
  "equipment-status-chart": "lg:col-span-1",
  "city-summary-table": "lg:col-span-2",
  "city-attention-cards": "lg:col-span-1",
  "status-history-chart": "lg:col-span-3",
  "inspection-coverage": "lg:col-span-3",
  "measurement-breakdown": "lg:col-span-2",
  "measurement-trend": "lg:col-span-1",
  "equipment-status-overview": "lg:col-span-3",
  "plants-overview": "lg:col-span-3",
  "workshops-overview": "lg:col-span-3",
};

export const WIDGET_LABEL: Record<DashboardWidgetId, string> = {
  "stat-cards": "Overview stats",
  "status-summary": "Status summary",
  "equipment-by-plant": "Equipment by plant",
  "equipment-status-chart": "Equipment status chart",
  "city-summary-table": "City summary table",
  "city-attention-cards": "Attention needed",
  "status-history-chart": "Status history",
  "inspection-coverage": "Inspection coverage",
  "measurement-breakdown": "Measurements by type",
  "measurement-trend": "Measurement trend",
  "equipment-status-overview": "Equipment status overview",
  "plants-overview": "Plants overview",
  "workshops-overview": "Workshops overview",
};
