import type { ColumnDef } from '@tanstack/react-table'

import { Badge } from '@/components/ui/badge'
import type { BrandWithCount } from '@/hooks/useBrands'

interface CreateBrandsTableColumnsOptions {
  onBrandClick: (brandId: string) => void
}

export function createBrandsTableColumns({
  onBrandClick,
}: CreateBrandsTableColumnsOptions): ColumnDef<BrandWithCount>[] {
  return [
    {
      accessorKey: 'sort_order',
      header: () => <span className="block text-center">Orden</span>,
      cell: ({ row }) => (
        <span className="block text-center font-mono text-sm">{row.original.sort_order}</span>
      ),
      meta: { headerClassName: 'text-center w-20', cellClassName: 'text-center' },
    },
    {
      accessorKey: 'name',
      header: 'Marca',
      cell: ({ row }) => (
        <button
          type="button"
          className="cursor-pointer text-left font-medium hover:underline"
          onClick={() => onBrandClick(row.original.id)}
        >
          {row.original.name}
        </button>
      ),
    },
    {
      id: 'model_count',
      accessorFn: (row) => row.model_count,
      header: () => <span className="block text-center">Modelos</span>,
      cell: ({ row }) => (
        <div className="text-center">
          <Badge variant="secondary">{row.original.model_count}</Badge>
        </div>
      ),
      meta: { headerClassName: 'text-center', cellClassName: 'text-center' },
    },
    {
      id: 'product_count',
      accessorFn: (row) => row.product_count,
      header: () => <span className="block text-center">Artículos</span>,
      cell: ({ row }) => (
        <div className="text-center">
          <Badge variant="outline">{row.original.product_count}</Badge>
        </div>
      ),
      meta: { headerClassName: 'text-center', cellClassName: 'text-center' },
    },
  ]
}
