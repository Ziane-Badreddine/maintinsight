// features/auth/components/settings/security/backup-codes-item.tsx
"use client";

import { useState } from "react";
import {
  ChevronDown,
  Check,
  Copy,
  Download,
  KeyRound,
  MoreHorizontal,
  RotateCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { cn } from "@/lib/utils";

import { RegenerateBackupCodesDialog } from "./regenerate-backup-codes-dialog";

interface BackupCodesItemProps {
  backupCodes: string[] | null;
  onBackupCodesGenerated: (codes: string[]) => void;
}

export function BackupCodesItem({
  backupCodes,
  onBackupCodesGenerated,
}: BackupCodesItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [regenerateOpen, setRegenerateOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  function copyBackupCodes() {
    if (!backupCodes) return;
    navigator.clipboard.writeText(backupCodes.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadBackupCodes() {
    if (!backupCodes) return;
    const blob = new Blob([backupCodes.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "backup-codes.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <Collapsible
        open={expanded}
        onOpenChange={setExpanded}
        render={
          <Item className="flex-col items-stretch px-0">
            <div className="flex w-full items-center gap-2.5">
              <ItemMedia>
                <KeyRound className="size-5 text-muted-foreground" />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>Backup codes</ItemTitle>
                <ItemDescription>
                  {backupCodes
                    ? `${backupCodes.length} single-use codes generated this session.`
                    : "Regenerate to get a new set of codes."}
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button size="icon" variant="ghost">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    }
                  ></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.preventDefault();
                        setTimeout(() => setRegenerateOpen(true), 0);
                      }}
                    >
                      <RotateCw className="size-4" />
                      Regenerate
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <CollapsibleTrigger
                  render={
                    <Button size="icon" variant="ghost" disabled={!backupCodes}>
                      <ChevronDown
                        className={cn(
                          "size-4 transition-transform",
                          expanded && "rotate-180",
                        )}
                      />
                    </Button>
                  }
                ></CollapsibleTrigger>
              </ItemActions>
            </div>

            <CollapsibleContent className="w-full p-4 border rounded">
              {backupCodes && (
                <div className="mt-3 space-y-3">
                  <div className="grid grid-cols-2 gap-2 rounded-lg border bg-muted/50 p-4 font-mono text-sm">
                    {backupCodes.map((code) => (
                      <span key={code}>{code}</span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={copyBackupCodes}
                    >
                      {copied ? (
                        <Check className="size-4" />
                      ) : (
                        <Copy className="size-4" />
                      )}
                      Copy
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={downloadBackupCodes}
                    >
                      <Download className="size-4" />
                      Download
                    </Button>
                  </div>
                </div>
              )}
            </CollapsibleContent>
          </Item>
        }
      ></Collapsible>

      <RegenerateBackupCodesDialog
        open={regenerateOpen}
        onOpenChange={setRegenerateOpen}
        onRegenerated={(codes) => {
          onBackupCodesGenerated(codes);
          setExpanded(true);
        }}
      />
    </>
  );
}
