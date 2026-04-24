/**
 * 入库单管理 Composable
 *
 * 提供完整的入库单管理功能，包括列表、详情、创建、工作流等
 */

import { ref, computed } from 'vue';
import {
  listInbounds,
  getInbound,
  createInbound,
  updateInbound,
  deleteInbound,
  submitInbound,
  approveInbound,
  rejectInbound,
  voidInbound,
  getInboundsByStatus,
  getInboundsByType,
  getInboundsBySupplier,
  getInboundsByDateRange,
  batchGetInbounds,
  batchSubmitInbounds,
  batchApproveInbounds,
  getInboundStats,
  canEditInbound,
  canSubmitInbound,
  clearInboundCache,
  type InboundHeadView,
  type CreateInboundCommand,
  type UpdateInboundCommand,
  type QueryInbounds,
} from '@/api/inbound';

// ============================================================================
// 入库单列表管理
// ============================================================================

/**
 * 入库单列表 Composable
 *
 * @example
 * const { inbounds, loading, total, loadInbounds, refresh } = useInboundList()
 * await loadInbounds({ status: 'PENDING' })
 */
export function useInboundList() {
  const inbounds = ref<InboundHeadView[]>([]);
  const loading = ref(false);
  const error = ref<Error | null>(null);
  const total = ref(0);
  const currentQuery = ref<QueryInbounds>({});

  /**
   * 加载入库单列表
   */
  async function loadInbounds(query?: QueryInbounds) {
    loading.value = true;
    error.value = null;
    currentQuery.value = query || {};

    try {
      const result = await listInbounds(query);
      inbounds.value = result || [];
      total.value = result?.length || 0;
    } catch (err) {
      error.value = err as Error;
      console.error('加载入库单列表失败:', err);
    } finally {
      loading.value = false;
    }
  }

  /**
   * 刷新列表
   */
  async function refresh() {
    clearInboundCache();
    await loadInbounds(currentQuery.value);
  }

  /**
   * 按状态筛选
   */
  async function filterByStatus(status: string) {
    await loadInbounds({
      ...currentQuery.value,
      status,
    });
  }

  /**
   * 按类型筛选
   */
  async function filterByType(inboundType: string) {
    await loadInbounds({
      ...currentQuery.value,
      inbound_type: inboundType,
    });
  }

  /**
   * 按供应商筛选
   */
  async function filterBySupplier(supplierId: number) {
    await loadInbounds({
      ...currentQuery.value,
      supplier_id: supplierId,
    });
  }

  /**
   * 按日期范围筛选
   */
  async function filterByDateRange(dateFrom: string, dateTo: string) {
    await loadInbounds({
      ...currentQuery.value,
      date_from: dateFrom,
      date_to: dateTo,
    });
  }

  /**
   * 搜索入库单
   */
  async function search(keyword: string) {
    await loadInbounds({
      ...currentQuery.value,
      inbound_no: keyword,
    });
  }

  return {
    inbounds,
    loading,
    error,
    total,
    currentQuery,
    loadInbounds,
    refresh,
    filterByStatus,
    filterByType,
    filterBySupplier,
    filterByDateRange,
    search,
  };
}

// ============================================================================
// 单个入库单管理
// ============================================================================

/**
 * 入库单详情 Composable
 *
 * @example
 * const { inbound, loading, loadInbound, update } = useInbound()
 * await loadInbound(1)
 */
export function useInbound(initialId?: number) {
  const inbound = ref<InboundHeadView | null>(null);
  const loading = ref(false);
  const error = ref<Error | null>(null);
  const inboundId = ref(initialId);

  /**
   * 加载入库单详情
   */
  async function loadInbound(id?: number) {
    const targetId = id ?? inboundId.value;
    if (!targetId) {
      throw new Error('入库单 ID 不能为空');
    }

    loading.value = true;
    error.value = null;
    inboundId.value = targetId;

    try {
      inbound.value = await getInbound(targetId);
    } catch (err) {
      error.value = err as Error;
      console.error('加载入库单详情失败:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * 更新入库单
   */
  async function update(data: UpdateInboundCommand) {
    if (!inboundId.value) {
      throw new Error('入库单 ID 不能为空');
    }

    loading.value = true;
    error.value = null;

    try {
      inbound.value = await updateInbound(inboundId.value, data);
      clearInboundCache();
      return inbound.value;
    } catch (err) {
      error.value = err as Error;
      console.error('更新入库单失败:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * 检查是否可编辑
   */
  async function checkCanEdit() {
    if (!inboundId.value) return false;
    try {
      return await canEditInbound(inboundId.value);
    } catch {
      return false;
    }
  }

  /**
   * 检查是否可提交
   */
  async function checkCanSubmit() {
    if (!inboundId.value) return false;
    try {
      return await canSubmitInbound(inboundId.value);
    } catch {
      return false;
    }
  }

  // 计算属性
  const canEdit = computed(() => inbound.value?.status === 'DRAFT');
  const canSubmit = computed(() => inbound.value?.status === 'DRAFT');
  const isApproved = computed(() => inbound.value?.status === 'APPROVED');

  return {
    inbound,
    loading,
    error,
    inboundId,
    canEdit,
    canSubmit,
    isApproved,
    loadInbound,
    update,
    checkCanEdit,
    checkCanSubmit,
  };
}

// ============================================================================
// 入库单创建
// ============================================================================

/**
 * 入库单创建 Composable
 *
 * @example
 * const { creating, create, validateData } = useInboundCreate()
 * const newInbound = await create({ inbound_type: 'PURCHASE', ... })
 */
export function useInboundCreate() {
  const creating = ref(false);
  const error = ref<Error | null>(null);

  /**
   * 创建入库单
   */
  async function create(data: CreateInboundCommand) {
    creating.value = true;
    error.value = null;

    try {
      const newInbound = await createInbound(data);
      clearInboundCache();
      return newInbound;
    } catch (err) {
      error.value = err as Error;
      console.error('创建入库单失败:', err);
      throw err;
    } finally {
      creating.value = false;
    }
  }

  /**
   * 验证入库单数据
   */
  function validateData(data: CreateInboundCommand): string[] {
    const errors: string[] = [];

    if (!data.inbound_type) {
      errors.push('入库类型不能为空');
    }

    if (!data.inbound_date) {
      errors.push('入库日期不能为空');
    }

    if (!data.wh_id) {
      errors.push('仓库不能为空');
    }

    if (!data.lines || data.lines.length === 0) {
      errors.push('入库明细不能为空');
    }

    // 验证明细行
    data.lines?.forEach((line, index) => {
      if (!line.material_id) {
        errors.push(`第 ${index + 1} 行：物料不能为空`);
      }
      if (!line.actual_qty || line.actual_qty <= 0) {
        errors.push(`第 ${index + 1} 行：数量必须大于 0`);
      }
    });

    return errors;
  }

  return {
    creating,
    error,
    create,
    validateData,
  };
}

// ============================================================================
// 入库单删除
// ============================================================================

/**
 * 入库单删除 Composable
 *
 * @example
 * const { deleting, remove, batchRemove } = useInboundDelete()
 * await remove(1)
 */
export function useInboundDelete() {
  const deleting = ref(false);
  const error = ref<Error | null>(null);

  /**
   * 删除入库单
   */
  async function remove(id: number) {
    deleting.value = true;
    error.value = null;

    try {
      await deleteInbound(id);
      clearInboundCache();
    } catch (err) {
      error.value = err as Error;
      console.error('删除入库单失败:', err);
      throw err;
    } finally {
      deleting.value = false;
    }
  }

  /**
   * 批量删除入库单
   */
  async function batchRemove(ids: number[]) {
    deleting.value = true;
    error.value = null;

    try {
      await Promise.all(ids.map((id) => deleteInbound(id)));
      clearInboundCache();
    } catch (err) {
      error.value = err as Error;
      console.error('批量删除入库单失败:', err);
      throw err;
    } finally {
      deleting.value = false;
    }
  }

  return {
    deleting,
    error,
    remove,
    batchRemove,
  };
}

// ============================================================================
// 入库单工作流
// ============================================================================

/**
 * 入库单工作流 Composable
 *
 * @example
 * const { submitting, submit, approve, reject, void: voidInbound } = useInboundWorkflow()
 * await submit(1)
 */
export function useInboundWorkflow() {
  const submitting = ref(false);
  const approving = ref(false);
  const rejecting = ref(false);
  const voiding = ref(false);
  const error = ref<Error | null>(null);

  /**
   * 提交入库单
   */
  async function submit(id: number) {
    submitting.value = true;
    error.value = null;

    try {
      const result = await submitInbound(id);
      clearInboundCache();
      return result;
    } catch (err) {
      error.value = err as Error;
      console.error('提交入库单失败:', err);
      throw err;
    } finally {
      submitting.value = false;
    }
  }

  /**
   * 审批通过
   */
  async function approve(id: number) {
    approving.value = true;
    error.value = null;

    try {
      const result = await approveInbound(id);
      clearInboundCache();
      return result;
    } catch (err) {
      error.value = err as Error;
      console.error('审批入库单失败:', err);
      throw err;
    } finally {
      approving.value = false;
    }
  }

  /**
   * 审批拒绝
   */
  async function reject(id: number, reason: string) {
    rejecting.value = true;
    error.value = null;

    try {
      const result = await rejectInbound(id, { reason });
      clearInboundCache();
      return result;
    } catch (err) {
      error.value = err as Error;
      console.error('拒绝入库单失败:', err);
      throw err;
    } finally {
      rejecting.value = false;
    }
  }

  /**
   * 作废入库单
   */
  async function voidInboundDoc(id: number) {
    voiding.value = true;
    error.value = null;

    try {
      await voidInbound(id);
      clearInboundCache();
    } catch (err) {
      error.value = err as Error;
      console.error('作废入库单失败:', err);
      throw err;
    } finally {
      voiding.value = false;
    }
  }

  /**
   * 批量提交
   */
  async function batchSubmit(ids: number[]) {
    submitting.value = true;
    error.value = null;

    try {
      await batchSubmitInbounds(ids);
      clearInboundCache();
    } catch (err) {
      error.value = err as Error;
      console.error('批量提交入库单失败:', err);
      throw err;
    } finally {
      submitting.value = false;
    }
  }

  /**
   * 批量审批
   */
  async function batchApprove(ids: number[]) {
    approving.value = true;
    error.value = null;

    try {
      await batchApproveInbounds(ids);
      clearInboundCache();
    } catch (err) {
      error.value = err as Error;
      console.error('批量审批入库单失败:', err);
      throw err;
    } finally {
      approving.value = false;
    }
  }

  const isProcessing = computed(() => {
    return submitting.value || approving.value || rejecting.value || voiding.value;
  });

  return {
    submitting,
    approving,
    rejecting,
    voiding,
    isProcessing,
    error,
    submit,
    approve,
    reject,
    void: voidInboundDoc,
    batchSubmit,
    batchApprove,
  };
}

// ============================================================================
// 入库单统计
// ============================================================================

/**
 * 入库单统计 Composable
 *
 * @example
 * const { stats, loading, loadStats } = useInboundStats()
 * await loadStats()
 */
export function useInboundStats() {
  const stats = ref<any>(null);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  /**
   * 加载统计信息
   */
  async function loadStats() {
    loading.value = true;
    error.value = null;

    try {
      stats.value = await getInboundStats();
    } catch (err) {
      error.value = err as Error;
      console.error('加载入库单统计失败:', err);
    } finally {
      loading.value = false;
    }
  }

  /**
   * 按状态加载入库单
   */
  async function loadByStatus(status: string) {
    loading.value = true;
    error.value = null;

    try {
      return await getInboundsByStatus(status);
    } catch (err) {
      error.value = err as Error;
      console.error('按状态加载入库单失败:', err);
      return [];
    } finally {
      loading.value = false;
    }
  }

  /**
   * 按类型加载入库单
   */
  async function loadByType(inboundType: string) {
    loading.value = true;
    error.value = null;

    try {
      return await getInboundsByType(inboundType);
    } catch (err) {
      error.value = err as Error;
      console.error('按类型加载入库单失败:', err);
      return [];
    } finally {
      loading.value = false;
    }
  }

  /**
   * 按供应商加载入库单
   */
  async function loadBySupplier(supplierId: number) {
    loading.value = true;
    error.value = null;

    try {
      return await getInboundsBySupplier(supplierId);
    } catch (err) {
      error.value = err as Error;
      console.error('按供应商加载入库单失败:', err);
      return [];
    } finally {
      loading.value = false;
    }
  }

  /**
   * 按日期范围加载入库单
   */
  async function loadByDateRange(dateFrom: string, dateTo: string) {
    loading.value = true;
    error.value = null;

    try {
      return await getInboundsByDateRange(dateFrom, dateTo);
    } catch (err) {
      error.value = err as Error;
      console.error('按日期范围加载入库单失败:', err);
      return [];
    } finally {
      loading.value = false;
    }
  }

  return {
    stats,
    loading,
    error,
    loadStats,
    loadByStatus,
    loadByType,
    loadBySupplier,
    loadByDateRange,
  };
}

// ============================================================================
// 批量操作
// ============================================================================

/**
 * 入库单批量操作 Composable
 *
 * @example
 * const { processing, batchLoad, batchSubmit } = useInboundBatch()
 * const inbounds = await batchLoad([1, 2, 3])
 */
export function useInboundBatch() {
  const processing = ref(false);
  const error = ref<Error | null>(null);
  const progress = ref(0);

  /**
   * 批量加载入库单
   */
  async function batchLoad(ids: number[]) {
    processing.value = true;
    error.value = null;
    progress.value = 0;

    try {
      const result = await batchGetInbounds(ids);
      progress.value = 100;
      return result;
    } catch (err) {
      error.value = err as Error;
      console.error('批量加载入库单失败:', err);
      throw err;
    } finally {
      processing.value = false;
    }
  }

  /**
   * 批量提交入库单
   */
  async function batchSubmit(ids: number[]) {
    processing.value = true;
    error.value = null;
    progress.value = 0;

    try {
      await batchSubmitInbounds(ids);
      progress.value = 100;
      clearInboundCache();
    } catch (err) {
      error.value = err as Error;
      console.error('批量提交入库单失败:', err);
      throw err;
    } finally {
      processing.value = false;
    }
  }

  /**
   * 批量审批入库单
   */
  async function batchApprove(ids: number[]) {
    processing.value = true;
    error.value = null;
    progress.value = 0;

    try {
      await batchApproveInbounds(ids);
      progress.value = 100;
      clearInboundCache();
    } catch (err) {
      error.value = err as Error;
      console.error('批量审批入库单失败:', err);
      throw err;
    } finally {
      processing.value = false;
    }
  }

  return {
    processing,
    error,
    progress,
    batchLoad,
    batchSubmit,
    batchApprove,
  };
}

// ============================================================================
// 完整的入库单管理 Composable（组合所有功能）
// ============================================================================

/**
 * 完整的入库单管理 Composable
 *
 * @example
 * const inboundManager = useInboundManager()
 * await inboundManager.list.loadInbounds()
 * await inboundManager.create.create({ ... })
 * await inboundManager.workflow.submit(1)
 */
export function useInboundManager() {
  const list = useInboundList();
  const detail = useInbound();
  const creator = useInboundCreate();
  const deleter = useInboundDelete();
  const workflow = useInboundWorkflow();
  const stats = useInboundStats();
  const batch = useInboundBatch();

  // 全局加载状态
  const isLoading = computed(() => {
    return (
      list.loading.value ||
      detail.loading.value ||
      creator.creating.value ||
      deleter.deleting.value ||
      workflow.isProcessing.value ||
      stats.loading.value ||
      batch.processing.value
    );
  });

  // 全局错误
  const hasError = computed(() => {
    return !!(
      list.error.value ||
      detail.error.value ||
      creator.error.value ||
      deleter.error.value ||
      workflow.error.value ||
      stats.error.value ||
      batch.error.value
    );
  });

  return {
    list,
    detail,
    create: creator,
    delete: deleter,
    workflow,
    stats,
    batch,
    isLoading,
    hasError,
  };
}
