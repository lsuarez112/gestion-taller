import {
  ArrowUpDown,
  Ban,
  Battery,
  Bus,
  Car,
  CircleStop,
  Cog,
  Disc3,
  Droplet,
  Filter,
  Fuel,
  Gauge,
  Hammer,
  Lightbulb,
  MoveVertical,
  Navigation2,
  Package,
  Settings,
  Tags,
  Thermometer,
  Truck,
  Wind,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react'

export interface CategoryIconOption {
  value: string
  label: string
}

export interface CategoryIconGroup {
  label: string
  icons: CategoryIconOption[]
}

export const CATEGORY_ICON_GROUPS: CategoryIconGroup[] = [
  {
    label: 'Motor y transmisión',
    icons: [
      { value: 'Fuel', label: 'Motor' },
      { value: 'Cog', label: 'Transmisión' },
      { value: 'Gauge', label: 'Instrumentación' },
      { value: 'Thermometer', label: 'Refrigeración' },
    ],
  },
  {
    label: 'Suspensión y dirección',
    icons: [
      { value: 'MoveVertical', label: 'Suspensión' },
      { value: 'ArrowUpDown', label: 'Amortiguación' },
      { value: 'Navigation2', label: 'Dirección' },
    ],
  },
  {
    label: 'Frenos',
    icons: [
      { value: 'Ban', label: 'Frenos' },
      { value: 'CircleStop', label: 'Discos de freno' },
      { value: 'Disc3', label: 'Pastillas' },
    ],
  },
  {
    label: 'Carrocería y vehículo',
    icons: [
      { value: 'Car', label: 'Automóvil' },
      { value: 'Truck', label: 'Camioneta' },
      { value: 'Bus', label: 'Utilitarios' },
    ],
  },
  {
    label: 'Eléctrico e iluminación',
    icons: [
      { value: 'Zap', label: 'Sistema eléctrico' },
      { value: 'Battery', label: 'Batería' },
      { value: 'Lightbulb', label: 'Iluminación' },
    ],
  },
  {
    label: 'Fluidos y filtros',
    icons: [
      { value: 'Droplet', label: 'Aceite y lubricantes' },
      { value: 'Filter', label: 'Filtros' },
      { value: 'Wind', label: 'Aire acondicionado' },
    ],
  },
  {
    label: 'Taller y general',
    icons: [
      { value: 'Wrench', label: 'Herramientas' },
      { value: 'Hammer', label: 'Reparaciones' },
      { value: 'Settings', label: 'Ajustes' },
      { value: 'Package', label: 'Repuestos generales' },
      { value: 'Tags', label: 'Varios' },
    ],
  },
]

export const categoryIconMap: Record<string, LucideIcon> = {
  Fuel,
  Cog,
  Gauge,
  Thermometer,
  MoveVertical,
  ArrowUpDown,
  Navigation2,
  Ban,
  CircleStop,
  Disc3,
  Car,
  Truck,
  Bus,
  Zap,
  Battery,
  Lightbulb,
  Droplet,
  Filter,
  Wind,
  Wrench,
  Hammer,
  Settings,
  Package,
  Tags,
}

export const categoryIconOptions = CATEGORY_ICON_GROUPS.flatMap((group) => group.icons)

export function getCategoryIconLabel(icon: string | null | undefined): string | null {
  if (!icon) return null
  return categoryIconOptions.find((option) => option.value === icon)?.label ?? icon
}

export function getCategoryIcon(icon: string | null | undefined): LucideIcon | null {
  if (!icon) return null
  return categoryIconMap[icon] ?? null
}
