import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { toastMessages, translateSupabaseError } from '@/lib/messages'
import { supabase } from '@/lib/supabase'
import type { Brand, Model } from '@/lib/types'

export interface ModelWithCount extends Model {
  brand?: Brand | null
  product_count: number
}

export interface ModelFormValues {
  brand_id: string
  name: string
}

function invalidateModelQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  brandId?: string,
) {
  void queryClient.invalidateQueries({ queryKey: ['models'] })
  if (brandId) {
    void queryClient.invalidateQueries({ queryKey: ['models', brandId] })
  }
  void queryClient.invalidateQueries({ queryKey: ['brands'] })
  void queryClient.invalidateQueries({ queryKey: ['products'] })
}

async function fetchBrandMap() {
  const { data, error } = await supabase
    .from('brands')
    .select('id, name, sort_order, created_at')

  if (error) throw error

  const brandMap = new Map<string, Brand>()
  for (const brand of data ?? []) {
    brandMap.set(brand.id as string, brand as Brand)
  }
  return brandMap
}

async function fetchModelsWithCounts(brandId?: string | null): Promise<ModelWithCount[]> {
  let modelsQuery = supabase.from('models').select('*').order('name', { ascending: true })
  if (brandId) {
    modelsQuery = modelsQuery.eq('brand_id', brandId)
  }

  const [modelsResult, productsResult, brandMap] = await Promise.all([
    modelsQuery,
    supabase.from('products').select('model_id'),
    fetchBrandMap(),
  ])

  if (modelsResult.error) throw modelsResult.error
  if (productsResult.error) throw productsResult.error

  const productCountMap = new Map<string, number>()
  for (const product of productsResult.data ?? []) {
    const modelId = product.model_id as string | null
    if (!modelId) continue
    productCountMap.set(modelId, (productCountMap.get(modelId) ?? 0) + 1)
  }

  return (modelsResult.data ?? []).map((model) => {
    const typedModel = model as Model
    return {
      ...typedModel,
      brand: brandMap.get(typedModel.brand_id) ?? null,
      product_count: productCountMap.get(typedModel.id) ?? 0,
    }
  })
}

export function useModels(brandId?: string | null) {
  return useQuery({
    queryKey: ['models', brandId ?? 'all'],
    queryFn: async (): Promise<Model[]> => {
      const rows = await fetchModelsWithCounts(brandId)
      return rows.map(({ brand: _b, product_count: _c, ...model }) => model)
    },
  })
}

export function useModelsWithCounts(brandId?: string | null) {
  return useQuery({
    queryKey: ['models', 'with-counts', brandId ?? 'all'],
    queryFn: () => fetchModelsWithCounts(brandId),
  })
}

export function useModelDetail(modelId: string | null) {
  return useQuery({
    queryKey: ['model', modelId],
    enabled: Boolean(modelId),
    queryFn: async (): Promise<ModelWithCount> => {
      const { data: model, error: modelError } = await supabase
        .from('models')
        .select('*')
        .eq('id', modelId!)
        .single()

      if (modelError) throw modelError

      const typedModel = model as Model
      const [{ data: brand, error: brandError }, { count, error: countError }] = await Promise.all([
        supabase.from('brands').select('*').eq('id', typedModel.brand_id).maybeSingle(),
        supabase
          .from('products')
          .select('id', { count: 'exact', head: true })
          .eq('model_id', modelId!),
      ])

      if (brandError) throw brandError
      if (countError) throw countError

      return {
        ...typedModel,
        brand: (brand as Brand | null) ?? null,
        product_count: count ?? 0,
      }
    },
  })
}

export function useCreateModel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: ModelFormValues | { brandId: string; name: string }) => {
      const payload: ModelFormValues =
        'brandId' in values
          ? { brand_id: values.brandId, name: values.name }
          : values

      const { data, error } = await supabase
        .from('models')
        .insert({ brand_id: payload.brand_id, name: payload.name.trim() })
        .select()
        .single()

      if (error) throw error
      return data as Model
    },
    onSuccess: (_data, variables) => {
      const brandId = 'brandId' in variables ? variables.brandId : variables.brand_id
      invalidateModelQueries(queryClient, brandId)
      toast.success(toastMessages.model.created)
    },
    onError: (error: Error) => {
      toast.error(translateSupabaseError(error.message) || toastMessages.model.createError)
    },
  })
}

export function useUpdateModel(modelId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: ModelFormValues) => {
      const { data, error } = await supabase
        .from('models')
        .update({
          brand_id: values.brand_id,
          name: values.name.trim(),
        })
        .eq('id', modelId)
        .select()
        .single()

      if (error) throw error
      return data as Model
    },
    onSuccess: (data) => {
      invalidateModelQueries(queryClient, data.brand_id)
      void queryClient.invalidateQueries({ queryKey: ['model', modelId] })
      toast.success(toastMessages.model.updated)
    },
    onError: (error: Error) => {
      toast.error(translateSupabaseError(error.message) || toastMessages.model.updateError)
    },
  })
}

export function useDeleteModel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (modelId: string) => {
      const { count, error: countError } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('model_id', modelId)

      if (countError) throw countError
      if ((count ?? 0) > 0) throw new Error('MODEL_HAS_PRODUCTS')

      const { data: model, error: modelError } = await supabase
        .from('models')
        .delete()
        .eq('id', modelId)
        .select('brand_id')
        .single()

      if (modelError) throw modelError
      return model as { brand_id: string }
    },
    onSuccess: (data) => {
      invalidateModelQueries(queryClient, data.brand_id)
      toast.success(toastMessages.model.deleted)
    },
    onError: (error: Error) => {
      if (error.message === 'MODEL_HAS_PRODUCTS') {
        toast.error(toastMessages.model.deleteHasProducts)
        return
      }
      toast.error(translateSupabaseError(error.message) || toastMessages.model.deleteError)
    },
  })
}
