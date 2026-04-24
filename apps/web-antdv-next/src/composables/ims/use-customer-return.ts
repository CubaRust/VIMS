/**
 * 客户退货管理 Composable
 *
 * 提供客户退货单的完整生命周期管理，包括判定流程和历史查询
 *
 * @example
 * ```ts
 * // 使用完整管理器
 * const manager = useCustomerReturnManager()
 * await manager.loadList()
 * await manager.createCustomerReturn(data)
 * await manager.judgeLines(id, judgeData)
 * await manager.submitCustomerReturn(id)
 * await manager.loadJudgeHistory(id)
 * ```
 */

import { ref, computed, type Ref } from 'vue'
import type {
  CustomerReturnHeadView,
  CreateCustomerReturnCommand,
  UpdateCustomerReturnCommand,
  JudgeLineCommand,
  JudgeHistoryView,
  QueryCustomerReturns,
} from '../../api/customer-return/customer-return-api'
import {
  listCustomerReturns,
  getCustomerReturn,
  createCustomerReturn,
  updateCustomerReturn,
  deleteCustomerReturn,
  judgeCustomerReturn,
  getCustomerReturnJudgeHistory,
  getCustomerReturnLineJudgeHistory,
  submitCustomerReturn,
  voidCustomerReturn,
  getCustomerReturnsByStatus,
  getCustomerReturnsByCustomer,
  getCustomerReturnsByMaterial,
  getCustomerReturnsByDateRange,
  searchCustomerReturnsByNo,
  batchGetCustomerReturns,
  batchSubmitCustomerReturns,
  batchVoidCustomerReturns,
  getCustomerReturnStats,
  getCustomerReturnTotalQty,
  getCustomerReturnMaterialCount,
  canEditCustomerReturn,
  canSubmitCustomerReturn,
  canJudgeCustomerReturn,
  getPendingJudgeCustomerReturns,
  getCustomerReturnPrintData,
  clearCustomerReturnCache,
} from '../../api/customer-return/customer-return-api'

// ============================================================================
// 1. 客户退货单列表管理
// ============================================================================

export interface UseCustomerReturnListOptions {
  autoLoad?: boolean
  filters?: Ref<QueryCustomerReturns>
}

export function useCustomerReturnList(options: UseCustomerReturnListOptions = {}) {
  const { autoLoad = false, filters } = options

  const customerReturns = ref<CustomerReturnHeadView[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const load = async (params?: QueryCustomerReturns) => {
    loading.value = true
    error.value = null
    try {
      const queryParams = params || filters?.value
      customerReturns.value = await listCustomerReturns(queryParams)
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
      customerReturns.value = await getCustomerReturnsByStatus(status)
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  const filterByCustomer = async (customerId: number) => {
    loading.value = true
    error.value = null
    try {
      customerReturns.value = await getCustomerReturnsByCustomer(customerId)
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
      customerReturns.value = await getCustomerReturnsByMaterial(materialId)
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
      customerReturns.value = await getCustomerReturnsByDateRange(dateFrom, dateTo)
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
      customerReturns.value = await searchCustomerReturnsByNo(returnNo)
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  const loadPendingJudge = async () => {
    loading.value = true
    error.value = null
    try {
      customerReturns.value = await getPendingJudgeCustomerReturns()
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
    customerReturns,
    loading,
    error,
    load,
    refresh,
    filterByStatus,
    filterByCustomer,
    filterByMaterial,
    filterByDateRange,
    search,
    loadPendingJudge,
  }
}

// ============================================================================
// 2. 客户退货单详情管理
// ============================================================================

export function useCustomerReturnDetail(id: Ref<number | null>) {
  const customerReturn = ref<CustomerReturnHeadView | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const load = async () => {
    if (!id.value) return

    loading.value = true
    error.value = null
    try {
      customerReturn.value = await getCustomerReturn(id.value)
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  const refresh = () => load()

  const update = async (data: UpdateCustomerReturnCommand) => {
    if (!id.value) throw new Error('客户退货单 ID 不能为空')

    loading.value = true
    error.value = null
    try {
      customerReturn.value = await updateCustomerReturn(id.value, data)
      clearCustomerReturnCache()
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  const canEdit = computed(() => customerReturn.value?.status === 'PENDING')
  const canJudge = computed(() => customerReturn.value?.status === 'PENDING')
  const canSubmit = computed(() => {
    if (customerReturn.value?.status !== 'PENDING') return false
    // 所有行都已判定才能提交
    return customerReturn.value?.lines?.every(line => line.judge_result) || false
  })

  const checkCanEdit = async () => {
    if (!id.value) return false
    return await canEditCustomerReturn(id.value)
  }

  const checkCanJudge = async () => {
    if (!id.value) return false
    return await canJudgeCustomerReturn(id.value)
  }

  const checkCanSubmit = async () => {
    if (!id.value) return false
    return await canSubmitCustomerReturn(id.value)
  }

  return {
    customerReturn,
    loading,
    error,
    load,
    refresh,
    update,
    canEdit,
    canJudge,
    canSubmit,
    checkCanEdit,
    checkCanJudge,
    checkCanSubmit,
  }
}

// ============================================================================
// 3. 客户退货单创建表单
// ============================================================================

export function useCustomerReturnForm() {
  const formData = ref<Partial<CreateCustomerReturnCommand>>({
    lines: [],
  })
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const create = async (data: CreateCustomerReturnCommand) => {
    loading.value = true
    error.value = null
    try {
      const result = await createCustomerReturn(data)
      clearCustomerReturnCache()
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
    if (!formData.value.customer_id) {
      throw new Error('客户不能为空')
    }
    if (!formData.value.return_date) {
      throw new Error('退货日期不能为空')
    }
    if (!formData.value.lines || formData.value.lines.length === 0) {
      throw new Error('退货明细不能为空')
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
// 4. 客户退货单删除和作废操作
// ============================================================================

export function useCustomerReturnActions() {
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const deleteOne = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      await deleteCustomerReturn(id)
      clearCustomerReturnCache()
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
      await voidCustomerReturn(id)
      clearCustomerReturnCache()
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
      const result = await submitCustomerReturn(id)
      clearCustomerReturnCache()
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
    deleteOne,
    voidOne,
    submit,
  }
}

// ============================================================================
// 5. 判定流程管理
// ============================================================================

export function useCustomerReturnJudge() {
  const judgeHistory = ref<JudgeHistoryView[]>([])
  const lineJudgeHistory = ref<JudgeHistoryView[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const judgeLines = async (id: number, lines: JudgeLineCommand[]) => {
    loading.value = true
    error.value = null
    try {
      await judgeCustomerReturn(id, lines)
      clearCustomerReturnCache()
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  const loadJudgeHistory = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      judgeHistory.value = await getCustomerReturnJudgeHistory(id)
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  const loadLineJudgeHistory = async (lineId: number) => {
    loading.value = true
    error.value = null
    try {
      lineJudgeHistory.value = await getCustomerReturnLineJudgeHistory(lineId)
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    judgeHistory,
    lineJudgeHistory,
    loading,
    error,
    judgeLines,
    loadJudgeHistory,
    loadLineJudgeHistory,
  }
}

// ============================================================================
// 6. 客户退货统计查询
// ============================================================================

export function useCustomerReturnStats() {
  const stats = ref<any>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const load = async () => {
    loading.value = true
    error.value = null
    try {
      stats.value = await getCustomerReturnStats()
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  const loadCustomerReturnQuantities = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      const [totalQty, materialCount] = await Promise.all([
        getCustomerReturnTotalQty(id),
        getCustomerReturnMaterialCount(id),
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
    loadCustomerReturnQuantities,
  }
}

// ============================================================================
// 7. 客户退货批量操作
// ============================================================================

export function useCustomerReturnBatch() {
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const batchGet = async (ids: number[]) => {
    loading.value = true
    error.value = null
    try {
      return await batchGetCustomerReturns(ids)
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
      await batchSubmitCustomerReturns(ids)
      clearCustomerReturnCache()
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
      await batchVoidCustomerReturns(ids)
      clearCustomerReturnCache()
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
// 8. 客户退货打印
// ============================================================================

export function useCustomerReturnPrint() {
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const getPrintData = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      return await getCustomerReturnPrintData(id)
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
// 9. 完整客户退货管理器
// ============================================================================

export function useCustomerReturnManager() {
  const currentId = ref<number | null>(null)

  const list = useCustomerReturnList()
  const detail = useCustomerReturnDetail(currentId)
  const form = useCustomerReturnForm()
  const actions = useCustomerReturnActions()
  const judge = useCustomerReturnJudge()
  const stats = useCustomerReturnStats()
  const batch = useCustomerReturnBatch()
  const print = useCustomerReturnPrint()

  const setCurrentId = (id: number | null) => {
    currentId.value = id
    if (id) {
      detail.load()
    }
  }

  const createCustomerReturn = async (data: CreateCustomerReturnCommand) => {
    const result = await form.create(data)
    await list.refresh()
    return result
  }

  const updateCustomerReturn = async (id: number, data: UpdateCustomerReturnCommand) => {
    currentId.value = id
    const result = await detail.update(data)
    await list.refresh()
    return result
  }

  const deleteCustomerReturn = async (id: number) => {
    await actions.deleteOne(id)
    await list.refresh()
    if (currentId.value === id) {
      currentId.value = null
    }
  }

  const voidCustomerReturn = async (id: number) => {
    await actions.voidOne(id)
    if (currentId.value === id) {
      await detail.refresh()
    }
    await list.refresh()
  }

  const submitCustomerReturn = async (id: number) => {
    const result = await actions.submit(id)
    if (currentId.value === id) {
      await detail.refresh()
    }
    await list.refresh()
    return result
  }

  const judgeLines = async (id: number, lines: JudgeLineCommand[]) => {
    await judge.judgeLines(id, lines)
    if (currentId.value === id) {
      await detail.refresh()
    }
    await list.refresh()
  }

  const loadJudgeHistory = async (id: number) => {
    return await judge.loadJudgeHistory(id)
  }

  const loadLineJudgeHistory = async (lineId: number) => {
    return await judge.loadLineJudgeHistory(lineId)
  }

  const loadList = (params?: QueryCustomerReturns) => list.load(params)
  const refreshList = () => list.refresh()
  const loadDetail = (id: number) => {
    setCurrentId(id)
    return detail.load()
  }
  const refreshDetail = () => detail.refresh()
  const loadStats = () => stats.load()
  const loadPendingJudge = () => list.loadPendingJudge()

  return {
    // 状态
    currentId,
    customerReturns: list.customerReturns,
    currentCustomerReturn: detail.customerReturn,
    judgeHistory: judge.judgeHistory,
    lineJudgeHistory: judge.lineJudgeHistory,
    stats: stats.stats,
    loading: computed(() =>
      list.loading.value ||
      detail.loading.value ||
      form.loading.value ||
      actions.loading.value ||
      judge.loading.value ||
      stats.loading.value ||
      batch.loading.value ||
      print.loading.value
    ),

    // 列表操作
    loadList,
    refreshList,
    filterByStatus: list.filterByStatus,
    filterByCustomer: list.filterByCustomer,
    filterByMaterial: list.filterByMaterial,
    filterByDateRange: list.filterByDateRange,
    search: list.search,
    loadPendingJudge,

    // 详情操作
    setCurrentId,
    loadDetail,
    refreshDetail,
    updateCustomerReturn,

    // 创建操作
    createCustomerReturn,
    formData: form.formData,
    resetForm: form.reset,
    validateForm: form.validate,

    // 删除和作废操作
    deleteCustomerReturn,
    voidCustomerReturn,
    submitCustomerReturn,

    // 判定操作
    judgeLines,
    loadJudgeHistory,
    loadLineJudgeHistory,

    // 统计操作
    loadStats,
    loadCustomerReturnQuantities: stats.loadCustomerReturnQuantities,

    // 批量操作
    batchGet: batch.batchGet,
    batchSubmit: batch.batchSubmit,
    batchVoid: batch.batchVoid,

    // 打印操作
    getPrintData: print.getPrintData,

    // 权限检查
    canEdit: detail.canEdit,
    canJudge: detail.canJudge,
    canSubmit: detail.canSubmit,
    checkCanEdit: detail.checkCanEdit,
    checkCanJudge: detail.checkCanJudge,
    checkCanSubmit: detail.checkCanSubmit,
  }
}
