import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { CategoryIconSelect } from '@/components/categories/CategoryIconSelect'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ModalShell } from '@/components/ui/modal-shell'
import {
  useCreateCategory,
  useUpdateCategory,
  type CategoryFormValues,
  type CategoryWithCount,
} from '@/hooks/useCategories'

const categorySchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  icon: z.string(),
  sort_order: z.number().int().min(0, 'El orden debe ser mayor o igual a 0'),
})

type CategoryFormData = z.infer<typeof categorySchema>

interface CategoryFormDialogProps {
  mode: 'create' | 'edit'
  category?: CategoryWithCount | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (categoryId?: string) => void
  suggestedSortOrder?: number
}

export function CategoryFormDialog({
  mode,
  category,
  open,
  onOpenChange,
  onSuccess,
  suggestedSortOrder = 0,
}: CategoryFormDialogProps) {
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory(category?.id ?? '')

  const isPending = createCategory.isPending || updateCategory.isPending

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      icon: '',
      sort_order: suggestedSortOrder,
    },
  })

  useEffect(() => {
    if (!open) return

    if (mode === 'edit' && category) {
      form.reset({
        name: category.name,
        icon: category.icon ?? '',
        sort_order: category.sort_order,
      })
    } else if (mode === 'create') {
      form.reset({
        name: '',
        icon: '',
        sort_order: suggestedSortOrder,
      })
    }
  }, [mode, category, open, form, suggestedSortOrder])

  async function onSubmit(values: CategoryFormData) {
    const payload: CategoryFormValues = values

    if (mode === 'create') {
      const result = await createCategory.mutateAsync(payload)
      onOpenChange(false)
      onSuccess?.(result.id)
      return
    }

    if (!category) return

    await updateCategory.mutateAsync(payload)
    onOpenChange(false)
    onSuccess?.(category.id)
  }

  return (
    <ModalShell
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'Nueva categoría' : 'Editar categoría'}
      description={
        mode === 'create'
          ? 'Completá los datos para organizar el catálogo.'
          : 'Modificá los datos de la categoría.'
      }
      className="sm:max-w-md"
      footer={
        <Button type="submit" form="category-form" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="animate-spin" />
              Guardando...
            </>
          ) : mode === 'create' ? (
            'Crear categoría'
          ) : (
            'Guardar cambios'
          )}
        </Button>
      }
    >
      <form id="category-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="category-name">Nombre</Label>
          <Input id="category-name" {...form.register('name')} />
          {form.formState.errors.name ? (
            <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label>Icono</Label>
          <CategoryIconSelect
            value={form.watch('icon')}
            onChange={(value) => form.setValue('icon', value, { shouldDirty: true })}
          />
          <p className="text-xs text-muted-foreground">
            Elegí un icono representativo para la categoría en el catálogo.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category-sort">Orden</Label>
          <Input
            id="category-sort"
            type="number"
            min={0}
            step={1}
            {...form.register('sort_order', {
              setValueAs: (value) => Number(value),
            })}
          />
          {form.formState.errors.sort_order ? (
            <p className="text-sm text-destructive">
              {form.formState.errors.sort_order.message}
            </p>
          ) : null}
        </div>
      </form>
    </ModalShell>
  )
}
