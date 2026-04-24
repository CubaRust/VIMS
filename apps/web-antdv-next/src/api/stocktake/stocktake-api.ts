/**
 * 盘点 API
 *
 * 提供盘点单的完整生命周期管理，包括任务分配、进度查询、差异审批
 */

import type { Schema } from '../types';
import { api } from '../client-factory';
import { enhancedApi } from '../enhanced-client';

// ============================================================================
// 类型定义
// ============================================================================

export type StocktakeHeadView = Schema<'StocktakeHeadView'>;
export type CreateStocktakeCommand = Schema<'CreateStocktakeCommand'>;
export type UpdateStocktakeCommand = Schema<'UpdateStocktakeCommand'>;
export type SubmitStocktakeResult = Schema<'SubmitStocktakeResult'>;
export type RecordCountCommand = Schema<'RecordCountCommand'>;
export type AssignTaskCommand = Schema<'AssignTaskCommand'>;
export type StocktakeProgressView = Schema<'StocktakeProgressView'>;
export type ApproveVarianceCommand = Schema<'ApproveVarianceCommand'>;

export interface QueryStocktakes {
  stocktake_no?: string;
  status?: string;
  wh_id?: number;
  material_id?: number;
  date_from?: string;
  date_to?: string;
}

// ============================================================================
// 基础 CRUD 操作
// ============================================================================

/**
 * 获取盘点单列表
 *
 * @example
 * const stocktakes = await listStocktakes({ status: 'PENDING' })
 */
export async function listStocktakes(params?: QueryStocktakes) {
  return api.get('/api/v1/stocktakes', {
    params: params as any,
  }) as Promise<StocktakeHeadView[]>;
}

/**
 * 获取盘点单详情
 *
 * @example
 * const stocktake = await getStocktake(1)
 */
export async function getStocktake(id: number) {
  return api.get('/api/v1/stocktakes/{id}', {
    pathParams: { id },
  }) as Promise<StocktakeHeadView>;
}

/**
 * 创建盘点单
 *
 * @example
 * const newStocktake = await createStocktake({
 *   stocktake_date: '2026-04-23',
 *   wh_id: 1,
 *   stocktake_type: 'FULL',
 *   lines: [
 *     {
 *       line_no: 1,
 *       material_id: 1,
 *       loc_id: 1,
 *       book_qty: 100,
 *       unit: 'PCS'
 *     }
 *   ]
 * })
 */
export async function createStocktake(data: CreateStocktakeCommand) {
  return api.post('/api/v1/stocktakes', data) as Promise<StocktakeHeadView>;
}

/**
 * 更新盘点单
 *
 * @example
 * const updated = await updateStocktake(1, {
 *   stocktake_type: 'PARTIAL',
 *   lines: [...]
 * })
 */
export async function updateStocktake(id: number, data: UpdateStocktakeCommand) {
  return api.put('/api/v1/stocktakes/{id}', data, {
    pathParams: { id },
  }) as Promise<StocktakeHeadView>;
}

/**
 * 删除盘点单
 *
 * @example
 * await deleteStocktake(1)
 */
export async function deleteStocktake(id: number) {
  return api.delete('/api/v1/stocktakes/{id}', {
    pathParams: { id },
  });
}

// ============================================================================
// 业务操作
// ============================================================================

/**
 * 记录盘点数据
 *
 * @example
 * await recordStocktakeCounts(1, {
 *   counts: [
 *     {
 *       line_id: 1,
 *       actual_qty: 95,
 *       counter: '张三'
 *     }
 *   ]
 * })
 */
export async function recordStocktakeCounts(id: number, data: RecordCountCommand) {
  return api.post('/api/v1/stocktakes/{id}/counts', data, {
    pathParams: { id },
  });
}

/**
 * 提交盘点单
 *
 * @example
 * const result = await submitStocktake(1)
 */
export async function submitStocktake(id: number) {
  return api.post('/api/v1/stocktakes/{id}/submit', {}, {
    pathParams: { id },
  }) as Promise<SubmitStocktakeResult>;
}

/**
 * 作废盘点单
 *
 * @example
 * await voidStocktake(1)
 */
export async function voidStocktake(id: number) {
  return api.post('/api/v1/stocktakes/{id}/void', {}, {
    pathParams: { id },
  });
}

/**
 * 分配盘点任务
 *
 * @example
 * const assigned = await assignStocktakeTask(1, {
 *   assignments: [
 *     {
 *       line_id: 1,
 *       assignee: '李四'
 *     }
 *   ]
 * })
 */
export async function assignStocktakeTask(id: number, data: AssignTaskCommand) {
  return api.post('/api/v1/stocktakes/{id}/assign', data, {
    pathParams: { id },
  }) as Promise<StocktakeHeadView>;
}

/**
 * 查询盘点进度
 *
 * @example
 * const progress = await getStocktakeProgress(1)
 */
export async function getStocktakeProgress(id: number) {
  return api.get('/api/v1/stocktakes/{id}/progress', {
    pathParams: { id },
  }) as Promise<StocktakeProgressView>;
}

/**
 * 审批盘点差异
 *
 * @example
 * const approved = await approveStocktakeVariance(1, {
 *   approve_comment: '差异合理，同意调整'
 * })
 */
export async function approveStocktakeVariance(id: number, data: ApproveVarianceCommand) {
  return api.post('/api/v1/stocktakes/{id}/approve', data, {
    pathParams: { id },
  }) as Promise<StocktakeHeadView>;
}

// ============================================================================
// 业务逻辑封装（使用 enhancedApi）
// ============================================================================

/**
 * 按状态获取盘点单（带缓存）
 *
 * @example
 * const pending = await getStocktakesByStatus('PENDING')
 */
export async function getStocktakesByStatus(status: string) {
  return enhancedApi.get('/api/v1/stocktakes', {
    params: { status } as any,
    cache: { ttl: 2 * 60 * 1000, key: `status:${status}` },
    label: `获取${status}状态盘点单`,
  }) as Promise<StocktakeHeadView[]>;
}

/**
 * 按仓库获取盘点单
 *
 * @example
 * const stocktakes = await getStocktakesByWarehouse(1)
 */
export async function getStocktakesByWarehouse(whId: number) {
  return enhancedApi.get('/api/v1/stocktakes', {
    params: { wh_id: whId } as any,
    cache: { ttl: 2 * 60 * 1000, key: `wh:${whId}` },
    label: `获取仓库${whId}的盘点单`,
  }) as Promise<StocktakeHeadView[]>;
}

/**
 * 按物料获取盘点单
 *
 * @example
 * const stocktakes = await getStocktakesByMaterial(1)
 */
export async function getStocktakesByMaterial(materialId: number) {
  return enhancedApi.get('/api/v1/stocktakes', {
    params: { material_id: materialId } as any,
    cache: { ttl: 2 * 60 * 1000, key: `material:${materialId}` },
    label: `获取物料${materialId}的盘点单`,
  }) as Promise<StocktakeHeadView[]>;
}

/**
 * 按日期范围获取盘点单
 *
 * @example
 * const stocktakes = await getStocktakesByDateRange('2026-04-01', '2026-04-30')
 */
export async function getStocktakesByDateRange(dateFrom: string, dateTo: string) {
  return enhancedApi.get('/api/v1/stocktakes', {
    params: { date_from: dateFrom, date_to: dateTo } as any,
    cache: { ttl: 5 * 60 * 1000, key: `date:${dateFrom}:${dateTo}` },
    label: `获取${dateFrom}至${dateTo}的盘点单`,
  }) as Promise<StocktakeHeadView[]>;
}

/**
 * 搜索盘点单（按单号）
 *
 * @example
 * const stocktakes = await searchStocktakesByNo('ST')
 */
export async function searchStocktakesByNo(stocktakeNo: string) {
  if (!stocktakeNo.trim()) {
    return [];
  }

  return enhancedApi.get('/api/v1/stocktakes', {
    params: { stocktake_no: stocktakeNo } as any,
    cache: { ttl: 2 * 60 * 1000, key: `no:${stocktakeNo}` },
    label: `搜索盘点单号: ${stocktakeNo}`,
  }) as Promise<StocktakeHeadView[]>;
}

/**
 * 获取盘点进度（带缓存）
 *
 * @example
 * const progress = await getCachedStocktakeProgress(1)
 */
export async function getCachedStocktakeProgress(id: number) {
  return enhancedApi.get('/api/v1/stocktakes/{id}/progress', {
    pathParams: { id },
    cache: { ttl: 1 * 60 * 1000, key: `progress:${id}` },
    label: `获取盘点单${id}进度`,
  }) as Promise<StocktakeProgressView>;
}

/**
 * 批量获取盘点单详情
 *
 * @example
 * const stocktakes = await batchGetStocktakes([1, 2, 3])
 */
export async function batchGetStocktakes(ids: number[]) {
  return enhancedApi.batch(
    ids.map((id) => () => getStocktake(id))
  );
}

/**
 * 批量提交盘点单
 *
 * @example
 * await batchSubmitStocktakes([1, 2, 3])
 */
export async function batchSubmitStocktakes(ids: number[]) {
  return enhancedApi.batch(
    ids.map((id) => () => submitStocktake(id))
  );
}

/**
 * 批量作废盘点单
 *
 * @example
 * await batchVoidStocktakes([1, 2, 3])
 */
export async function batchVoidStocktakes(ids: number[]) {
  return enhancedApi.batch(
    ids.map((id) => () => voidStocktake(id))
  );
}

/**
 * 获取盘点单统计信息（带重试）
 *
 * @example
 * const stats = await getStocktakeStats()
 */
export async function getStocktakeStats() {
  const result = await enhancedApi.get('/api/v1/stocktakes', {
    params: {} as any,
    retry: { times: 3, delay: 1000 },
    cache: { ttl: 5 * 60 * 1000 },
    label: '获取盘点统计',
  }) as StocktakeHeadView[];

  const statusCount = result.reduce((acc, stocktake) => {
    acc[stocktake.status] = (acc[stocktake.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const typeCount = result.reduce((acc, stocktake) => {
    acc[stocktake.stocktake_type] = (acc[stocktake.stocktake_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalLines = result.reduce((sum, stocktake) => {
    return sum + (stocktake.lines?.length || 0);
  }, 0);

  const totalVariance = result.reduce((sum, stocktake) => {
    return sum + (stocktake.lines?.reduce((lineSum, line) => {
      const variance = Number(line.actual_qty || 0) - Number(line.book_qty);
      return lineSum + Math.abs(variance);
    }, 0) || 0);
  }, 0);

  return {
    total: result.length,
    byStatus: statusCount,
    byType: typeCount,
    totalLines,
    totalVariance,
  };
}

/**
 * 获取盘点单的总账面数量
 *
 * @example
 * const bookQty = await getStocktakeTotalBookQty(1)
 */
export async function getStocktakeTotalBookQty(id: number): Promise<number> {
  const stocktake = await getStocktake(id);
  return stocktake.lines?.reduce((sum, line) => sum + Number(line.book_qty), 0) || 0;
}

/**
 * 获取盘点单的总实盘数量
 *
 * @example
 * const actualQty = await getStocktakeTotalActualQty(1)
 */
export async function getStocktakeTotalActualQty(id: number): Promise<number> {
  const stocktake = await getStocktake(id);
  return stocktake.lines?.reduce((sum, line) => sum + Number(line.actual_qty || 0), 0) || 0;
}

/**
 * 获取盘点单的总差异数量
 *
 * @example
 * const variance = await getStocktakeTotalVariance(1)
 */
export async function getStocktakeTotalVariance(id: number): Promise<number> {
  const stocktake = await getStocktake(id);
  return stocktake.lines?.reduce((sum, line) => {
    const variance = Number(line.actual_qty || 0) - Number(line.book_qty);
    return sum + variance;
  }, 0) || 0;
}

/**
 * 获取盘点单的差异率
 *
 * @example
 * const rate = await getStocktakeVarianceRate(1)
 */
export async function getStocktakeVarianceRate(id: number): Promise<string> {
  const bookQty = await getStocktakeTotalBookQty(id);
  const variance = await getStocktakeTotalVariance(id);

  if (bookQty === 0) return '0';
  return ((Math.abs(variance) / bookQty) * 100).toFixed(2);
}

/**
 * 检查盘点单是否可编辑
 *
 * @example
 * const canEdit = await canEditStocktake(1)
 */
export async function canEditStocktake(id: number): Promise<boolean> {
  try {
    const stocktake = await getStocktake(id);
    return stocktake.status === 'PENDING';
  } catch {
    return false;
  }
}

/**
 * 检查盘点单是否可记录数据
 *
 * @example
 * const canRecord = await canRecordStocktake(1)
 */
export async function canRecordStocktake(id: number): Promise<boolean> {
  try {
    const stocktake = await getStocktake(id);
    return stocktake.status === 'PENDING' || stocktake.status === 'IN_PROGRESS';
  } catch {
    return false;
  }
}

/**
 * 检查盘点单是否可提交
 *
 * @example
 * const canSubmit = await canSubmitStocktake(1)
 */
export async function canSubmitStocktake(id: number): Promise<boolean> {
  try {
    const stocktake = await getStocktake(id);
    // 所有行都已盘点才能提交
    const allCounted = stocktake.lines?.every(line => line.actual_qty !== null && line.actual_qty !== undefined) || false;
    return (stocktake.status === 'PENDING' || stocktake.status === 'IN_PROGRESS') && allCounted;
  } catch {
    return false;
  }
}

/**
 * 检查盘点单是否可审批
 *
 * @example
 * const canApprove = await canApproveStocktake(1)
 */
export async function canApproveStocktake(id: number): Promise<boolean> {
  try {
    const stocktake = await getStocktake(id);
    return stocktake.status === 'PENDING_APPROVAL';
  } catch {
    return false;
  }
}

/**
 * 获取待盘点的盘点单
 *
 * @example
 * const pending = await getPendingStocktakes()
 */
export async function getPendingStocktakes() {
  return getStocktakesByStatus('PENDING');
}

/**
 * 获取盘点中的盘点单
 *
 * @example
 * const inProgress = await getInProgressStocktakes()
 */
export async function getInProgressStocktakes() {
  return getStocktakesByStatus('IN_PROGRESS');
}

/**
 * 获取待审批的盘点单
 *
 * @example
 * const pendingApproval = await getPendingApprovalStocktakes()
 */
export async function getPendingApprovalStocktakes() {
  return getStocktakesByStatus('PENDING_APPROVAL');
}

/**
 * 获取盘点单的打印数据
 *
 * @example
 * const printData = await getStocktakePrintData(1)
 */
export async function getStocktakePrintData(id: number) {
  const stocktake = await getStocktake(id);

  return {
    header: {
      stocktake_no: stocktake.stocktake_no,
      stocktake_date: stocktake.stocktake_date,
      stocktake_type: stocktake.stocktake_type,
      wh_name: stocktake.wh_name,
      status: stocktake.status,
    },
    lines: stocktake.lines?.map(line => ({
      line_no: line.line_no,
      material_code: line.material_code,
      material_name: line.material_name,
      loc_name: line.loc_name,
      book_qty: line.book_qty,
      actual_qty: line.actual_qty,
      variance: Number(line.actual_qty || 0) - Number(line.book_qty),
      unit: line.unit,
      counter: line.counter,
    })) || [],
    summary: {
      total_lines: stocktake.lines?.length || 0,
      total_book_qty: await getStocktakeTotalBookQty(id),
      total_actual_qty: await getStocktakeTotalActualQty(id),
      total_variance: await getStocktakeTotalVariance(id),
      variance_rate: await getStocktakeVarianceRate(id),
    },
  };
}

// ============================================================================
// 缓存管理
// ============================================================================

/**
 * 清除盘点相关缓存
 */
export function clearStocktakeCache() {
  enhancedApi.clearCache('stocktakes');
  enhancedApi.clearCache('status:');
  enhancedApi.clearCache('wh:');
  enhancedApi.clearCache('material:');
  enhancedApi.clearCache('date:');
  enhancedApi.clearCache('no:');
  enhancedApi.clearCache('progress:');
}
