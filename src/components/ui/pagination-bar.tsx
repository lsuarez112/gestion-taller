import { Button } from '@/components/ui/button'

interface PaginationBarProps {
  filteredCount?: number
  totalCount: number
  rowCountLabel?: string
  canPrevious: boolean
  canNext: boolean
  onPrevious: () => void
  onNext: () => void
  showRowCount?: boolean
  summary?: string
}

export function PaginationBar({
  filteredCount,
  totalCount,
  rowCountLabel = 'registros',
  canPrevious,
  canNext,
  onPrevious,
  onNext,
  showRowCount = true,
  summary,
}: PaginationBarProps) {
  const countLabel =
    summary ??
    (typeof filteredCount === 'number'
      ? `Mostrando ${filteredCount} de ${totalCount} ${rowCountLabel}`
      : `Total: ${totalCount} ${rowCountLabel}`)

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-4">
      {showRowCount ? (
        <p className="text-sm text-muted-foreground">{countLabel}</p>
      ) : (
        <span />
      )}

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="cursor-pointer"
          onClick={onPrevious}
          disabled={!canPrevious}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="cursor-pointer"
          onClick={onNext}
          disabled={!canNext}
        >
          Siguiente
        </Button>
      </div>
    </div>
  )
}
