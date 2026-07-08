import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'

import {
  buildProductImagePath,
  compressImage,
  MAX_IMAGES,
  PRODUCT_IMAGES_BUCKET,
  validateImageFile,
} from '@/lib/images'
import { toastMessages, translateSupabaseError } from '@/lib/messages'
import { supabase } from '@/lib/supabase'

export interface UploadedImageResult {
  imageId: string
  path: string
  publicUrl: string
}

function invalidateProductImageQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  productId?: string,
) {
  void queryClient.invalidateQueries({ queryKey: ['products'] })
  void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
  if (productId) {
    void queryClient.invalidateQueries({ queryKey: ['product', productId] })
  }
}

export function useImageUpload() {
  const queryClient = useQueryClient()
  const [isUploading, setIsUploading] = useState(false)

  const getPublicUrl = useCallback((path: string) => {
    const { data } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path)
    return data.publicUrl
  }, [])

  const uploadImage = useCallback(
    async (productId: string, file: File): Promise<UploadedImageResult> => {
      const validationError = validateImageFile(file)
      if (validationError) {
        toast.error(validationError)
        throw new Error(validationError)
      }

      const { count, error: countError } = await supabase
        .from('product_images')
        .select('id', { count: 'exact', head: true })
        .eq('product_id', productId)

      if (countError) throw countError

      if ((count ?? 0) >= MAX_IMAGES) {
        toast.warning(toastMessages.product.imageLimit)
        throw new Error('IMAGE_LIMIT')
      }

      setIsUploading(true)

      try {
        const compressed = await compressImage(file)
        const path = buildProductImagePath(productId)

        const { error: uploadError } = await supabase.storage
          .from(PRODUCT_IMAGES_BUCKET)
          .upload(path, compressed, { contentType: 'image/webp', upsert: false })

        if (uploadError) throw uploadError

        const { data: row, error: insertError } = await supabase
          .from('product_images')
          .insert({
            product_id: productId,
            storage_path: path,
            sort_order: count ?? 0,
          })
          .select('id')
          .single()

        if (insertError) {
          await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove([path])
          throw insertError
        }

        invalidateProductImageQueries(queryClient, productId)
        toast.success(toastMessages.product.imageUploaded)

        return {
          imageId: row.id as string,
          path,
          publicUrl: getPublicUrl(path),
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : ''
        if (message !== 'IMAGE_LIMIT') {
          toast.error(
            translateSupabaseError(message) || toastMessages.product.imageUploadError,
          )
        }
        throw error
      } finally {
        setIsUploading(false)
      }
    },
    [getPublicUrl, queryClient],
  )

  const deleteImage = useCallback(
    async (path: string, imageId?: string, productId?: string) => {
      try {
        if (imageId) {
          const { error: rowError } = await supabase
            .from('product_images')
            .delete()
            .eq('id', imageId)

          if (rowError) throw rowError
        }

        const { error: storageError } = await supabase.storage
          .from(PRODUCT_IMAGES_BUCKET)
          .remove([path])

        if (storageError) throw storageError

        invalidateProductImageQueries(queryClient, productId)
        toast.success(toastMessages.product.imageDeleted)
      } catch (error) {
        toast.error(
          translateSupabaseError(error instanceof Error ? error.message : '') ||
            toastMessages.product.imageDeleteError,
        )
        throw error
      }
    },
    [queryClient],
  )

  return {
    uploadImage,
    deleteImage,
    getPublicUrl,
    isUploading,
  }
}
