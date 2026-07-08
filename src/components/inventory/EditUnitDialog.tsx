import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ModalShell } from '@/components/ui/modal-shell'
import { Textarea } from '@/components/ui/textarea'
import { useUpdateUnit } from '@/hooks/useInventory'
import type { InventoryUnit } from '@/lib/types'

const schema = z.object({
  sku: z.string().min(1, 'El SKU es obligatorio'),
  cost_price: z.number().nullable(),
  location: z.string(),
  notes: z.string(),
  sale_price: z.number().nullable(),
})

type FormData = z.infer<typeof schema>

interface EditUnitDialogProps {
  productId: string
  unit: InventoryUnit | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditUnitDialog({ productId, unit, open, onOpenChange }: EditUnitDialogProps) {
  const updateUnit = useUpdateUnit(productId)

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      sku: '',
      cost_price: null,
      location: '',
      notes: '',
      sale_price: null,
    },
  })

  useEffect(() => {
    if (!open || !unit) return

    form.reset({
      sku: unit.sku,
      cost_price: unit.cost_price,
      location: unit.location ?? '',
      notes: unit.notes ?? '',
      sale_price: unit.sale_price,
    })
  }, [open, unit, form])

  async function onSubmit(values: FormData) {
    if (!unit) return

    await updateUnit.mutateAsync({
      unitId: unit.id,
      status: unit.status,
      values: {
        sku: values.sku,
        cost_price: values.cost_price,
        location: values.location,
        notes: values.notes,
        sale_price: values.sale_price,
      },
    })
    onOpenChange(false)
  }

  return (
    <ModalShell
      open={open}
      onOpenChange={onOpenChange}
      title="Editar unidad"
      description={unit ? `Modificá los datos de la unidad ${unit.sku}.` : undefined}
      className="sm:max-w-md"
      footer={
        <Button type="submit" form="edit-unit-form" disabled={updateUnit.isPending || !unit}>
          {updateUnit.isPending ? (
            <>
              <Loader2 className="animate-spin" />
              Guardando...
            </>
          ) : (
            'Guardar cambios'
          )}
        </Button>
      }
    >
      <form id="edit-unit-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="edit-unit-sku">SKU</Label>
          <Input id="edit-unit-sku" className="font-mono" {...form.register('sku')} />
          {form.formState.errors.sku ? (
            <p className="text-sm text-destructive">{form.formState.errors.sku.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-unit-cost">Precio costo</Label>
          <Input
            id="edit-unit-cost"
            type="number"
            min={0}
            step="0.01"
            {...form.register('cost_price', {
              setValueAs: (value) =>
                value === '' || value == null ? null : Number(value),
            })}
          />
        </div>

        {unit?.status === 'vendido' ? (
          <div className="space-y-2">
            <Label htmlFor="edit-unit-sale">Precio venta</Label>
            <Input
              id="edit-unit-sale"
              type="number"
              min={0}
              step="0.01"
              {...form.register('sale_price', {
                setValueAs: (value) =>
                  value === '' || value == null ? null : Number(value),
              })}
            />
          </div>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="edit-unit-location">Ubicación</Label>
          <Input
            id="edit-unit-location"
            placeholder="Ej: Estante 3, Depósito fondo"
            {...form.register('location')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-unit-notes">Notas</Label>
          <Textarea id="edit-unit-notes" rows={2} {...form.register('notes')} />
        </div>
      </form>
    </ModalShell>
  )
}
