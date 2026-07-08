import { CategoryBadge } from '@/components/categories/CategoryBadge'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ProductImageCarousel } from '@/components/products/ProductImageCarousel'
import { formatCurrency } from '@/lib/format'
import type { ProductWithDetails } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ProductCardProps {
  product: ProductWithDetails
  onTitleClick: () => void
}

export function ProductCard({ product, onTitleClick }: ProductCardProps) {
  const available = product.stock?.units_available ?? 0

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <div className="relative bg-muted">
        <ProductImageCarousel
          images={product.images}
          productName={product.name}
          variant="card"
        />
        <Badge
          className={cn(
            'absolute right-2 top-2 z-10',
            available === 0 && 'bg-destructive text-white hover:bg-destructive',
          )}
          variant={available > 0 ? 'secondary' : 'destructive'}
        >
          {available} en stock
        </Badge>
        {product.category ? (
          <CategoryBadge
            category={product.category}
            variant="secondary"
            className="absolute left-2 top-2 z-10 max-w-[calc(100%-4rem)] bg-background/90 backdrop-blur-sm"
          />
        ) : null}
      </div>

      <CardHeader className="pb-2">
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
          {product.name}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-1 pb-2">
        {(product.brand || product.model) && (
          <div className="flex flex-wrap gap-1">
            {product.brand ? (
              <Badge variant="outline" className="text-xs">
                {product.brand.name}
              </Badge>
            ) : null}
            {product.model ? (
              <Badge variant="outline" className="text-xs">
                {product.model.name}
              </Badge>
            ) : null}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <span className="text-sm font-medium">
          Ref. {formatCurrency(product.reference_price)}
        </span>
      </CardFooter>
    </Card>
  )
}
