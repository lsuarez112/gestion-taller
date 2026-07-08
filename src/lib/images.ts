import imageCompression from 'browser-image-compression'

export const PRODUCT_IMAGES_BUCKET = 'product-images'
export const MAX_IMAGES = 2

const COMPRESSION_OPTIONS = {
  maxSizeMB: 0.3,
  maxWidthOrHeight: 800,
  fileType: 'image/webp',
  useWebWorker: true,
} as const

export async function compressImage(file: File): Promise<File> {
  return imageCompression(file, COMPRESSION_OPTIONS)
}

export function buildProductImagePath(productId: string): string {
  return `products/${productId}/${Date.now()}.webp`
}

export function validateImageFile(file: File): string | null {
  if (!file.type.startsWith('image/')) {
    return 'Solo se permiten archivos de imagen'
  }
  if (file.size > 10 * 1024 * 1024) {
    return 'La imagen no puede superar 10 MB'
  }
  return null
}
