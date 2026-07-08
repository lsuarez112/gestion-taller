import { useMemo } from 'react'

import { DataTable } from '@/components/ui/data-table'
import { createProductsTableColumns } from '@/components/products/products-table-columns'
import type { ProductWithDetails } from '@/lib/types'

interface ProductsDataTableProps {
  data: ProductWithDetails[]
  onProductClick: (productId: string) => void
  emptyState?: React.ReactNode
  pageSize?: number
}

export function ProductsDataTable({
  data,
  onProductClick,
  emptyState,
  pageSize = 10,
}: ProductsDataTableProps) {
  const columns = useMemo(
    () => createProductsTableColumns({ onProductClick }),
    [onProductClick],
  )

  return (
    <DataTable
      columns={columns}
      data={data}
      pageSize={pageSize}
      emptyState={emptyState}
      rowCountLabel="artículos"
    />
  )
}
