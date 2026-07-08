import { Package, Plus, SearchX } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'

interface ProductsEmptyStateProps {
  variant: 'empty' | 'no-results'
  isAdmin: boolean
  onCreate?: () => void
  onClearSearch?: () => void
}

export function ProductsEmptyState({
  variant,
  isAdmin,
  onCreate,
  onClearSearch,
}: ProductsEmptyStateProps) {
  const isEmpty = variant === 'empty'

  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          {isEmpty ? <Package /> : <SearchX />}
        </EmptyMedia>
        <EmptyTitle>
          {isEmpty ? 'No hay artículos' : 'Sin resultados'}
        </EmptyTitle>
        <EmptyDescription>
          {isEmpty
            ? isAdmin
              ? 'Todavía no cargaste repuestos en el catálogo. Creá el primero para empezar a gestionar el stock.'
              : 'El catálogo está vacío. Contactá a un administrador para cargar artículos.'
            : 'Ningún artículo coincide con tu búsqueda. Probá con otro nombre o limpiá el filtro.'}
        </EmptyDescription>
      </EmptyHeader>

      {(isAdmin && isEmpty) || !isEmpty ? (
        <EmptyContent className="flex-row justify-center gap-2">
          {isAdmin && isEmpty ? (
            <Button onClick={onCreate}>
              <Plus />
              Nuevo artículo
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
