import { Car, CarFront, LayoutGrid, Plus, Search, TableIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { BrandCard } from '@/components/brands/BrandCard'
import { BrandDetailDialog } from '@/components/brands/BrandDetailDialog'
import { BrandFormDialog } from '@/components/brands/BrandFormDialog'
import { BrandsDataTable } from '@/components/brands/brands-data-table'
import { BrandsEmptyState } from '@/components/brands/BrandsEmptyState'
import { ModelCard } from '@/components/models/ModelCard'
import { ModelDetailDialog } from '@/components/models/ModelDetailDialog'
import { ModelFormDialog } from '@/components/models/ModelFormDialog'
import { ModelsDataTable } from '@/components/models/models-data-table'
import { ModelsEmptyState } from '@/components/models/ModelsEmptyState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PaginationBar } from '@/components/ui/pagination-bar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/hooks/useAuth'
import { useBrands, useBrandsWithCounts } from '@/hooks/useBrands'
import { useModelsWithCounts } from '@/hooks/useModels'
import { cn } from '@/lib/utils'

type ViewMode = 'table' | 'cards'
type Tab = 'models' | 'brands'
type SortOption = 'name' | 'sort_order'

const CARDS_PAGE_SIZE = 8

export function BrandsModelsPage() {
  const { isAdmin } = useAuth()
  const [tab, setTab] = useState<Tab>('models')
  const [search, setSearch] = useState('')
  const [brandId, setBrandId] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortOption>('name')
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [cardsPageIndex, setCardsPageIndex] = useState(0)

  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null)
  const [brandDetailOpen, setBrandDetailOpen] = useState(false)
  const [createBrandOpen, setCreateBrandOpen] = useState(false)

  const [selectedModelId, setSelectedModelId] = useState<string | null>(null)
  const [modelDetailOpen, setModelDetailOpen] = useState(false)
  const [createModelOpen, setCreateModelOpen] = useState(false)

  const { data: brands = [] } = useBrands()
  const { data: brandsWithCounts = [], isLoading: brandsLoading } = useBrandsWithCounts()
  const { data: modelsWithCounts = [], isLoading: modelsLoading } = useModelsWithCounts(brandId)

  const suggestedBrandSortOrder = useMemo(() => {
    if (brandsWithCounts.length === 0) return 0
    return Math.max(...brandsWithCounts.map((brand) => brand.sort_order)) + 1
  }, [brandsWithCounts])

  const filteredBrands = useMemo(() => {
    const query = search.trim().toLowerCase()
    let rows = [...brandsWithCounts]

    if (query) {
      rows = rows.filter((brand) => brand.name.toLowerCase().includes(query))
    }

    rows.sort((a, b) =>
      sortBy === 'sort_order'
        ? a.sort_order - b.sort_order || a.name.localeCompare(b.name)
        : a.name.localeCompare(b.name),
    )

    return rows
  }, [brandsWithCounts, search, sortBy])

  const filteredModels = useMemo(() => {
    const query = search.trim().toLowerCase()
    let rows = [...modelsWithCounts]

    if (query) {
      rows = rows.filter((model) => {
        const nameMatch = model.name.toLowerCase().includes(query)
        const brandMatch = model.brand?.name.toLowerCase().includes(query)
        return nameMatch || brandMatch
      })
    }

    rows.sort((a, b) => a.name.localeCompare(b.name))
    return rows
  }, [modelsWithCounts, search])

  const isLoading = tab === 'models' ? modelsLoading : brandsLoading
  const activeRows = tab === 'models' ? filteredModels : filteredBrands
  const selectedBrand = brands.find((brand) => brand.id === brandId)
  const hasSearch = search.trim().length > 0

  useEffect(() => {
    setCardsPageIndex(0)
  }, [search, brandId, sortBy, viewMode, tab, activeRows.length])

  useEffect(() => {
    if (tab === 'models' && sortBy === 'sort_order') {
      setSortBy('name')
    }
  }, [tab, sortBy])

  function handleBrandChange(value: string) {
    setBrandId(value === 'all' ? null : value)
  }

  function handleBrandClick(id: string) {
    setSelectedBrandId(id)
    setBrandDetailOpen(true)
  }

  function handleModelClick(id: string) {
    setSelectedModelId(id)
    setModelDetailOpen(true)
  }

  function handleBrandCreated(id?: string) {
    if (id) {
      setSelectedBrandId(id)
      setBrandDetailOpen(true)
    }
  }

  function handleModelCreated(id?: string) {
    if (id) {
      setSelectedModelId(id)
      setModelDetailOpen(true)
    }
  }

  const cardsPageStart = cardsPageIndex * CARDS_PAGE_SIZE
  const paginatedModels = filteredModels.slice(cardsPageStart, cardsPageStart + CARDS_PAGE_SIZE)
  const paginatedBrands = filteredBrands.slice(cardsPageStart, cardsPageStart + CARDS_PAGE_SIZE)
  const cardsCanPrevious = cardsPageIndex > 0
  const cardsCanNext =
    tab === 'models'
      ? cardsPageStart + CARDS_PAGE_SIZE < filteredModels.length
      : cardsPageStart + CARDS_PAGE_SIZE < filteredBrands.length

  function renderModelsEmptyState() {
    if (brandId) {
      return (
        <ModelsEmptyState
          variant="filter"
          isAdmin={isAdmin}
          brandName={selectedBrand?.name}
          onClearBrand={() => setBrandId(null)}
          onCreate={() => setCreateModelOpen(true)}
        />
      )
    }

    return (
      <ModelsEmptyState
        variant={hasSearch ? 'no-results' : 'empty'}
        isAdmin={isAdmin}
        onCreate={() => setCreateModelOpen(true)}
        onClearSearch={() => setSearch('')}
      />
    )
  }

  function renderBrandsEmptyState() {
    return (
      <BrandsEmptyState
        variant={hasSearch ? 'no-results' : 'empty'}
        isAdmin={isAdmin}
        onCreate={() => setCreateBrandOpen(true)}
        onClearSearch={() => setSearch('')}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Marcas y modelos</h1>
          <p className="text-sm text-muted-foreground">
            Gestioná las marcas y modelos de vehículos del catálogo
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border p-0.5">
            <Button
              variant={tab === 'models' ? 'secondary' : 'ghost'}
              size="sm"
              className="cursor-pointer px-3"
              onClick={() => setTab('models')}
            >
              <CarFront />
              Modelos
            </Button>
            <Button
              variant={tab === 'brands' ? 'secondary' : 'ghost'}
              size="sm"
              className="cursor-pointer px-3"
              onClick={() => setTab('brands')}
            >
              <Car />
              Marcas
            </Button>
          </div>
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
            <>
              {tab === 'models' ? (
                <Button onClick={() => setCreateModelOpen(true)}>
                  <Plus />
                  Nuevo modelo
                </Button>
              ) : (
                <Button onClick={() => setCreateBrandOpen(true)}>
                  <Plus />
                  Nueva marca
                </Button>
              )}
            </>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={tab === 'models' ? 'Buscar por modelo o marca...' : 'Buscar por marca...'}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="cursor-text pl-9"
          />
        </div>

        {tab === 'models' ? (
          <Select value={brandId ?? 'all'} onValueChange={handleBrandChange}>
            <SelectTrigger className="w-full cursor-pointer sm:w-44">
              <SelectValue placeholder="Marca">
                {selectedBrand ? selectedBrand.name : 'Todas las marcas'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="cursor-pointer">
                Todas las marcas
              </SelectItem>
              {brands.map((brand) => (
                <SelectItem key={brand.id} value={brand.id} className="cursor-pointer">
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}

        <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
          <SelectTrigger className="w-full cursor-pointer sm:w-44">
            <SelectValue placeholder="Ordenar">
              {sortBy === 'sort_order' ? 'Orden' : 'Nombre'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name" className="cursor-pointer">
              Nombre
            </SelectItem>
            {tab === 'brands' ? (
              <SelectItem value="sort_order" className="cursor-pointer">
                Orden
              </SelectItem>
            ) : null}
          </SelectContent>
        </Select>
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
      ) : activeRows.length === 0 ? (
        tab === 'models' ? renderModelsEmptyState() : renderBrandsEmptyState()
      ) : tab === 'models' ? (
        viewMode === 'table' ? (
          <ModelsDataTable
            data={filteredModels}
            onModelClick={handleModelClick}
            emptyState={renderModelsEmptyState()}
          />
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {paginatedModels.map((model) => (
                <ModelCard
                  key={model.id}
                  model={model}
                  onTitleClick={() => handleModelClick(model.id)}
                />
              ))}
            </div>
            {filteredModels.length > CARDS_PAGE_SIZE ? (
              <PaginationBar
                summary={`Mostrando ${cardsPageStart + 1}-${Math.min(cardsPageStart + CARDS_PAGE_SIZE, filteredModels.length)} de ${filteredModels.length} modelos`}
                totalCount={filteredModels.length}
                canPrevious={cardsCanPrevious}
                canNext={cardsCanNext}
                onPrevious={() => setCardsPageIndex((prev) => prev - 1)}
                onNext={() => setCardsPageIndex((prev) => prev + 1)}
              />
            ) : null}
          </div>
        )
      ) : viewMode === 'table' ? (
        <BrandsDataTable
          data={filteredBrands}
          onBrandClick={handleBrandClick}
          emptyState={renderBrandsEmptyState()}
        />
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paginatedBrands.map((brand) => (
              <BrandCard
                key={brand.id}
                brand={brand}
                onTitleClick={() => handleBrandClick(brand.id)}
              />
            ))}
          </div>
          {filteredBrands.length > CARDS_PAGE_SIZE ? (
            <PaginationBar
              summary={`Mostrando ${cardsPageStart + 1}-${Math.min(cardsPageStart + CARDS_PAGE_SIZE, filteredBrands.length)} de ${filteredBrands.length} marcas`}
              totalCount={filteredBrands.length}
              canPrevious={cardsCanPrevious}
              canNext={cardsCanNext}
              onPrevious={() => setCardsPageIndex((prev) => prev - 1)}
              onNext={() => setCardsPageIndex((prev) => prev + 1)}
            />
          ) : null}
        </div>
      )}

      <BrandDetailDialog
        brandId={selectedBrandId}
        open={brandDetailOpen}
        onOpenChange={(nextOpen) => {
          setBrandDetailOpen(nextOpen)
          if (!nextOpen) setSelectedBrandId(null)
        }}
      />

      <ModelDetailDialog
        modelId={selectedModelId}
        open={modelDetailOpen}
        onOpenChange={(nextOpen) => {
          setModelDetailOpen(nextOpen)
          if (!nextOpen) setSelectedModelId(null)
        }}
      />

      {isAdmin ? (
        <>
          <BrandFormDialog
            mode="create"
            open={createBrandOpen}
            onOpenChange={setCreateBrandOpen}
            onSuccess={handleBrandCreated}
            suggestedSortOrder={suggestedBrandSortOrder}
          />
          <ModelFormDialog
            mode="create"
            open={createModelOpen}
            onOpenChange={setCreateModelOpen}
            onSuccess={handleModelCreated}
            defaultBrandId={brandId}
          />
        </>
      ) : null}
    </div>
  )
}
