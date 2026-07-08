import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency, formatDateTime } from '@/lib/format'
import type { RecentMovement, UnitStatus } from '@/lib/types'

const statusLabels: Record<UnitStatus, string> = {
  disponible: 'Disponible',
  vendido: 'Vendido',
  baja: 'Baja',
}

const statusVariants: Record<UnitStatus, 'default' | 'secondary' | 'destructive'> = {
  disponible: 'secondary',
  vendido: 'default',
  baja: 'destructive',
}

interface RecentActivityProps {
  movements: RecentMovement[]
  loading?: boolean
}

export function RecentActivity({ movements, loading }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Últimos movimientos</CardTitle>
        <CardDescription>Ventas y bajas recientes</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </div>
        ) : movements.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay movimientos recientes.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead className="text-right">Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell className="font-medium">{movement.product_name}</TableCell>
                  <TableCell className="font-mono text-xs">{movement.sku}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariants[movement.status]}>
                      {statusLabels[movement.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {movement.status === 'vendido'
                      ? formatCurrency(movement.sale_price)
                      : '—'}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatDateTime(movement.sold_at ?? movement.updated_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
