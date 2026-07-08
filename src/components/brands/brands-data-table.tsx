import { useMemo } from 'react'

import { createBrandsTableColumns } from '@/components/brands/brands-table-columns'
import { DataTable } from '@/components/ui/data-table'
import type { BrandWithCount } from '@/hooks/useBrands'

interface BrandsDataTableProps {
  data: BrandWithCount[]
  onBrandClick: (brandId: string) => void
  emptyState?: React.ReactNode
  pageSize?: number
}

export function BrandsDataTable({
  data,
  onBrandClick,
  emptyState,
  pageSize = 10,
}: BrandsDataTableProps) {
  const columns = useMemo(
    () => createBrandsTableColumns({ onBrandClick }),
    [onBrandClick],
  )

  return (
    <DataTable
      columns={columns}
      data={data}
      pageSize={pageSize}
      emptyState={emptyState}
      rowCountLabel="marcas"
    />
  )
}
