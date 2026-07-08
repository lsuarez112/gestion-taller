import { createClient } from '@supabase/supabase-js'

function normalizeSupabaseUrl(url: string): string {
  return url.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '')
}

const supabaseUrl = normalizeSupabaseUrl(import.meta.env.VITE_SUPABASE_URL ?? '')
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan las variables de entorno VITE_SUPABASE_URL y/o VITE_SUPABASE_ANON_KEY',
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/** @deprecated Usar fetchSignedImageUrl o useSignedImageUrl */
export function getProductImageUrl(storagePath: string): string {
  const { data } = supabase.storage.from('product-images').getPublicUrl(storagePath)
  return data.publicUrl
}
