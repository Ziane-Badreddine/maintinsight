"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format, isSameMonth } from "date-fns";
import { enUS } from "date-fns/locale";
import {
  DownloadIcon,
  MailCheckIcon,
  Trash2Icon,
  Loader2,
  FileTextIcon,
  CalendarIcon,
  LayoutGridIcon,
  CircleCheckIcon,
  CircleAlertIcon,
  Loader2Icon,
  CalendarDaysIcon,
  ListIcon,
  EyeIcon,
  ExternalLinkIcon,
} from "lucide-react";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import { InputGroupAddon } from "@/components/ui/input-group";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { deleteReportAction } from "../actions/generate-report-action";

interface ReportRow {
  id: number;
  date: string;
  status: "GENERATING" | "COMPLETED" | "FAILED";
  trigger: "MANUAL" | "AUTO";
  blobUrl: string | null;
  // Optional: thumbnail URL (first PDF page rendered as an image).
  // Absent until the generation pipeline produces this image —
  // see note at the end of the response.
  previewUrl?: string | null;
  generatedByName: string | null;
  emailSentAt: string | null;
  error: string | null;
}

type StatusValue = "all" | ReportRow["status"];
type GroupValue = "month" | "none";

interface Option<T extends string> {
  value: T;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  iconClassName?: string;
}

const STATUS_OPTIONS: Option<StatusValue>[] = [
  { value: "all", label: "All statuses", icon: LayoutGridIcon },
  {
    value: "COMPLETED",
    label: "Completed",
    icon: CircleCheckIcon,
    iconClassName: "text-primary",
  },
  {
    value: "GENERATING",
    label: "Generating",
    icon: Loader2Icon,
    iconClassName: "animate-spin",
  },
  {
    value: "FAILED",
    label: "Failed",
    icon: CircleAlertIcon,
    iconClassName: "text-destructive",
  },
];

const GROUP_OPTIONS: Option<GroupValue>[] = [
  { value: "month", label: "Group by month", icon: CalendarDaysIcon },
  { value: "none", label: "No grouping", icon: ListIcon },
];

const STATUS_BADGE_VARIANT: Record<
  ReportRow["status"],
  "default" | "secondary" | "destructive"
> = {
  COMPLETED: "default",
  GENERATING: "secondary",
  FAILED: "destructive",
};

const STATUS_BADGE_LABEL: Record<ReportRow["status"], string> = {
  COMPLETED: "Completed",
  GENERATING: "Generating…",
  FAILED: "Failed",
};

// // Visual fallback when there is no thumbnail: gradient banner + large
// // status icon occupying the top of the card like a real preview.
// const STATUS_PREVIEW: Record<
//   ReportRow["status"],
//   { className: string; icon: React.ComponentType<{ className?: string }> }
// > = {
//   COMPLETED: {
//     className: "from-primary/15 to-primary/5 text-primary",
//     icon: FileTextIcon,
//   },
//   GENERATING: {
//     className: "from-muted to-muted/40 text-muted-foreground",
//     icon: Loader2Icon,
//   },
//   FAILED: {
//     className: "from-destructive/15 to-destructive/5 text-destructive",
//     icon: CircleAlertIcon,
//   },
// };

function generic<T extends string>() {
  return {
    itemToStringLabel: (item: Option<T>) => item.label,
    itemToStringValue: (item: Option<T>) => item.value,
    isItemEqualToValue: (a: Option<T>, b: Option<T>) => a.value === b.value,
  };
}

function FilterCombobox<T extends string>({
  placeholder,
  options,
  value,
  onValueChange,
}: {
  placeholder: string;
  options: Option<T>[];
  value: T;
  onValueChange: (value: T) => void;
}) {
  const anchorRef = useComboboxAnchor();
  const selected = options.find((o) => o.value === value) ?? null;
  const SelectedIcon = selected?.icon ?? options[0].icon;

  return (
    <Combobox<Option<T>>
      items={options}
      value={selected}
      onValueChange={(option) => option && onValueChange(option.value)}
      {...generic<T>()}
    >
      <div ref={anchorRef}>
        <ComboboxInput placeholder={placeholder} className={cn("w-[180px]")}>
          <InputGroupAddon>
            <SelectedIcon className={cn("size-4", selected?.iconClassName)} />
          </InputGroupAddon>
        </ComboboxInput>
      </div>

      <ComboboxContent anchor={anchorRef} align="start" side="bottom">
        <ComboboxEmpty>No option found.</ComboboxEmpty>
        <ComboboxList>
          {(item: Option<T>) => (
            <ComboboxItem key={item.value} value={item}>
              <item.icon className={cn("size-4", item.iconClassName)} />
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

function groupByMonth(reports: ReportRow[]) {
  const groups: { label: string; items: ReportRow[] }[] = [];

  for (const report of reports) {
    const date = new Date(report.date);
    const current = groups[groups.length - 1];

    if (current && isSameMonth(new Date(current.items[0].date), date)) {
      current.items.push(report);
    } else {
      groups.push({
        label: format(date, "MMMM yyyy", { locale: enUS }),
        items: [report],
      });
    }
  }

  return groups;
}

// Builds a stable, human-readable filename for the downloaded PDF, e.g.
// "report-2026-08-28.pdf". Falls back to the report id if the date can't
// be parsed for some reason.
function reportFileName(report: ReportRow) {
  const parsed = new Date(report.date);
  const stamp = Number.isNaN(parsed.getTime())
    ? report.id
    : format(parsed, "yyyy-MM-dd");
  return `report-${stamp}.pdf`;
}

/**
 * Note on "PDFViewer": @react-pdf/renderer's own <PDFViewer> only knows how
 * to render a <Document> tree built from React components (like
 * ReportDocument + live data) — it has no `src` prop, so it can't preview a
 * PDF that's already been generated and stored as a blob URL. Once a report
 * is generated we only have the resulting file, not the original data, so
 * previewing it here uses the browser's native PDF renderer inside an
 * <iframe>, which is the practical equivalent for an already-built file.
 */
function ReportPreviewDialog({
  report,
  onOpenChange,
}: {
  report: ReportRow | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={Boolean(report)} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[85vh] max-w-7xl! flex-col gap-0 overflow-hidden ">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>
            {report
              ? format(new Date(report.date), "EEEE d MMMM yyyy", {
                  locale: enUS,
                })
              : "Report preview"}
          </DialogTitle>
          <DialogDescription className="flex items-center justify-between gap-2">
            <span>Daily report preview</span>
            {report?.blobUrl && (
              <a
                href={report.blobUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <ExternalLinkIcon className="size-3.5" />
                Open in new tab
              </a>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 bg-muted">
          {report?.blobUrl ? (
            <iframe
              key={report.id}
              src={`${report.blobUrl}#toolbar=1`}
              title={`Report preview — ${report.date}`}
              className="h-full w-full border-0"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
              <FileTextIcon className="size-8" />
              No file available for this report yet.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ReportCard({
  report,
  canDelete,
  isDownloading,
  onView,
  onDownload,
  onRequestDelete,
}: {
  report: ReportRow;
  canDelete: boolean;
  isDownloading: boolean;
  onView: (report: ReportRow) => void;
  onDownload: (report: ReportRow) => void;
  onRequestDelete: (report: ReportRow) => void;
}) {
  return (
    <Card className="overflow-hidden py-0">
      <CardHeader className="pt-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarIcon className="size-4 text-muted-foreground" />
          {format(new Date(report.date), "EEEE d MMM", { locale: enUS })}
        </CardTitle>
        <CardDescription>
          {report.trigger === "AUTO" ? "Auto-generated" : "Manually generated"}
          {report.generatedByName ? ` · ${report.generatedByName}` : ""}
        </CardDescription>
        <CardAction>
          <Badge variant={STATUS_BADGE_VARIANT[report.status]}>
            {STATUS_BADGE_LABEL[report.status]}
          </Badge>
        </CardAction>
      </CardHeader>

      <CardContent>
        {report.status === "FAILED" && report.error ? (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {report.error}
          </p>
        ) : report.emailSentAt ? (
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <MailCheckIcon className="size-3.5" />
            Emailed at {format(new Date(report.emailSentAt), "HH:mm")}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">Not emailed</span>
        )}
      </CardContent>

      <CardFooter className="gap-2 pb-4">
        {report.blobUrl && (
          <>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onView(report)}
            >
              <EyeIcon className="size-4" />
              View
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Download report"
              disabled={isDownloading}
              onClick={() => onDownload(report)}
            >
              {isDownloading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <DownloadIcon className="size-4" />
              )}
            </Button>
          </>
        )}
        {canDelete && (
          <Button
            type="button"
            variant="destructive"
            size={"icon"}
            aria-label="Delete report"
            onClick={() => onRequestDelete(report)}
          >
            <Trash2Icon className="size-4 text-destructive" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export function ReportsGrid({
  cityId,
  reports,
  canDelete,
}: {
  cityId: number;
  reports: ReportRow[];
  canDelete: boolean;
}) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<StatusValue>("all");
  const [groupMode, setGroupMode] = useState<GroupValue>("month");
  const [deleteTarget, setDeleteTarget] = useState<ReportRow | null>(null);
  const [previewTarget, setPreviewTarget] = useState<ReportRow | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [isDeleting, startDelete] = useTransition();

  const filtered = useMemo(
    () =>
      reports.filter(
        (r) => statusFilter === "all" || r.status === statusFilter,
      ),
    [reports, statusFilter],
  );

  const groups = useMemo(
    () =>
      groupMode === "month"
        ? groupByMonth(filtered)
        : [{ label: null, items: filtered }],
    [filtered, groupMode],
  );

  function handleDelete() {
    if (!deleteTarget) return;

    startDelete(async () => {
      const result = await deleteReportAction({
        reportId: deleteTarget.id,
        cityId,
      });
      if (!result.success) {
        toast.add({
          type: "error",
          title: "Could not delete report",
          description: String(result.error),
        });
        return;
      }

      toast.add({ type: "success", title: "Report deleted" });
      setDeleteTarget(null);
      router.refresh();
    });
  }

  // A plain `<a href={blobUrl} download>` doesn't reliably force a download:
  // the `download` attribute is ignored by browsers on cross-origin URLs
  // (which is what blob storage URLs are), so it just opens the PDF in a
  // new tab instead of saving it. Fetching the file ourselves and saving it
  // as a local object URL sidesteps that and gives it a clean filename.
  async function handleDownload(report: ReportRow) {
    if (!report.blobUrl) return;

    setDownloadingId(report.id);
    try {
      const response = await fetch(report.blobUrl);
      if (!response.ok) throw new Error(`Request failed (${response.status})`);

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = reportFileName(report);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    } catch {
      toast.add({
        type: "error",
        title: "Couldn't download directly",
        description: "Opening the file in a new tab instead.",
      });
      window.open(report.blobUrl, "_blank", "noreferrer");
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <FilterCombobox
          placeholder="Status"
          options={STATUS_OPTIONS}
          value={statusFilter}
          onValueChange={setStatusFilter}
        />
        <FilterCombobox
          placeholder="Group by"
          options={GROUP_OPTIONS}
          value={groupMode}
          onValueChange={setGroupMode}
        />

        <span className="ml-auto text-sm text-muted-foreground">
          {filtered.length} report{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-16 text-center">
          <FileTextIcon className="size-8 text-muted-foreground" />
          <p className="text-sm font-medium">No reports found</p>
          <p className="text-sm text-muted-foreground">
            {reports.length === 0
              ? "Generate the first daily report for this city."
              : "Try a different filter."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map((group, i) => (
            <div key={group.label ?? i} className="flex flex-col gap-3">
              {group.label && (
                <h2 className="text-sm font-medium capitalize text-muted-foreground">
                  {group.label}
                </h2>
              )}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {group.items.map((report) => (
                  <ReportCard
                    key={report.id}
                    report={report}
                    canDelete={canDelete}
                    isDownloading={downloadingId === report.id}
                    onView={setPreviewTarget}
                    onDownload={handleDownload}
                    onRequestDelete={setDeleteTarget}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <ReportPreviewDialog
        report={previewTarget}
        onOpenChange={(open) => {
          if (!open) setPreviewTarget(null);
        }}
      />

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this report?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `The report for ${format(new Date(deleteTarget.date), "dd MMM yyyy")} will be permanently removed from storage.`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isDeleting}
              onClick={handleDelete}
            >
              {isDeleting && <Loader2 className="mr-1.5 size-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
