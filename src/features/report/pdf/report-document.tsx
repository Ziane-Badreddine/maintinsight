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

// Kept as pure grayscale weights (0 = black) so the report reads like a
// typeset document rather than a UI dashboard; ALERT/ALARM keep a restrained
// amount of ink since they're the one place color earns its keep.
const STATUS_INK: Record<string, string> = {
  NOT_MONITORED: "#6b6b6b",
  STOPPED: "#6b6b6b",
  GOOD: "#1a1a1a",
  ACCEPTABLE: "#1a1a1a",
  ALERT: "#9a3b12",
  ALARM: "#8a1414",
};

const RULE = "#1a1a1a";
const HAIRLINE = "#bdbdbd";

const styles = StyleSheet.create({
  page: {
    paddingTop: 64,
    paddingBottom: 56,
    paddingHorizontal: 72, // ~1in margins, LaTeX article default
    fontSize: 10.5,
    fontFamily: "Times-Roman",
    color: "#1a1a1a",
    lineHeight: 1.35,
  },

  // ---------- running header (fancyhdr-style) ----------
  runningHeader: {
    position: "absolute",
    top: 28,
    left: 72,
    right: 72,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: "#555555",
    borderBottom: `0.75 solid ${HAIRLINE}`,
    paddingBottom: 4,
  },
  runningHeaderSmallCaps: {
    fontFamily: "Times-Bold",
    fontSize: 8,
    letterSpacing: 0.6,
  },

  // ---------- title page ----------
  titleBlock: { marginTop: 140, marginBottom: 36, textAlign: "center" },
  kicker: {
    fontSize: 9,
    letterSpacing: 2,
    color: "#555555",
    marginBottom: 14,
    fontFamily: "Times-Bold",
  },
  title: {
    fontSize: 25,
    fontFamily: "Times-Bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Times-Italic",
    color: "#333333",
    marginBottom: 24,
  },
  titleRule: {
    borderBottom: `1 solid ${RULE}`,
    width: 160,
    alignSelf: "center",
    marginBottom: 22,
  },
  metaLine: { fontSize: 9.5, color: "#444444", marginBottom: 3 },

  abstractBox: {
    marginTop: 40,
    marginBottom: 32,
    marginHorizontal: 28,
    paddingTop: 14,
    borderTop: `0.75 solid ${HAIRLINE}`,
  },
  abstractHeading: {
    fontSize: 9,
    fontFamily: "Times-Bold",
    letterSpacing: 1.4,
    textAlign: "center",
    marginBottom: 8,
  },
  abstractBody: {
    fontSize: 9.5,
    textAlign: "justify",
    color: "#2b2b2b",
  },

  // ---------- section headings ----------
  section: { marginBottom: 22 },
  sectionTitle: {
    fontSize: 12.5,
    fontFamily: "Times-Bold",
    marginBottom: 12,
    marginTop: 4,
  },
  sectionNumber: { fontFamily: "Times-Bold" },
  subsectionTitle: {
    fontSize: 10.5,
    fontFamily: "Times-Bold",
    marginTop: 10,
    marginBottom: 6,
  },
  captionLabel: {
    fontSize: 8.5,
    fontFamily: "Times-Italic",
    color: "#555555",
    marginTop: 4,
    marginBottom: 2,
  },

  // ---------- definition-list style key/value stats (replaces "cards") ----------
  statGrid: { flexDirection: "row", flexWrap: "wrap" },
  statItem: {
    width: "50%",
    flexDirection: "row",
    marginBottom: 9,
    paddingRight: 10,
  },
  statLabel: {
    fontSize: 9.5,
    fontFamily: "Times-Italic",
    color: "#3a3a3a",
    width: "62%",
  },
  statValue: {
    fontSize: 10.5,
    fontFamily: "Times-Bold",
    width: "38%",
    textAlign: "right",
  },

  chart: { width: 300, height: 176, marginBottom: 2, alignSelf: "center" },
  chartWide: { width: "100%", height: 156, marginBottom: 2 },

  // ---------- ruled tables (horizontal + vertical rules, LaTeX \hline/\vline) ----------
  table: {
    display: "flex",
    width: "auto",
    marginBottom: 4,
    border: `0.9 solid ${RULE}`,
  },
  headerRow: {
    flexDirection: "row",
    borderBottom: `0.9 solid ${RULE}`,
    paddingVertical: 5,
    fontFamily: "Times-Bold",
    fontSize: 9,
  },
  row: {
    flexDirection: "row",
    borderBottom: `0.5 solid ${HAIRLINE}`,
    paddingVertical: 5,
    fontSize: 9.5,
  },
  lastRow: { borderBottom: "none" },
  cell: {
    flex: 1,
    paddingHorizontal: 6,
    borderRight: `0.5 solid ${HAIRLINE}`,
  },
  cellRight: {
    flex: 1,
    paddingHorizontal: 6,
    textAlign: "right",
    borderRight: `0.5 solid ${HAIRLINE}`,
  },
  cellLast: { borderRight: "none" },
  emptyTableBox: {
    border: `0.9 solid ${RULE}`,
    paddingVertical: 16,
    marginBottom: 4,
  },
  emptyTableText: {
    fontFamily: "Times-Italic",
    fontSize: 9.5,
    color: "#555555",
    textAlign: "center",
  },

  recoRow: { flexDirection: "row", marginBottom: 7, paddingLeft: 2 },
  recoBullet: { width: 14, fontFamily: "Times-Bold" },
  recoText: { fontSize: 10, flex: 1, textAlign: "justify" },

  footer: {
    position: "absolute",
    bottom: 26,
    left: 72,
    right: 72,
    fontSize: 8.5,
    color: "#666666",
    textAlign: "center",
  },
  footerRule: {
    position: "absolute",
    bottom: 40,
    left: 72,
    right: 72,
    borderBottom: `0.5 solid ${HAIRLINE}`,
  },
});

function has(data: DailyCityReport, section: string) {
  return data.sections.includes(section as never);
}

// LaTeX-esque section counter: increments once per rendered section so
// headings read "1 Executive Summary", "2 City Health Overview", etc.,
// regardless of which optional sections are enabled for this report.
function makeCounter() {
  let n = 0;
  return () => {
    n += 1;
    return n;
  };
}

function EmptyNote({ text }: { text: string }) {
  return (
    <View style={styles.emptyTableBox}>
      <Text style={styles.emptyTableText}>{text}</Text>
    </View>
  );
}

function RunningHeader({
  cityName,
  label,
}: {
  cityName: string;
  label: string;
}) {
  return (
    <View style={styles.runningHeader} fixed>
      <Text style={styles.runningHeaderSmallCaps}>
        {cityName.toUpperCase()}
      </Text>
      <Text>{label}</Text>
    </View>
  );
}

function Footer({ cityName }: { cityName: string }) {
  return (
    <>
      <View style={styles.footerRule} fixed />
      <Text
        style={styles.footer}
        render={({ pageNumber, totalPages }) =>
          `${cityName} — Daily Report  ·  ${pageNumber} / ${totalPages}`
        }
        fixed
      />
    </>
  );
}

export function ReportDocument({ data }: { data: DailyCityReport }) {
  const periodLabel =
    data.period.mode === "today" ? "today" : "the last 24 hours";
  const sectionNo = makeCounter();

  return (
    <Document>
      {/* ============ PAGE 1 : TITLE PAGE + EXECUTIVE SUMMARY ============ */}
      <Page size="A4" style={styles.page}>
        <View style={styles.titleBlock}>
          <Text style={styles.kicker}>
            MAINTINSIGHT · DAILY OPERATIONS REPORT
          </Text>
          <Text style={styles.title}>{data.city.name}</Text>
          <Text style={styles.subtitle}>
            Equipment Health &amp; Inspection Summary
          </Text>
          <View style={styles.titleRule} />
          <Text style={styles.metaLine}>
            Generated{" "}
            {format(
              new Date(data.period.generatedAt),
              "d MMMM yyyy 'at' HH:mm",
              {
                locale: enUS,
              },
            )}
          </Text>
          <Text style={styles.metaLine}>
            Covering {periodLabel} · {data.summary.plants} plant
            {data.summary.plants === 1 ? "" : "s"} · {data.summary.equipment}{" "}
            pieces of equipment
          </Text>
        </View>

        {has(data, "summary") && (
          <View style={styles.abstractBox}>
            <Text style={styles.abstractHeading}>SUMMARY</Text>
            <Text style={styles.abstractBody}>
              {data.summary.healthRate}% of monitored equipment across{" "}
              {data.summary.plants} plant{data.summary.plants === 1 ? "" : "s"}{" "}
              is in good or acceptable condition, with{" "}
              {data.summary.criticalEquipment} unit
              {data.summary.criticalEquipment === 1 ? "" : "s"} flagged
              critical. {data.summary.openInspections} inspection
              {data.summary.openInspections === 1
                ? " remains"
                : "s remain"}{" "}
              open, and {data.summary.alerts} alert
              {data.summary.alerts === 1 ? "" : "s"} and {data.summary.alarms}{" "}
              alarm{data.summary.alarms === 1 ? "" : "s"} were recorded against{" "}
              {data.summary.measurementsToday} measurement
              {data.summary.measurementsToday === 1 ? "" : "s"} taken.
            </Text>
          </View>
        )}

        {has(data, "summary") && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Text style={styles.sectionNumber}>{sectionNo()} </Text>
              Executive Summary
            </Text>
            <View style={styles.statGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Plants</Text>
                <Text style={styles.statValue}>{data.summary.plants}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Equipment</Text>
                <Text style={styles.statValue}>{data.summary.equipment}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Health rate</Text>
                <Text style={styles.statValue}>{data.summary.healthRate}%</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Critical equipment</Text>
                <Text style={[styles.statValue, { color: STATUS_INK.ALARM }]}>
                  {data.summary.criticalEquipment}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Open inspections</Text>
                <Text style={styles.statValue}>
                  {data.summary.openInspections}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Alerts / alarms</Text>
                <Text style={styles.statValue}>
                  {data.summary.alerts} / {data.summary.alarms}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Recorded measurements</Text>
                <Text style={styles.statValue}>
                  {data.summary.measurementsToday}
                </Text>
              </View>
            </View>
          </View>
        )}

        {data.recommendations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.subsectionTitle}>Recommendations</Text>
            {data.recommendations.map((r, i) => (
              <View style={styles.recoRow} key={i}>
                <Text style={styles.recoBullet}>{i + 1}.</Text>
                <Text style={styles.recoText}>{r}</Text>
              </View>
            ))}
          </View>
        )}

        <Footer cityName={data.city.name} />
      </Page>

      {/* ============ PAGE 2 : CHARTS / CITY HEALTH OVERVIEW ============ */}
      {has(data, "charts") && (
        <Page size="A4" style={styles.page}>
          <RunningHeader
            cityName={data.city.name}
            label="City Health Overview"
          />
          <Text style={styles.sectionTitle}>
            <Text style={styles.sectionNumber}>{sectionNo()} </Text>
            City Health Overview
          </Text>

          <View style={styles.section}>
            <Image
              src={buildStatusChartUrl(data.equipmentStatus)}
              style={styles.chart}
            />
            <Text style={[styles.captionLabel, { textAlign: "center" }]}>
              Figure — Equipment status distribution
            </Text>
          </View>

          {has(data, "plants") && data.plants.length > 0 && (
            <View style={styles.section}>
              <Image
                src={buildHealthByPlantChartUrl(data.plants)}
                style={styles.chartWide}
              />
              <Text style={styles.captionLabel}>
                Figure — Health rate by plant
              </Text>
            </View>
          )}

          {has(data, "measurements") && data.measurements.length > 0 && (
            <View style={styles.section}>
              <Image
                src={buildMeasurementsChartUrl(data.measurements)}
                style={styles.chartWide}
              />
              <Text style={styles.captionLabel}>
                Figure — Measurements by type
              </Text>
            </View>
          )}

          <Footer cityName={data.city.name} />
        </Page>
      )}

      {/* ============ PAGE 3: PLANTS + STATUS ============ */}
      {has(data, "plants") && (
        <Page size="A4" style={styles.page}>
          <RunningHeader
            cityName={data.city.name}
            label="Plants &amp; Equipment Status"
          />
          <Text style={styles.sectionTitle}>
            <Text style={styles.sectionNumber}>{sectionNo()} </Text>
            Overview of Plants
          </Text>
          {data.plants.length === 0 ? (
            <EmptyNote text="No plants recorded for this city." />
          ) : (
            <View style={styles.table}>
              <View style={styles.headerRow}>
                <Text style={styles.cell}>Plant</Text>
                <Text style={styles.cellRight}>Equipment</Text>
                <Text style={styles.cellRight}>Health</Text>
                <Text style={styles.cellRight}>Critical</Text>
                <Text style={[styles.cellRight, styles.cellLast]}>
                  Inspections
                </Text>
              </View>
              {data.plants.map((p) => (
                <View style={styles.row} key={p.id}>
                  <Text style={styles.cell}>{p.name}</Text>
                  <Text style={styles.cellRight}>{p.equipmentCount}</Text>
                  <Text style={styles.cellRight}>{p.healthRate}%</Text>
                  <Text
                    style={[
                      styles.cellRight,
                      p.critical > 0
                        ? { color: STATUS_INK.ALARM, fontFamily: "Times-Bold" }
                        : undefined,
                    ]}
                  >
                    {p.critical}
                  </Text>
                  <Text style={[styles.cellRight, styles.cellLast]}>
                    {p.inspections}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <View style={[styles.section, { marginTop: 22 }]}>
            <Text style={styles.subsectionTitle}>Equipment Status</Text>
            {data.equipmentStatus.length === 0 ? (
              <EmptyNote text="No equipment status data available." />
            ) : (
              <View style={styles.table}>
                <View style={styles.headerRow}>
                  <Text style={styles.cell}>Status</Text>
                  <Text style={[styles.cellRight, styles.cellLast]}>Count</Text>
                </View>
                {data.equipmentStatus.map((s) => (
                  <View style={styles.row} key={s.status}>
                    <Text
                      style={[styles.cell, { color: STATUS_INK[s.status] }]}
                    >
                      {STATUS_LABELS[s.status] ?? s.status}
                    </Text>
                    <Text style={[styles.cellRight, styles.cellLast]}>
                      {s.count}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          <Footer cityName={data.city.name} />
        </Page>
      )}

      {/* ============ PAGE 4: CRITICAL EQUIPMENT ============ */}
      {has(data, "criticalEquipment") && (
        <Page size="A4" style={styles.page}>
          <RunningHeader cityName={data.city.name} label="Critical Equipment" />
          <Text style={styles.sectionTitle}>
            <Text style={styles.sectionNumber}>{sectionNo()} </Text>
            Critical Equipment
          </Text>
          {data.criticalEquipment.length === 0 ? (
            <EmptyNote text="No critical equipment during the period." />
          ) : (
            <>
              <View style={styles.table}>
                <View style={styles.headerRow}>
                  <Text style={styles.cell}>Code</Text>
                  <Text style={[styles.cell, { flex: 1.6 }]}>Name</Text>
                  <Text style={styles.cell}>Plant</Text>
                  <Text style={styles.cell}>Status</Text>
                  <Text style={styles.cellRight}>Health</Text>
                  <Text style={[styles.cellRight, styles.cellLast]}>
                    Last inspection
                  </Text>
                </View>
                {data.criticalEquipment.map((e) => (
                  <View style={styles.row} key={e.id}>
                    <Text style={styles.cell}>{e.code ?? "—"}</Text>
                    <Text style={[styles.cell, { flex: 1.6 }]}>{e.name}</Text>
                    <Text style={styles.cell}>{e.plantName}</Text>
                    <Text
                      style={[styles.cell, { color: STATUS_INK[e.status] }]}
                    >
                      {STATUS_LABELS[e.status] ?? e.status}
                    </Text>
                    <Text style={styles.cellRight}>{e.healthRate}%</Text>
                    <Text style={[styles.cellRight, styles.cellLast]}>
                      {e.lastInspection
                        ? format(e.lastInspection, "dd/MM/yyyy")
                        : "—"}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          )}

          <Footer cityName={data.city.name} />
        </Page>
      )}

      {/* ============ PAGE 5 : INSPECTIONS ============ */}
      {has(data, "inspections") && (
        <Page size="A4" style={styles.page}>
          <RunningHeader cityName={data.city.name} label="Inspections" />
          <Text style={styles.sectionTitle}>
            <Text style={styles.sectionNumber}>{sectionNo()} </Text>
            Inspections
          </Text>

          <View style={styles.statGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Completed</Text>
              <Text style={styles.statValue}>{data.inspections.completed}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Pending</Text>
              <Text style={styles.statValue}>{data.inspections.pending}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>With critical findings</Text>
              <Text style={[styles.statValue, { color: STATUS_INK.ALARM }]}>
                {data.inspections.critical}
              </Text>
            </View>
          </View>

          <View style={[styles.section, { marginTop: 10 }]}>
            <Text style={styles.subsectionTitle}>Recent Inspections</Text>
            {data.inspections.recent.length === 0 ? (
              <EmptyNote text="No inspections recorded for this period." />
            ) : (
              <View style={styles.table}>
                <View style={styles.headerRow}>
                  <Text style={styles.cell}>Reference</Text>
                  <Text style={styles.cell}>Date</Text>
                  <Text style={styles.cell}>Inspector</Text>
                  <Text style={styles.cell}>Status</Text>
                  <Text style={[styles.cellRight, styles.cellLast]}>
                    Equipment
                  </Text>
                </View>
                {data.inspections.recent.map((i) => (
                  <View style={styles.row} key={i.id}>
                    <Text style={styles.cell}>{i.reference ?? `#${i.id}`}</Text>
                    <Text style={styles.cell}>
                      {format(i.inspectionDate, "dd/MM/yyyy")}
                    </Text>
                    <Text style={styles.cell}>{i.performedBy}</Text>
                    <Text style={styles.cell}>{i.status}</Text>
                    <Text style={[styles.cellRight, styles.cellLast]}>
                      {i.equipmentCount}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          <Footer cityName={data.city.name} />
        </Page>
      )}

      {/* ============ PAGE 6: MEASUREMENTS & ALERTS ============ */}
      {(has(data, "measurements") || has(data, "alerts")) && (
        <Page size="A4" style={styles.page}>
          <RunningHeader
            cityName={data.city.name}
            label="Measurements &amp; Alerts"
          />

          {has(data, "measurements") && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <Text style={styles.sectionNumber}>{sectionNo()} </Text>
                Measurements &amp; Anomalies
              </Text>
              {data.measurements.length === 0 ? (
                <EmptyNote text="No measurements recorded for this period." />
              ) : (
                <View style={styles.table}>
                  <View style={styles.headerRow}>
                    <Text style={styles.cell}>Type</Text>
                    <Text style={styles.cellRight}>Total</Text>
                    <Text style={[styles.cellRight, styles.cellLast]}>
                      Abnormal
                    </Text>
                  </View>
                  {data.measurements.map((m) => (
                    <View style={styles.row} key={m.type}>
                      <Text style={styles.cell}>{m.type}</Text>
                      <Text style={styles.cellRight}>{m.count}</Text>
                      <Text
                        style={[
                          styles.cellRight,
                          styles.cellLast,
                          m.abnormal > 0
                            ? {
                                color: STATUS_INK.ALARM,
                                fontFamily: "Times-Bold",
                              }
                            : undefined,
                        ]}
                      >
                        {m.abnormal}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {has(data, "alerts") && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <Text style={styles.sectionNumber}>{sectionNo()} </Text>
                Alerts &amp; Alarms
              </Text>
              {data.alerts.length === 0 ? (
                <EmptyNote text="No alerts or alarms recorded for this period." />
              ) : (
                <View style={styles.table}>
                  <View style={styles.headerRow}>
                    <Text style={styles.cell}>Type</Text>
                    <Text style={[styles.cellRight, styles.cellLast]}>
                      Count
                    </Text>
                  </View>
                  {data.alerts.map((a) => (
                    <View style={styles.row} key={a.type}>
                      <Text
                        style={[
                          styles.cell,
                          {
                            color:
                              a.type === "ALARM"
                                ? STATUS_INK.ALARM
                                : STATUS_INK.ALERT,
                            fontFamily: "Times-Bold",
                          },
                        ]}
                      >
                        {a.type === "ALARM" ? "Alarm" : "Alert"}
                      </Text>
                      <Text style={[styles.cellRight, styles.cellLast]}>
                        {a.count}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          <Footer cityName={data.city.name} />
        </Page>
      )}
    </Document>
  );
}
