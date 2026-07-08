import { EllipsisVertical, Loader2, Pencil, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'

import { ModelFormDialog } from '@/components/models/ModelFormDialog'
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
import { useDeleteModel, useModelDetail } from '@/hooks/useModels'

interface ModelDetailDialogProps {
  modelId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleted?: () => void
}

export function ModelDetailDialog({
  modelId,
  open,
  onOpenChange,
  onDeleted,
}: ModelDetailDialogProps) {
  const { isAdmin } = useAuth()
  const [editOpen, setEditOpen] = useState(false)
  const showView = open && !editOpen
  const { data: model, isLoading } = useModelDetail(showView || editOpen ? modelId : null)
  const deleteModel = useDeleteModel()
  const [deleteOpen, setDeleteOpen] = useState(false)

  useEffect(() => {
    if (!open) setEditOpen(false)
  }, [open])

  async function handleDelete() {
    if (!modelId) return
    await deleteModel.mutateAsync(modelId)
    setDeleteOpen(false)
    onOpenChange(false)
    onDeleted?.()
  }

  const headerActions =
    isAdmin && model ? (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="size-8 shrink-0 cursor-pointer">
            <EllipsisVertical className="size-4" />
            <span className="sr-only">Acciones del modelo</span>
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
        title={model?.name}
        description={model?.brand?.name ?? 'Detalle de modelo'}
        headerActions={headerActions}
        className="sm:max-w-md"
      >
        {isLoading || !model ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {model.brand ? <Badge variant="outline">{model.brand.name}</Badge> : null}
            <Badge variant="secondary">{model.product_count} artículos</Badge>
          </div>
        )}
      </ModalShell>

      {model ? (
        <ModelFormDialog
          mode="edit"
          model={model}
          open={editOpen}
          onOpenChange={setEditOpen}
          onSuccess={() => setEditOpen(false)}
        />
      ) : null}

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar modelo?</AlertDialogTitle>
            <AlertDialogDescription>
              {model && model.product_count > 0
                ? `Este modelo tiene ${model.product_count} artículo(s) asociado(s). No se puede eliminar hasta reasignarlos.`
                : 'Esta acción no se puede deshacer.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteModel.isPending || (model?.product_count ?? 0) > 0}
              onClick={(event) => {
                event.preventDefault()
                void handleDelete()
              }}
            >
              {deleteModel.isPending ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
