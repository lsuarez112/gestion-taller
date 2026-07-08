import { useMemo } from 'react'

import { createModelsTableColumns } from '@/components/models/models-table-columns'
import { DataTable } from '@/components/ui/data-table'
import type { ModelWithCount } from '@/hooks/useModels'

interface ModelsDataTableProps {
  data: ModelWithCount[]
  onModelClick: (modelId: string) => void
  emptyState?: React.ReactNode
  pageSize?: number
}

export function ModelsDataTable({
  data,
  onModelClick,
  emptyState,
  pageSize = 10,
}: ModelsDataTableProps) {
  const columns = useMemo(
    () => createModelsTableColumns({ onModelClick }),
    [onModelClick],
  )

  return (
    <DataTable
      columns={columns}
      data={data}
      pageSize={pageSize}
      emptyState={emptyState}
      rowCountLabel="modelos"
    />
  )
}
