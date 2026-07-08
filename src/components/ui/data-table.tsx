import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
  type Table as TanstackTable,
} from '@tanstack/react-table'
import { useEffect, useState } from 'react'

import { PaginationBar } from '@/components/ui/pagination-bar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TableScrollArea } from '@/components/ui/table-scroll-area'
import { cn } from '@/lib/utils'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  pageSize?: number
  emptyState?: React.ReactNode
  emptyMessage?: string
  rowCountLabel?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageSize = 10,
  emptyState,
  emptyMessage = 'Sin resultados',
  rowCountLabel = 'registros',
}: DataTableProps<TData, TValue>) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  })

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }, [data])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    state: { pagination },
  })

  return (
    <DataTableView
      table={table}
      columnCount={columns.length}
      emptyState={emptyState}
      emptyMessage={emptyMessage}
      showPagination
      showRowCount
      totalCount={data.length}
      rowCountLabel={rowCountLabel}
    />
  )
}

interface DataTableViewProps<TData> {
  table: TanstackTable<TData>
  columnCount: number
  emptyMessage?: string
  emptyState?: React.ReactNode
  showPagination?: boolean
  showRowCount?: boolean
  totalCount?: number
  rowCountLabel?: string
}

export function DataTableView<TData>({
  table,
  columnCount,
  emptyMessage = 'Sin resultados',
  emptyState,
  showPagination = false,
  showRowCount = false,
  totalCount,
  rowCountLabel = 'registros',
}: DataTableViewProps<TData>) {
  const pageIndex = table.getState().pagination.pageIndex
  const pageSize = table.getState().pagination.pageSize
  const visibleCount = table.getRowModel().rows.length
  const total = totalCount ?? table.getFilteredRowModel().rows.length
  const rangeStart = total === 0 ? 0 : pageIndex * pageSize + 1
  const rangeEnd = total === 0 ? 0 : rangeStart + visibleCount - 1

  return (
    <div className="min-w-0">
      <div className="overflow-hidden rounded-lg border bg-card">
        <TableScrollArea>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={cn(header.column.columnDef.meta?.headerClassName)}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(cell.column.columnDef.meta?.cellClassName)}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columnCount} className="p-0">
                    {emptyState ?? (
                      <p className="py-12 text-center text-sm text-muted-foreground">
                        {emptyMessage}
                      </p>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableScrollArea>
      </div>

      {showPagination ? (
        <PaginationBar
          summary={
            total === 0
              ? `0 ${rowCountLabel}`
              : `Mostrando ${rangeStart}-${rangeEnd} de ${total} ${rowCountLabel}`
          }
          totalCount={total}
          rowCountLabel={rowCountLabel}
          showRowCount={showRowCount}
          canPrevious={table.getCanPreviousPage()}
          canNext={table.getCanNextPage()}
          onPrevious={() => table.previousPage()}
          onNext={() => table.nextPage()}
        />
      ) : null}
    </div>
  )
}
