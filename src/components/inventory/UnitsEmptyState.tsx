import { Box, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'

interface UnitsEmptyStateProps {
  isAdmin: boolean
  onAddUnit?: () => void
}

export function UnitsEmptyState({ isAdmin, onAddUnit }: UnitsEmptyStateProps) {
  return (
    <Empty className="border py-8">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Box />
        </EmptyMedia>
        <EmptyTitle>Sin unidades registradas</EmptyTitle>
        <EmptyDescription>
          {isAdmin
            ? 'Agregá la primera unidad con su SKU para empezar a controlar el stock de este artículo.'
            : 'Este artículo aún no tiene piezas físicas cargadas en el inventario.'}
        </EmptyDescription>
      </EmptyHeader>

      {isAdmin ? (
        <EmptyContent>
          <Button size="sm" onClick={onAddUnit}>
            <Plus />
            Agregar unidad
          </Button>
        </EmptyContent>
      ) : null}
    </Empty>
  )
}
