import { Package } from 'lucide-react'

import { ProductImage } from '@/components/products/ProductImage'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import type { ProductImage as ProductImageType } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ProductImageCarouselProps {
  images?: ProductImageType[]
  productName: string
  className?: string
  variant?: 'default' | 'card'
}

export function ProductImageCarousel({
  images = [],
  productName,
  className,
  variant = 'default',
}: ProductImageCarouselProps) {
  const isCard = variant === 'card'
  const imageSizeClass = isCard ? 'aspect-[4/3] w-full object-cover' : 'size-[280px] border'
  const fallbackSizeClass = isCard ? 'aspect-[4/3] w-full' : 'size-[280px] border'

  if (images.length === 0) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-muted',
          isCard ? 'aspect-[4/3] w-full' : 'size-[280px] rounded-lg border',
          className,
        )}
      >
        <Package className="size-12 text-muted-foreground opacity-40" />
      </div>
    )
  }

  if (images.length === 1) {
    return (
      <ProductImage
        storagePath={images[0].storage_path}
        alt={productName}
        className={cn(imageSizeClass, isCard && 'rounded-none')}
        fallbackClassName={cn(fallbackSizeClass, isCard && 'rounded-none')}
      />
    )
  }

  return (
    <Carousel className={cn('relative w-full', isCard ? '' : 'max-w-[280px]', className)}>
      <CarouselContent className={isCard ? '-ml-0' : undefined}>
        {images.map((image) => (
          <CarouselItem key={image.id} className={isCard ? 'basis-full pl-0' : undefined}>
            <ProductImage
              storagePath={image.storage_path}
              alt={productName}
              className={cn(imageSizeClass, isCard && 'rounded-none')}
              fallbackClassName={cn(fallbackSizeClass, isCard && 'rounded-none')}
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className={isCard ? 'left-2 size-7' : 'left-2'} />
      <CarouselNext className={isCard ? 'right-2 size-7' : 'right-2'} />
    </Carousel>
  )
}
