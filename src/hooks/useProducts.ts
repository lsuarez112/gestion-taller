import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { buildProductImagePath, compressImage, MAX_IMAGES, PRODUCT_IMAGES_BUCKET } from '@/lib/images'
import { toastMessages, translateSupabaseError } from '@/lib/messages'
import { supabase } from '@/lib/supabase'
import type {
  Brand,
  InventoryUnit,
  Model,
  Product,
  ProductImage,
  ProductSortOption,
  ProductStockSummary,
  ProductWithDetails,
} from '@/lib/types'

interface UseProductsOptions {
  search?: string
  categoryId?: string | null
  brandId?: string | null
  modelId?: string | null
  sortBy?: ProductSortOption
}

const PRODUCT_SELECT = `
  *,
  categories ( id, name, icon, sort_order ),
  product_images ( id, product_id, storage_path, sort_order )
`

async function fetchBrandModelMaps() {
  const [brandsResult, modelsResult] = await Promise.all([
    supabase.from('brands').select('id, name, sort_order, created_at'),
    supabase.from('models').select('id, brand_id, name, created_at'),
  ])

  if (brandsResult.error) throw brandsResult.error
  if (modelsResult.error) throw modelsResult.error

  const brandMap = new Map<string, Brand>()
  for (const brand of brandsResult.data ?? []) {
    brandMap.set(brand.id as string, brand as Brand)
  }

  const modelMap = new Map<string, Model>()
  for (const model of modelsResult.data ?? []) {
    modelMap.set(model.id as string, model as Model)
  }

  return { brandMap, modelMap }
}

function invalidateAllProductQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  productId?: string,
) {
  void queryClient.invalidateQueries({ queryKey: ['products'] })
  void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
  if (productId) {
    void queryClient.invalidateQueries({ queryKey: ['product', productId] })
  }
}

function unwrapRelation<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null
  return Array.isArray(value) ? (value[0] ?? null) : value
}

function mapProductRow(
  row: Record<string, unknown>,
  stockMap: Map<string, ProductStockSummary>,
  brandMap: Map<string, Brand>,
  modelMap: Map<string, Model>,
): ProductWithDetails {
  const product = row as unknown as Product
  const productId = product.id

  return {
    ...product,
    category: unwrapRelation(row.categories as ProductWithDetails['category']),
    brand: product.brand_id ? (brandMap.get(product.brand_id) ?? null) : null,
    model: product.model_id ? (modelMap.get(product.model_id) ?? null) : null,
    images: ((row.product_images as ProductImage[] | undefined) ?? []).sort(
      (a, b) => a.sort_order - b.sort_order,
    ),
    stock: stockMap.get(productId) ?? null,
  }
}

export function useProducts({
  search = '',
  categoryId,
  brandId,
  modelId,
  sortBy = 'name',
}: UseProductsOptions = {}) {
  return useQuery({
    queryKey: ['products', search, categoryId, brandId, modelId, sortBy],
    queryFn: async (): Promise<ProductWithDetails[]> => {
      let query = supabase.from('products').select(PRODUCT_SELECT)

      if (categoryId) {
        query = query.eq('category_id', categoryId)
      }

      if (brandId) {
        query = query.eq('brand_id', brandId)
      }

      if (modelId) {
        query = query.eq('model_id', modelId)
      }

      if (search.trim()) {
        query = query.ilike('name', `%${search.trim()}%`)
      }

      if (sortBy === 'name') {
        query = query.order('name', { ascending: true })
      } else if (sortBy === 'created_at') {
        query = query.order('created_at', { ascending: false })
      }

      const [{ data: products, error: productsError }, { brandMap, modelMap }] = await Promise.all([
        query,
        fetchBrandModelMaps(),
      ])
      if (productsError) throw productsError

      const productIds = (products ?? []).map((product) => product.id as string)
      const stockMap = new Map<string, ProductStockSummary>()

      if (productIds.length > 0) {
        const { data: stockRows, error: stockError } = await supabase
          .from('product_stock_summary')
          .select('*')
          .in('product_id', productIds)

        if (stockError) throw stockError

        for (const row of stockRows ?? []) {
          stockMap.set(row.product_id as string, row as ProductStockSummary)
        }
      }

      let mapped = (products ?? []).map((row) =>
        mapProductRow(row as Record<string, unknown>, stockMap, brandMap, modelMap),
      )

      if (sortBy === 'stock') {
        mapped = [...mapped].sort(
          (a, b) => (b.stock?.units_available ?? 0) - (a.stock?.units_available ?? 0),
        )
      }

      return mapped
    },
  })
}

export function useProductDetail(productId: string | null) {
  return useQuery({
    queryKey: ['product', productId],
    enabled: Boolean(productId),
    queryFn: async (): Promise<ProductWithDetails & { units: InventoryUnit[] }> => {
      const [
        { data: product, error: productError },
        { brandMap, modelMap },
        { data: stock },
        { data: units, error: unitsError },
      ] = await Promise.all([
        supabase.from('products').select(PRODUCT_SELECT).eq('id', productId!).single(),
        fetchBrandModelMaps(),
        supabase.from('product_stock_summary').select('*').eq('product_id', productId!).maybeSingle(),
        supabase
          .from('inventory_units')
          .select('*')
          .eq('product_id', productId!)
          .order('created_at', { ascending: false }),
      ])

      if (productError) throw productError
      if (unitsError) throw unitsError

      const stockMap = new Map<string, ProductStockSummary>()
      if (stock) stockMap.set(productId!, stock as ProductStockSummary)

      return {
        ...mapProductRow(product as Record<string, unknown>, stockMap, brandMap, modelMap),
        units: (units ?? []) as InventoryUnit[],
      }
    },
  })
}

export interface ProductFormValues {
  name: string
  description: string
  category_id: string
  brand_id: string | null
  model_id: string | null
  vehicle_year_range: string
  reference_price: number | null
}

export interface InitialUnitValues {
  sku: string
  cost_price: number | null
  location: string
  notes: string
}

export interface CreateProductPayload extends ProductFormValues {
  initialUnits?: InitialUnitValues[]
  imageFiles?: File[]
}

async function uploadProductImages(productId: string, files: File[], existingCount = 0) {
  const slotsLeft = MAX_IMAGES - existingCount
  const filesToUpload = files.slice(0, slotsLeft)

  if (files.length > slotsLeft) {
    toast.warning(toastMessages.product.imageLimit)
  }

  for (const [index, file] of filesToUpload.entries()) {
    const compressed = await compressImage(file)
    const storagePath = buildProductImagePath(productId)

    const { error: uploadError } = await supabase.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .upload(storagePath, compressed, { contentType: 'image/webp', upsert: false })

    if (uploadError) throw uploadError

    const { error: insertError } = await supabase.from('product_images').insert({
      product_id: productId,
      storage_path: storagePath,
      sort_order: existingCount + index,
    })

    if (insertError) throw insertError
  }
}

export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateProductPayload) => {
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData.user?.id

      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
          name: payload.name,
          description: payload.description || null,
          category_id: payload.category_id || null,
          brand_id: payload.brand_id || null,
          model_id: payload.model_id || null,
          vehicle_year_range: payload.vehicle_year_range || null,
          reference_price: payload.reference_price,
          created_by: userId ?? null,
        })
        .select()
        .single()

      if (productError) throw productError

      const productId = (product as Product).id

      if (payload.initialUnits?.length) {
        const units = payload.initialUnits
          .filter((unit) => unit.sku.trim())
          .map((unit) => ({
            product_id: productId,
            sku: unit.sku.trim(),
            status: 'disponible' as const,
            cost_price: unit.cost_price,
            location: unit.location.trim(),
            notes: unit.notes.trim() || null,
            created_by: userId ?? null,
          }))

        if (units.length > 0) {
          const { error: unitsError } = await supabase.from('inventory_units').insert(units)
          if (unitsError) throw unitsError
        }
      }

      if (payload.imageFiles?.length) {
        await uploadProductImages(productId, payload.imageFiles)
      }

      return product as Product
    },
    onSuccess: () => {
      invalidateAllProductQueries(queryClient)
      toast.success(toastMessages.product.created)
    },
    onError: (error: Error) => {
      toast.error(translateSupabaseError(error.message) || toastMessages.product.createError)
    },
  })
}

export function useUpdateProduct(productId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: ProductFormValues & { imageFiles?: File[]; existingImageCount?: number }) => {
      const { imageFiles, existingImageCount, ...values } = payload

      const { data, error } = await supabase
        .from('products')
        .update({
          name: values.name,
          description: values.description || null,
          category_id: values.category_id || null,
          brand_id: values.brand_id || null,
          model_id: values.model_id || null,
          vehicle_year_range: values.vehicle_year_range || null,
          reference_price: values.reference_price,
        })
        .eq('id', productId)
        .select()
        .single()

      if (error) throw error

      if (imageFiles?.length) {
        await uploadProductImages(productId, imageFiles, existingImageCount ?? 0)
      }

      return data as Product
    },
    onSuccess: () => {
      invalidateAllProductQueries(queryClient, productId)
      toast.success(toastMessages.product.updated)
    },
    onError: (error: Error) => {
      toast.error(translateSupabaseError(error.message) || toastMessages.product.updateError)
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (productId: string) => {
      const { data: images, error: imagesError } = await supabase
        .from('product_images')
        .select('storage_path')
        .eq('product_id', productId)

      if (imagesError) throw imagesError

      const paths = (images ?? []).map((image) => image.storage_path as string)

      const { error: deleteError } = await supabase.from('products').delete().eq('id', productId)
      if (deleteError) throw deleteError

      if (paths.length > 0) {
        await supabase.storage.from('product-images').remove(paths)
      }
    },
    onSuccess: () => {
      invalidateAllProductQueries(queryClient)
      toast.success(toastMessages.product.deleted)
    },
    onError: (error: Error) => {
      toast.error(translateSupabaseError(error.message) || toastMessages.product.deleteError)
    },
  })
}

export function useDeleteProductImage(productId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ imageId, storagePath }: { imageId: string; storagePath: string }) => {
      const { error: deleteRowError } = await supabase
        .from('product_images')
        .delete()
        .eq('id', imageId)

      if (deleteRowError) throw deleteRowError

      await supabase.storage.from('product-images').remove([storagePath])
    },
    onSuccess: () => {
      invalidateAllProductQueries(queryClient, productId)
      toast.success(toastMessages.product.imageDeleted)
    },
    onError: (error: Error) => {
      toast.error(translateSupabaseError(error.message) || toastMessages.product.imageDeleteError)
    },
  })
}

export function useDeleteAllProductImages(productId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (images: ProductImage[]) => {
      if (images.length === 0) return

      const { error: deleteRowError } = await supabase
        .from('product_images')
        .delete()
        .eq('product_id', productId)

      if (deleteRowError) throw deleteRowError

      const paths = images.map((image) => image.storage_path)
      await supabase.storage.from('product-images').remove(paths)
    },
    onSuccess: () => {
      invalidateAllProductQueries(queryClient, productId)
      toast.success(toastMessages.product.imagesDeleted)
    },
    onError: (error: Error) => {
      toast.error(translateSupabaseError(error.message) || toastMessages.product.imageDeleteError)
    },
  })
}
