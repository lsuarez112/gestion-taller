import { FolderOpen, Plus, SearchX, Tags } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'

interface CatalogCategoryEmptyStateProps {
  context: 'catalog-filter'
  categoryName?: string
  isAdmin: boolean
  hasSearch?: boolean
  onClearCategory: () => void
  onClearSearch?: () => void
  onCreate?: () => void
}

interface ManageCategoryEmptyStateProps {
  context: 'manage'
  variant: 'empty' | 'no-results'
  isAdmin: boolean
  onCreate?: () => void
  onClearSearch?: () => void
}

export type CategoriesEmptyStateProps =
  | CatalogCategoryEmptyStateProps
  | ManageCategoryEmptyStateProps

export function CategoriesEmptyState(props: CategoriesEmptyStateProps) {
  if (props.context === 'catalog-filter') {
    const { categoryName, isAdmin, hasSearch, onClearCategory, onClearSearch, onCreate } = props

    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FolderOpen />
          </EmptyMedia>
          <EmptyTitle>
            {categoryName ? `Sin artículos en ${categoryName}` : 'Sin artículos en esta categoría'}
          </EmptyTitle>
          <EmptyDescription>
            {hasSearch
              ? 'No hay artículos que coincidan con la búsqueda en esta categoría.'
              : 'Esta categoría no tiene artículos cargados todavía.'}
          </EmptyDescription>
        </EmptyHeader>

        <EmptyContent className="flex-row flex-wrap justify-center gap-2">
          <Button variant="outline" onClick={onClearCategory}>
            Ver todas las categorías
          </Button>
          {hasSearch && onClearSearch ? (
            <Button variant="outline" onClick={onClearSearch}>
              Limpiar búsqueda
            </Button>
          ) : null}
          {isAdmin && onCreate ? (
            <Button onClick={onCreate}>
              <Plus />
              Nuevo artículo
            </Button>
          ) : null}
        </EmptyContent>
      </Empty>
    )
  }

  const { variant, isAdmin, onCreate, onClearSearch } = props
  const isEmpty = variant === 'empty'

  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          {isEmpty ? <Tags /> : <SearchX />}
        </EmptyMedia>
        <EmptyTitle>
          {isEmpty ? 'No hay categorías' : 'Sin resultados'}
        </EmptyTitle>
        <EmptyDescription>
          {isEmpty
            ? isAdmin
              ? 'Creá categorías para organizar el catálogo de repuestos.'
              : 'No hay categorías cargadas.'
            : 'Ninguna categoría coincide con tu búsqueda.'}
        </EmptyDescription>
      </EmptyHeader>

      {(isAdmin && isEmpty) || !isEmpty ? (
        <EmptyContent className="flex-row justify-center gap-2">
          {isAdmin && isEmpty ? (
            <Button onClick={onCreate}>
              <Plus />
              Nueva categoría
            </Button>
          ) : null}
          {!isEmpty ? (
            <Button variant="outline" onClick={onClearSearch}>
              Limpiar búsqueda
            </Button>
          ) : null}
        </EmptyContent>
      ) : null}
    </Empty>
  )
}
