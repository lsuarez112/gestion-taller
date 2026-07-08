import type { ColumnDef } from '@tanstack/react-table'

import { CategoryBadge } from '@/components/categories/CategoryBadge'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/format'
import type { ProductWithDetails } from '@/lib/types'
import { cn } from '@/lib/utils'

interface CreateProductsTableColumnsOptions {
  onProductClick: (productId: string) => void
}

export function createProductsTableColumns({
  onProductClick,
}: CreateProductsTableColumnsOptions): ColumnDef<ProductWithDetails>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Nombre',
      cell: ({ row }) => (
        <button
          type="button"
          className="max-w-[220px] cursor-pointer text-left font-medium hover:underline"
          onClick={() => onProductClick(row.original.id)}
        >
          <span className="line-clamp-2">{row.original.name}</span>
        </button>
      ),
    },
    {
      id: 'category',
      accessorFn: (row) => row.category?.name ?? '—',
      header: 'Categoría',
      cell: ({ row }) =>
        row.original.category ? (
          <CategoryBadge category={row.original.category} variant="secondary" />
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      id: 'vehicle',
      accessorFn: (row) =>
        [row.brand?.name, row.model?.name].filter(Boolean).join(' ') || '—',
      header: 'Vehículo',
      cell: ({ row }) => {
        const { brand, model } = row.original
        if (!brand && !model) {
          return <span className="text-muted-foreground">—</span>
        }

        return (
          <div className="flex max-w-[160px] flex-wrap gap-1">
            {brand ? (
              <Badge variant="outline" className="text-xs">
                {brand.name}
              </Badge>
            ) : null}
            {model ? (
              <Badge variant="outline" className="text-xs">
                {model.name}
              </Badge>
            ) : null}
          </div>
        )
      },
    },
    {
      id: 'stock',
      accessorFn: (row) => row.stock?.units_available ?? 0,
      header: () => <span className="block text-center">Stock</span>,
      cell: ({ row }) => {
        const available = row.original.stock?.units_available ?? 0
        return (
          <div className="text-center">
            <Badge
              variant={available > 0 ? 'secondary' : 'destructive'}
              className={cn(available === 0 && 'bg-destructive text-white')}
            >
              {available}
            </Badge>
          </div>
        )
      },
      meta: { headerClassName: 'text-center', cellClassName: 'text-center' },
    },
    {
      accessorKey: 'reference_price',
      header: () => <span className="block text-right">Precio ref.</span>,
      cell: ({ row }) => (
        <span className="block text-right">{formatCurrency(row.original.reference_price)}</span>
      ),
      meta: { headerClassName: 'text-right', cellClassName: 'text-right' },
    },
  ]
}
