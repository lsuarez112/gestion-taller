import { DollarSign, Package, ShoppingCart, Warehouse } from 'lucide-react'

import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { StatCard } from '@/components/dashboard/StatCard'
import { useDashboardStats, useRecentMovements } from '@/hooks/useDashboard'
import { formatCurrency } from '@/lib/format'

export function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: movements = [], isLoading: movementsLoading } = useRecentMovements()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Inicio</h1>
        <p className="text-sm text-muted-foreground">
          Resumen del inventario de repuestos
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total productos"
          value={stats?.totalProducts ?? 0}
          icon={Package}
          loading={statsLoading}
        />
        <StatCard
          title="Unidades disponibles"
          value={stats?.unitsAvailable ?? 0}
          icon={Warehouse}
          loading={statsLoading}
        />
        <StatCard
          title="Unidades vendidas"
          value={stats?.unitsSold ?? 0}
          icon={ShoppingCart}
          loading={statsLoading}
        />
        <StatCard
          title="Valor total vendido"
          value={formatCurrency(stats?.totalSoldValue ?? 0)}
          icon={DollarSign}
          loading={statsLoading}
        />
      </div>

      <RecentActivity movements={movements} loading={movementsLoading} />
    </div>
  )
}
