/**
 * 供应商退货管理 Composable
 *
 * 提供供应商退货单的完整生命周期管理
 *
 * @example
 * ```ts
 * const manager = useSupplierReturnManager()
 * await manager.loadList()
 * await manager.createSupplierReturn(data)
 * await manager.submitSupplierReturn(id)
 * ```
 */

import { ref, computed, type Ref } from 'vue'
import type {
  SupplierReturnHeadView,
  CreateSupplierReturnCommand,
  UpdateSupplierReturnCommand,
  QuerySupplierReturns,
} from '../../api/supplier-return/supplier-return-api'
import {
  listSupplierReturns,
  getSupplierReturn,
  createSupplierReturn,
  updateSupplierReturn,
  deleteSupplierReturn,
  submitSupplierReturn,
  voidSupplierReturn,
  getSupplierReturnsByStatus,
  getSupplierReturnsBySupplier,
  getSupplierReturnsByMaterial,
  getSupplierReturnsByDateRange,
  searchSupplierReturnsByNo,
  batchGetSupplierReturns,
  batchSubmitSupplierReturns,
  batchVoidSupplierReturns,
  getSupplierReturnStats,
  getSupplierReturnTotalQty,
  getSupplierReturnMaterialCount,
  canEditSupplierReturn,
  canSubmitSupplierReturn,
  getPendingSupplierReturns,
  getSupplierReturnPrintData,
  clearSupplierReturnCache,
} from '../../api/supplier-return/supplier-return-api'

// ============================================================================
// 1. 供应商退货单列表管理
// ============================================================================

export function useSupplierReturnList(options: { autoLoad?: boolean; filters?: Ref<QuerySupplierReturns> } = {}) {
  const { autoLoad = false, filters } = options

  const supplierReturns = ref<SupplierReturnHeadView[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const load = async (params?: QuerySupplierReturns) => {
    loading.value = true
    error.value = null
    try {
      supplierReturns.value = await listSupplierReturns(params || filters?.value)
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  const refresh = () => load(filters?.value)

  const filterByStatus = async (status: string) => {
    loading.value = true
    error.value = null
    try {
      supplierReturns.value = await getSupplierReturnsByStatus(status)
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  const filterBySupplier = async (supplierId: number) => {
    loading.value = true
    error.value = null
    try {
      supplierReturns.value = await getSupplierReturnsBySupplier(supplierId)
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  const filterByMaterial = async (materialId: number) => {
    loading.value = true
    error.value = null
    try {
      supplierReturns.value = await getSupplierReturnsByMaterial(materialId)
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  const filterByDateRange = async (dateFrom: string, dateTo: string) => {
    loading.value = true
    error.value = null
    try {
      supplierReturns.value = await getSupplierReturnsByDateRange(dateFrom, dateTo)
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  const search = async (returnNo: string) => {
    loading.value = true
    error.value = null
    try {
      supplierReturns.value = await searchSupplierReturnsByNo(returnNo)
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  const loadPending = async () => {
    loading.value = true
    error.value = null
    try {
      supplierReturns.value = await getPendingSupplierReturns()
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  if (autoLoad) load()

  return {
    supplierReturns,
    loading,
    error,
    load,
    refresh,
    filterByStatus,
    filterBySupplier,
    filterByMaterial,
    filterByDateRange,
    search,
    loadPending,
  }
}

// ============================================================================
// 2. 供应商退货单详情管理
// ============================================================================

export function useSupplierReturnDetail(id: Ref<number | null>) {
  const supplierReturn = ref<SupplierReturnHeadView | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const load = async () => {
    if (!id.value) return
    loading.value = true
    error.value = null
    try {
      supplierReturn.value = await getSupplierReturn(id.value)
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  const refresh = () => load()

  const update = async (data: UpdateSupplierReturnCommand) => {
    if (!id.value) throw new Error('供应商退货单 ID 不能为空')
    loading.value = true
    error.value = null
    try {
      supplierReturn.value = await updateSupplierReturn(id.value, data)
      clearSupplierReturnCache()
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  const canEdit = computed(() => supplierReturn.value?.status === 'PENDING')
  const canSubmit = computed(() => supplierReturn.value?.status === 'PENDING' && (supplierReturn.value?.lines?.length || 0) > 0)

  const checkCanEdit = async () => {
    if (!id.value) return false
    return await canEditSupplierReturn(id.value)
  }

  const checkCanSubmit = async () => {
    if (!id.value) return false
    return await canSubmitSupplierReturn(id.value)
  }

  return {
    supplierReturn,
    loading,
    error,
    load,
    refresh,
    update,
    canEdit,
    canSubmit,
    checkCanEdit,
    checkCanSubmit,
  }
}

// ============================================================================
// 3. 供应商退货单创建表单
// ============================================================================

export function useSupplierReturnForm() {
  const formData = ref<Partial<CreateSupplierReturnCommand>>({ lines: [] })
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const create = async (data: CreateSupplierReturnCommand) => {
    loading.value = true
    error.value = null
    try {
      const result = await createSupplierReturn(data)
      clearSupplierReturnCache()
      return result
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  const reset = () => {
    formData.value = { lines: [] }
    error.value = null
  }

  const validate = () => {
    if (!formData.value.supplier_id) throw new Error('供应商不能为空')
    if (!formData.value.return_date) throw new Error('退货日期不能为空')
    if (!formData.value.lines || formData.value.lines.length === 0) throw new Error('退货明细不能为空')
    return true
  }

  return { formData, loading, error, create, reset, validate }
}

// ============================================================================
// 4. 供应商退货单操作
// ============================================================================

export function useSupplierReturnActions() {
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const deleteOne = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      await deleteSupplierReturn(id)
      clearSupplierReturnCache()
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  const voidOne = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      await voidSupplierReturn(id)
      clearSupplierReturnCache()
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  const submit = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      const result = await submitSupplierReturn(id)
      clearSupplierReturnCache()
      return result
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  return { loading, error, deleteOne, voidOne, submit }
}

// ============================================================================
// 5. 供应商退货统计
// ============================================================================

export function useSupplierReturnStats() {
  const stats = ref<any>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const load = async () => {
    loading.value = true
    error.value = null
    try {
      stats.value = await getSupplierReturnStats()
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  const loadQuantities = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      const [totalQty, materialCount] = await Promise.all([
        getSupplierReturnTotalQty(id),
        getSupplierReturnMaterialCount(id),
      ])
      return { totalQty, materialCount }
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  return { stats, loading, error, load, loadQuantities }
}

// ============================================================================
// 6. 供应商退货批量操作
// ============================================================================

export function useSupplierReturnBatch() {
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const batchGet = async (ids: number[]) => {
    loading.value = true
    error.value = null
    try {
      return await batchGetSupplierReturns(ids)
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  const batchSubmit = async (ids: number[]) => {
    loading.value = true
    error.value = null
    try {
      await batchSubmitSupplierReturns(ids)
      clearSupplierReturnCache()
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  const batchVoid = async (ids: number[]) => {
    loading.value = true
    error.value = null
    try {
      await batchVoidSupplierReturns(ids)
      clearSupplierReturnCache()
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  return { loading, error, batchGet, batchSubmit, batchVoid }
}

// ============================================================================
// 7. 供应商退货打印
// ============================================================================

export function useSupplierReturnPrint() {
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const getPrintData = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      return await getSupplierReturnPrintData(id)
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  return { loading, error, getPrintData }
}

// ============================================================================
// 8. 完整供应商退货管理器
// ============================================================================

export function useSupplierReturnManager() {
  const currentId = ref<number | null>(null)

  const list = useSupplierReturnList()
  const detail = useSupplierReturnDetail(currentId)
  const form = useSupplierReturnForm()
  const actions = useSupplierReturnActions()
  const stats = useSupplierReturnStats()
  const batch = useSupplierReturnBatch()
  const print = useSupplierReturnPrint()

  const setCurrentId = (id: number | null) => {
    currentId.value = id
    if (id) detail.load()
  }

  const createSupplierReturn = async (data: CreateSupplierReturnCommand) => {
    const result = await form.create(data)
    await list.refresh()
    return result
  }

  const updateSupplierReturn = async (id: number, data: UpdateSupplierReturnCommand) => {
    currentId.value = id
    const result = await detail.update(data)
    await list.refresh()
    return result
  }

  const deleteSupplierReturn = async (id: number) => {
    await actions.deleteOne(id)
    await list.refresh()
    if (currentId.value === id) currentId.value = null
  }

  const voidSupplierReturn = async (id: number) => {
    await actions.voidOne(id)
    if (currentId.value === id) await detail.refresh()
    await list.refresh()
  }

  const submitSupplierReturn = async (id: number) => {
    const result = await actions.submit(id)
    if (currentId.value === id) await detail.refresh()
    await list.refresh()
    return result
  }

  return {
    currentId,
    supplierReturns: list.supplierReturns,
    currentSupplierReturn: detail.supplierReturn,
    stats: stats.stats,
    loading: computed(() =>
      list.loading.value ||
      detail.loading.value ||
      form.loading.value ||
      actions.loading.value ||
      stats.loading.value ||
      batch.loading.value ||
      print.loading.value
    ),
    loadList: list.load,
    refreshList: list.refresh,
    filterByStatus: list.filterByStatus,
    filterBySupplier: list.filterBySupplier,
    filterByMaterial: list.filterByMaterial,
    filterByDateRange: list.filterByDateRange,
    search: list.search,
    loadPending: list.loadPending,
    setCurrentId,
    loadDetail: (id: number) => { setCurrentId(id); return detail.load() },
    refreshDetail: detail.refresh,
    createSupplierReturn,
    updateSupplierReturn,
    deleteSupplierReturn,
    voidSupplierReturn,
    submitSupplierReturn,
    formData: form.formData,
    resetForm: form.reset,
    validateForm: form.validate,
    loadStats: stats.load,
    loadQuantities: stats.loadQuantities,
    batchGet: batch.batchGet,
    batchSubmit: batch.batchSubmit,
    batchVoid: batch.batchVoid,
    getPrintData: print.getPrintData,
    canEdit: detail.canEdit,
    canSubmit: detail.canSubmit,
    checkCanEdit: detail.checkCanEdit,
    checkCanSubmit: detail.checkCanSubmit,
  }
}
