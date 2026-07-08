import { Package } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'
import { useSignedImageUrl } from '@/hooks/useSignedImageUrl'
import { cn } from '@/lib/utils'

interface ProductImageProps {
  storagePath: string
  alt: string
  className?: string
  fallbackClassName?: string
}

export function ProductImage({
  storagePath,
  alt,
  className,
  fallbackClassName,
}: ProductImageProps) {
  const { data: url, isLoading, isError } = useSignedImageUrl(storagePath)

  if (isLoading) {
    return <Skeleton className={cn('rounded-lg', className)} />
  }

  if (isError || !url) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-lg bg-muted text-muted-foreground',
          fallbackClassName ?? className,
        )}
      >
        <Package className="size-8 opacity-40" />
      </div>
    )
  }

  return (
    <img
      src={url}
      alt={alt}
      className={cn('rounded-lg object-cover', className)}
      loading="lazy"
    />
  )
}
