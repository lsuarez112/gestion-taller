import { EllipsisVertical, Loader2, Pencil, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'

import { BrandFormDialog } from '@/components/brands/BrandFormDialog'
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
import { useAuth } from '@/hooks/useAuth'
import { useBrandDetail, useDeleteBrand } from '@/hooks/useBrands'

interface BrandDetailDialogProps {
  brandId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleted?: () => void
}

export function BrandDetailDialog({
  brandId,
  open,
  onOpenChange,
  onDeleted,
}: BrandDetailDialogProps) {
  const { isAdmin } = useAuth()
  const [editOpen, setEditOpen] = useState(false)
  const showView = open && !editOpen
  const { data: brand, isLoading } = useBrandDetail(showView || editOpen ? brandId : null)
  const deleteBrand = useDeleteBrand()
  const [deleteOpen, setDeleteOpen] = useState(false)

  useEffect(() => {
    if (!open) setEditOpen(false)
  }, [open])

  async function handleDelete() {
    if (!brandId) return
    await deleteBrand.mutateAsync(brandId)
    setDeleteOpen(false)
    onOpenChange(false)
    onDeleted?.()
  }

  const headerActions =
    isAdmin && brand ? (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="size-8 shrink-0 cursor-pointer">
            <EllipsisVertical className="size-4" />
            <span className="sr-only">Acciones de la marca</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem className="cursor-pointer" onClick={() => setEditOpen(true)}>
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

  const hasDependencies = (brand?.model_count ?? 0) > 0 || (brand?.product_count ?? 0) > 0

  return (
    <>
      <ModalShell
        open={showView}
        onOpenChange={onOpenChange}
        title={brand?.name}
        description="Detalle de marca"
        headerActions={headerActions}
        className="sm:max-w-md"
      >
        {isLoading || !brand ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="font-mono">
              Orden #{brand.sort_order}
            </Badge>
            <Badge variant="secondary">{brand.model_count} modelos</Badge>
            <Badge variant="secondary">{brand.product_count} artículos</Badge>
          </div>
        )}
      </ModalShell>

      {brand ? (
        <BrandFormDialog
          mode="edit"
          brand={brand}
          open={editOpen}
          onOpenChange={setEditOpen}
          onSuccess={() => setEditOpen(false)}
        />
      ) : null}

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar marca?</AlertDialogTitle>
            <AlertDialogDescription>
              {hasDependencies
                ? 'Esta marca tiene modelos o artículos asociados. No se puede eliminar hasta reasignarlos.'
                : 'Esta acción no se puede deshacer.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteBrand.isPending || hasDependencies}
              onClick={(event) => {
                event.preventDefault()
                void handleDelete()
              }}
            >
              {deleteBrand.isPending ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
