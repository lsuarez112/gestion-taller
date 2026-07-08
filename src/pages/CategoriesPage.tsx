import { LayoutGrid, Plus, Search, TableIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { CategoriesDataTable } from '@/components/categories/categories-data-table'
import { CategoriesEmptyState } from '@/components/categories/CategoriesEmptyState'
import { CategoryCard } from '@/components/categories/CategoryCard'
import { CategoryDetailDialog } from '@/components/categories/CategoryDetailDialog'
import { CategoryFormDialog } from '@/components/categories/CategoryFormDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PaginationBar } from '@/components/ui/pagination-bar'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/hooks/useAuth'
import { useCategoriesWithCounts } from '@/hooks/useCategories'
import { cn } from '@/lib/utils'

type ViewMode = 'table' | 'cards'

const CARDS_PAGE_SIZE = 8

export function CategoriesPage() {
  const { isAdmin } = useAuth()
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [cardsPageIndex, setCardsPageIndex] = useState(0)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)

  const { data: categories = [], isLoading } = useCategoriesWithCounts()

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return categories

    return categories.filter((category) => {
      const nameMatch = category.name.toLowerCase().includes(query)
      const iconMatch = category.icon?.toLowerCase().includes(query)
      return nameMatch || iconMatch
    })
  }, [categories, search])

  const suggestedSortOrder = useMemo(() => {
    if (categories.length === 0) return 0
    return Math.max(...categories.map((category) => category.sort_order)) + 1
  }, [categories])

  useEffect(() => {
    setCardsPageIndex(0)
  }, [search, viewMode, filteredCategories.length])

  function handleCategoryClick(categoryId: string) {
    setSelectedCategoryId(categoryId)
    setDetailOpen(true)
  }

  function handleCreated(categoryId?: string) {
    if (categoryId) {
      setSelectedCategoryId(categoryId)
      setDetailOpen(true)
    }
  }

  const hasSearch = search.trim().length > 0

  function handleClearSearch() {
    setSearch('')
  }

  function renderEmptyState() {
    return (
      <CategoriesEmptyState
        context="manage"
        variant={hasSearch ? 'no-results' : 'empty'}
        isAdmin={isAdmin}
        onCreate={() => setCreateOpen(true)}
        onClearSearch={handleClearSearch}
      />
    )
  }

  const cardsPageStart = cardsPageIndex * CARDS_PAGE_SIZE
  const paginatedCategories = filteredCategories.slice(
    cardsPageStart,
    cardsPageStart + CARDS_PAGE_SIZE,
  )
  const cardsCanPrevious = cardsPageIndex > 0
  const cardsCanNext = cardsPageStart + CARDS_PAGE_SIZE < filteredCategories.length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Categorías</h1>
          <p className="text-sm text-muted-foreground">
            Organizá el catálogo de repuestos por categorías
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border p-0.5">
            <Button
              variant={viewMode === 'table' ? 'secondary' : 'ghost'}
              size="sm"
              className="cursor-pointer px-2.5"
              onClick={() => setViewMode('table')}
              aria-label="Vista tabla"
            >
              <TableIcon />
            </Button>
            <Button
              variant={viewMode === 'cards' ? 'secondary' : 'ghost'}
              size="sm"
              className="cursor-pointer px-2.5"
              onClick={() => setViewMode('cards')}
              aria-label="Vista cards"
            >
              <LayoutGrid />
            </Button>
          </div>
          {isAdmin ? (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus />
              Nueva categoría
            </Button>
          ) : null}
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre o icono..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="cursor-text pl-9"
        />
      </div>

      {isLoading ? (
        <div
          className={cn(
            viewMode === 'cards'
              ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'space-y-2',
          )}
        >
          {Array.from({ length: viewMode === 'cards' ? 8 : 6 }).map((_, index) => (
            <Skeleton
              key={index}
              className={cn(
                'w-full rounded-xl',
                viewMode === 'cards' ? 'aspect-[4/5]' : 'h-12',
              )}
            />
          ))}
        </div>
      ) : filteredCategories.length === 0 ? (
        renderEmptyState()
      ) : viewMode === 'table' ? (
        <CategoriesDataTable
          data={filteredCategories}
          onCategoryClick={handleCategoryClick}
          emptyState={renderEmptyState()}
        />
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paginatedCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onTitleClick={() => handleCategoryClick(category.id)}
              />
            ))}
          </div>

          {filteredCategories.length > CARDS_PAGE_SIZE ? (
            <PaginationBar
              summary={`Mostrando ${cardsPageStart + 1}-${Math.min(cardsPageStart + CARDS_PAGE_SIZE, filteredCategories.length)} de ${filteredCategories.length} categorías`}
              totalCount={filteredCategories.length}
              canPrevious={cardsCanPrevious}
              canNext={cardsCanNext}
              onPrevious={() => setCardsPageIndex((prev) => prev - 1)}
              onNext={() => setCardsPageIndex((prev) => prev + 1)}
            />
          ) : null}
        </div>
      )}

      <CategoryDetailDialog
        categoryId={selectedCategoryId}
        open={detailOpen}
        onOpenChange={(nextOpen) => {
          setDetailOpen(nextOpen)
          if (!nextOpen) setSelectedCategoryId(null)
        }}
      />

      {isAdmin ? (
        <CategoryFormDialog
          mode="create"
          open={createOpen}
          onOpenChange={setCreateOpen}
          onSuccess={handleCreated}
          suggestedSortOrder={suggestedSortOrder}
        />
      ) : null}
    </div>
  )
}
