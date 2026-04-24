/**
 * 盘点管理 Composable
 *
 * 提供盘点单的完整生命周期管理，包括任务分配、进度跟踪、差异审批
 *
 * @example
 * ```ts
 * // 使用完整管理器
 * const manager = useStocktakeManager()
 * await manager.loadList()
 * await manager.createStocktake(data)
 * await manager.assignTask(id, assignments)
 * await manager.recordCounts(id, counts)
 * await manager.submit(id)
 * await manager.approveVariance(id, comment)
 * ```
 */

import { ref, computed, type Ref } from 'vue'
import type {
  StocktakeHeadView,
  CreateStocktakeCommand,
  UpdateStocktakeCommand,
  RecordCountCommand,
  AssignTaskCommand,
  ApproveVarianceCommand,
  StocktakeProgressView,
  QueryStocktakes,
} from '../../api/stocktake/stocktake-api'
import {
  listStocktakes,
  getStocktake,
  createStocktake,
  updateStocktake,
  deleteStocktake,
  recordStocktakeCounts,
  submitStocktake,
  voidStocktake,
  assignStocktakeTask,
  getStocktakeProgress,
  approveStocktakeVariance,
  getStocktakesByStatus,
  getStocktakesByWarehouse,
  getStocktakesByMaterial,
  getStocktakesByDateRange,
  searchStocktakesByNo,
  getCachedStocktakeProgress,
  batchGetStocktakes,
  batchSubmitStocktakes,
  batchVoidStocktakes,
  getStocktakeStats,
  getStocktakeTotalBookQty,
  getStocktakeTotalActualQty,
  getStocktakeTotalVariance,
  getStocktakeVarianceRate,
  canEditStocktake,
  canRecordStocktake,
  canSubmitStocktake,
  canApproveStocktake,
  getPendingStocktakes,
  getInProgressStocktakes,
  getPendingApprovalStocktakes,
  getStocktakePrintData,
  clearStocktakeCache,
} from '../../api/stocktake/stocktake-api'

// ============================================================================
// 1. 盘点单列表管理
// ============================================================================

export interface UseStocktakeListOptions {
  autoLoad?: boolean
  filters?: Ref<QueryStocktakes>
}

export function useStocktakeList(options: UseStocktakeListOptions = {}) {
  const { autoLoad = false, filters } = options

  const stocktakes = ref<StocktakeHeadView[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const load = async (params?: QueryStocktakes) => {
    loading.value = true
    error.value = null
    try {
      const queryParams = params || filters?.value
      stocktakes.value = await listStocktakes(queryParams)
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
      stocktakes.value = await getStocktakesByStatus(status)
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
      stocktakes.value = await getStocktakesByWarehouse(whId)
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
      stocktakes.value = await getStocktakesByMaterial(materialId)
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
      stocktakes.value = await getStocktakesByDateRange(dateFrom, dateTo)
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  const search = async (stocktakeNo: string) => {
    loading.value = true
    error.value = null
    try {
      stocktakes.value = await searchStocktakesByNo(stocktakeNo)
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
      stocktakes.value = await getPendingStocktakes()
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  const loadInProgress = async () => {
    loading.value = true
    error.value = null
    try {
      stocktakes.value = await getInProgressStocktakes()
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  const loadPendingApproval = async () => {
    loading.value = true
    error.value = null
    try {
      stocktakes.value = await getPendingApprovalStocktakes()
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
    stocktakes,
    loading,
    error,
    load,
    refresh,
    filterByStatus,
    filterByWarehouse,
    filterByMaterial,
    filterByDateRange,
    search,
    loadPending,
    loadInProgress,
    loadPendingApproval,
  }
}

// ============================================================================
// 2. 盘点单详情管理
// ============================================================================

export function useStocktakeDetail(id: Ref<number | null>) {
  const stocktake = ref<StocktakeHeadView | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const load = async () => {
    if (!id.value) return

    loading.value = true
    error.value = null
    try {
      stocktake.value = await getStocktake(id.value)
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  const refresh = () => load()

  const update = async (data: UpdateStocktakeCommand) => {
    if (!id.value) throw new Error('盘点单 ID 不能为空')

    loading.value = true
    error.value = null
    try {
      stocktake.value = await updateStocktake(id.value, data)
      clearStocktakeCache()
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  const canEdit = computed(() => stocktake.value?.status === 'PENDING')
  const canRecord = computed(() =>
    stocktake.value?.status === 'PENDING' || stocktake.value?.status === 'IN_PROGRESS'
  )
  const canSubmit = computed(() => {
    if (!stocktake.value) return false
    const allCounted = stocktake.value.lines?.every(
      line => line.actual_qty !== null && line.actual_qty !== undefined
    ) || false
    return (stocktake.value.status === 'PENDING' || stocktake.value.status === 'IN_PROGRESS') && allCounted
  })
  const canApprove = computed(() => stocktake.value?.status === 'PENDING_APPROVAL')

  const checkCanEdit = async () => {
    if (!id.value) return false
    return await canEditStocktake(id.value)
  }

  const checkCanRecord = async () => {
    if (!id.value) return false
    return await canRecordStocktake(id.value)
  }

  const checkCanSubmit = async () => {
    if (!id.value) return false
    return await canSubmitStocktake(id.value)
  }

  const checkCanApprove = async () => {
    if (!id.value) return false
    return await canApproveStocktake(id.value)
  }

  return {
    stocktake,
    loading,
    error,
    load,
    refresh,
    update,
    canEdit,
    canRecord,
    canSubmit,
    canApprove,
    checkCanEdit,
    checkCanRecord,
    checkCanSubmit,
    checkCanApprove,
  }
}

// ============================================================================
// 3. 盘点单创建表单
// ============================================================================

export function useStocktakeForm() {
  const formData = ref<Partial<CreateStocktakeCommand>>({
    lines: [],
  })
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const create = async (data: CreateStocktakeCommand) => {
    loading.value = true
    error.value = null
    try {
      const result = await createStocktake(data)
      clearStocktakeCache()
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
    if (!formData.value.stocktake_date) {
      throw new Error('盘点日期不能为空')
    }
    if (!formData.value.wh_id) {
      throw new Error('仓库不能为空')
    }
    if (!formData.value.stocktake_type) {
      throw new Error('盘点类型不能为空')
    }
    if (!formData.value.lines || formData.value.lines.length === 0) {
      throw new Error('盘点明细不能为空')
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
// 4. 盘点单删除操作
// ============================================================================

export function useStocktakeDelete() {
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const deleteOne = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      await deleteStocktake(id)
      clearStocktakeCache()
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
  }
}

// ============================================================================
// 5. 盘点单工作流管理
// ============================================================================

export function useStocktakeWorkflow() {
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const recordCounts = async (id: number, data: RecordCountCommand) => {
    loading.value = true
    error.value = null
    try {
      await recordStocktakeCounts(id, data)
      clearStocktakeCache()
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
      const result = await submitStocktake(id)
      clearStocktakeCache()
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
      await voidStocktake(id)
      clearStocktakeCache()
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  const approveVariance = async (id: number, data: ApproveVarianceCommand) => {
    loading.value = true
    error.value = null
    try {
      const result = await approveStocktakeVariance(id, data)
      clearStocktakeCache()
      return result
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
    recordCounts,
    submit,
    voidOne,
    approveVariance,
  }
}

// ============================================================================
// 6. 盘点任务分配
// ============================================================================

export function useStocktakeTask() {
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const assignTask = async (id: number, data: AssignTaskCommand) => {
    loading.value = true
    error.value = null
    try {
      const result = await assignStocktakeTask(id, data)
      clearStocktakeCache()
      return result
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
    assignTask,
  }
}

// ============================================================================
// 7. 盘点进度跟踪
// ============================================================================

export function useStocktakeProgress(id: Ref<number | null>) {
  const progress = ref<StocktakeProgressView | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const load = async (useCache = true) => {
    if (!id.value) return

    loading.value = true
    error.value = null
    try {
      progress.value = useCache
        ? await getCachedStocktakeProgress(id.value)
        : await getStocktakeProgress(id.value)
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  const refresh = () => load(false)

  const completionRate = computed(() => {
    if (!progress.value) return 0
    const total = progress.value.total_lines || 0
    const counted = progress.value.counted_lines || 0
    return total > 0 ? (counted / total) * 100 : 0
  })

  return {
    progress,
    loading,
    error,
    load,
    refresh,
    completionRate,
  }
}

// ============================================================================
// 8. 盘点统计查询
// ============================================================================

export function useStocktakeStats() {
  const stats = ref<any>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const load = async () => {
    loading.value = true
    error.value = null
    try {
      stats.value = await getStocktakeStats()
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  const loadStocktakeQuantities = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      const [bookQty, actualQty, variance, varianceRate] = await Promise.all([
        getStocktakeTotalBookQty(id),
        getStocktakeTotalActualQty(id),
        getStocktakeTotalVariance(id),
        getStocktakeVarianceRate(id),
      ])
      return { bookQty, actualQty, variance, varianceRate }
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
    loadStocktakeQuantities,
  }
}

// ============================================================================
// 9. 盘点批量操作
// ============================================================================

export function useStocktakeBatch() {
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const batchGet = async (ids: number[]) => {
    loading.value = true
    error.value = null
    try {
      return await batchGetStocktakes(ids)
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
      await batchSubmitStocktakes(ids)
      clearStocktakeCache()
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
      await batchVoidStocktakes(ids)
      clearStocktakeCache()
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
    batchSubmit,
    batchVoid,
  }
}

// ============================================================================
// 10. 盘点打印
// ============================================================================

export function useStocktakePrint() {
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const getPrintData = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      return await getStocktakePrintData(id)
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
// 11. 完整盘点管理器
// ============================================================================

export function useStocktakeManager() {
  const currentId = ref<number | null>(null)

  const list = useStocktakeList()
  const detail = useStocktakeDetail(currentId)
  const form = useStocktakeForm()
  const deleteOps = useStocktakeDelete()
  const workflow = useStocktakeWorkflow()
  const task = useStocktakeTask()
  const progress = useStocktakeProgress(currentId)
  const stats = useStocktakeStats()
  const batch = useStocktakeBatch()
  const print = useStocktakePrint()

  const setCurrentId = (id: number | null) => {
    currentId.value = id
    if (id) {
      detail.load()
      progress.load()
    }
  }

  const createStocktake = async (data: CreateStocktakeCommand) => {
    const result = await form.create(data)
    await list.refresh()
    return result
  }

  const updateStocktake = async (id: number, data: UpdateStocktakeCommand) => {
    currentId.value = id
    const result = await detail.update(data)
    await list.refresh()
    return result
  }

  const deleteStocktake = async (id: number) => {
    await deleteOps.deleteOne(id)
    await list.refresh()
    if (currentId.value === id) {
      currentId.value = null
    }
  }

  const recordCounts = async (id: number, data: RecordCountCommand) => {
    await workflow.recordCounts(id, data)
    if (currentId.value === id) {
      await detail.refresh()
      await progress.refresh()
    }
    await list.refresh()
  }

  const submit = async (id: number) => {
    const result = await workflow.submit(id)
    if (currentId.value === id) {
      await detail.refresh()
    }
    await list.refresh()
    return result
  }

  const voidStocktake = async (id: number) => {
    await workflow.voidOne(id)
    if (currentId.value === id) {
      await detail.refresh()
    }
    await list.refresh()
  }

  const assignTask = async (id: number, data: AssignTaskCommand) => {
    const result = await task.assignTask(id, data)
    if (currentId.value === id) {
      await detail.refresh()
      await progress.refresh()
    }
    await list.refresh()
    return result
  }

  const approveVariance = async (id: number, data: ApproveVarianceCommand) => {
    const result = await workflow.approveVariance(id, data)
    if (currentId.value === id) {
      await detail.refresh()
    }
    await list.refresh()
    return result
  }

  const loadList = (params?: QueryStocktakes) => list.load(params)
  const refreshList = () => list.refresh()
  const loadDetail = (id: number) => {
    setCurrentId(id)
    return detail.load()
  }
  const refreshDetail = () => detail.refresh()
  const loadProgress = (id: number) => {
    currentId.value = id
    return progress.load()
  }
  const refreshProgress = () => progress.refresh()
  const loadStats = () => stats.load()

  return {
    // 状态
    currentId,
    stocktakes: list.stocktakes,
    currentStocktake: detail.stocktake,
    currentProgress: progress.progress,
    stats: stats.stats,
    loading: computed(() =>
      list.loading.value ||
      detail.loading.value ||
      form.loading.value ||
      deleteOps.loading.value ||
      workflow.loading.value ||
      task.loading.value ||
      progress.loading.value ||
      stats.loading.value ||
      batch.loading.value ||
      print.loading.value
    ),

    // 列表操作
    loadList,
    refreshList,
    filterByStatus: list.filterByStatus,
    filterByWarehouse: list.filterByWarehouse,
    filterByMaterial: list.filterByMaterial,
    filterByDateRange: list.filterByDateRange,
    search: list.search,
    loadPending: list.loadPending,
    loadInProgress: list.loadInProgress,
    loadPendingApproval: list.loadPendingApproval,

    // 详情操作
    setCurrentId,
    loadDetail,
    refreshDetail,
    updateStocktake,

    // 创建操作
    createStocktake,
    formData: form.formData,
    resetForm: form.reset,
    validateForm: form.validate,

    // 删除操作
    deleteStocktake,

    // 工作流操作
    recordCounts,
    submit,
    voidStocktake,
    approveVariance,

    // 任务操作
    assignTask,

    // 进度操作
    loadProgress,
    refreshProgress,
    completionRate: progress.completionRate,

    // 统计操作
    loadStats,
    loadStocktakeQuantities: stats.loadStocktakeQuantities,

    // 批量操作
    batchGet: batch.batchGet,
    batchSubmit: batch.batchSubmit,
    batchVoid: batch.batchVoid,

    // 打印操作
    getPrintData: print.getPrintData,

    // 权限检查
    canEdit: detail.canEdit,
    canRecord: detail.canRecord,
    canSubmit: detail.canSubmit,
    canApprove: detail.canApprove,
    checkCanEdit: detail.checkCanEdit,
    checkCanRecord: detail.checkCanRecord,
    checkCanSubmit: detail.checkCanSubmit,
    checkCanApprove: detail.checkCanApprove,
  }
}
