/**
 * 委外加工管理 Composable
 *
 * 提供委外加工单的完整生命周期管理，包括发出、回收、在途查询
 *
 * @example
 * ```ts
 * const manager = useOutsourceManager()
 * await manager.loadList()
 * await manager.createOutsource(data)
 * await manager.sendOutsource(id)
 * await manager.backOutsource(id, backData)
 * ```
 */

import { ref, computed, type Ref } from 'vue'
import type {
  OutsourceHeadView,
  CreateOutsourceCommand,
  UpdateOutsourceCommand,
  SubmitBackCommand,
  OutsourceInTransitView,
  QueryOutsources,
} from '../../api/outsource/outsource-api'
import {
  listOutsources,
  getOutsource,
  createOutsource,
  updateOutsource,
  deleteOutsource,
  sendOutsource,
  backOutsource,
  closeOutsource,
  voidOutsource,
  getOutsourcesInTransit,
  getOutsourcesByStatus,
  getOutsourcesBySupplier,
  getOutsourcesByMaterial,
  getOutsourcesByDateRange,
  searchOutsourcesByNo,
  getInTransitOutsources,
  batchGetOutsources,
  batchSendOutsources,
  batchCloseOutsources,
  batchVoidOutsources,
  getOutsourceStats,
  getOutsourceTotalSendQty,
  getOutsourceTotalBackQty,
  getOutsourceInTransitQty,
  canEditOutsource,
  canSendOutsource,
  canBackOutsource,
  canCloseOutsource,
  getPendingSendOutsources,
  getPendingBackOutsources,
  getOutsourcePrintData,
  clearOutsourceCache,
} from '../../api/outsource/outsource-api'

// ============================================================================
// 1. 委外加工单列表管理
// ============================================================================

export function useOutsourceList(options: { autoLoad?: boolean; filters?: Ref<QueryOutsources> } = {}) {
  const { autoLoad = false, filters } = options

  const outsources = ref<OutsourceHeadView[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const load = async (params?: QueryOutsources) => {
    loading.value = true
    error.value = null
    try {
      outsources.value = await listOutsources(params || filters?.value)
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
      outsources.value = await getOutsourcesByStatus(status)
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
      outsources.value = await getOutsourcesBySupplier(supplierId)
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
      outsources.value = await getOutsourcesByMaterial(materialId)
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
      outsources.value = await getOutsourcesByDateRange(dateFrom, dateTo)
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  const search = async (outsourceNo: string) => {
    loading.value = true
    error.value = null
    try {
      outsources.value = await searchOutsourcesByNo(outsourceNo)
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  const loadPendingSend = async () => {
    loading.value = true
    error.value = null
    try {
      outsources.value = await getPendingSendOutsources()
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  const loadPendingBack = async () => {
    loading.value = true
    error.value = null
    try {
      outsources.value = await getPendingBackOutsources()
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  if (autoLoad) load()

  return {
    outsources,
    loading,
    error,
    load,
    refresh,
    filterByStatus,
    filterBySupplier,
    filterByMaterial,
    filterByDateRange,
    search,
    loadPendingSend,
    loadPendingBack,
  }
}

// ============================================================================
// 2. 委外加工单详情管理
// ============================================================================

export function useOutsourceDetail(id: Ref<number | null>) {
  const outsource = ref<OutsourceHeadView | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const load = async () => {
    if (!id.value) return
    loading.value = true
    error.value = null
    try {
      outsource.value = await getOutsource(id.value)
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  const refresh = () => load()

  const update = async (data: UpdateOutsourceCommand) => {
    if (!id.value) throw new Error('委外加工单 ID 不能为空')
    loading.value = true
    error.value = null
    try {
      outsource.value = await updateOutsource(id.value, data)
      clearOutsourceCache()
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  const canEdit = computed(() => outsource.value?.status === 'PENDING')
  const canSend = computed(() => outsource.value?.status === 'PENDING' && (outsource.value?.lines?.length || 0) > 0)
  const canBack = computed(() => outsource.value?.status === 'SENT')
  const canClose = computed(() => outsource.value?.status === 'SENT' || outsource.value?.status === 'PARTIAL_BACK')

  const checkCanEdit = async () => {
    if (!id.value) return false
    return await canEditOutsource(id.value)
  }

  const checkCanSend = async () => {
    if (!id.value) return false
    return await canSendOutsource(id.value)
  }

  const checkCanBack = async () => {
    if (!id.value) return false
    return await canBackOutsource(id.value)
  }

  const checkCanClose = async () => {
    if (!id.value) return false
    return await canCloseOutsource(id.value)
  }

  return {
    outsource,
    loading,
    error,
    load,
    refresh,
    update,
    canEdit,
    canSend,
    canBack,
    canClose,
    checkCanEdit,
    checkCanSend,
    checkCanBack,
    checkCanClose,
  }
}

// ============================================================================
// 3. 委外加工单创建表单
// ============================================================================

export function useOutsourceForm() {
  const formData = ref<Partial<CreateOutsourceCommand>>({ lines: [] })
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const create = async (data: CreateOutsourceCommand) => {
    loading.value = true
    error.value = null
    try {
      const result = await createOutsource(data)
      clearOutsourceCache()
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
    if (!formData.value.outsource_date) throw new Error('委外日期不能为空')
    if (!formData.value.lines || formData.value.lines.length === 0) throw new Error('委外明细不能为空')
    return true
  }

  return { formData, loading, error, create, reset, validate }
}

// ============================================================================
// 4. 委外加工单工作流操作
// ============================================================================

export function useOutsourceWorkflow() {
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const send = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      const result = await sendOutsource(id)
      clearOutsourceCache()
      return result
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  const back = async (id: number, data: SubmitBackCommand) => {
    loading.value = true
    error.value = null
    try {
      const result = await backOutsource(id, data)
      clearOutsourceCache()
      return result
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  const close = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      const result = await closeOutsource(id)
      clearOutsourceCache()
      return result
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
      await voidOutsource(id)
      clearOutsourceCache()
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  const deleteOne = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      await deleteOutsource(id)
      clearOutsourceCache()
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  return { loading, error, send, back, close, voidOne, deleteOne }
}

// ============================================================================
// 5. 在途委外加工查询
// ============================================================================

export function useOutsourceInTransit() {
  const inTransitList = ref<OutsourceInTransitView[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const load = async () => {
    loading.value = true
    error.value = null
    try {
      inTransitList.value = await getInTransitOutsources()
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  const refresh = () => load()

  const getInTransitQty = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      return await getOutsourceInTransitQty(id)
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  return { inTransitList, loading, error, load, refresh, getInTransitQty }
}

// ============================================================================
// 6. 委外加工统计
// ============================================================================

export function useOutsourceStats() {
  const stats = ref<any>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const load = async () => {
    loading.value = true
    error.value = null
    try {
      stats.value = await getOutsourceStats()
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
      const [sendQty, backQty, inTransitQty] = await Promise.all([
        getOutsourceTotalSendQty(id),
        getOutsourceTotalBackQty(id),
        getOutsourceInTransitQty(id),
      ])
      return { sendQty, backQty, inTransitQty }
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
// 7. 委外加工批量操作
// ============================================================================

export function useOutsourceBatch() {
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const batchGet = async (ids: number[]) => {
    loading.value = true
    error.value = null
    try {
      return await batchGetOutsources(ids)
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  const batchSend = async (ids: number[]) => {
    loading.value = true
    error.value = null
    try {
      await batchSendOutsources(ids)
      clearOutsourceCache()
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  const batchClose = async (ids: number[]) => {
    loading.value = true
    error.value = null
    try {
      await batchCloseOutsources(ids)
      clearOutsourceCache()
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
      await batchVoidOutsources(ids)
      clearOutsourceCache()
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  return { loading, error, batchGet, batchSend, batchClose, batchVoid }
}

// ============================================================================
// 8. 委外加工打印
// ============================================================================

export function useOutsourcePrint() {
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const getPrintData = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      return await getOutsourcePrintData(id)
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
// 9. 完整委外加工管理器
// ============================================================================

export function useOutsourceManager() {
  const currentId = ref<number | null>(null)

  const list = useOutsourceList()
  const detail = useOutsourceDetail(currentId)
  const form = useOutsourceForm()
  const workflow = useOutsourceWorkflow()
  const inTransit = useOutsourceInTransit()
  const stats = useOutsourceStats()
  const batch = useOutsourceBatch()
  const print = useOutsourcePrint()

  const setCurrentId = (id: number | null) => {
    currentId.value = id
    if (id) detail.load()
  }

  const createOutsource = async (data: CreateOutsourceCommand) => {
    const result = await form.create(data)
    await list.refresh()
    return result
  }

  const updateOutsource = async (id: number, data: UpdateOutsourceCommand) => {
    currentId.value = id
    const result = await detail.update(data)
    await list.refresh()
    return result
  }

  const deleteOutsource = async (id: number) => {
    await workflow.deleteOne(id)
    await list.refresh()
    if (currentId.value === id) currentId.value = null
  }

  const sendOutsource = async (id: number) => {
    const result = await workflow.send(id)
    if (currentId.value === id) await detail.refresh()
    await list.refresh()
    return result
  }

  const backOutsource = async (id: number, data: SubmitBackCommand) => {
    const result = await workflow.back(id, data)
    if (currentId.value === id) await detail.refresh()
    await list.refresh()
    return result
  }

  const closeOutsource = async (id: number) => {
    const result = await workflow.close(id)
    if (currentId.value === id) await detail.refresh()
    await list.refresh()
    return result
  }

  const voidOutsource = async (id: number) => {
    await workflow.voidOne(id)
    if (currentId.value === id) await detail.refresh()
    await list.refresh()
  }

  return {
    currentId,
    outsources: list.outsources,
    currentOutsource: detail.outsource,
    inTransitList: inTransit.inTransitList,
    stats: stats.stats,
    loading: computed(() =>
      list.loading.value ||
      detail.loading.value ||
      form.loading.value ||
      workflow.loading.value ||
      inTransit.loading.value ||
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
    loadPendingSend: list.loadPendingSend,
    loadPendingBack: list.loadPendingBack,
    setCurrentId,
    loadDetail: (id: number) => { setCurrentId(id); return detail.load() },
    refreshDetail: detail.refresh,
    createOutsource,
    updateOutsource,
    deleteOutsource,
    sendOutsource,
    backOutsource,
    closeOutsource,
    voidOutsource,
    formData: form.formData,
    resetForm: form.reset,
    validateForm: form.validate,
    loadInTransit: inTransit.load,
    refreshInTransit: inTransit.refresh,
    getInTransitQty: inTransit.getInTransitQty,
    loadStats: stats.load,
    loadQuantities: stats.loadQuantities,
    batchGet: batch.batchGet,
    batchSend: batch.batchSend,
    batchClose: batch.batchClose,
    batchVoid: batch.batchVoid,
    getPrintData: print.getPrintData,
    canEdit: detail.canEdit,
    canSend: detail.canSend,
    canBack: detail.canBack,
    canClose: detail.canClose,
    checkCanEdit: detail.checkCanEdit,
    checkCanSend: detail.checkCanSend,
    checkCanBack: detail.checkCanBack,
    checkCanClose: detail.checkCanClose,
  }
}
