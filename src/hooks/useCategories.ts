import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { toastMessages, translateSupabaseError } from '@/lib/messages'
import { supabase } from '@/lib/supabase'
import type { Category } from '@/lib/types'

export interface CategoryWithCount extends Category {
  product_count: number
}

export interface CategoryFormValues {
  name: string
  icon: string
  sort_order: number
}

function invalidateCategoryQueries(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: ['categories'] })
  void queryClient.invalidateQueries({ queryKey: ['products'] })
}

async function fetchCategoriesWithCounts(): Promise<CategoryWithCount[]> {
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('id, name, icon, sort_order')
    .order('sort_order', { ascending: true })

  if (categoriesError) throw categoriesError

  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('category_id')

  if (productsError) throw productsError

  const countMap = new Map<string, number>()
  for (const product of products ?? []) {
    const categoryId = product.category_id as string | null
    if (!categoryId) continue
    countMap.set(categoryId, (countMap.get(categoryId) ?? 0) + 1)
  }

  return (categories ?? []).map((category) => ({
    ...(category as Category),
    product_count: countMap.get(category.id as string) ?? 0,
  }))
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async (): Promise<Category[]> => {
      const rows = await fetchCategoriesWithCounts()
      return rows.map(({ product_count: _count, ...category }) => category)
    },
  })
}

export function useCategoriesWithCounts() {
  return useQuery({
    queryKey: ['categories', 'with-counts'],
    queryFn: fetchCategoriesWithCounts,
  })
}

export function useCategoryDetail(categoryId: string | null) {
  return useQuery({
    queryKey: ['category', categoryId],
    enabled: Boolean(categoryId),
    queryFn: async (): Promise<CategoryWithCount> => {
      const { data: category, error: categoryError } = await supabase
        .from('categories')
        .select('id, name, icon, sort_order')
        .eq('id', categoryId!)
        .single()

      if (categoryError) throw categoryError

      const { count, error: countError } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('category_id', categoryId!)

      if (countError) throw countError

      return {
        ...(category as Category),
        product_count: count ?? 0,
      }
    },
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: CategoryFormValues) => {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: values.name.trim(),
          icon: values.icon.trim() || null,
          sort_order: values.sort_order,
        })
        .select()
        .single()

      if (error) throw error
      return data as Category
    },
    onSuccess: () => {
      invalidateCategoryQueries(queryClient)
      toast.success(toastMessages.category.created)
    },
    onError: (error: Error) => {
      toast.error(translateSupabaseError(error.message) || toastMessages.category.createError)
    },
  })
}

export function useUpdateCategory(categoryId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: CategoryFormValues) => {
      const { data, error } = await supabase
        .from('categories')
        .update({
          name: values.name.trim(),
          icon: values.icon.trim() || null,
          sort_order: values.sort_order,
        })
        .eq('id', categoryId)
        .select()
        .single()

      if (error) throw error
      return data as Category
    },
    onSuccess: () => {
      invalidateCategoryQueries(queryClient)
      void queryClient.invalidateQueries({ queryKey: ['category', categoryId] })
      toast.success(toastMessages.category.updated)
    },
    onError: (error: Error) => {
      toast.error(translateSupabaseError(error.message) || toastMessages.category.updateError)
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (categoryId: string) => {
      const { count, error: countError } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('category_id', categoryId)

      if (countError) throw countError
      if ((count ?? 0) > 0) {
        throw new Error('CATEGORY_HAS_PRODUCTS')
      }

      const { error } = await supabase.from('categories').delete().eq('id', categoryId)
      if (error) throw error
    },
    onSuccess: () => {
      invalidateCategoryQueries(queryClient)
      toast.success(toastMessages.category.deleted)
    },
    onError: (error: Error) => {
      if (error.message === 'CATEGORY_HAS_PRODUCTS') {
        toast.error(toastMessages.category.deleteHasProducts)
        return
      }
      toast.error(translateSupabaseError(error.message) || toastMessages.category.deleteError)
    },
  })
}
