"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconDotsVertical,
  IconLayoutColumns,
} from "@tabler/icons-react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  Eye,
  Send,
  CheckCircle,
  XCircle,
  Trash2,
  Receipt,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { QuotationStatusBadge } from "@/components/quotation-status-badge";
import { Quotation, QuotationStatus } from "@/lib/types/quotation";

interface QuotationsDataTableProps {
  data: Quotation[];
  onStatusChange: (id: string, status: QuotationStatus) => void;
  onDelete: (id: string) => void;
  onCreateInvoice: (quotation: { id: string; quotationNumber: string }) => void;
}

// Check if quotation is expired
const isExpired = (validUntil: string, status: QuotationStatus) => {
  if (status === "accepted" || status === "rejected") return false;
  return new Date(validUntil) < new Date();
};

const formatDate = (dateString: string) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatCurrency = (amount: number) => {
  return `RM ${amount.toLocaleString("en-MY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export function QuotationsDataTable({
  data,
  onStatusChange,
  onDelete,
  onCreateInvoice,
}: QuotationsDataTableProps) {
  const router = useRouter();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const columns: ColumnDef<Quotation>[] = React.useMemo(
    () => [
      {
        accessorKey: "quotationNumber",
        header: "Quotation #",
        cell: ({ row }) => (
          <Link
            href={`/dashboard/quotations/${row.original.id}`}
            className="font-medium hover:underline"
          >
            {row.original.quotationNumber}
          </Link>
        ),
        enableHiding: false,
      },
      {
        accessorKey: "clientName",
        header: "Client",
        cell: ({ row }) => row.original.clientName || "-",
      },
      {
        accessorKey: "projectTitle",
        header: "Project",
        cell: ({ row }) => row.original.projectTitle || "-",
      },
      {
        accessorKey: "total",
        header: () => <div className="text-right">Amount</div>,
        cell: ({ row }) => (
          <div className="text-right font-medium">
            {formatCurrency(row.original.total)}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const expired = isExpired(row.original.validUntil, row.original.status);
          const displayStatus =
            expired &&
            row.original.status !== "accepted" &&
            row.original.status !== "rejected"
              ? "expired"
              : row.original.status;
          return <QuotationStatusBadge status={displayStatus} />;
        },
      },
      {
        accessorKey: "validUntil",
        header: "Valid Until",
        cell: ({ row }) => {
          const expired = isExpired(row.original.validUntil, row.original.status);
          const isAcceptedOrRejected =
            row.original.status === "accepted" ||
            row.original.status === "rejected";
          return (
            <span
              className={
                expired && !isAcceptedOrRejected
                  ? "text-orange-600 font-medium"
                  : undefined
              }
            >
              {formatDate(row.original.validUntil)}
            </span>
          );
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const quotation = row.original;
          return (
            <div className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="data-[state=open]:bg-muted text-muted-foreground flex size-8 ml-auto"
                    size="icon"
                  >
                    <IconDotsVertical />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem
                    onClick={() =>
                      router.push(`/dashboard/quotations/${quotation.id}`)
                    }
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      onCreateInvoice({
                        id: quotation.id,
                        quotationNumber: quotation.quotationNumber,
                      })
                    }
                  >
                    <Receipt className="mr-2 h-4 w-4" />
                    Create Invoice
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {quotation.status === "draft" && (
                    <DropdownMenuItem
                      onClick={() => onStatusChange(quotation.id, "sent")}
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Mark as Sent
                    </DropdownMenuItem>
                  )}
                  {quotation.status === "sent" && (
                    <>
                      <DropdownMenuItem
                        onClick={() => onStatusChange(quotation.id, "accepted")}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark as Accepted
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onStatusChange(quotation.id, "rejected")}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Mark as Rejected
                      </DropdownMenuItem>
                    </>
                  )}
                  {(quotation.status === "draft" ||
                    quotation.status === "sent") && <DropdownMenuSeparator />}
                  <DropdownMenuItem
                    onClick={() => onDelete(quotation.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [router, onStatusChange, onDelete, onCreateInvoice]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination,
    },
    getRowId: (row) => row.id,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <IconLayoutColumns />
              <span className="hidden lg:inline">Customize Columns</span>
              <span className="lg:hidden">Columns</span>
              <IconChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {table
              .getAllColumns()
              .filter(
                (column) =>
                  typeof column.accessorFn !== "undefined" &&
                  column.getCanHide()
              )
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                const expired = isExpired(
                  row.original.validUntil,
                  row.original.status
                );
                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={expired ? "bg-orange-50" : undefined}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No quotations found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between px-4">
        <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
          {table.getFilteredRowModel().rows.length} quotation(s) total.
        </div>
        <div className="flex w-full items-center gap-8 lg:w-fit">
          <div className="hidden items-center gap-2 lg:flex">
            <Label htmlFor="rows-per-page" className="text-sm font-medium">
              Rows per page
            </Label>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-fit items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <IconChevronsLeft />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <IconChevronLeft />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <IconChevronRight />
            </Button>
            <Button
              variant="outline"
              className="hidden size-8 lg:flex"
              size="icon"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <IconChevronsRight />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
