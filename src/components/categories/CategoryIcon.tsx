import type { ReactNode } from 'react'

import { getCategoryIcon } from '@/lib/category-icons'
import { cn } from '@/lib/utils'

interface CategoryIconProps {
  icon: string | null | undefined
  className?: string
  fallback?: ReactNode
}

export function CategoryIcon({ icon, className, fallback = null }: CategoryIconProps) {
  const Icon = getCategoryIcon(icon)
  if (!Icon) return fallback

  return <Icon className={cn('size-4 shrink-0', className)} aria-hidden />
}
