import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ModalShell } from '@/components/ui/modal-shell'
import { useSellUnit } from '@/hooks/useInventory'

const schema = z.object({
  sale_price: z.number({ error: 'Ingresá el precio de venta' }).min(0, 'El precio debe ser mayor o igual a 0'),
})

type FormData = z.infer<typeof schema>

interface SellUnitDialogProps {
  productId: string
  unitId: string | null
  sku?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SellUnitDialog({
  productId,
  unitId,
  sku,
  open,
  onOpenChange,
}: SellUnitDialogProps) {
  const sellUnit = useSellUnit(productId)

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { sale_price: 0 },
  })

  async function onSubmit(values: FormData) {
    if (!unitId) return
    await sellUnit.mutateAsync({ unitId, values })
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
      title="Registrar venta"
      description={
        sku ? `Unidad ${sku}` : 'Ingresá el precio de venta de la unidad.'
      }
      className="sm:max-w-md"
      footer={
        <Button type="submit" form="sell-unit-form" disabled={sellUnit.isPending}>
          {sellUnit.isPending ? (
            <>
              <Loader2 className="animate-spin" />
              Registrando...
            </>
          ) : (
            'Confirmar venta'
          )}
        </Button>
      }
    >
      <form id="sell-unit-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="sale-price">Precio de venta</Label>
          <Input
            id="sale-price"
            type="number"
            min={0}
            step="0.01"
            autoFocus
            {...form.register('sale_price', {
              setValueAs: (value) => Number(value),
            })}
          />
          {form.formState.errors.sale_price ? (
            <p className="text-sm text-destructive">
              {form.formState.errors.sale_price.message}
            </p>
          ) : null}
        </div>
      </form>
    </ModalShell>
  )
}
