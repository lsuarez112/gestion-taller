import type { ColumnDef } from '@tanstack/react-table'

import { CategoryIcon } from '@/components/categories/CategoryIcon'
import { Badge } from '@/components/ui/badge'
import type { CategoryWithCount } from '@/hooks/useCategories'
import { getCategoryIconLabel } from '@/lib/category-icons'

interface CreateCategoriesTableColumnsOptions {
  onCategoryClick: (categoryId: string) => void
}

export function createCategoriesTableColumns({
  onCategoryClick,
}: CreateCategoriesTableColumnsOptions): ColumnDef<CategoryWithCount>[] {
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
      header: 'Nombre',
      cell: ({ row }) => (
        <button
          type="button"
          className="cursor-pointer text-left font-medium hover:underline"
          onClick={() => onCategoryClick(row.original.id)}
        >
          {row.original.name}
        </button>
      ),
    },
    {
      accessorKey: 'icon',
      header: 'Icono',
      cell: ({ row }) =>
        row.original.icon ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <CategoryIcon icon={row.original.icon} />
            <span>{getCategoryIconLabel(row.original.icon)}</span>
          </div>
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
