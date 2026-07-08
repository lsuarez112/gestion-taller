import { useQuery } from '@tanstack/react-query'

import { supabase } from '@/lib/supabase'
import type { DashboardStats, RecentMovement } from '@/lib/types'

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async (): Promise<DashboardStats> => {
      const [productsResult, stockResult] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase
          .from('product_stock_summary')
          .select('units_available, units_sold, total_sold_value'),
      ])

      if (productsResult.error) throw productsResult.error
      if (stockResult.error) throw stockResult.error

      const rows = (stockResult.data ?? []) as Array<{
        units_available: number
        units_sold: number
        total_sold_value: number
      }>

      return {
        totalProducts: productsResult.count ?? 0,
        unitsAvailable: rows.reduce((sum, row) => sum + (row.units_available ?? 0), 0),
        unitsSold: rows.reduce((sum, row) => sum + (row.units_sold ?? 0), 0),
        totalSoldValue: rows.reduce((sum, row) => sum + (row.total_sold_value ?? 0), 0),
      }
    },
  })
}

export function useRecentMovements() {
  return useQuery({
    queryKey: ['dashboard', 'recent-movements'],
    queryFn: async (): Promise<RecentMovement[]> => {
      const { data, error } = await supabase
        .from('inventory_units')
        .select(
          `
          id,
          sku,
          status,
          sale_price,
          sold_at,
          updated_at,
          products ( name )
        `,
        )
        .in('status', ['vendido', 'baja'])
        .order('updated_at', { ascending: false })
        .limit(10)

      if (error) throw error

      return (data ?? []).map((row) => {
        const product = row.products as { name: string } | { name: string }[] | null
        const productName = Array.isArray(product) ? product[0]?.name : product?.name

        return {
          id: row.id as string,
          sku: row.sku as string,
          status: row.status as RecentMovement['status'],
          sale_price: row.sale_price as number | null,
          sold_at: row.sold_at as string | null,
          updated_at: row.updated_at as string,
          product_name: productName ?? 'Producto',
        }
      })
    },
  })
}
