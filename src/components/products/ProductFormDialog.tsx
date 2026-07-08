import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { BrandModelFields } from '@/components/products/BrandModelFields'
import { ImageUploader } from '@/components/products/ImageUploader'
import { Button } from '@/components/ui/button'
import { ModalShell } from '@/components/ui/modal-shell'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { useCategories } from '@/hooks/useCategories'
import {
  useCreateProduct,
  useProductDetail,
  useUpdateProduct,
  type InitialUnitValues,
} from '@/hooks/useProducts'
import type { ProductWithDetails } from '@/lib/types'

const productSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  description: z.string(),
  category_id: z.string().min(1, 'Seleccioná una categoría'),
  brand_id: z.string().nullable(),
  model_id: z.string().nullable(),
  vehicle_year_range: z.string(),
  reference_price: z.number().nullable(),
})

type ProductFormData = z.infer<typeof productSchema>

interface ProductFormDialogProps {
  mode: 'create' | 'edit'
  product?: ProductWithDetails | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (productId?: string) => void
}

const emptyUnit = (): InitialUnitValues => ({
  sku: '',
  cost_price: null,
  location: '',
  notes: '',
})

export function ProductFormDialog({
  mode,
  product,
  open,
  onOpenChange,
  onSuccess,
}: ProductFormDialogProps) {
  const { data: categories = [] } = useCategories()
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct(product?.id ?? '')
  const { data: liveProduct } = useProductDetail(
    mode === 'edit' && open ? (product?.id ?? null) : null,
  )

  const [initialUnits, setInitialUnits] = useState<InitialUnitValues[]>([emptyUnit()])
  const [pendingImageFiles, setPendingImageFiles] = useState<File[]>([])

  const isPending = createProduct.isPending || updateProduct.isPending
  const existingImages = liveProduct?.images ?? product?.images ?? []

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      category_id: '',
      brand_id: null,
      model_id: null,
      vehicle_year_range: '',
      reference_price: null,
    },
  })

  useEffect(() => {
    if (!open) return

    if (mode === 'edit' && product) {
      form.reset({
        name: product.name,
        description: product.description ?? '',
        category_id: product.category_id ?? '',
        brand_id: product.brand_id,
        model_id: product.model_id,
        vehicle_year_range: product.vehicle_year_range ?? '',
        reference_price: product.reference_price,
      })
    } else if (mode === 'create') {
      form.reset({
        name: '',
        description: '',
        category_id: '',
        brand_id: null,
        model_id: null,
        vehicle_year_range: '',
        reference_price: null,
      })
      setInitialUnits([emptyUnit()])
    }

    setPendingImageFiles([])
  }, [mode, product, open, form])

  function addUnitRow() {
    setInitialUnits((prev) => [...prev, emptyUnit()])
  }

  function removeUnitRow(index: number) {
    setInitialUnits((prev) => prev.filter((_, i) => i !== index))
  }

  function updateUnitRow(index: number, field: keyof InitialUnitValues, value: string) {
    setInitialUnits((prev) =>
      prev.map((unit, i) =>
        i === index
          ? {
              ...unit,
              [field]: field === 'cost_price' ? (value === '' ? null : Number(value)) : value,
            }
          : unit,
      ),
    )
  }

  async function onSubmit(values: ProductFormData) {
    if (mode === 'create') {
      const units = initialUnits.filter((unit) => unit.sku.trim())
      const result = await createProduct.mutateAsync({
        ...values,
        initialUnits: units,
        imageFiles: pendingImageFiles,
      })
      onOpenChange(false)
      onSuccess?.(result.id)
      return
    }

    if (!product) return

    await updateProduct.mutateAsync(values)
    onOpenChange(false)
    onSuccess?.(product.id)
  }

  return (
    <ModalShell
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'Nuevo artículo' : 'Editar artículo'}
      description={
        mode === 'create'
          ? 'Completá los datos del repuesto y las unidades iniciales.'
          : 'Modificá los datos del artículo en el catálogo.'
      }
      className="sm:max-w-lg"
      footer={
        <Button type="submit" form="product-form" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="animate-spin" />
              Guardando...
            </>
          ) : mode === 'create' ? (
            'Crear artículo'
          ) : (
            'Guardar cambios'
          )}
        </Button>
      }
    >
      <form id="product-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pb-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" {...form.register('name')} />
            {form.formState.errors.name ? (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" rows={3} {...form.register('description')} />
          </div>

          <BrandModelFields
            brandId={form.watch('brand_id')}
            modelId={form.watch('model_id')}
            onBrandChange={(brandId) => {
              form.setValue('brand_id', brandId)
              form.setValue('model_id', null)
            }}
            onModelChange={(modelId) => form.setValue('model_id', modelId)}
          />

          <div className="space-y-2">
            <Label>Categoría</Label>
            <Select
              value={form.watch('category_id')}
              onValueChange={(value) => form.setValue('category_id', value, { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.category_id ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.category_id.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="vehicle_year_range">Año/s</Label>
            <Input
              id="vehicle_year_range"
              placeholder="2015-2020"
              {...form.register('vehicle_year_range')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference_price">Precio referencia</Label>
            <Input
              id="reference_price"
              type="number"
              min={0}
              step="0.01"
              {...form.register('reference_price', {
                setValueAs: (value) =>
                  value === '' || value == null ? null : Number(value),
              })}
            />
          </div>

          <Separator />

          <ImageUploader
            productId={mode === 'edit' ? product?.id : null}
            existingImages={mode === 'edit' ? existingImages : []}
            pendingFiles={pendingImageFiles}
            onPendingFilesChange={setPendingImageFiles}
          />

          {mode === 'create' ? (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Unidades iniciales</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addUnitRow}>
                    <Plus />
                    Agregar
                  </Button>
                </div>
                {initialUnits.map((unit, index) => (
                  <div key={index} className="space-y-2 rounded-lg border p-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="SKU"
                        value={unit.sku}
                        onChange={(e) => updateUnitRow(index, 'sku', e.target.value)}
                        className="flex-1 font-mono text-sm"
                      />
                      <Input
                        type="number"
                        placeholder="Costo"
                        min={0}
                        value={unit.cost_price ?? ''}
                        onChange={(e) => updateUnitRow(index, 'cost_price', e.target.value)}
                        className="w-28"
                      />
                      {initialUnits.length > 1 ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeUnitRow(index)}
                        >
                          <Trash2 />
                        </Button>
                      ) : null}
                    </div>
                    <Input
                      placeholder="Ubicación (ej: Estante 3)"
                      value={unit.location}
                      onChange={(e) => updateUnitRow(index, 'location', e.target.value)}
                    />
                    <Textarea
                      placeholder="Notas"
                      rows={2}
                      value={unit.notes}
                      onChange={(e) => updateUnitRow(index, 'notes', e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </>
          ) : null}
      </form>
    </ModalShell>
  )
}
