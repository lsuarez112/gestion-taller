export type UserRole = 'admin' | 'viewer'
export type UnitStatus = 'disponible' | 'vendido' | 'baja'

export interface Profile {
  id: string
  full_name: string | null
  role: UserRole
}

export interface Category {
  id: string
  name: string
  icon: string | null
  sort_order: number
}

export interface Brand {
  id: string
  name: string
  sort_order: number
  created_at: string
}

export interface Model {
  id: string
  brand_id: string
  name: string
  created_at: string
}

export interface Product {
  id: string
  name: string
  description: string | null
  category_id: string | null
  brand_id: string | null
  model_id: string | null
  vehicle_year_range: string | null
  reference_price: number | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface ProductImage {
  id: string
  product_id: string
  storage_path: string
  sort_order: number
}

export interface InventoryUnit {
  id: string
  product_id: string
  sku: string
  status: UnitStatus
  cost_price: number | null
  sale_price: number | null
  sold_at: string | null
  notes: string | null
  location: string
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface ProductStockSummary {
  product_id: string
  units_available: number
  units_sold: number
  units_retired: number
  total_sold_value: number
  brand_name: string | null
  model_name: string | null
}

export interface ProductWithDetails extends Product {
  category?: Category | null
  brand?: Brand | null
  model?: Model | null
  images?: ProductImage[]
  stock?: ProductStockSummary | null
}

export interface DashboardStats {
  totalProducts: number
  unitsAvailable: number
  unitsSold: number
  totalSoldValue: number
}

export interface RecentMovement {
  id: string
  sku: string
  status: UnitStatus
  sale_price: number | null
  sold_at: string | null
  updated_at: string
  product_name: string
}

export type ProductSortOption = 'name' | 'created_at' | 'stock'
