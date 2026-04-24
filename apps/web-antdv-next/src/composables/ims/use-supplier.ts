/**
 * 供应商选择器 Composable
 * 提供供应商列表查询和选择功能
 */

import { ref, computed } from 'vue'
import type { SupplierView, SupplierListQuery } from '../../api/catalog/supplier-api'
import {
  listSuppliers,
  getSupplier,
  searchSuppliers,
  getActiveSuppliers,
  clearSupplierCache,
} from '../../api/catalog/supplier-api'

export function useSupplierSelector() {
  const suppliers = ref<SupplierView[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const selectedId = ref<number | null>(null)

  const selectedSupplier = computed(() =>
    suppliers.value.find(s => s.id === selectedId.value) || null
  )

  const load = async (params?: SupplierListQuery) => {
    loading.value = true
    error.value = null
    try {
      suppliers.value = await listSuppliers(params)
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  const loadActive = async () => {
    loading.value = true
    error.value = null
    try {
      suppliers.value = await getActiveSuppliers()
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  const search = async (keyword: string) => {
    loading.value = true
    error.value = null
    try {
      suppliers.value = await searchSuppliers(keyword)
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  const select = (id: number | null) => {
    selectedId.value = id
  }

  const getById = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      return await getSupplier(id)
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  const refresh = () => {
    clearSupplierCache()
    return load()
  }

  return {
    suppliers,
    loading,
    error,
    selectedId,
    selectedSupplier,
    load,
    loadActive,
    search,
    select,
    getById,
    refresh,
  }
}
