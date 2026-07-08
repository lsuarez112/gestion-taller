import { CategoryIcon } from '@/components/categories/CategoryIcon'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import type { CategoryWithCount } from '@/hooks/useCategories'
import { getCategoryIconLabel } from '@/lib/category-icons'

interface CategoryCardProps {
  category: CategoryWithCount
  onTitleClick: () => void
}

export function CategoryCard({ category, onTitleClick }: CategoryCardProps) {
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle
            className="line-clamp-2 cursor-pointer text-base hover:underline"
            role="button"
            tabIndex={0}
            onClick={onTitleClick}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onTitleClick()
              }
            }}
          >
            {category.name}
          </CardTitle>
          <Badge variant="outline" className="shrink-0 font-mono">
            #{category.sort_order}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-1 pb-2">
        {category.icon ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CategoryIcon icon={category.icon} className="size-3.5" />
            <span>{getCategoryIconLabel(category.icon)}</span>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Sin icono</p>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <Badge variant="secondary">{category.product_count} artículos</Badge>
      </CardFooter>
    </Card>
  )
}
