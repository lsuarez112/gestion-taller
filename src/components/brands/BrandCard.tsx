import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import type { BrandWithCount } from '@/hooks/useBrands'

interface BrandCardProps {
  brand: BrandWithCount
  onTitleClick: () => void
}

export function BrandCard({ brand, onTitleClick }: BrandCardProps) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-2">
        <CardTitle
          className="cursor-pointer text-base hover:underline"
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
          {brand.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2 pb-2">
        <Badge variant="outline" className="font-mono">
          Orden #{brand.sort_order}
        </Badge>
      </CardContent>
      <CardFooter className="gap-2 pt-0">
        <Badge variant="secondary">{brand.model_count} modelos</Badge>
        <Badge variant="outline">{brand.product_count} artículos</Badge>
      </CardFooter>
    </Card>
  )
}
