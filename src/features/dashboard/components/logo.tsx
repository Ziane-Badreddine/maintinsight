import Link from "next/link";
import { GaugeIcon } from "lucide-react";

export function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2 shrink-0 mr-2">
      <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <GaugeIcon className="size-4" />
      </div>
    </Link>
  );
}
