import { Car } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'

interface BrandsEmptyStateProps {
  variant: 'empty' | 'no-results'
  isAdmin: boolean
  onCreate?: () => void
  onClearSearch?: () => void
}

export function BrandsEmptyState({
  variant,
  isAdmin,
  onCreate,
  onClearSearch,
}: BrandsEmptyStateProps) {
  const isNoResults = variant === 'no-results'

  return (
    <Empty className="border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Car />
        </EmptyMedia>
        <EmptyTitle>{isNoResults ? 'Sin resultados' : 'No hay marcas'}</EmptyTitle>
        <EmptyDescription>
          {isNoResults
            ? 'Probá con otro término de búsqueda.'
            : 'Creá marcas de vehículos para organizar el catálogo.'}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        {isNoResults && onClearSearch ? (
          <Button variant="outline" onClick={onClearSearch}>
            Limpiar búsqueda
          </Button>
        ) : null}
        {!isNoResults && isAdmin && onCreate ? (
          <Button onClick={onCreate}>Nueva marca</Button>
        ) : null}
      </EmptyContent>
    </Empty>
  )
}
