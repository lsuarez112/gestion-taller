import { useQuery } from '@tanstack/react-query'

import { supabase } from '@/lib/supabase'

const SIGNED_URL_TTL = 3600

export async function fetchSignedImageUrl(storagePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from('product-images')
    .createSignedUrl(storagePath, SIGNED_URL_TTL)

  if (error || !data?.signedUrl) {
    const { data: publicData } = supabase.storage
      .from('product-images')
      .getPublicUrl(storagePath)
    return publicData.publicUrl
  }

  return data.signedUrl
}

export function useSignedImageUrl(storagePath: string | null | undefined) {
  return useQuery({
    queryKey: ['signed-image', storagePath],
    enabled: Boolean(storagePath),
    staleTime: (SIGNED_URL_TTL - 300) * 1000,
    queryFn: () => fetchSignedImageUrl(storagePath!),
  })
}

export function useSignedImageUrls(storagePaths: string[]) {
  return useQuery({
    queryKey: ['signed-images', ...storagePaths],
    enabled: storagePaths.length > 0,
    staleTime: (SIGNED_URL_TTL - 300) * 1000,
    queryFn: async () => {
      const urls = await Promise.all(storagePaths.map((path) => fetchSignedImageUrl(path)))
      return urls
    },
  })
}
