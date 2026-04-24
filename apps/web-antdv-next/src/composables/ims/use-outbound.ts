/**
 * 出库单管理 Composable
 *
 * 提供出库单的完整生命周期管理，包括：
 * - 列表查询和筛选
 * - 详情加载和更新
 * - 创建和删除
 * - 工作流管理（提交、审批、拒绝、作废）
 * - 批量出库操作
 * - 统计查询
 *
 * @example
 * // 列表管理
 * const { outbounds, loading, loadOutbounds } = useOutboundList()
 * await loadOutbounds({ doc_status: 'DRAFT' })
 *
 * // 详情管理
 * const { outbound, loadOutbound, updateOutbound } = useOutbound(1)
 * await loadOutbound()
 *
 * // 工作流管理
 * const { submit, approve, reject } = useOutboundWorkflow(1)
 * await submit()
 *
 * // 批量出库
 * const { executeBatchOutbound } = useOutboundBatch()
 * await executeBatchOutbound({ preissue_ids: [1, 2, 3] })
 */

import { ref, computed, watch, toValue } from 'vue'
import type { Ref, MaybeRefOrGetter } from 'vue'
import {
  listOutbounds,
  getOutbound,
  createOutbound,
  updateOutbound,
  deleteOutbound,
  submitOutbound,
  voidOutbound,
  approveOutbound,
  rejectOutbound,
  getOutboundPrintData,
  batchOutbound,
  getOutboundsByStatus,
  getOutboundsByType,
  getOutboundsByWorkOrder,
  getOutboundsByDateRange,
  searchOutboundsByNo,
  batchGetOutbounds,
  batchSubmitOutbounds,
  batchApproveOutbounds,
  getOutboundStats,
  getOutboundTotalQty,
  getOutboundMaterialCount,
  getOutboundPreissueLineCount,
  canEditOutbound,
  canSubmitOutbound,
  clearOutboundCache,
  type OutboundHeadView,
  type OutboundCreateBody,
  type OutboundUpdateBody,
  type OutboundListQuery,
  type BatchOutboundCommand,
  type OutboundPrintData,
} from '../../../api/outbound/outbound-api'

// ============================================================================
// 类型定义
// ============================================================================

export interface UseOutboundListOptions {
  /** 是否自动加载 */
  autoLoad?: boolean
  /** 初始查询参数 */
  initialQuery?: OutboundListQuery
}

export interface OutboundStats {
  total: number
  draft: number
  pending: number
  approved: number
  voided: number
  totalQty: number
  materialCount: number
}

// ============================================================================
// 1. 列表管理
// ============================================================================

/**
 * 出库单列表管理
 *
 * @example
 * const { outbounds, loading, loadOutbounds, refresh } = useOutboundList({
 *   autoLoad: true,
 *   initialQuery: { doc_status: 'DRAFT' }
 * })
 */
export function useOutboundList(options: UseOutboundListOptions = {}) {
  const outbounds = ref<OutboundHeadView[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const total = ref(0)
  const currentQuery = ref<OutboundListQuery | undefined>(options.initialQuery)

  /**
   * 加载出库单列表
   */
  async function loadOutbounds(query?: OutboundListQuery) {
    loading.value = true
    error.value = null
    currentQuery.value = query

    try {
      const data = await listOutbounds(query)
      outbounds.value = data
      total.value = data.length
      return data
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * 刷新列表（使用当前查询参数）
   */
  async function refresh() {
    return loadOutbounds(currentQuery.value)
  }

  /**
   * 按状态筛选
   */
  async function filterByStatus(docStatus: string) {
    return loadOutbounds({ ...currentQuery.value, doc_status: docStatus })
  }

  /**
   * 按类型筛选
   */
  async function filterByType(outboundType: string) {
    return loadOutbounds({ ...currentQuery.value, outbound_type: outboundType })
  }

  /**
   * 按工单筛选
   */
  async function filterByWorkOrder(workOrderNo: string) {
    return loadOutbounds({ ...currentQuery.value, work_order_no: workOrderNo })
  }

  /**
   * 按日期范围筛选
   */
  async function filterByDateRange(dateFrom: string, dateTo: string) {
    return loadOutbounds({ ...currentQuery.value, date_from: dateFrom, date_to: dateTo })
  }

  /**
   * 搜索出库单（按单号）
   */
  async function search(keyword: string) {
    loading.value = true
    error.value = null

    try {
      const data = await searchOutboundsByNo(keyword)
      outbounds.value = data
      total.value = data.length
      return data
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  // 自动加载
  if (options.autoLoad) {
    loadOutbounds(options.initialQuery)
  }

  return {
    outbounds,
    loading,
    error,
    total,
    currentQuery,
    loadOutbounds,
    refresh,
    filterByStatus,
    filterByType,
    filterByWorkOrder,
    filterByDateRange,
    search,
  }
}

// ============================================================================
// 2. 详情管理
// ============================================================================

/**
 * 单个出库单管理
 *
 * @example
 * const outboundId = ref(1)
 * const { outbound, loading, loadOutbound, updateOutbound } = useOutbound(outboundId)
 * await loadOutbound()
 */
export function useOutbound(id: MaybeRefOrGetter<number | undefined>) {
  const outbound = ref<OutboundHeadView | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  /**
   * 加载出库单详情
   */
  async function loadOutbound() {
    const outboundId = toValue(id)
    if (!outboundId) {
      outbound.value = null
      return null
    }

    loading.value = true
    error.value = null

    try {
      const data = await getOutbound(outboundId)
      outbound.value = data
      return data
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新出库单
   */
  async function update(data: OutboundUpdateBody) {
    const outboundId = toValue(id)
    if (!outboundId) {
      throw new Error('出库单 ID 不能为空')
    }

    loading.value = true
    error.value = null

    try {
      const updated = await updateOutbound(outboundId, data)
      outbound.value = updated
      clearOutboundCache()
      return updated
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取打印数据
   */
  async function getPrintData() {
    const outboundId = toValue(id)
    if (!outboundId) {
      throw new Error('出库单 ID 不能为空')
    }

    loading.value = true
    error.value = null

    try {
      return await getOutboundPrintData(outboundId)
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取出库总数量
   */
  async function getTotalQty() {
    const outboundId = toValue(id)
    if (!outboundId) return 0

    try {
      return await getOutboundTotalQty(outboundId)
    } catch (e) {
      console.error('获取出库总数量失败:', e)
      return 0
    }
  }

  /**
   * 获取物料种类数
   */
  async function getMaterialCount() {
    const outboundId = toValue(id)
    if (!outboundId) return 0

    try {
      return await getOutboundMaterialCount(outboundId)
    } catch (e) {
      console.error('获取物料种类数失败:', e)
      return 0
    }
  }

  /**
   * 获取预发料行数
   */
  async function getPreissueLineCount() {
    const outboundId = toValue(id)
    if (!outboundId) return 0

    try {
      return await getOutboundPreissueLineCount(outboundId)
    } catch (e) {
      console.error('获取预发料行数失败:', e)
      return 0
    }
  }

  /**
   * 检查是否可编辑
   */
  async function checkCanEdit() {
    const outboundId = toValue(id)
    if (!outboundId) return false

    try {
      return await canEditOutbound(outboundId)
    } catch (e) {
      console.error('检查编辑权限失败:', e)
      return false
    }
  }

  /**
   * 检查是否可提交
   */
  async function checkCanSubmit() {
    const outboundId = toValue(id)
    if (!outboundId) return false

    try {
      return await canSubmitOutbound(outboundId)
    } catch (e) {
      console.error('检查提交权限失败:', e)
      return false
    }
  }

  // 计算属性
  const isDraft = computed(() => outbound.value?.doc_status === 'DRAFT')
  const isPending = computed(() => outbound.value?.doc_status === 'PENDING')
  const isApproved = computed(() => outbound.value?.doc_status === 'APPROVED')
  const isVoided = computed(() => outbound.value?.doc_status === 'VOIDED')
  const canEdit = computed(() => isDraft.value)
  const canSubmit = computed(() => isDraft.value)

  // 监听 ID 变化自动加载
  watch(() => toValue(id), (newId) => {
    if (newId) {
      loadOutbound()
    } else {
      outbound.value = null
    }
  }, { immediate: true })

  return {
    outbound,
    loading,
    error,
    isDraft,
    isPending,
    isApproved,
    isVoided,
    canEdit,
    canSubmit,
    loadOutbound,
    update,
    getPrintData,
    getTotalQty,
    getMaterialCount,
    getPreissueLineCount,
    checkCanEdit,
    checkCanSubmit,
  }
}

// ============================================================================
// 3. 创建管理
// ============================================================================

/**
 * 出库单创建管理
 *
 * @example
 * const { creating, create, validateData } = useOutboundCreate()
 * const newOutbound = await create({
 *   outbound_type: 'PRODUCTION',
 *   work_order_no: 'WO001',
 *   wh_id: 1,
 *   loc_id: 1,
 *   outbound_date: '2026-04-23',
 *   lines: [...]
 * })
 */
export function useOutboundCreate() {
  const creating = ref(false)
  const error = ref<Error | null>(null)

  /**
   * 创建出库单
   */
  async function create(data: OutboundCreateBody) {
    creating.value = true
    error.value = null

    try {
      const newOutbound = await createOutbound(data)
      clearOutboundCache()
      return newOutbound
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      creating.value = false
    }
  }

  /**
   * 验证出库单数据
   */
  function validateData(data: OutboundCreateBody): string[] {
    const errors: string[] = []

    if (!data.outbound_type) {
      errors.push('出库类型不能为空')
    }

    if (!data.outbound_date) {
      errors.push('出库日期不能为空')
    }

    if (!data.wh_id) {
      errors.push('仓库不能为空')
    }

    if (!data.loc_id) {
      errors.push('仓位不能为空')
    }

    if (!data.lines || data.lines.length === 0) {
      errors.push('出库明细不能为空')
    } else {
      data.lines.forEach((line, index) => {
        if (!line.material_id) {
          errors.push(`第 ${index + 1} 行：物料不能为空`)
        }
        if (!line.actual_qty || line.actual_qty <= 0) {
          errors.push(`第 ${index + 1} 行：出库数量必须大于 0`)
        }
        if (!line.unit) {
          errors.push(`第 ${index + 1} 行：单位不能为空`)
        }
      })
    }

    return errors
  }

  return {
    creating,
    error,
    create,
    validateData,
  }
}

// ============================================================================
// 4. 删除管理
// ============================================================================

/**
 * 出库单删除管理
 *
 * @example
 * const { deleting, deleteOne, deleteMany } = useOutboundDelete()
 * await deleteOne(1)
 * await deleteMany([1, 2, 3])
 */
export function useOutboundDelete() {
  const deleting = ref(false)
  const error = ref<Error | null>(null)

  /**
   * 删除单个出库单
   */
  async function deleteOne(id: number) {
    deleting.value = true
    error.value = null

    try {
      await deleteOutbound(id)
      clearOutboundCache()
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      deleting.value = false
    }
  }

  /**
   * 批量删除出库单
   */
  async function deleteMany(ids: number[]) {
    deleting.value = true
    error.value = null

    try {
      await Promise.all(ids.map(id => deleteOutbound(id)))
      clearOutboundCache()
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      deleting.value = false
    }
  }

  return {
    deleting,
    error,
    deleteOne,
    deleteMany,
  }
}

// ============================================================================
// 5. 工作流管理
// ============================================================================

/**
 * 出库单工作流管理
 *
 * @example
 * const { submit, approve, reject, voidOutbound } = useOutboundWorkflow(1)
 * await submit()
 * await approve()
 * await reject('数量不符')
 * await voidOutbound()
 */
export function useOutboundWorkflow(id: MaybeRefOrGetter<number | undefined>) {
  const submitting = ref(false)
  const approving = ref(false)
  const rejecting = ref(false)
  const voiding = ref(false)
  const error = ref<Error | null>(null)

  /**
   * 提交出库单
   */
  async function submit() {
    const outboundId = toValue(id)
    if (!outboundId) {
      throw new Error('出库单 ID 不能为空')
    }

    submitting.value = true
    error.value = null

    try {
      await submitOutbound(outboundId)
      clearOutboundCache()
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      submitting.value = false
    }
  }

  /**
   * 审批通过
   */
  async function approve() {
    const outboundId = toValue(id)
    if (!outboundId) {
      throw new Error('出库单 ID 不能为空')
    }

    approving.value = true
    error.value = null

    try {
      await approveOutbound(outboundId)
      clearOutboundCache()
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      approving.value = false
    }
  }

  /**
   * 审批拒绝
   */
  async function reject(reason: string) {
    const outboundId = toValue(id)
    if (!outboundId) {
      throw new Error('出库单 ID 不能为空')
    }

    rejecting.value = true
    error.value = null

    try {
      await rejectOutbound(outboundId, { reason })
      clearOutboundCache()
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      rejecting.value = false
    }
  }

  /**
   * 作废出库单
   */
  async function voidDoc() {
    const outboundId = toValue(id)
    if (!outboundId) {
      throw new Error('出库单 ID 不能为空')
    }

    voiding.value = true
    error.value = null

    try {
      await voidOutbound(outboundId)
      clearOutboundCache()
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      voiding.value = false
    }
  }

  /**
   * 批量提交
   */
  async function batchSubmit(ids: number[]) {
    submitting.value = true
    error.value = null

    try {
      await batchSubmitOutbounds(ids)
      clearOutboundCache()
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      submitting.value = false
    }
  }

  /**
   * 批量审批
   */
  async function batchApprove(ids: number[]) {
    approving.value = true
    error.value = null

    try {
      await batchApproveOutbounds(ids)
      clearOutboundCache()
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      approving.value = false
    }
  }

  return {
    submitting,
    approving,
    rejecting,
    voiding,
    error,
    submit,
    approve,
    reject,
    voidDoc,
    batchSubmit,
    batchApprove,
  }
}

// ============================================================================
// 6. 批量出库管理
// ============================================================================

/**
 * 批量出库管理
 *
 * @example
 * const { executing, executeBatchOutbound } = useOutboundBatch()
 * const result = await executeBatchOutbound({
 *   preissue_ids: [1, 2, 3],
 *   wh_id: 1,
 *   loc_id: 1,
 *   outbound_date: '2026-04-23'
 * })
 */
export function useOutboundBatch() {
  const executing = ref(false)
  const error = ref<Error | null>(null)
  const progress = ref(0)

  /**
   * 执行批量出库
   */
  async function executeBatchOutbound(command: BatchOutboundCommand) {
    executing.value = true
    error.value = null
    progress.value = 0

    try {
      const result = await batchOutbound(command)
      progress.value = 100
      clearOutboundCache()
      return result
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      executing.value = false
    }
  }

  /**
   * 批量加载出库单
   */
  async function batchLoad(ids: number[]) {
    executing.value = true
    error.value = null

    try {
      return await batchGetOutbounds(ids)
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      executing.value = false
    }
  }

  return {
    executing,
    error,
    progress,
    executeBatchOutbound,
    batchLoad,
  }
}

// ============================================================================
// 7. 统计查询
// ============================================================================

/**
 * 出库单统计查询
 *
 * @example
 * const { stats, loading, loadStats } = useOutboundStats()
 * await loadStats()
 */
export function useOutboundStats() {
  const stats = ref<OutboundStats | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  /**
   * 加载统计信息
   */
  async function loadStats() {
    loading.value = true
    error.value = null

    try {
      const data = await getOutboundStats()
      stats.value = data as OutboundStats
      return data
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * 按状态查询
   */
  async function loadByStatus(docStatus: string) {
    loading.value = true
    error.value = null

    try {
      return await getOutboundsByStatus(docStatus)
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * 按类型查询
   */
  async function loadByType(outboundType: string) {
    loading.value = true
    error.value = null

    try {
      return await getOutboundsByType(outboundType)
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * 按工单查询
   */
  async function loadByWorkOrder(workOrderNo: string) {
    loading.value = true
    error.value = null

    try {
      return await getOutboundsByWorkOrder(workOrderNo)
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * 按日期范围查询
   */
  async function loadByDateRange(dateFrom: string, dateTo: string) {
    loading.value = true
    error.value = null

    try {
      return await getOutboundsByDateRange(dateFrom, dateTo)
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
    loadStats,
    loadByStatus,
    loadByType,
    loadByWorkOrder,
    loadByDateRange,
  }
}

// ============================================================================
// 8. 完整管理器
// ============================================================================

/**
 * 出库单完整管理器
 *
 * 组合所有功能模块，提供统一的管理接口
 *
 * @example
 * const manager = useOutboundManager()
 *
 * // 列表操作
 * await manager.list.loadOutbounds()
 *
 * // 创建
 * await manager.create.create({ ... })
 *
 * // 工作流
 * await manager.workflow.submit()
 * await manager.workflow.approve()
 *
 * // 批量出库
 * await manager.batch.executeBatchOutbound({ ... })
 *
 * // 统计
 * await manager.stats.loadStats()
 */
export function useOutboundManager() {
  const selectedId = ref<number>()

  const list = useOutboundList()
  const detail = useOutbound(computed(() => selectedId.value))
  const create = useOutboundCreate()
  const deleteOps = useOutboundDelete()
  const workflow = useOutboundWorkflow(computed(() => selectedId.value))
  const batch = useOutboundBatch()
  const stats = useOutboundStats()

  /**
   * 选择出库单
   */
  function selectOutbound(id: number) {
    selectedId.value = id
  }

  /**
   * 取消选择
   */
  function clearSelection() {
    selectedId.value = undefined
  }

  /**
   * 全局加载状态
   */
  const isLoading = computed(() =>
    list.loading.value ||
    detail.loading.value ||
    create.creating.value ||
    deleteOps.deleting.value ||
    workflow.submitting.value ||
    workflow.approving.value ||
    workflow.rejecting.value ||
    workflow.voiding.value ||
    batch.executing.value ||
    stats.loading.value
  )

  /**
   * 全局错误状态
   */
  const hasError = computed(() =>
    !!list.error.value ||
    !!detail.error.value ||
    !!create.error.value ||
    !!deleteOps.error.value ||
    !!workflow.error.value ||
    !!batch.error.value ||
    !!stats.error.value
  )

  return {
    selectedId,
    list,
    detail,
    create,
    delete: deleteOps,
    workflow,
    batch,
    stats,
    selectOutbound,
    clearSelection,
    isLoading,
    hasError,
  }
}
