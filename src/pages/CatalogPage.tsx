import { LayoutGrid, Plus, Search, TableIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

import { CategoryIcon } from '@/components/categories/CategoryIcon'
import { CategoriesEmptyState } from '@/components/categories/CategoriesEmptyState'
import { ProductCard } from '@/components/products/ProductCard'
import { ProductDetailDialog } from '@/components/products/ProductDetailDialog'
import { ProductFormDialog } from '@/components/products/ProductFormDialog'
import { ProductsDataTable } from '@/components/products/products-data-table'
import { ProductsEmptyState } from '@/components/products/ProductsEmptyState'
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
import { useBrands } from '@/hooks/useBrands'
import { useCategories } from '@/hooks/useCategories'
import { useModels } from '@/hooks/useModels'
import { useProducts } from '@/hooks/useProducts'
import type { ProductSortOption } from '@/lib/types'
import { cn } from '@/lib/utils'

type ViewMode = 'table' | 'cards'

const CARDS_PAGE_SIZE = 8

export function CatalogPage() {
  const { isAdmin } = useAuth()
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [brandId, setBrandId] = useState<string | null>(null)
  const [modelId, setModelId] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<ProductSortOption>('name')
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [cardsPageIndex, setCardsPageIndex] = useState(0)
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)

  const { data: categories = [] } = useCategories()
  const { data: brands = [] } = useBrands()
  const { data: models = [] } = useModels(brandId)
  const { data: products = [], isLoading } = useProducts({
    search,
    categoryId,
    brandId,
    modelId,
    sortBy,
  })

  useEffect(() => {
    setCardsPageIndex(0)
  }, [search, categoryId, brandId, modelId, sortBy, viewMode, products.length])

  function handleProductClick(productId: string) {
    setSelectedProductId(productId)
    setDetailOpen(true)
  }

  function handleCreated(productId?: string) {
    if (productId) {
      setSelectedProductId(productId)
      setDetailOpen(true)
    }
  }

  const hasSearch = search.trim().length > 0
  const selectedCategory = categories.find((category) => category.id === categoryId)
  const selectedBrand = brands.find((brand) => brand.id === brandId)
  const selectedModel = models.find((model) => model.id === modelId)
  const hasActiveFilters = Boolean(categoryId || brandId || modelId)

  function handleClearSearch() {
    setSearch('')
  }

  function handleClearCategory() {
    setCategoryId(null)
  }

  function handleBrandChange(value: string) {
    const nextBrandId = value === 'all' ? null : value
    setBrandId(nextBrandId)
    setModelId(null)
  }

  function renderEmptyState() {
    if (hasActiveFilters) {
      return (
        <CategoriesEmptyState
          context="catalog-filter"
          categoryName={
            [selectedCategory?.name, selectedBrand?.name, selectedModel?.name]
              .filter(Boolean)
              .join(' · ') || undefined
          }
          isAdmin={isAdmin}
          hasSearch={hasSearch}
          onClearCategory={() => {
            handleClearCategory()
            setBrandId(null)
            setModelId(null)
          }}
          onClearSearch={handleClearSearch}
          onCreate={() => setCreateOpen(true)}
        />
      )
    }

    return (
      <ProductsEmptyState
        variant={hasSearch ? 'no-results' : 'empty'}
        isAdmin={isAdmin}
        onCreate={() => setCreateOpen(true)}
        onClearSearch={handleClearSearch}
      />
    )
  }

  const cardsPageStart = cardsPageIndex * CARDS_PAGE_SIZE
  const paginatedProducts = products.slice(cardsPageStart, cardsPageStart + CARDS_PAGE_SIZE)
  const cardsCanPrevious = cardsPageIndex > 0
  const cardsCanNext = cardsPageStart + CARDS_PAGE_SIZE < products.length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Artículos</h1>
          <p className="text-sm text-muted-foreground">
            Catálogo de repuestos con stock disponible
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
              Nuevo artículo
            </Button>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="cursor-text pl-9"
          />
        </div>

        <Select
          value={categoryId ?? 'all'}
          onValueChange={(value) => setCategoryId(value === 'all' ? null : value)}
        >
          <SelectTrigger className="w-full cursor-pointer sm:w-48">
            <SelectValue placeholder="Categoría">
              {selectedCategory ? (
                <span className="flex items-center gap-2">
                  <CategoryIcon icon={selectedCategory.icon} />
                  {selectedCategory.name}
                </span>
              ) : (
                'Todas las categorías'
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="cursor-pointer">
              Todas las categorías
            </SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id} className="cursor-pointer">
                <CategoryIcon icon={category.icon} />
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

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

        <Select
          value={modelId ?? 'all'}
          onValueChange={(value) => setModelId(value === 'all' ? null : value)}
          disabled={!brandId}
        >
          <SelectTrigger className="w-full cursor-pointer sm:w-44">
            <SelectValue placeholder={brandId ? 'Modelo' : 'Elegí marca'}>
              {!brandId
                ? 'Elegí marca'
                : selectedModel
                  ? selectedModel.name
                  : 'Todos los modelos'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="cursor-pointer">
              Todos los modelos
            </SelectItem>
            {models.map((model) => (
              <SelectItem key={model.id} value={model.id} className="cursor-pointer">
                {model.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={sortBy}
          onValueChange={(value) => setSortBy(value as ProductSortOption)}
        >
          <SelectTrigger className="w-full cursor-pointer sm:w-44">
            <SelectValue placeholder="Ordenar">
              {sortBy === 'name'
                ? 'Nombre'
                : sortBy === 'created_at'
                  ? 'Más recientes'
                  : 'Mayor stock'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name" className="cursor-pointer">Nombre</SelectItem>
            <SelectItem value="created_at" className="cursor-pointer">Más recientes</SelectItem>
            <SelectItem value="stock" className="cursor-pointer">Mayor stock</SelectItem>
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
      ) : products.length === 0 ? (
        renderEmptyState()
      ) : viewMode === 'table' ? (
        <ProductsDataTable
          data={products}
          onProductClick={handleProductClick}
          emptyState={renderEmptyState()}
        />
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paginatedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onTitleClick={() => handleProductClick(product.id)}
              />
            ))}
          </div>

          {products.length > CARDS_PAGE_SIZE ? (
            <PaginationBar
              summary={`Mostrando ${cardsPageStart + 1}-${Math.min(cardsPageStart + CARDS_PAGE_SIZE, products.length)} de ${products.length} artículos`}
              totalCount={products.length}
              canPrevious={cardsCanPrevious}
              canNext={cardsCanNext}
              onPrevious={() => setCardsPageIndex((prev) => prev - 1)}
              onNext={() => setCardsPageIndex((prev) => prev + 1)}
            />
          ) : null}
        </div>
      )}

      <ProductDetailDialog
        productId={selectedProductId}
        open={detailOpen}
        onOpenChange={(nextOpen) => {
          setDetailOpen(nextOpen)
          if (!nextOpen) setSelectedProductId(null)
        }}
      />

      {isAdmin ? (
        <ProductFormDialog
          mode="create"
          open={createOpen}
          onOpenChange={setCreateOpen}
          onSuccess={handleCreated}
        />
      ) : null}
    </div>
  )
}
