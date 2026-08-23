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

function ReportCard({
  report,
  canDelete,
  onRequestDelete,
}: {
  report: ReportRow;
  canDelete: boolean;
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
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            render={
              <a href={report.blobUrl} target="_blank" rel="noreferrer" />
            }
          >
            <DownloadIcon className="size-4" />
            Download
          </Button>
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
                    onRequestDelete={setDeleteTarget}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

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
