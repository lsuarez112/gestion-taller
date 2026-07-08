import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { supabase } from '@/lib/supabase'
import { toastMessages, translateSupabaseError } from '@/lib/messages'
import type { UnitStatus } from '@/lib/types'

function invalidateProductQueries(queryClient: ReturnType<typeof useQueryClient>, productId: string) {
  void queryClient.invalidateQueries({ queryKey: ['products'] })
  void queryClient.invalidateQueries({ queryKey: ['product', productId] })
  void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
}

export interface AddUnitValues {
  sku: string
  cost_price: number | null
  notes?: string
  location: string
}

export function useAddUnit(productId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: AddUnitValues) => {
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData.user?.id

      const { data, error } = await supabase
        .from('inventory_units')
        .insert({
          product_id: productId,
          sku: values.sku.trim(),
          status: 'disponible',
          cost_price: values.cost_price,
          notes: values.notes?.trim() || null,
          location: values.location.trim(),
          created_by: userId ?? null,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      invalidateProductQueries(queryClient, productId)
      toast.success(toastMessages.unit.added)
    },
    onError: (error: Error) => {
      toast.error(translateSupabaseError(error.message) || toastMessages.unit.addError)
    },
  })
}

export interface SellUnitValues {
  sale_price: number
}

export interface UpdateUnitValues {
  sku: string
  cost_price: number | null
  location: string
  notes?: string
  sale_price?: number | null
}

export function useUpdateUnit(productId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      unitId,
      status,
      values,
    }: {
      unitId: string
      status: UnitStatus
      values: UpdateUnitValues
    }) => {
      const payload: Record<string, unknown> = {
        sku: values.sku.trim(),
        cost_price: values.cost_price,
        location: values.location.trim(),
        notes: values.notes?.trim() || null,
      }

      if (status === 'vendido') {
        payload.sale_price = values.sale_price
      }

      const { data, error } = await supabase
        .from('inventory_units')
        .update(payload)
        .eq('id', unitId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      invalidateProductQueries(queryClient, productId)
      toast.success(toastMessages.unit.updated)
    },
    onError: (error: Error) => {
      toast.error(translateSupabaseError(error.message) || toastMessages.unit.updateError)
    },
  })
}

export function useSellUnit(productId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ unitId, values }: { unitId: string; values: SellUnitValues }) => {
      const { data, error } = await supabase
        .from('inventory_units')
        .update({
          status: 'vendido',
          sale_price: values.sale_price,
          sold_at: new Date().toISOString(),
        })
        .eq('id', unitId)
        .eq('status', 'disponible')
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      invalidateProductQueries(queryClient, productId)
      toast.success(toastMessages.unit.sold)
    },
    onError: (error: Error) => {
      toast.error(translateSupabaseError(error.message) || toastMessages.unit.sellError)
    },
  })
}

export function useRetireUnit(productId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (unitId: string) => {
      const { data, error } = await supabase
        .from('inventory_units')
        .update({ status: 'baja' })
        .eq('id', unitId)
        .eq('status', 'disponible')
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      invalidateProductQueries(queryClient, productId)
      toast.success(toastMessages.unit.retired)
    },
    onError: (error: Error) => {
      toast.error(translateSupabaseError(error.message) || toastMessages.unit.retireError)
    },
  })
}
