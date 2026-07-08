import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { toastMessages, translateSupabaseError } from '@/lib/messages'
import { supabase } from '@/lib/supabase'
import type { Brand } from '@/lib/types'

export interface BrandWithCount extends Brand {
  model_count: number
  product_count: number
}

export interface BrandFormValues {
  name: string
  sort_order: number
}

function invalidateBrandQueries(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: ['brands'] })
  void queryClient.invalidateQueries({ queryKey: ['models'] })
  void queryClient.invalidateQueries({ queryKey: ['products'] })
}

async function fetchBrandsWithCounts(): Promise<BrandWithCount[]> {
  const [brandsResult, modelsResult, productsResult] = await Promise.all([
    supabase.from('brands').select('*').order('sort_order', { ascending: true }).order('name'),
    supabase.from('models').select('id, brand_id'),
    supabase.from('products').select('brand_id'),
  ])

  if (brandsResult.error) throw brandsResult.error
  if (modelsResult.error) throw modelsResult.error
  if (productsResult.error) throw productsResult.error

  const modelCountMap = new Map<string, number>()
  for (const model of modelsResult.data ?? []) {
    const brandId = model.brand_id as string
    modelCountMap.set(brandId, (modelCountMap.get(brandId) ?? 0) + 1)
  }

  const productCountMap = new Map<string, number>()
  for (const product of productsResult.data ?? []) {
    const brandId = product.brand_id as string | null
    if (!brandId) continue
    productCountMap.set(brandId, (productCountMap.get(brandId) ?? 0) + 1)
  }

  return (brandsResult.data ?? []).map((brand) => ({
    ...(brand as Brand),
    model_count: modelCountMap.get(brand.id as string) ?? 0,
    product_count: productCountMap.get(brand.id as string) ?? 0,
  }))
}

export function useBrands() {
  return useQuery({
    queryKey: ['brands'],
    queryFn: async (): Promise<Brand[]> => {
      const rows = await fetchBrandsWithCounts()
      return rows.map(({ model_count: _mc, product_count: _pc, ...brand }) => brand)
    },
  })
}

export function useBrandsWithCounts() {
  return useQuery({
    queryKey: ['brands', 'with-counts'],
    queryFn: fetchBrandsWithCounts,
  })
}

export function useBrandDetail(brandId: string | null) {
  return useQuery({
    queryKey: ['brand', brandId],
    enabled: Boolean(brandId),
    queryFn: async (): Promise<BrandWithCount> => {
      const { data: brand, error: brandError } = await supabase
        .from('brands')
        .select('*')
        .eq('id', brandId!)
        .single()

      if (brandError) throw brandError

      const [{ count: modelCount, error: modelError }, { count: productCount, error: productError }] =
        await Promise.all([
          supabase
            .from('models')
            .select('id', { count: 'exact', head: true })
            .eq('brand_id', brandId!),
          supabase
            .from('products')
            .select('id', { count: 'exact', head: true })
            .eq('brand_id', brandId!),
        ])

      if (modelError) throw modelError
      if (productError) throw productError

      return {
        ...(brand as Brand),
        model_count: modelCount ?? 0,
        product_count: productCount ?? 0,
      }
    },
  })
}

export function useCreateBrand() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: BrandFormValues | string) => {
      const payload: BrandFormValues =
        typeof values === 'string' ? { name: values, sort_order: 0 } : values

      let sortOrder = payload.sort_order
      if (typeof values === 'string') {
        const { data: existing, error: maxError } = await supabase
          .from('brands')
          .select('sort_order')
          .order('sort_order', { ascending: false })
          .limit(1)

        if (maxError) throw maxError
        sortOrder = ((existing?.[0]?.sort_order as number | undefined) ?? -1) + 1
      }

      const { data, error } = await supabase
        .from('brands')
        .insert({ name: payload.name.trim(), sort_order: sortOrder })
        .select()
        .single()

      if (error) throw error
      return data as Brand
    },
    onSuccess: () => {
      invalidateBrandQueries(queryClient)
      toast.success(toastMessages.brand.created)
    },
    onError: (error: Error) => {
      toast.error(translateSupabaseError(error.message) || toastMessages.brand.createError)
    },
  })
}

export function useUpdateBrand(brandId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: BrandFormValues) => {
      const { data, error } = await supabase
        .from('brands')
        .update({
          name: values.name.trim(),
          sort_order: values.sort_order,
        })
        .eq('id', brandId)
        .select()
        .single()

      if (error) throw error
      return data as Brand
    },
    onSuccess: () => {
      invalidateBrandQueries(queryClient)
      void queryClient.invalidateQueries({ queryKey: ['brand', brandId] })
      toast.success(toastMessages.brand.updated)
    },
    onError: (error: Error) => {
      toast.error(translateSupabaseError(error.message) || toastMessages.brand.updateError)
    },
  })
}

export function useDeleteBrand() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (brandId: string) => {
      const [{ count: modelCount, error: modelError }, { count: productCount, error: productError }] =
        await Promise.all([
          supabase
            .from('models')
            .select('id', { count: 'exact', head: true })
            .eq('brand_id', brandId),
          supabase
            .from('products')
            .select('id', { count: 'exact', head: true })
            .eq('brand_id', brandId),
        ])

      if (modelError) throw modelError
      if (productError) throw productError
      if ((modelCount ?? 0) > 0) throw new Error('BRAND_HAS_MODELS')
      if ((productCount ?? 0) > 0) throw new Error('BRAND_HAS_PRODUCTS')

      const { error } = await supabase.from('brands').delete().eq('id', brandId)
      if (error) throw error
    },
    onSuccess: () => {
      invalidateBrandQueries(queryClient)
      toast.success(toastMessages.brand.deleted)
    },
    onError: (error: Error) => {
      if (error.message === 'BRAND_HAS_MODELS') {
        toast.error(toastMessages.brand.deleteHasModels)
        return
      }
      if (error.message === 'BRAND_HAS_PRODUCTS') {
        toast.error(toastMessages.brand.deleteHasProducts)
        return
      }
      toast.error(translateSupabaseError(error.message) || toastMessages.brand.deleteError)
    },
  })
}
