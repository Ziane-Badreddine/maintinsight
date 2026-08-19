import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function SessionsTableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-20" />
      <div className="rounded border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>User Agent</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rows }).map((_, i) => (
              <TableRow key={i}>
                {/* User */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-8 rounded-full shrink-0" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-3.5 w-28" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                  </div>
                </TableCell>
                {/* IP */}
                <TableCell>
                  <Skeleton className="h-3.5 w-24" />
                </TableCell>
                {/* UA */}
                <TableCell>
                  <Skeleton className="h-3.5 w-40" />
                </TableCell>
                {/* Created */}
                <TableCell>
                  <Skeleton className="h-3.5 w-24" />
                </TableCell>
                {/* Expires */}
                <TableCell>
                  <Skeleton className="h-3.5 w-24" />
                </TableCell>
                {/* Actions */}
                <TableCell>
                  <Skeleton className="size-8 rounded-md" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
