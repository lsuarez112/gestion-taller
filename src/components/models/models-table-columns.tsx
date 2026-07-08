import type { ColumnDef } from '@tanstack/react-table'

import { Badge } from '@/components/ui/badge'
import type { ModelWithCount } from '@/hooks/useModels'

interface CreateModelsTableColumnsOptions {
  onModelClick: (modelId: string) => void
}

export function createModelsTableColumns({
  onModelClick,
}: CreateModelsTableColumnsOptions): ColumnDef<ModelWithCount>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Modelo',
      cell: ({ row }) => (
        <button
          type="button"
          className="cursor-pointer text-left font-medium hover:underline"
          onClick={() => onModelClick(row.original.id)}
        >
          {row.original.name}
        </button>
      ),
    },
    {
      id: 'brand',
      accessorFn: (row) => row.brand?.name ?? '—',
      header: 'Marca',
      cell: ({ row }) =>
        row.original.brand ? (
          <Badge variant="outline">{row.original.brand.name}</Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      id: 'product_count',
      accessorFn: (row) => row.product_count,
      header: () => <span className="block text-center">Artículos</span>,
      cell: ({ row }) => (
        <div className="text-center">
          <Badge variant="secondary">{row.original.product_count}</Badge>
        </div>
      ),
      meta: { headerClassName: 'text-center', cellClassName: 'text-center' },
    },
  ]
}
