import { CarFront } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'

interface ModelsEmptyStateProps {
  variant: 'empty' | 'no-results' | 'filter'
  isAdmin: boolean
  brandName?: string
  onCreate?: () => void
  onClearSearch?: () => void
  onClearBrand?: () => void
}

export function ModelsEmptyState({
  variant,
  isAdmin,
  brandName,
  onCreate,
  onClearSearch,
  onClearBrand,
}: ModelsEmptyStateProps) {
  const isNoResults = variant === 'no-results'
  const isFilter = variant === 'filter'

  return (
    <Empty className="border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CarFront />
        </EmptyMedia>
        <EmptyTitle>
          {isNoResults || isFilter ? 'Sin resultados' : 'No hay modelos'}
        </EmptyTitle>
        <EmptyDescription>
          {isFilter
            ? `No hay modelos para ${brandName ?? 'la marca seleccionada'}.`
            : isNoResults
              ? 'Probá con otro término de búsqueda.'
              : 'Creá modelos asociados a las marcas del taller.'}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex flex-wrap gap-2">
        {isFilter && onClearBrand ? (
          <Button variant="outline" onClick={onClearBrand}>
            Ver todas las marcas
          </Button>
        ) : null}
        {isNoResults && onClearSearch ? (
          <Button variant="outline" onClick={onClearSearch}>
            Limpiar búsqueda
          </Button>
        ) : null}
        {!isNoResults && !isFilter && isAdmin && onCreate ? (
          <Button onClick={onCreate}>Nuevo modelo</Button>
        ) : null}
      </EmptyContent>
    </Empty>
  )
}
