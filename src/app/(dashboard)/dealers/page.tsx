"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { CreateDealerDialog } from "@/components/dealers/CreateDealerDialog";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/queryKeys";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  SortingState,
} from "@tanstack/react-table";
import { getDealers } from "@/services/dealerApi";

export default function DealersPage() {
  const [dealerDialogOpen, setDealerDialogOpen] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);

  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.dealers,
    queryFn: getDealers,
  });

  const columns = React.useMemo(
    () => [
      { accessorKey: "dealerId", header: "ID" },
      { accessorKey: "name", header: "Name" },
      { accessorKey: "city", header: "City" },
      { accessorKey: "state", header: "State" },
      { accessorKey: "country", header: "Country" },
      { accessorKey: "phone", header: "Phone" },
      { accessorKey: "listingCount", header: "Listings" },
      { accessorKey: "status", header: "Status" },
    ],
    []
  );

  const table = useReactTable({
    data: data || [],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    debugTable: false,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Dealers</h1>
        <Button
          variant="outline"
          className="border-primary cursor-pointer text-primary font-medium rounded-full py-2 px-4"
          onClick={() => setDealerDialogOpen(true)}
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          Create
        </Button>
        <CreateDealerDialog
          open={dealerDialogOpen}
          onOpenChange={setDealerDialogOpen}
        />
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        {isLoading ? (
          <div>Loading dealers...</div>
        ) : error ? (
          <div className="text-red-500">{error.message}</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {table.getHeaderGroups()[0].headers.map((header) => (
                  <TableHead
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="cursor-pointer select-none"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {header.column.getIsSorted() === "asc"
                      ? " ▲"
                      : header.column.getIsSorted() === "desc"
                      ? " ▼"
                      : ""}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center">
                    No dealers found.
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
