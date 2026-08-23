import type { DailyCityReport } from "../types";

const STATUS_COLORS: Record<string, string> = {
  NOT_MONITORED: "#d1d5db",
  STOPPED: "#6b7280",
  GOOD: "#22c55e",
  ACCEPTABLE: "#84cc16",
  ALERT: "#f59e0b",
  ALARM: "#ef4444",
};

const STATUS_LABELS: Record<string, string> = {
  NOT_MONITORED: "Not monitored",
  STOPPED: "Stopped",
  GOOD: "Good",
  ACCEPTABLE: "Acceptable",
  ALERT: "Alert",
  ALARM: "Alarm",
};

function quickChartUrl(config: object, width = 500, height = 300) {
  const params = new URLSearchParams({
    c: JSON.stringify(config),
    width: String(width),
    height: String(height),
    backgroundColor: "white",
  });
  return `https://quickchart.io/chart?${params.toString()}`;
}

export function buildStatusChartUrl(data: DailyCityReport["equipmentStatus"]) {
  return quickChartUrl({
    type: "doughnut",
    data: {
      labels: data.map((d) => STATUS_LABELS[d.status] ?? d.status),
      datasets: [
        {
          data: data.map((d) => d.count),
          backgroundColor: data.map(
            (d) => STATUS_COLORS[d.status] ?? "#94a3b8",
          ),
        },
      ],
    },
    options: { plugins: { legend: { position: "bottom" } } },
  });
}

export function buildHealthByPlantChartUrl(data: DailyCityReport["plants"]) {
  return quickChartUrl(
    {
      type: "horizontalBar",
      data: {
        labels: data.map((p) => p.name),
        datasets: [
          {
            label: "Health rate (%)",
            data: data.map((p) => p.healthRate),
            backgroundColor: "#3b82f6",
          },
        ],
      },
      options: {
        scales: { xAxes: [{ ticks: { min: 0, max: 100 } }] },
        legend: { display: false },
      },
    },
    500,
    Math.max(180, data.length * 40),
  );
}

export function buildMeasurementsChartUrl(
  data: DailyCityReport["measurements"],
) {
  return quickChartUrl({
    type: "bar",
    data: {
      labels: data.map((m) => m.type),
      datasets: [
        {
          label: "Total",
          data: data.map((m) => m.count),
          backgroundColor: "#3b82f6",
        },
        {
          label: "Abnormal",
          data: data.map((m) => m.abnormal),
          backgroundColor: "#ef4444",
        },
      ],
    },
    options: { legend: { position: "bottom" } },
  });
}
