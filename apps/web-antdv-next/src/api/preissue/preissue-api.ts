/**
 * 预发料 API
 *
 * 提供预发料单的完整生命周期管理，包括超期预警和手动关闭功能
 */

import type { Schema } from '../shared/helpers';
import { api } from '../shared/api';
import { enhancedApi } from '../shared/enhanced-api';

// ============================================================================
// 类型定义
// ============================================================================

export type PreissueHeadView = Schema<'PreissueHeadView'>;
export type CreatePreissueCommand = Schema<'CreatePreissueCommand'>;
export type UpdatePreissueCommand = Schema<'UpdatePreissueCommand'>;
export type SubmitPreissueResult = Schema<'SubmitPreissueResult'>;
export type ManualCloseLineCommand = Schema<'ManualCloseLineCommand'>;

export interface QueryPreissues {
  preissue_no?: string;
  status?: string;
  work_order_no?: string;
  material_id?: number;
  wh_id?: number;
  date_from?: string;
  date_to?: string;
}

// ============================================================================
// 基础 CRUD 操作
// ============================================================================

/**
 * 获取预发料单列表
 *
 * @example
 * const preissues = await listPreissues({ status: 'PENDING' })
 */
export async function listPreissues(params?: QueryPreissues) {
  return api.get('/api/v1/preissues', {
    params: params as any,
  }) as Promise<PreissueHeadView[]>;
}

/**
 * 获取预发料单详情
 *
 * @example
 * const preissue = await getPreissue(1)
 */
export async function getPreissue(id: number) {
  return api.get('/api/v1/preissues/{id}', {
    pathParams: { id },
  }) as Promise<PreissueHeadView>;
}

/**
 * 创建预发料单（自动产生 PREISSUE_PENDING 库存）
 *
 * @example
 * const result = await createPreissue({
 *   work_order_no: 'WO001',
 *   preissue_date: '2026-04-23',
 *   lines: [
 *     {
 *       line_no: 1,
 *       material_id: 1,
 *       wh_id: 1,
 *       loc_id: 1,
 *       batch_no: 'B001',
 *       preissue_qty: 100,
 *       unit: 'PCS'
 *     }
 *   ]
 * })
 */
export async function createPreissue(data: CreatePreissueCommand) {
  return api.post('/api/v1/preissues', data) as Promise<SubmitPreissueResult>;
}

/**
 * 更新预发料单（仅 PENDING 状态）
 *
 * @example
 * const updated = await updatePreissue(1, {
 *   work_order_no: 'WO002',
 *   lines: [...]
 * })
 */
export async function updatePreissue(id: number, data: UpdatePreissueCommand) {
  return api.put('/api/v1/preissues/{id}', data, {
    pathParams: { id },
  }) as Promise<PreissueHeadView>;
}

/**
 * 删除预发料单（仅 PENDING 状态且无冲销）
 *
 * @example
 * await deletePreissue(1)
 */
export async function deletePreissue(id: number) {
  return api.delete('/api/v1/preissues/{id}', {
    pathParams: { id },
  });
}

/**
 * 作废预发料单（仅 PENDING 状态）
 *
 * @example
 * await voidPreissue(1)
 */
export async function voidPreissue(id: number) {
  return api.post('/api/v1/preissues/{id}/void', {}, {
    pathParams: { id },
  });
}

// ============================================================================
// 超期管理
// ============================================================================

/**
 * 检查超期预警（系统定时任务）
 *
 * @returns 返回检查到的超期记录数
 * @example
 * const count = await checkPreissueTimeout()
 */
export async function checkPreissueTimeout() {
  return api.post('/api/v1/preissues/check-timeout', {}) as Promise<number>;
}

/**
 * 查询超期预警列表
 *
 * @example
 * const warnings = await getPreissueTimeoutWarnings()
 */
export async function getPreissueTimeoutWarnings() {
  return api.get('/api/v1/preissues/timeout-warnings') as Promise<PreissueHeadView[]>;
}

/**
 * 手动关闭预发料行
 *
 * @example
 * await manualClosePreissueLine({
 *   line_id: 1,
 *   close_reason: '工单取消'
 * })
 */
export async function manualClosePreissueLine(data: ManualCloseLineCommand) {
  return api.post('/api/v1/preissues/manual-close-line', data);
}

// ============================================================================
// 业务逻辑封装（使用 enhancedApi）
// ============================================================================

/**
 * 按状态获取预发料单（带缓存）
 *
 * @example
 * const pending = await getPreissuesByStatus('PENDING')
 */
export async function getPreissuesByStatus(status: string) {
  return enhancedApi.get('/api/v1/preissues', {
    params: { status } as any,
    cache: { ttl: 2 * 60 * 1000, key: `status:${status}` },
    label: `获取${status}状态预发料单`,
  }) as Promise<PreissueHeadView[]>;
}

/**
 * 按工单号获取预发料单
 *
 * @example
 * const preissues = await getPreissuesByWorkOrder('WO001')
 */
export async function getPreissuesByWorkOrder(workOrderNo: string) {
  return enhancedApi.get('/api/v1/preissues', {
    params: { work_order_no: workOrderNo } as any,
    cache: { ttl: 2 * 60 * 1000, key: `wo:${workOrderNo}` },
    label: `获取工单${workOrderNo}的预发料单`,
  }) as Promise<PreissueHeadView[]>;
}

/**
 * 按物料获取预发料单
 *
 * @example
 * const preissues = await getPreissuesByMaterial(1)
 */
export async function getPreissuesByMaterial(materialId: number) {
  return enhancedApi.get('/api/v1/preissues', {
    params: { material_id: materialId } as any,
    cache: { ttl: 2 * 60 * 1000, key: `material:${materialId}` },
    label: `获取物料${materialId}的预发料单`,
  }) as Promise<PreissueHeadView[]>;
}

/**
 * 按仓库获取预发料单
 *
 * @example
 * const preissues = await getPreissuesByWarehouse(1)
 */
export async function getPreissuesByWarehouse(whId: number) {
  return enhancedApi.get('/api/v1/preissues', {
    params: { wh_id: whId } as any,
    cache: { ttl: 2 * 60 * 1000, key: `wh:${whId}` },
    label: `获取仓库${whId}的预发料单`,
  }) as Promise<PreissueHeadView[]>;
}

/**
 * 按日期范围获取预发料单
 *
 * @example
 * const preissues = await getPreissuesByDateRange('2026-04-01', '2026-04-30')
 */
export async function getPreissuesByDateRange(dateFrom: string, dateTo: string) {
  return enhancedApi.get('/api/v1/preissues', {
    params: { date_from: dateFrom, date_to: dateTo } as any,
    cache: { ttl: 5 * 60 * 1000, key: `date:${dateFrom}:${dateTo}` },
    label: `获取${dateFrom}至${dateTo}的预发料单`,
  }) as Promise<PreissueHeadView[]>;
}

/**
 * 搜索预发料单（按单号）
 *
 * @example
 * const preissues = await searchPreissuesByNo('PI')
 */
export async function searchPreissuesByNo(preissueNo: string) {
  if (!preissueNo.trim()) {
    return [];
  }

  return enhancedApi.get('/api/v1/preissues', {
    params: { preissue_no: preissueNo } as any,
    cache: { ttl: 2 * 60 * 1000, key: `no:${preissueNo}` },
    label: `搜索预发料单号: ${preissueNo}`,
  }) as Promise<PreissueHeadView[]>;
}

/**
 * 批量获取预发料单详情
 *
 * @example
 * const preissues = await batchGetPreissues([1, 2, 3])
 */
export async function batchGetPreissues(ids: number[]) {
  return enhancedApi.batch(
    ids.map((id) => () => getPreissue(id))
  );
}

/**
 * 批量作废预发料单
 *
 * @example
 * await batchVoidPreissues([1, 2, 3])
 */
export async function batchVoidPreissues(ids: number[]) {
  return enhancedApi.batch(
    ids.map((id) => () => voidPreissue(id))
  );
}

/**
 * 获取预发料单统计信息（带重试）
 *
 * @example
 * const stats = await getPreissueStats()
 */
export async function getPreissueStats() {
  const result = await enhancedApi.get('/api/v1/preissues', {
    params: {} as any,
    retry: { times: 3, delay: 1000 },
    cache: { ttl: 5 * 60 * 1000 },
    label: '获取预发料统计',
  }) as PreissueHeadView[];

  const statusCount = result.reduce((acc, preissue) => {
    acc[preissue.status] = (acc[preissue.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalQty = result.reduce((sum, preissue) => {
    return sum + (preissue.lines?.reduce((lineSum, line) => lineSum + Number(line.preissue_qty), 0) || 0);
  }, 0);

  return {
    total: result.length,
    byStatus: statusCount,
    totalQty,
  };
}

/**
 * 获取预发料单的总数量
 *
 * @example
 * const totalQty = await getPreissueTotalQty(1)
 */
export async function getPreissueTotalQty(id: number): Promise<number> {
  const preissue = await getPreissue(id);
  return preissue.lines?.reduce((sum, line) => sum + Number(line.preissue_qty), 0) || 0;
}

/**
 * 获取预发料单的物料数量
 *
 * @example
 * const materialCount = await getPreissueMaterialCount(1)
 */
export async function getPreissueMaterialCount(id: number): Promise<number> {
  const preissue = await getPreissue(id);
  return new Set(preissue.lines?.map(line => line.material_id)).size;
}

/**
 * 检查预发料单是否可编辑
 *
 * @example
 * const canEdit = await canEditPreissue(1)
 */
export async function canEditPreissue(id: number): Promise<boolean> {
  try {
    const preissue = await getPreissue(id);
    return preissue.status === 'PENDING';
  } catch {
    return false;
  }
}

/**
 * 检查预发料单是否可删除
 *
 * @example
 * const canDelete = await canDeletePreissue(1)
 */
export async function canDeletePreissue(id: number): Promise<boolean> {
  try {
    const preissue = await getPreissue(id);
    // 仅 PENDING 状态且无冲销可删除
    return preissue.status === 'PENDING' && !preissue.has_offset;
  } catch {
    return false;
  }
}

/**
 * 检查预发料单是否可作废
 *
 * @example
 * const canVoid = await canVoidPreissue(1)
 */
export async function canVoidPreissue(id: number): Promise<boolean> {
  try {
    const preissue = await getPreissue(id);
    return preissue.status === 'PENDING';
  } catch {
    return false;
  }
}

/**
 * 获取超期预警数量
 *
 * @example
 * const count = await getTimeoutWarningCount()
 */
export async function getTimeoutWarningCount(): Promise<number> {
  const warnings = await getPreissueTimeoutWarnings();
  return warnings.length;
}

/**
 * 获取预发料单的打印数据
 *
 * @example
 * const printData = await getPreissuePrintData(1)
 */
export async function getPreissuePrintData(id: number) {
  const preissue = await getPreissue(id);

  return {
    header: {
      preissue_no: preissue.preissue_no,
      work_order_no: preissue.work_order_no,
      preissue_date: preissue.preissue_date,
      status: preissue.status,
    },
    lines: preissue.lines?.map(line => ({
      line_no: line.line_no,
      material_code: line.material_code,
      material_name: line.material_name,
      batch_no: line.batch_no,
      preissue_qty: line.preissue_qty,
      unit: line.unit,
      wh_name: line.wh_name,
      loc_name: line.loc_name,
    })) || [],
    summary: {
      total_lines: preissue.lines?.length || 0,
      total_qty: preissue.lines?.reduce((sum, line) => sum + Number(line.preissue_qty), 0) || 0,
    },
  };
}

// ============================================================================
// 缓存管理
// ============================================================================

/**
 * 清除预发料相关缓存
 */
export function clearPreissueCache() {
  enhancedApi.clearCache('preissues');
  enhancedApi.clearCache('status:');
  enhancedApi.clearCache('wo:');
  enhancedApi.clearCache('material:');
  enhancedApi.clearCache('wh:');
  enhancedApi.clearCache('date:');
  enhancedApi.clearCache('no:');
}
