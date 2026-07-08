import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import type { ModelWithCount } from '@/hooks/useModels'

interface ModelCardProps {
  model: ModelWithCount
  onTitleClick: () => void
}

export function ModelCard({ model, onTitleClick }: ModelCardProps) {
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
          {model.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        {model.brand ? <Badge variant="outline">{model.brand.name}</Badge> : null}
      </CardContent>
      <CardFooter className="pt-0">
        <Badge variant="secondary">{model.product_count} artículos</Badge>
      </CardFooter>
    </Card>
  )
}
