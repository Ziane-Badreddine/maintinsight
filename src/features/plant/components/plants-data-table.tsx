"use client";

import { useMemo, useState } from "react";
import {
  useTable,
  type ColumnFiltersState,
  type SortingState,
} from "@tanstack/react-table";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { useRouter, useParams } from "next/navigation";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { SearchIcon, BuildingIcon, Plus } from "lucide-react";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { createPlantColumns, type PlantRow } from "./plant-columns";
import { features } from "@/features/dashboard/components/data-table-features";
import { DataTableViewOptions } from "@/features/dashboard/components/data-table-view-options";
import { NewPlantSheet } from "./new-plant-sheet";
import { Button } from "@/components/ui/button";
import { authClient, Permissions, Role } from "@/lib/auth-client";

// type CheckRolePermissionArgs = Parameters<
//   typeof authClient.admin.checkRolePermission
// >[0];
// type Role = CheckRolePermissionArgs["role"];
// type Permissions = CheckRolePermissionArgs["permissions"];

interface PlantsDataTableProps {
  data: PlantRow[];
}

export function PlantsDataTable({ data }: PlantsDataTableProps) {
  const router = useRouter();
  const params = useParams<{ cityId: string }>();
  const [open, setOpen] = useState(false);

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "healthRate", desc: false },
  ]);

  const { data: session, isPending: isSessionPending } =
    authClient.useSession();

  const roles = (session?.user?.role?.split(",") ?? []) as Role[];

  function hasPermission(permissions: Permissions) {
    if (isSessionPending) return false;

    return roles.some((role) =>
      authClient.admin.checkRolePermission({
        role,
        permissions,
      }),
    );
  }

  const canCreatePlant = hasPermission({
    plant: ["create"],
  } satisfies Permissions);

  const columns = useMemo(() => createPlantColumns(), []);

  const table = useTable({
    features,
    data,
    columns,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    state: { columnFilters, sorting },
  });

  const rows = table.getRowModel().rows;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <InputGroup className="w-full md:w-64">
            <InputGroupInput
              placeholder="Search plant…"
              value={
                (table.getColumn("name")?.getFilterValue() as string) ?? ""
              }
              onChange={(e) =>
                table.getColumn("name")?.setFilterValue(e.target.value)
              }
            />
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
          </InputGroup>
          <DataTableViewOptions table={table} />
        </div>
        {canCreatePlant && (
          <Button
            onClick={() => {
              setOpen(true);
            }}
          >
            <Plus />
            New plant
          </Button>
        )}
      </div>

      {rows.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BuildingIcon />
            </EmptyMedia>
            <EmptyTitle>No plants found</EmptyTitle>
            <EmptyDescription>Try a different search term.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="overflow-hidden rounded-t-2xl rounded-b-xl outline-4 outline-input/30">
          <Table>
            <TableHeader className="bg-input/30 h-12">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : (
                        <table.FlexRender header={header} />
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer select-none"
                  onClick={() =>
                    router.push(
                      `/dashboard/cities/${params.cityId}/plants/${row.original.id}`,
                    )
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {canCreatePlant && (
        <NewPlantSheet
          cityId={Number(params.cityId)}
          open={open}
          onOpenChange={setOpen}
        />
      )}
    </div>
  );
}
