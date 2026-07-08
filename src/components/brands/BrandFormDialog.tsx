import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ModalShell } from '@/components/ui/modal-shell'
import {
  useCreateBrand,
  useUpdateBrand,
  type BrandFormValues,
  type BrandWithCount,
} from '@/hooks/useBrands'

const brandSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  sort_order: z.number().int().min(0, 'El orden debe ser mayor o igual a 0'),
})

type BrandFormData = z.infer<typeof brandSchema>

interface BrandFormDialogProps {
  mode: 'create' | 'edit'
  brand?: BrandWithCount | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (brandId?: string) => void
  suggestedSortOrder?: number
}

export function BrandFormDialog({
  mode,
  brand,
  open,
  onOpenChange,
  onSuccess,
  suggestedSortOrder = 0,
}: BrandFormDialogProps) {
  const createBrand = useCreateBrand()
  const updateBrand = useUpdateBrand(brand?.id ?? '')
  const isPending = createBrand.isPending || updateBrand.isPending

  const form = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
    defaultValues: { name: '', sort_order: suggestedSortOrder },
  })

  useEffect(() => {
    if (!open) return

    if (mode === 'edit' && brand) {
      form.reset({ name: brand.name, sort_order: brand.sort_order })
    } else if (mode === 'create') {
      form.reset({ name: '', sort_order: suggestedSortOrder })
    }
  }, [mode, brand, open, form, suggestedSortOrder])

  async function onSubmit(values: BrandFormData) {
    const payload: BrandFormValues = values

    if (mode === 'create') {
      const result = await createBrand.mutateAsync(payload)
      onOpenChange(false)
      onSuccess?.(result.id)
      return
    }

    if (!brand) return
    await updateBrand.mutateAsync(payload)
    onOpenChange(false)
    onSuccess?.(brand.id)
  }

  return (
    <ModalShell
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'Nueva marca' : 'Editar marca'}
      description={
        mode === 'create'
          ? 'Agregá una marca de vehículo al catálogo.'
          : 'Modificá los datos de la marca.'
      }
      className="sm:max-w-md"
      footer={
        <Button type="submit" form="brand-form" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="animate-spin" />
              Guardando...
            </>
          ) : mode === 'create' ? (
            'Crear marca'
          ) : (
            'Guardar cambios'
          )}
        </Button>
      }
    >
      <form id="brand-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="brand-name">Nombre</Label>
          <Input id="brand-name" {...form.register('name')} />
          {form.formState.errors.name ? (
            <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="brand-sort">Orden</Label>
          <Input
            id="brand-sort"
            type="number"
            min={0}
            {...form.register('sort_order', { valueAsNumber: true })}
          />
          {form.formState.errors.sort_order ? (
            <p className="text-sm text-destructive">{form.formState.errors.sort_order.message}</p>
          ) : null}
        </div>
      </form>
    </ModalShell>
  )
}
