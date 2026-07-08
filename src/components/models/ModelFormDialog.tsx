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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useBrands } from '@/hooks/useBrands'
import {
  useCreateModel,
  useUpdateModel,
  type ModelFormValues,
  type ModelWithCount,
} from '@/hooks/useModels'

const modelSchema = z.object({
  brand_id: z.string().min(1, 'Seleccioná una marca'),
  name: z.string().min(1, 'El nombre es obligatorio'),
})

type ModelFormData = z.infer<typeof modelSchema>

interface ModelFormDialogProps {
  mode: 'create' | 'edit'
  model?: ModelWithCount | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (modelId?: string) => void
  defaultBrandId?: string | null
}

export function ModelFormDialog({
  mode,
  model,
  open,
  onOpenChange,
  onSuccess,
  defaultBrandId = null,
}: ModelFormDialogProps) {
  const { data: brands = [] } = useBrands()
  const createModel = useCreateModel()
  const updateModel = useUpdateModel(model?.id ?? '')
  const isPending = createModel.isPending || updateModel.isPending

  const form = useForm<ModelFormData>({
    resolver: zodResolver(modelSchema),
    defaultValues: { brand_id: '', name: '' },
  })

  useEffect(() => {
    if (!open) return

    if (mode === 'edit' && model) {
      form.reset({ brand_id: model.brand_id, name: model.name })
    } else if (mode === 'create') {
      form.reset({ brand_id: defaultBrandId ?? '', name: '' })
    }
  }, [mode, model, open, form, defaultBrandId])

  async function onSubmit(values: ModelFormData) {
    const payload: ModelFormValues = values

    if (mode === 'create') {
      const result = await createModel.mutateAsync(payload)
      onOpenChange(false)
      onSuccess?.(result.id)
      return
    }

    if (!model) return
    await updateModel.mutateAsync(payload)
    onOpenChange(false)
    onSuccess?.(model.id)
  }

  return (
    <ModalShell
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'Nuevo modelo' : 'Editar modelo'}
      description={
        mode === 'create'
          ? 'Agregá un modelo asociado a una marca.'
          : 'Modificá los datos del modelo.'
      }
      className="sm:max-w-md"
      footer={
        <Button type="submit" form="model-form" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="animate-spin" />
              Guardando...
            </>
          ) : mode === 'create' ? (
            'Crear modelo'
          ) : (
            'Guardar cambios'
          )}
        </Button>
      }
    >
      <form id="model-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label>Marca</Label>
          <Select
            value={form.watch('brand_id')}
            onValueChange={(value) => form.setValue('brand_id', value, { shouldValidate: true })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar marca" />
            </SelectTrigger>
            <SelectContent>
              {brands.map((brand) => (
                <SelectItem key={brand.id} value={brand.id}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.brand_id ? (
            <p className="text-sm text-destructive">{form.formState.errors.brand_id.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="model-name">Modelo</Label>
          <Input id="model-name" {...form.register('name')} />
          {form.formState.errors.name ? (
            <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
          ) : null}
        </div>
      </form>
    </ModalShell>
  )
}
