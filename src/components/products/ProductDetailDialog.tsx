import { EllipsisVertical, Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'

import { CategoryBadge } from '@/components/categories/CategoryBadge'
import { AddUnitDialog } from '@/components/inventory/AddUnitDialog'
import { EditUnitDialog } from '@/components/inventory/EditUnitDialog'
import { SellUnitDialog } from '@/components/inventory/SellUnitDialog'
import { UnitsEmptyState } from '@/components/inventory/UnitsEmptyState'
import { ProductFormDialog } from '@/components/products/ProductFormDialog'
import { ProductImageCarousel } from '@/components/products/ProductImageCarousel'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ModalShell } from '@/components/ui/modal-shell'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAuth } from '@/hooks/useAuth'
import { useRetireUnit } from '@/hooks/useInventory'
import { useDeleteProduct, useProductDetail } from '@/hooks/useProducts'
import { formatCurrency, formatDate } from '@/lib/format'
import type { InventoryUnit, UnitStatus } from '@/lib/types'

const statusLabels: Record<UnitStatus, string> = {
  disponible: 'Disponible',
  vendido: 'Vendido',
  baja: 'Baja',
}

const statusVariants: Record<UnitStatus, 'default' | 'secondary' | 'destructive'> = {
  disponible: 'secondary',
  vendido: 'default',
  baja: 'destructive',
}

interface ProductDetailDialogProps {
  productId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleted?: () => void
}

export function ProductDetailDialog({
  productId,
  open,
  onOpenChange,
  onDeleted,
}: ProductDetailDialogProps) {
  const { isAdmin } = useAuth()
  const [editOpen, setEditOpen] = useState(false)
  const showView = open && !editOpen
  const { data: product, isLoading } = useProductDetail(showView || editOpen ? productId : null)
  const deleteProduct = useDeleteProduct()
  const retireUnit = useRetireUnit(productId ?? '')

  const [addUnitOpen, setAddUnitOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [sellUnitId, setSellUnitId] = useState<string | null>(null)
  const [sellUnitSku, setSellUnitSku] = useState<string>('')
  const [sellOpen, setSellOpen] = useState(false)
  const [retireUnitId, setRetireUnitId] = useState<string | null>(null)
  const [retireOpen, setRetireOpen] = useState(false)
  const [editUnit, setEditUnit] = useState<InventoryUnit | null>(null)
  const [editUnitOpen, setEditUnitOpen] = useState(false)

  useEffect(() => {
    if (!open) setEditOpen(false)
  }, [open])

  function handleEditClick() {
    setEditOpen(true)
  }

  function handleEditClose(nextOpen: boolean) {
    setEditOpen(nextOpen)
  }

  function handleEditComplete() {
    setEditOpen(false)
  }

  async function handleDelete() {
    if (!productId) return
    await deleteProduct.mutateAsync(productId)
    setDeleteOpen(false)
    onOpenChange(false)
    onDeleted?.()
  }

  async function handleRetire() {
    if (!retireUnitId) return
    await retireUnit.mutateAsync(retireUnitId)
    setRetireOpen(false)
    setRetireUnitId(null)
  }

  function openSellDialog(unitId: string, sku: string) {
    setSellUnitId(unitId)
    setSellUnitSku(sku)
    setSellOpen(true)
  }

  function openRetireDialog(unitId: string) {
    setRetireUnitId(unitId)
    setRetireOpen(true)
  }

  function openEditDialog(unit: InventoryUnit) {
    setEditUnit(unit)
    setEditUnitOpen(true)
  }

  const headerActions =
    isAdmin && product ? (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="size-8 shrink-0 cursor-pointer">
            <EllipsisVertical className="size-4" />
            <span className="sr-only">Acciones del artículo</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem className="cursor-pointer" onClick={handleEditClick}>
            <Pencil />
            Editar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            className="cursor-pointer"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ) : null

  return (
    <>
      <ModalShell
        open={showView}
        onOpenChange={onOpenChange}
        title={product?.name}
        description={
          product?.category ? (
            <CategoryBadge category={product.category} variant="secondary" />
          ) : (
            'Sin categoría'
          )
        }
        headerActions={headerActions}
        className="sm:max-w-3xl"
      >
        {isLoading || !product ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="flex justify-center md:justify-start">
                <ProductImageCarousel
                  images={product.images}
                  productName={product.name}
                  className="w-full max-w-[280px]"
                />
              </div>

              <div className="flex flex-col gap-4">
                {product.description ? (
                  <p className="text-sm text-muted-foreground">{product.description}</p>
                ) : null}

                <div className="flex flex-col gap-3">
                  {(product.brand || product.model) ? (
                    <div>
                      <p className="mb-1.5 text-xs text-muted-foreground">Marca y modelo</p>
                      <div className="flex flex-wrap gap-1.5">
                        {product.brand ? (
                          <Badge variant="outline">{product.brand.name}</Badge>
                        ) : null}
                        {product.model ? (
                          <Badge variant="outline">{product.model.name}</Badge>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                  <div>
                    <p className="text-xs text-muted-foreground">Año/s</p>
                    <p className="text-sm font-medium">
                      {product.vehicle_year_range || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Precio referencia</p>
                    <p className="text-sm font-medium">
                      {formatCurrency(product.reference_price)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {product.category ? (
                <CategoryBadge category={product.category} variant="outline" />
              ) : null}
              {product.brand ? (
                <Badge variant="outline">{product.brand.name}</Badge>
              ) : null}
              {product.model ? (
                <Badge variant="outline">{product.model.name}</Badge>
              ) : null}
              <Badge variant="secondary">
                {product.stock?.units_available ?? 0} disponibles
              </Badge>
              <Badge variant="default">
                {product.stock?.units_sold ?? 0} vendidas
              </Badge>
              <Badge variant="destructive">
                {product.stock?.units_retired ?? 0} bajas
              </Badge>
            </div>

            <Separator />

            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold">Unidades</h3>
                {isAdmin ? (
                  <Button variant="outline" size="sm" onClick={() => setAddUnitOpen(true)}>
                    <Plus />
                    Agregar unidad
                  </Button>
                ) : null}
              </div>

              {product.units.length === 0 ? (
                <UnitsEmptyState
                  isAdmin={isAdmin}
                  onAddUnit={() => setAddUnitOpen(true)}
                />
              ) : (
                <ScrollArea className="w-full min-w-0">
                  <div className="min-w-max">
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead>Ubicación</TableHead>
                      <TableHead>Notas</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Costo</TableHead>
                      <TableHead className="text-right">Venta</TableHead>
                      <TableHead className="text-right">Fecha</TableHead>
                      {isAdmin ? (
                        <TableHead className="text-right">Acciones</TableHead>
                      ) : null}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {product.units.map((unit) => (
                      <TableRow key={unit.id}>
                        <TableCell className="font-mono text-xs">{unit.sku}</TableCell>
                        <TableCell className="min-w-[120px] font-medium">
                          {unit.location || '—'}
                        </TableCell>
                        <TableCell className="min-w-[140px] max-w-[220px] text-muted-foreground">
                          <span className="line-clamp-2">{unit.notes || '—'}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariants[unit.status]}>
                            {statusLabels[unit.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(unit.cost_price)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(unit.sale_price)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {formatDate(unit.sold_at ?? unit.created_at)}
                        </TableCell>
                        {isAdmin ? (
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="xs"
                                onClick={() => openEditDialog(unit)}
                              >
                                Editar
                              </Button>
                              {unit.status === 'disponible' ? (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="xs"
                                    onClick={() => openSellDialog(unit.id, unit.sku)}
                                  >
                                    Vender
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="xs"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => openRetireDialog(unit.id)}
                                  >
                                    Baja
                                  </Button>
                                </>
                              ) : null}
                            </div>
                          </TableCell>
                        ) : null}
                      </TableRow>
                    ))}
                  </TableBody>
                  </Table>
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              )}
            </div>
          </div>
        )}
      </ModalShell>

      {product ? (
        <ProductFormDialog
          mode="edit"
          product={product}
          open={editOpen}
          onOpenChange={handleEditClose}
          onSuccess={handleEditComplete}
        />
      ) : null}

      {productId ? (
        <AddUnitDialog
          productId={productId}
          open={addUnitOpen}
          onOpenChange={setAddUnitOpen}
        />
      ) : null}

      {productId ? (
        <EditUnitDialog
          productId={productId}
          unit={editUnit}
          open={editUnitOpen}
          onOpenChange={(nextOpen) => {
            setEditUnitOpen(nextOpen)
            if (!nextOpen) setEditUnit(null)
          }}
        />
      ) : null}

      {productId ? (
        <SellUnitDialog
          productId={productId}
          unitId={sellUnitId}
          sku={sellUnitSku}
          open={sellOpen}
          onOpenChange={setSellOpen}
        />
      ) : null}

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar artículo?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminarán el producto, sus imágenes y todas las unidades asociadas.
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteProduct.isPending}
              onClick={(event) => {
                event.preventDefault()
                void handleDelete()
              }}
            >
              {deleteProduct.isPending ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={retireOpen} onOpenChange={setRetireOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Dar de baja la unidad?</AlertDialogTitle>
            <AlertDialogDescription>
              La unidad dejará de estar disponible en el inventario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={retireUnit.isPending}
              onClick={(event) => {
                event.preventDefault()
                void handleRetire()
              }}
            >
              {retireUnit.isPending ? 'Procesando...' : 'Confirmar baja'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
