import { useMemo } from 'react'

import { createCategoriesTableColumns } from '@/components/categories/categories-table-columns'
import { DataTable } from '@/components/ui/data-table'
import type { CategoryWithCount } from '@/hooks/useCategories'

interface CategoriesDataTableProps {
  data: CategoryWithCount[]
  onCategoryClick: (categoryId: string) => void
  emptyState?: React.ReactNode
  pageSize?: number
}

export function CategoriesDataTable({
  data,
  onCategoryClick,
  emptyState,
  pageSize = 10,
}: CategoriesDataTableProps) {
  const columns = useMemo(
    () => createCategoriesTableColumns({ onCategoryClick }),
    [onCategoryClick],
  )

  return (
    <DataTable
      columns={columns}
      data={data}
      pageSize={pageSize}
      emptyState={emptyState}
      rowCountLabel="categorías"
    />
  )
}
