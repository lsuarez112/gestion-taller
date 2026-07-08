import { EllipsisVertical, Loader2, Pencil, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'

import { CategoryFormDialog } from '@/components/categories/CategoryFormDialog'
import { CategoryIcon } from '@/components/categories/CategoryIcon'
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
import { useCategoryDetail, useDeleteCategory } from '@/hooks/useCategories'
import { getCategoryIconLabel } from '@/lib/category-icons'

interface CategoryDetailDialogProps {
  categoryId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleted?: () => void
}

export function CategoryDetailDialog({
  categoryId,
  open,
  onOpenChange,
  onDeleted,
}: CategoryDetailDialogProps) {
  const { isAdmin } = useAuth()
  const [editOpen, setEditOpen] = useState(false)
  const showView = open && !editOpen
  const { data: category, isLoading } = useCategoryDetail(showView || editOpen ? categoryId : null)
  const deleteCategory = useDeleteCategory()
  const [deleteOpen, setDeleteOpen] = useState(false)

  useEffect(() => {
    if (!open) setEditOpen(false)
  }, [open])

  async function handleDelete() {
    if (!categoryId) return
    await deleteCategory.mutateAsync(categoryId)
    setDeleteOpen(false)
    onOpenChange(false)
    onDeleted?.()
  }

  const headerActions =
    isAdmin && category ? (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="size-8 shrink-0 cursor-pointer">
            <EllipsisVertical className="size-4" />
            <span className="sr-only">Acciones de la categoría</span>
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

  return (
    <>
      <ModalShell
        open={showView}
        onOpenChange={onOpenChange}
        title={category?.name}
        description="Detalle de categoría"
        headerActions={headerActions}
        className="sm:max-w-md"
      >
        {isLoading || !category ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="font-mono">
                Orden #{category.sort_order}
              </Badge>
              <Badge variant="secondary">{category.product_count} artículos</Badge>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Icono</p>
                {category.icon ? (
                  <div className="flex items-center gap-2">
                    <CategoryIcon icon={category.icon} className="size-5" />
                    <p className="text-sm font-medium">{getCategoryIconLabel(category.icon)}</p>
                  </div>
                ) : (
                  <p className="text-sm font-medium">—</p>
                )}
              </div>
            </div>
          </div>
        )}
      </ModalShell>

      {category ? (
        <CategoryFormDialog
          mode="edit"
          category={category}
          open={editOpen}
          onOpenChange={setEditOpen}
          onSuccess={() => setEditOpen(false)}
        />
      ) : null}

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
            <AlertDialogDescription>
              {category && category.product_count > 0
                ? `Esta categoría tiene ${category.product_count} artículo(s) asociado(s). No se puede eliminar hasta reasignarlos.`
                : 'Esta acción no se puede deshacer.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteCategory.isPending || (category?.product_count ?? 0) > 0}
              onClick={(event) => {
                event.preventDefault()
                void handleDelete()
              }}
            >
              {deleteCategory.isPending ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
