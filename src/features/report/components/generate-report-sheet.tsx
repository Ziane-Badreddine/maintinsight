"use client";

import { useState, useTransition } from "react";
import {
  ExternalLinkIcon,
  FileTextIcon,
  Loader2,
  RefreshCcwIcon,
} from "lucide-react";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/toast";

import {
  REPORT_SECTIONS,
  type ReportPeriod,
  type ReportSection,
} from "../types";
import { generateReportAction } from "../actions/generate-report-action";
import { INSPECTION_SHEET_CLASS } from "@/features/inspection/components/sheets/inspection-sheet-styles";
import { Report } from "../../../../prisma/generated/prisma/client";
import { useRouter } from "next/navigation";

interface GenerateReportSheetProps {
  cityId: number;
  cityName: string;
  todayReport: Report | null;
}

export function GenerateReportSheet({
  cityId,
  cityName,
  todayReport,
}: GenerateReportSheetProps) {
  const [open, setOpen] = useState(false);
  const [period, setPeriod] = useState<ReportPeriod>("today");
  const [sections, setSections] = useState<Set<ReportSection>>(
    new Set(REPORT_SECTIONS.map((s) => s.id)),
  );
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function toggleSection(id: ReportSection) {
    setSections((prev) => {
      const next = new Set(prev);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function runGenerate(force: boolean) {
    startTransition(async () => {
      const result = await generateReportAction({
        cityId,
        period,
        sections: Array.from(sections),
      });

      if (!result.success) {
        toast.add({
          type: "error",
          title: force
            ? "Could not regenerate report"
            : "Could not generate report",
          description: String(result.error),
        });
        return;
      }

      toast.add({
        type: "success",
        title: force ? "Report regenerated" : "Report generated",
        actionProps: result.report.blobUrl
          ? {
              children: "Open",
              onClick: () => window.open(result.report.blobUrl!, "_blank"),
            }
          : undefined,
      });
      router.refresh();
      setOpen(false);
    });
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button>
            <FileTextIcon className="size-4" />
            Generate report
          </Button>
        }
      ></SheetTrigger>

      <SheetContent side="right" className={INSPECTION_SHEET_CLASS}>
        <SheetHeader>
          <SheetTitle>
            Daily report — {format(new Date(), "d MMMM yyyy", { locale: enUS })}
          </SheetTitle>
          <SheetDescription>{cityName}</SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 px-4">
          <div className="flex flex-col gap-6 pb-4">
            <FieldGroup>
              <Field>
                <FieldLabel>Period</FieldLabel>
                <RadioGroup
                  value={period}
                  onValueChange={(v) => setPeriod(v as ReportPeriod)}
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="today" id="period-today" />
                    <FieldLabel htmlFor="period-today" className="font-normal">
                      Today
                    </FieldLabel>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="last24h" id="period-24h" />
                    <FieldLabel htmlFor="period-24h" className="font-normal">
                      Last 24 hours
                    </FieldLabel>
                  </div>
                </RadioGroup>
                <FieldDescription>
                  The range of activity included in the report.
                </FieldDescription>
              </Field>
              <FieldSeparator />

              <Field>
                <FieldLabel>Content</FieldLabel>
                <div className="space-y-2">
                  {REPORT_SECTIONS.map((section) => (
                    <div key={section.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`section-${section.id}`}
                        checked={sections.has(section.id)}
                        onCheckedChange={() => toggleSection(section.id)}
                      />
                      <FieldLabel
                        htmlFor={`section-${section.id}`}
                        className="font-normal"
                      >
                        {section.label}
                      </FieldLabel>
                    </div>
                  ))}
                </div>
                <FieldDescription>
                  Sections included in the generated PDF.
                </FieldDescription>
              </Field>
            </FieldGroup>
          </div>
        </ScrollArea>
        {todayReport &&
          todayReport.status === "COMPLETED" &&
          todayReport.blobUrl && (
            <a
              href={todayReport.blobUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4"
            >
              <Item variant="outline">
                <ItemMedia variant="icon">
                  <FileTextIcon className="size-4" />
                </ItemMedia>

                <ItemContent>
                  <ItemTitle>Report already generated today</ItemTitle>
                  <ItemDescription>
                    {todayReport.trigger === "AUTO"
                      ? "Auto-generated"
                      : "Manually generated"}{" "}
                    · {format(new Date(todayReport.date), "HH:mm")}
                  </ItemDescription>
                </ItemContent>
                <ItemActions>
                  {isPending ? (
                    <RefreshCcwIcon className="size-4 animate-spin" />
                  ) : (
                    <ExternalLinkIcon className="size-4" />
                  )}
                </ItemActions>
              </Item>
            </a>
          )}

        <SheetFooter className="flex-row gap-2 pb-4">
          <div className="ml-auto flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="flex-1"
              onClick={() => runGenerate(Boolean(todayReport))}
              disabled={isPending || sections.size === 0}
            >
              {isPending && <Loader2 className="mr-1.5 size-4 animate-spin" />}
              {todayReport ? "Regenerate" : "Generate"}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
