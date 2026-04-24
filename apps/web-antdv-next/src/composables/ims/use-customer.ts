/**
 * 客户选择器 Composable
 * 提供客户列表查询和选择功能
 */

import { ref, computed } from 'vue'
import type { CustomerView, CustomerListQuery } from '../../api/catalog/customer-api'
import {
  listCustomers,
  getCustomer,
  searchCustomers,
  getActiveCustomers,
  clearCustomerCache,
} from '../../api/catalog/customer-api'

export function useCustomerSelector() {
  const customers = ref<CustomerView[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const selectedId = ref<number | null>(null)

  const selectedCustomer = computed(() =>
    customers.value.find(c => c.id === selectedId.value) || null
  )

  const load = async (params?: CustomerListQuery) => {
    loading.value = true
    error.value = null
    try {
      customers.value = await listCustomers(params)
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
      customers.value = await getActiveCustomers()
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
      customers.value = await searchCustomers(keyword)
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
      return await getCustomer(id)
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  const refresh = () => {
    clearCustomerCache()
    return load()
  }

  return {
    customers,
    loading,
    error,
    selectedId,
    selectedCustomer,
    load,
    loadActive,
    search,
    select,
    getById,
    refresh,
  }
}
