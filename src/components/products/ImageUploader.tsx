import { Camera, ImagePlus, Loader2, Trash2, Upload } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { ProductImage } from '@/components/products/ProductImage'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useImageUpload } from '@/hooks/useImageUpload'
import { useDeleteAllProductImages } from '@/hooks/useProducts'
import { MAX_IMAGES, validateImageFile } from '@/lib/images'
import type { ProductImage as ProductImageType } from '@/lib/types'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface PendingPreview {
  id: string
  file: File
  previewUrl: string
}

interface ImageUploaderProps {
  productId?: string | null
  existingImages?: ProductImageType[]
  pendingFiles: File[]
  onPendingFilesChange: (files: File[]) => void
  maxImages?: number
  disabled?: boolean
}

export function ImageUploader({
  productId,
  existingImages = [],
  pendingFiles,
  onPendingFilesChange,
  maxImages = MAX_IMAGES,
  disabled = false,
}: ImageUploaderProps) {
  const { uploadImage, deleteImage, isUploading } = useImageUpload()
  const deleteAllImages = useDeleteAllProductImages(productId ?? '')

  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  const [pendingPreviews, setPendingPreviews] = useState<PendingPreview[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null)
  const [deleteAllOpen, setDeleteAllOpen] = useState(false)
  const [processingCount, setProcessingCount] = useState(0)

  const totalCount = existingImages.length + pendingPreviews.length
  const canAddMore = totalCount < maxImages && !disabled
  const isBusy = isUploading || processingCount > 0 || deleteAllImages.isPending

  useEffect(() => {
    const nextPreviews = pendingFiles.map((file) => ({
      id: `${file.name}-${file.lastModified}-${file.size}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }))

    setPendingPreviews((prev) => {
      for (const item of prev) {
        URL.revokeObjectURL(item.previewUrl)
      }
      return nextPreviews
    })

    return () => {
      for (const item of nextPreviews) {
        URL.revokeObjectURL(item.previewUrl)
      }
    }
  }, [pendingFiles])

  const processFiles = useCallback(
    async (files: File[]) => {
      if (!canAddMore || files.length === 0) return

      const slotsLeft = maxImages - totalCount
      if (slotsLeft <= 0) {
        toast.warning(`Máximo ${maxImages} imágenes por artículo`)
        return
      }

      const filesToProcess = files.slice(0, slotsLeft)
      if (files.length > slotsLeft) {
        toast.warning(`Máximo ${maxImages} imágenes por artículo`)
      }

      const validFiles: File[] = []
      for (const file of filesToProcess) {
        const error = validateImageFile(file)
        if (error) {
          toast.error(error)
          continue
        }
        validFiles.push(file)
      }

      if (validFiles.length === 0) return

      if (productId) {
        setProcessingCount((count) => count + validFiles.length)
        try {
          for (const file of validFiles) {
            await uploadImage(productId, file)
          }
        } finally {
          setProcessingCount(0)
        }
        return
      }

      onPendingFilesChange([...pendingFiles, ...validFiles])
    },
    [
      canAddMore,
      maxImages,
      totalCount,
      productId,
      pendingFiles,
      onPendingFilesChange,
      uploadImage,
    ],
  )

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ''
    void processFiles(files)
  }

  function handleDragOver(event: React.DragEvent) {
    event.preventDefault()
    if (canAddMore) setIsDragOver(true)
  }

  function handleDragLeave(event: React.DragEvent) {
    event.preventDefault()
    setIsDragOver(false)
  }

  function handleDrop(event: React.DragEvent) {
    event.preventDefault()
    setIsDragOver(false)
    if (!canAddMore) return

    const files = Array.from(event.dataTransfer.files).filter((file) =>
      file.type.startsWith('image/'),
    )
    void processFiles(files)
  }

  async function handleDeleteExisting(image: ProductImageType) {
    setDeletingImageId(image.id)
    try {
      await deleteImage(image.storage_path, image.id, productId ?? undefined)
    } finally {
      setDeletingImageId(null)
    }
  }

  function handleRemovePending(index: number) {
    onPendingFilesChange(pendingFiles.filter((_, i) => i !== index))
  }

  async function handleDeleteAll() {
    if (!productId) return
    await deleteAllImages.mutateAsync(existingImages)
    setDeleteAllOpen(false)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <Label>Fotos ({totalCount}/{maxImages})</Label>
        {isBusy ? (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Loader2 className="size-3 animate-spin" />
            Procesando...
          </span>
        ) : null}
      </div>

      {(existingImages.length > 0 || pendingPreviews.length > 0) && (
        <div className="flex flex-wrap gap-3">
          {existingImages.map((image) => (
            <div key={image.id} className="relative">
              <ProductImage
                storagePath={image.storage_path}
                alt=""
                className="size-24 rounded-lg border object-cover sm:size-20"
                fallbackClassName="size-24 rounded-lg border sm:size-20"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon-xs"
                className="absolute -top-1 -right-1 cursor-pointer"
                disabled={isBusy}
                aria-label="Eliminar foto"
                onClick={() => void handleDeleteExisting(image)}
              >
                {deletingImageId === image.id ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Trash2 />
                )}
              </Button>
            </div>
          ))}

          {pendingPreviews.map((item, index) => (
            <div key={item.id} className="relative">
              <img
                src={item.previewUrl}
                alt=""
                className="size-24 rounded-lg border object-cover sm:size-20"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon-xs"
                className="absolute -top-1 -right-1 cursor-pointer"
                disabled={isBusy}
                aria-label="Quitar foto"
                onClick={() => handleRemovePending(index)}
              >
                <Trash2 />
              </Button>
            </div>
          ))}
        </div>
      )}

      {productId && existingImages.length > 1 ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="cursor-pointer text-destructive hover:text-destructive"
          disabled={isBusy}
          onClick={() => setDeleteAllOpen(true)}
        >
          <Trash2 />
          Eliminar todas
        </Button>
      ) : null}

      {canAddMore ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'flex flex-col items-center gap-3 rounded-lg border border-dashed p-4 text-center transition-colors sm:p-6',
            isDragOver
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/30 bg-muted/20',
          )}
        >
          <div className="flex size-10 items-center justify-center rounded-full bg-background">
            <ImagePlus className="size-5 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Arrastrá fotos acá</p>
            <p className="text-xs text-muted-foreground">
              JPEG, PNG o WebP · máx. {maxImages} por artículo
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className="w-full cursor-pointer sm:w-auto"
              disabled={isBusy}
              onClick={() => cameraInputRef.current?.click()}
            >
              <Camera />
              Cámara
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full cursor-pointer sm:w-auto"
              disabled={isBusy}
              onClick={() => galleryInputRef.current?.click()}
            >
              <Upload />
              Galería
            </Button>
          </div>
        </div>
      ) : null}

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        disabled={disabled || isBusy}
        onChange={handleInputChange}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        disabled={disabled || isBusy}
        onChange={handleInputChange}
      />

      <AlertDialog open={deleteAllOpen} onOpenChange={setDeleteAllOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar todas las fotos?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminarán las {existingImages.length} imágenes del artículo. Esta acción no se
              puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteAllImages.isPending}
              onClick={(event) => {
                event.preventDefault()
                void handleDeleteAll()
              }}
            >
              {deleteAllImages.isPending ? 'Eliminando...' : 'Eliminar todas'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
