import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ModalShell } from '@/components/ui/modal-shell'
import { Textarea } from '@/components/ui/textarea'
import { useAddUnit } from '@/hooks/useInventory'

const schema = z.object({
  sku: z.string().min(1, 'El SKU es obligatorio'),
  cost_price: z.number().nullable(),
  location: z.string(),
  notes: z.string(),
})

type FormData = z.infer<typeof schema>

interface AddUnitDialogProps {
  productId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddUnitDialog({ productId, open, onOpenChange }: AddUnitDialogProps) {
  const addUnit = useAddUnit(productId)

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { sku: '', cost_price: null, location: '', notes: '' },
  })

  async function onSubmit(values: FormData) {
    await addUnit.mutateAsync({
      sku: values.sku,
      cost_price: values.cost_price,
      location: values.location,
      notes: values.notes,
    })
    form.reset()
    onOpenChange(false)
  }

  return (
    <ModalShell
      open={open}
      onOpenChange={(next) => {
        if (!next) form.reset()
        onOpenChange(next)
      }}
      title="Agregar unidad"
      description="Registrá una nueva pieza física con su SKU único."
      className="sm:max-w-md"
      footer={
        <Button type="submit" form="add-unit-form" disabled={addUnit.isPending}>
          {addUnit.isPending ? (
            <>
              <Loader2 className="animate-spin" />
              Guardando...
            </>
          ) : (
            'Agregar unidad'
          )}
        </Button>
      }
    >
      <form id="add-unit-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="unit-sku">SKU</Label>
          <Input id="unit-sku" className="font-mono" {...form.register('sku')} />
          {form.formState.errors.sku ? (
            <p className="text-sm text-destructive">{form.formState.errors.sku.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit-cost">Precio costo</Label>
          <Input
            id="unit-cost"
            type="number"
            min={0}
            step="0.01"
            {...form.register('cost_price', {
              setValueAs: (value) =>
                value === '' || value == null ? null : Number(value),
            })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit-location">Ubicación</Label>
          <Input
            id="unit-location"
            placeholder="Ej: Estante 3, Depósito fondo"
            {...form.register('location')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit-notes">Notas</Label>
          <Textarea id="unit-notes" rows={2} {...form.register('notes')} />
        </div>
      </form>
    </ModalShell>
  )
}
