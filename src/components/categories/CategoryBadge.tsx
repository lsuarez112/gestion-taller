import type { ReactNode } from 'react'

import { CategoryIcon } from '@/components/categories/CategoryIcon'
import { Badge } from '@/components/ui/badge'
import type { Category } from '@/lib/types'
import { cn } from '@/lib/utils'

interface CategoryBadgeProps {
  category?: Pick<Category, 'name' | 'icon'> | null
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link'
  className?: string
  fallback?: ReactNode
}

export function CategoryBadge({
  category,
  variant = 'outline',
  className,
  fallback = 'Sin categoría',
}: CategoryBadgeProps) {
  if (!category) {
    if (typeof fallback === 'string') {
      return <span className={cn('text-sm text-muted-foreground', className)}>{fallback}</span>
    }
    return fallback
  }

  return (
    <Badge variant={variant} className={cn('max-w-full gap-1', className)}>
      <CategoryIcon icon={category.icon} className="size-3" />
      <span className="truncate">{category.name}</span>
    </Badge>
  )
}
