/**
 * 预发料管理 Composable
 *
 * 提供预发料单的完整生命周期管理，包括超期预警和手动关闭功能
 *
 * @example
 * ```ts
 * // 使用完整管理器
 * const manager = usePreissueManager()
 * await manager.loadList()
 * await manager.createPreissue(data)
 * await manager.voidPreissue(id)
 * await manager.loadTimeoutWarnings()
 * await manager.manualCloseLine({ line_id: 1, close_reason: '工单取消' })
 * ```
 */

import { ref, computed, type Ref } from 'vue'
import type {
  PreissueHeadView,
  CreatePreissueCommand,
  UpdatePreissueCommand,
  ManualCloseLineCommand,
  QueryPreissues,
} from '../../api/preissue/preissue-api'
import {
  listPreissues,
  getPreissue,
  createPreissue,
  updatePreissue,
  deletePreissue,
  voidPreissue,
  checkPreissueTimeout,
  getPreissueTimeoutWarnings,
  manualClosePreissueLine,
  getPreissuesByStatus,
  getPreissuesByWorkOrder,
  getPreissuesByMaterial,
  getPreissuesByWarehouse,
  getPreissuesByDateRange,
  searchPreissuesByNo,
  batchGetPreissues,
  batchVoidPreissues,
  getPreissueStats,
  getPreissueTotalQty,
  getPreissueMaterialCount,
  canEditPreissue,
  canDeletePreissue,
  canVoidPreissue as canVoidPreissueApi,
  getTimeoutWarningCount,
  getPreissuePrintData,
  clearPreissueCache,
} from '../../api/preissue/preissue-api'

// ============================================================================
// 1. 预发料单列表管理
// ============================================================================

export interface UsePreissueListOptions {
  autoLoad?: boolean
  filters?: Ref<QueryPreissues>
}

export function usePreissueList(options: UsePreissueListOptions = {}) {
  const { autoLoad = false, filters } = options

  const preissues = ref<PreissueHeadView[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const load = async (params?: QueryPreissues) => {
    loading.value = true
    error.value = null
    try {
      const queryParams = params || filters?.value
      preissues.value = await listPreissues(queryParams)
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
      preissues.value = await getPreissuesByStatus(status)
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  const filterByWorkOrder = async (workOrderNo: string) => {
    loading.value = true
    error.value = null
    try {
      preissues.value = await getPreissuesByWorkOrder(workOrderNo)
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
      preissues.value = await getPreissuesByMaterial(materialId)
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  const filterByWarehouse = async (whId: number) => {
    loading.value = true
    error.value = null
    try {
      preissues.value = await getPreissuesByWarehouse(whId)
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
      preissues.value = await getPreissuesByDateRange(dateFrom, dateTo)
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  const search = async (preissueNo: string) => {
    loading.value = true
    error.value = null
    try {
      preissues.value = await searchPreissuesByNo(preissueNo)
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  if (autoLoad) {
    load()
  }

  return {
    preissues,
    loading,
    error,
    load,
    refresh,
    filterByStatus,
    filterByWorkOrder,
    filterByMaterial,
    filterByWarehouse,
    filterByDateRange,
    search,
  }
}

// ============================================================================
// 2. 预发料单详情管理
// ============================================================================

export function usePreissueDetail(id: Ref<number | null>) {
  const preissue = ref<PreissueHeadView | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const load = async () => {
    if (!id.value) return

    loading.value = true
    error.value = null
    try {
      preissue.value = await getPreissue(id.value)
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  const refresh = () => load()

  const update = async (data: UpdatePreissueCommand) => {
    if (!id.value) throw new Error('预发料单 ID 不能为空')

    loading.value = true
    error.value = null
    try {
      preissue.value = await updatePreissue(id.value, data)
      clearPreissueCache()
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  const canEdit = computed(() => preissue.value?.status === 'PENDING')
  const canDelete = computed(() => preissue.value?.status === 'PENDING' && !preissue.value?.has_offset)
  const canVoid = computed(() => preissue.value?.status === 'PENDING')

  const checkCanEdit = async () => {
    if (!id.value) return false
    return await canEditPreissue(id.value)
  }

  const checkCanDelete = async () => {
    if (!id.value) return false
    return await canDeletePreissue(id.value)
  }

  const checkCanVoid = async () => {
    if (!id.value) return false
    return await canVoidPreissueApi(id.value)
  }

  return {
    preissue,
    loading,
    error,
    load,
    refresh,
    update,
    canEdit,
    canDelete,
    canVoid,
    checkCanEdit,
    checkCanDelete,
    checkCanVoid,
  }
}

// ============================================================================
// 3. 预发料单创建表单
// ============================================================================

export function usePreissueForm() {
  const formData = ref<Partial<CreatePreissueCommand>>({
    lines: [],
  })
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const create = async (data: CreatePreissueCommand) => {
    loading.value = true
    error.value = null
    try {
      const result = await createPreissue(data)
      clearPreissueCache()
      return result
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  const reset = () => {
    formData.value = {
      lines: [],
    }
    error.value = null
  }

  const validate = () => {
    if (!formData.value.work_order_no) {
      throw new Error('工单号不能为空')
    }
    if (!formData.value.preissue_date) {
      throw new Error('预发料日期不能为空')
    }
    if (!formData.value.lines || formData.value.lines.length === 0) {
      throw new Error('预发料明细不能为空')
    }
    return true
  }

  return {
    formData,
    loading,
    error,
    create,
    reset,
    validate,
  }
}

// ============================================================================
// 4. 预发料单删除和作废操作
// ============================================================================

export function usePreissueActions() {
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const deleteOne = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      await deletePreissue(id)
      clearPreissueCache()
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
      await voidPreissue(id)
      clearPreissueCache()
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    deleteOne,
    voidOne,
  }
}

// ============================================================================
// 5. 超期管理
// ============================================================================

export function usePreissueTimeout() {
  const warnings = ref<PreissueHeadView[]>([])
  const warningCount = ref(0)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const loadWarnings = async () => {
    loading.value = true
    error.value = null
    try {
      warnings.value = await getPreissueTimeoutWarnings()
      warningCount.value = warnings.value.length
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  const checkTimeout = async () => {
    loading.value = true
    error.value = null
    try {
      const count = await checkPreissueTimeout()
      await loadWarnings()
      return count
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  const manualCloseLine = async (data: ManualCloseLineCommand) => {
    loading.value = true
    error.value = null
    try {
      await manualClosePreissueLine(data)
      clearPreissueCache()
      await loadWarnings()
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  const loadWarningCount = async () => {
    loading.value = true
    error.value = null
    try {
      warningCount.value = await getTimeoutWarningCount()
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    warnings,
    warningCount,
    loading,
    error,
    loadWarnings,
    checkTimeout,
    manualCloseLine,
    loadWarningCount,
  }
}

// ============================================================================
// 6. 预发料统计查询
// ============================================================================

export function usePreissueStats() {
  const stats = ref<any>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const load = async () => {
    loading.value = true
    error.value = null
    try {
      stats.value = await getPreissueStats()
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  const loadPreissueQuantities = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      const [totalQty, materialCount] = await Promise.all([
        getPreissueTotalQty(id),
        getPreissueMaterialCount(id),
      ])
      return { totalQty, materialCount }
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    stats,
    loading,
    error,
    load,
    loadPreissueQuantities,
  }
}

// ============================================================================
// 7. 预发料批量操作
// ============================================================================

export function usePreissueBatch() {
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const batchGet = async (ids: number[]) => {
    loading.value = true
    error.value = null
    try {
      return await batchGetPreissues(ids)
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
      await batchVoidPreissues(ids)
      clearPreissueCache()
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    batchGet,
    batchVoid,
  }
}

// ============================================================================
// 8. 预发料打印
// ============================================================================

export function usePreissuePrint() {
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const getPrintData = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      return await getPreissuePrintData(id)
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    getPrintData,
  }
}

// ============================================================================
// 9. 完整预发料管理器
// ============================================================================

export function usePreissueManager() {
  const currentId = ref<number | null>(null)

  const list = usePreissueList()
  const detail = usePreissueDetail(currentId)
  const form = usePreissueForm()
  const actions = usePreissueActions()
  const timeout = usePreissueTimeout()
  const stats = usePreissueStats()
  const batch = usePreissueBatch()
  const print = usePreissuePrint()

  const setCurrentId = (id: number | null) => {
    currentId.value = id
    if (id) {
      detail.load()
    }
  }

  const createPreissue = async (data: CreatePreissueCommand) => {
    const result = await form.create(data)
    await list.refresh()
    return result
  }

  const updatePreissue = async (id: number, data: UpdatePreissueCommand) => {
    currentId.value = id
    const result = await detail.update(data)
    await list.refresh()
    return result
  }

  const deletePreissue = async (id: number) => {
    await actions.deleteOne(id)
    await list.refresh()
    if (currentId.value === id) {
      currentId.value = null
    }
  }

  const voidPreissue = async (id: number) => {
    await actions.voidOne(id)
    if (currentId.value === id) {
      await detail.refresh()
    }
    await list.refresh()
  }

  const manualCloseLine = async (data: ManualCloseLineCommand) => {
    await timeout.manualCloseLine(data)
    if (currentId.value) {
      await detail.refresh()
    }
    await list.refresh()
  }

  const loadList = (params?: QueryPreissues) => list.load(params)
  const refreshList = () => list.refresh()
  const loadDetail = (id: number) => {
    setCurrentId(id)
    return detail.load()
  }
  const refreshDetail = () => detail.refresh()
  const loadTimeoutWarnings = () => timeout.loadWarnings()
  const checkTimeout = () => timeout.checkTimeout()
  const loadStats = () => stats.load()

  return {
    // 状态
    currentId,
    preissues: list.preissues,
    currentPreissue: detail.preissue,
    timeoutWarnings: timeout.warnings,
    timeoutWarningCount: timeout.warningCount,
    stats: stats.stats,
    loading: computed(() =>
      list.loading.value ||
      detail.loading.value ||
      form.loading.value ||
      actions.loading.value ||
      timeout.loading.value ||
      stats.loading.value ||
      batch.loading.value ||
      print.loading.value
    ),

    // 列表操作
    loadList,
    refreshList,
    filterByStatus: list.filterByStatus,
    filterByWorkOrder: list.filterByWorkOrder,
    filterByMaterial: list.filterByMaterial,
    filterByWarehouse: list.filterByWarehouse,
    filterByDateRange: list.filterByDateRange,
    search: list.search,

    // 详情操作
    setCurrentId,
    loadDetail,
    refreshDetail,
    updatePreissue,

    // 创建操作
    createPreissue,
    formData: form.formData,
    resetForm: form.reset,
    validateForm: form.validate,

    // 删除和作废操作
    deletePreissue,
    voidPreissue,

    // 超期管理
    loadTimeoutWarnings,
    checkTimeout,
    manualCloseLine,
    loadWarningCount: timeout.loadWarningCount,

    // 统计操作
    loadStats,
    loadPreissueQuantities: stats.loadPreissueQuantities,

    // 批量操作
    batchGet: batch.batchGet,
    batchVoid: batch.batchVoid,

    // 打印操作
    getPrintData: print.getPrintData,

    // 权限检查
    canEdit: detail.canEdit,
    canDelete: detail.canDelete,
    canVoid: detail.canVoid,
    checkCanEdit: detail.checkCanEdit,
    checkCanDelete: detail.checkCanDelete,
    checkCanVoid: detail.checkCanVoid,
  }
}
