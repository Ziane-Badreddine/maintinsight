/* eslint-disable jsx-a11y/alt-text */
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import type { DailyCityReport } from "../types";
import {
  buildStatusChartUrl,
  buildHealthByPlantChartUrl,
  buildMeasurementsChartUrl,
} from "../lib/chart-url";

const STATUS_LABELS: Record<string, string> = {
  NOT_MONITORED: "Not monitored",
  STOPPED: "Stopped",
  GOOD: "Good",
  ACCEPTABLE: "Acceptable",
  ALERT: "Alert",
  ALARM: "Alarm",
};

const STATUS_COLORS: Record<string, string> = {
  NOT_MONITORED: "#9ca3af",
  STOPPED: "#6b7280",
  GOOD: "#16a34a",
  ACCEPTABLE: "#65a30d",
  ALERT: "#d97706",
  ALARM: "#dc2626",
};

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#111827",
  },

  // Cover
  coverTitle: { fontSize: 22, marginBottom: 6, fontWeight: 700 },
  coverCity: { fontSize: 16, color: "#374151", marginBottom: 4 },
  coverMeta: { fontSize: 10, color: "#6b7280", marginBottom: 2 },
  coverDivider: { borderBottom: "1 solid #e5e7eb", marginVertical: 16 },

  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 13,
    marginBottom: 10,
    fontWeight: 700,
    color: "#111827",
  },

  // Summary cards
  cardsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 4 },
  card: {
    width: "31%",
    border: "1 solid #e5e7eb",
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
  },
  cardLabel: { fontSize: 8, color: "#6b7280", marginBottom: 4 },
  cardValue: { fontSize: 16, fontWeight: 700 },

  chart: { width: 300, height: 180, marginBottom: 4 },
  chartWide: { width: "100%", height: 160, marginBottom: 4 },

  table: { display: "flex", width: "auto" },
  headerRow: {
    flexDirection: "row",
    borderBottom: "2 solid #111827",
    paddingVertical: 5,
    fontWeight: 700,
    fontSize: 9,
  },
  row: {
    flexDirection: "row",
    borderBottom: "1 solid #f3f4f6",
    paddingVertical: 5,
    fontSize: 9,
  },
  cell: { flex: 1, paddingRight: 4 },

  badge: { fontSize: 8, fontWeight: 700 },

  recoRow: { flexDirection: "row", marginBottom: 6 },
  recoText: { fontSize: 10 },

  footer: {
    position: "absolute",
    bottom: 20,
    left: 32,
    right: 32,
    fontSize: 8,
    color: "#9ca3af",
    borderTop: "1 solid #e5e7eb",
    paddingTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

function has(data: DailyCityReport, section: string) {
  return data.sections.includes(section as never);
}

export function ReportDocument({ data }: { data: DailyCityReport }) {
  const periodLabel = data.period.mode === "today" ? "Today" : "Last 24 hours";

  return (
    <Document>
      {/* ============ PAGE 1 : COVER + EXECUTIVE SUMMARY ============ */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.coverTitle}>MaintInsight</Text>
        <Text style={styles.coverCity}>{data.city.name} — Daily report</Text>
        <Text style={styles.coverMeta}>
          Generated on{" "}
          {format(new Date(data.period.generatedAt), "d MMMM yyyy 'at' HH:mm", {
            locale: enUS,
          })}
        </Text>
        <Text style={styles.coverMeta}>Covered period: {periodLabel}</Text>

        <View style={styles.coverDivider} />

        {has(data, "summary") && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Executive summary</Text>
            <View style={styles.cardsRow}>
              <View style={styles.card}>
                <Text style={styles.cardLabel}>Plants</Text>
                <Text style={styles.cardValue}>{data.summary.plants}</Text>
              </View>
              <View style={styles.card}>
                <Text style={styles.cardLabel}>Equipment</Text>
                <Text style={styles.cardValue}>{data.summary.equipment}</Text>
              </View>
              <View style={styles.card}>
                <Text style={styles.cardLabel}>Health rate</Text>
                <Text style={styles.cardValue}>{data.summary.healthRate}%</Text>
              </View>
              <View style={styles.card}>
                <Text style={styles.cardLabel}>Critical equipment</Text>
                <Text style={[styles.cardValue, { color: "#dc2626" }]}>
                  {data.summary.criticalEquipment}
                </Text>
              </View>
              <View style={styles.card}>
                <Text style={styles.cardLabel}>Open inspections</Text>
                <Text style={styles.cardValue}>
                  {data.summary.openInspections}
                </Text>
              </View>
              <View style={styles.card}>
                <Text style={styles.cardLabel}>Alerts / Alarms</Text>
                <Text style={styles.cardValue}>
                  {data.summary.alerts} / {data.summary.alarms}
                </Text>
              </View>
              <View style={styles.card}>
                <Text style={styles.cardLabel}>Recorded measurements</Text>
                <Text style={styles.cardValue}>
                  {data.summary.measurementsToday}
                </Text>
              </View>
            </View>
          </View>
        )}

        {data.recommendations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommendations / actions</Text>
            {data.recommendations.map((r, i) => (
              <View style={styles.recoRow} key={i}>
                <Text style={styles.recoText}>{r}</Text>
              </View>
            ))}
          </View>
        )}

        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `${data.city.name} — ${pageNumber} / ${totalPages}`
          }
          fixed
        />
      </Page>

      {/* ============ PAGE 2 : CHARTS / CITY HEALTH OVERVIEW ============ */}
      {has(data, "charts") && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>Overview — city health</Text>

          <View style={styles.section}>
            <Text style={{ fontSize: 10, marginBottom: 4 }}>
              Equipment status distribution
            </Text>
            <Image
              src={buildStatusChartUrl(data.equipmentStatus)}
              style={styles.chart}
            />
          </View>

          {has(data, "plants") && data.plants.length > 0 && (
            <View style={styles.section}>
              <Text style={{ fontSize: 10, marginBottom: 4 }}>
                Health rate by plant
              </Text>
              <Image
                src={buildHealthByPlantChartUrl(data.plants)}
                style={styles.chartWide}
              />
            </View>
          )}

          {has(data, "measurements") && data.measurements.length > 0 && (
            <View style={styles.section}>
              <Text style={{ fontSize: 10, marginBottom: 4 }}>
                Measurements by type
              </Text>
              <Image
                src={buildMeasurementsChartUrl(data.measurements)}
                style={styles.chartWide}
              />
            </View>
          )}

          <Text
            style={styles.footer}
            render={({ pageNumber, totalPages }) =>
              `${data.city.name} — ${pageNumber} / ${totalPages}`
            }
            fixed
          />
        </Page>
      )}

      {/* ============ PAGE 3: PLANTS + STATUS ============ */}
      {has(data, "plants") && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>Overview of plants</Text>
          <View style={styles.table}>
            <View style={styles.headerRow}>
              <Text style={styles.cell}>Plant</Text>
              <Text style={styles.cell}>Equipment</Text>
              <Text style={styles.cell}>Health</Text>
              <Text style={styles.cell}>Critical</Text>
              <Text style={styles.cell}>Inspections</Text>
            </View>
            {data.plants.map((p) => (
              <View style={styles.row} key={p.id}>
                <Text style={styles.cell}>{p.name}</Text>
                <Text style={styles.cell}>{p.equipmentCount}</Text>
                <Text style={styles.cell}>{p.healthRate}%</Text>
                <Text
                  style={[
                    styles.cell,
                    p.critical > 0 ? { color: "#dc2626" } : undefined,
                  ]}
                >
                  {p.critical}
                </Text>
                <Text style={styles.cell}>{p.inspections}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.section, { marginTop: 20 }]}>
            <Text style={styles.sectionTitle}>Equipment status</Text>
            <View style={styles.table}>
              <View style={styles.headerRow}>
                <Text style={styles.cell}>Statut</Text>
                <Text style={styles.cell}>Nombre</Text>
              </View>
              {data.equipmentStatus.map((s) => (
                <View style={styles.row} key={s.status}>
                  <Text
                    style={[styles.cell, { color: STATUS_COLORS[s.status] }]}
                  >
                    {STATUS_LABELS[s.status] ?? s.status}
                  </Text>
                  <Text style={styles.cell}>{s.count}</Text>
                </View>
              ))}
            </View>
          </View>

          <Text
            style={styles.footer}
            render={({ pageNumber, totalPages }) =>
              `${data.city.name} — ${pageNumber} / ${totalPages}`
            }
            fixed
          />
        </Page>
      )}

      {/* ============ PAGE 4: CRITICAL EQUIPMENT ============ */}
      {has(data, "criticalEquipment") && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>Critical equipment</Text>
          {data.criticalEquipment.length === 0 ? (
            <Text>No critical equipment during the period.</Text>
          ) : (
            <View style={styles.table}>
              <View style={styles.headerRow}>
                <Text style={styles.cell}>Code</Text>
                <Text style={[styles.cell, { flex: 1.5 }]}>Nom</Text>
                <Text style={styles.cell}>Plant</Text>
                <Text style={styles.cell}>Statut</Text>
                <Text style={styles.cell}>Health</Text>
                <Text style={styles.cell}>Last inspection</Text>
              </View>
              {data.criticalEquipment.map((e) => (
                <View style={styles.row} key={e.id}>
                  <Text style={styles.cell}>{e.code ?? "—"}</Text>
                  <Text style={[styles.cell, { flex: 1.5 }]}>{e.name}</Text>
                  <Text style={styles.cell}>{e.plantName}</Text>
                  <Text
                    style={[styles.cell, { color: STATUS_COLORS[e.status] }]}
                  >
                    {STATUS_LABELS[e.status] ?? e.status}
                  </Text>
                  <Text style={styles.cell}>{e.healthRate}%</Text>
                  <Text style={styles.cell}>
                    {e.lastInspection
                      ? format(e.lastInspection, "dd/MM/yyyy")
                      : "—"}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <Text
            style={styles.footer}
            render={({ pageNumber, totalPages }) =>
              `${data.city.name} — ${pageNumber} / ${totalPages}`
            }
            fixed
          />
        </Page>
      )}

      {/* ============ PAGE 5 : INSPECTIONS ============ */}
      {has(data, "inspections") && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>Inspections</Text>

          <View style={styles.cardsRow}>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Completed</Text>
              <Text style={styles.cardValue}>{data.inspections.completed}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Pending</Text>
              <Text style={styles.cardValue}>{data.inspections.pending}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>With critical findings</Text>
              <Text style={[styles.cardValue, { color: "#dc2626" }]}>
                {data.inspections.critical}
              </Text>
            </View>
          </View>

          <View style={[styles.section, { marginTop: 12 }]}>
            <Text style={{ fontSize: 11, marginBottom: 8, fontWeight: 700 }}>
              Recent inspections
            </Text>
            <View style={styles.table}>
              <View style={styles.headerRow}>
                <Text style={styles.cell}>Reference</Text>
                <Text style={styles.cell}>Date</Text>
                <Text style={styles.cell}>Inspector</Text>
                <Text style={styles.cell}>Statut</Text>
                <Text style={styles.cell}>Equipment</Text>
              </View>
              {data.inspections.recent.map((i) => (
                <View style={styles.row} key={i.id}>
                  <Text style={styles.cell}>{i.reference ?? `#${i.id}`}</Text>
                  <Text style={styles.cell}>
                    {format(i.inspectionDate, "dd/MM/yyyy")}
                  </Text>
                  <Text style={styles.cell}>{i.performedBy}</Text>
                  <Text style={styles.cell}>{i.status}</Text>
                  <Text style={styles.cell}>{i.equipmentCount}</Text>
                </View>
              ))}
            </View>
          </View>

          <Text
            style={styles.footer}
            render={({ pageNumber, totalPages }) =>
              `${data.city.name} — ${pageNumber} / ${totalPages}`
            }
            fixed
          />
        </Page>
      )}

      {/* ============ PAGE 6: MEASUREMENTS & ALERTS ============ */}
      {(has(data, "measurements") || has(data, "alerts")) && (
        <Page size="A4" style={styles.page}>
          {has(data, "measurements") && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Measurements & anomalies</Text>
              <View style={styles.table}>
                <View style={styles.headerRow}>
                  <Text style={styles.cell}>Type</Text>
                  <Text style={styles.cell}>Total</Text>
                  <Text style={styles.cell}>Abnormal</Text>
                </View>
                {data.measurements.map((m) => (
                  <View style={styles.row} key={m.type}>
                    <Text style={styles.cell}>{m.type}</Text>
                    <Text style={styles.cell}>{m.count}</Text>
                    <Text
                      style={[
                        styles.cell,
                        m.abnormal > 0 ? { color: "#dc2626" } : undefined,
                      ]}
                    >
                      {m.abnormal}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {has(data, "alerts") && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Alerts & alarms</Text>
              <View style={styles.table}>
                <View style={styles.headerRow}>
                  <Text style={styles.cell}>Type</Text>
                  <Text style={styles.cell}>Nombre</Text>
                </View>
                {data.alerts.map((a) => (
                  <View style={styles.row} key={a.type}>
                    <Text
                      style={[
                        styles.cell,
                        { color: a.type === "ALARM" ? "#dc2626" : "#d97706" },
                      ]}
                    >
                      {a.type === "ALARM" ? "Alarm" : "Alert"}
                    </Text>
                    <Text style={styles.cell}>{a.count}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <Text
            style={styles.footer}
            render={({ pageNumber, totalPages }) =>
              `${data.city.name} — ${pageNumber} / ${totalPages}`
            }
            fixed
          />
        </Page>
      )}
    </Document>
  );
}
