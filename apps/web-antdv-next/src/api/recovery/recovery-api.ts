/**
 * 拆解回收 API
 *
 * 提供拆解回收单的完整生命周期管理，包括模板应用功能
 */

import type { Schema } from '../types';
import { api } from '../client-factory';
import { enhancedApi } from '../enhanced-client';

// ============================================================================
// 类型定义
// ============================================================================

export type RecoveryHeadView = Schema<'RecoveryHeadView'>;
export type CreateRecoveryCommand = Schema<'CreateRecoveryCommand'>;
export type UpdateRecoveryCommand = Schema<'UpdateRecoveryCommand'>;
export type SubmitRecoveryResult = Schema<'SubmitRecoveryResult'>;
export type ApplyTemplateCommand = Schema<'ApplyTemplateCommand'>;

export interface QueryRecoveries {
  recovery_no?: string;
  status?: string;
  source_material_id?: number;
  target_material_id?: number;
  date_from?: string;
  date_to?: string;
}

// ============================================================================
// 基础 CRUD 操作
// ============================================================================

/**
 * 获取拆解回收单列表
 *
 * @example
 * const recoveries = await listRecoveries({ status: 'PENDING' })
 */
export async function listRecoveries(params?: QueryRecoveries) {
  return api.get('/api/v1/recoveries', {
    params: params as any,
  }) as Promise<RecoveryHeadView[]>;
}

/**
 * 获取拆解回收单详情
 *
 * @example
 * const recovery = await getRecovery(1)
 */
export async function getRecovery(id: number) {
  return api.get('/api/v1/recoveries/{id}', {
    pathParams: { id },
  }) as Promise<RecoveryHeadView>;
}

/**
 * 创建拆解回收单
 *
 * @example
 * const newRecovery = await createRecovery({
 *   recovery_date: '2026-04-23',
 *   source_material_id: 1,
 *   source_qty: 10,
 *   lines: [
 *     {
 *       line_no: 1,
 *       target_material_id: 2,
 *       recovery_qty: 8,
 *       unit: 'PCS',
 *       wh_id: 1,
 *       loc_id: 1
 *     }
 *   ]
 * })
 */
export async function createRecovery(data: CreateRecoveryCommand) {
  return api.post('/api/v1/recoveries', data) as Promise<RecoveryHeadView>;
}

/**
 * 更新拆解回收单
 *
 * @example
 * const updated = await updateRecovery(1, {
 *   source_qty: 12,
 *   lines: [...]
 * })
 */
export async function updateRecovery(id: number, data: UpdateRecoveryCommand) {
  return api.put('/api/v1/recoveries/{id}', data, {
    pathParams: { id },
  }) as Promise<RecoveryHeadView>;
}

/**
 * 删除拆解回收单
 *
 * @example
 * await deleteRecovery(1)
 */
export async function deleteRecovery(id: number) {
  return api.delete('/api/v1/recoveries/{id}', {
    pathParams: { id },
  });
}

// ============================================================================
// 业务操作
// ============================================================================

/**
 * 提交拆解回收单
 *
 * @example
 * const result = await submitRecovery(1)
 */
export async function submitRecovery(id: number) {
  return api.post('/api/v1/recoveries/{id}/submit', {}, {
    pathParams: { id },
  }) as Promise<SubmitRecoveryResult>;
}

/**
 * 作废拆解回收单
 *
 * @example
 * await voidRecovery(1)
 */
export async function voidRecovery(id: number) {
  return api.post('/api/v1/recoveries/{id}/void', {}, {
    pathParams: { id },
  });
}

/**
 * 应用拆解回收模板
 *
 * @example
 * const recovery = await applyRecoveryTemplate({
 *   template_id: 1,
 *   source_material_id: 1,
 *   source_qty: 10,
 *   recovery_date: '2026-04-23'
 * })
 */
export async function applyRecoveryTemplate(data: ApplyTemplateCommand) {
  return api.post('/api/v1/recoveries/apply-template', data) as Promise<RecoveryHeadView>;
}

// ============================================================================
// 业务逻辑封装（使用 enhancedApi）
// ============================================================================

/**
 * 按状态获取拆解回收单（带缓存）
 *
 * @example
 * const pending = await getRecoveriesByStatus('PENDING')
 */
export async function getRecoveriesByStatus(status: string) {
  return enhancedApi.get('/api/v1/recoveries', {
    params: { status } as any,
    cache: { ttl: 2 * 60 * 1000, key: `status:${status}` },
    label: `获取${status}状态拆解回收单`,
  }) as Promise<RecoveryHeadView[]>;
}

/**
 * 按源物料获取拆解回收单
 *
 * @example
 * const recoveries = await getRecoveriesBySourceMaterial(1)
 */
export async function getRecoveriesBySourceMaterial(sourceMaterialId: number) {
  return enhancedApi.get('/api/v1/recoveries', {
    params: { source_material_id: sourceMaterialId } as any,
    cache: { ttl: 2 * 60 * 1000, key: `source:${sourceMaterialId}` },
    label: `获取源物料${sourceMaterialId}的拆解回收单`,
  }) as Promise<RecoveryHeadView[]>;
}

/**
 * 按目标物料获取拆解回收单
 *
 * @example
 * const recoveries = await getRecoveriesByTargetMaterial(2)
 */
export async function getRecoveriesByTargetMaterial(targetMaterialId: number) {
  return enhancedApi.get('/api/v1/recoveries', {
    params: { target_material_id: targetMaterialId } as any,
    cache: { ttl: 2 * 60 * 1000, key: `target:${targetMaterialId}` },
    label: `获取目标物料${targetMaterialId}的拆解回收单`,
  }) as Promise<RecoveryHeadView[]>;
}

/**
 * 按日期范围获取拆解回收单
 *
 * @example
 * const recoveries = await getRecoveriesByDateRange('2026-04-01', '2026-04-30')
 */
export async function getRecoveriesByDateRange(dateFrom: string, dateTo: string) {
  return enhancedApi.get('/api/v1/recoveries', {
    params: { date_from: dateFrom, date_to: dateTo } as any,
    cache: { ttl: 5 * 60 * 1000, key: `date:${dateFrom}:${dateTo}` },
    label: `获取${dateFrom}至${dateTo}的拆解回收单`,
  }) as Promise<RecoveryHeadView[]>;
}

/**
 * 搜索拆解回收单（按单号）
 *
 * @example
 * const recoveries = await searchRecoveriesByNo('RC')
 */
export async function searchRecoveriesByNo(recoveryNo: string) {
  if (!recoveryNo.trim()) {
    return [];
  }

  return enhancedApi.get('/api/v1/recoveries', {
    params: { recovery_no: recoveryNo } as any,
    cache: { ttl: 2 * 60 * 1000, key: `no:${recoveryNo}` },
    label: `搜索拆解回收单号: ${recoveryNo}`,
  }) as Promise<RecoveryHeadView[]>;
}

/**
 * 批量获取拆解回收单详情
 *
 * @example
 * const recoveries = await batchGetRecoveries([1, 2, 3])
 */
export async function batchGetRecoveries(ids: number[]) {
  return enhancedApi.batch(
    ids.map((id) => () => getRecovery(id))
  );
}

/**
 * 批量提交拆解回收单
 *
 * @example
 * await batchSubmitRecoveries([1, 2, 3])
 */
export async function batchSubmitRecoveries(ids: number[]) {
  return enhancedApi.batch(
    ids.map((id) => () => submitRecovery(id))
  );
}

/**
 * 批量作废拆解回收单
 *
 * @example
 * await batchVoidRecoveries([1, 2, 3])
 */
export async function batchVoidRecoveries(ids: number[]) {
  return enhancedApi.batch(
    ids.map((id) => () => voidRecovery(id))
  );
}

/**
 * 获取拆解回收单统计信息（带重试）
 *
 * @example
 * const stats = await getRecoveryStats()
 */
export async function getRecoveryStats() {
  const result = await enhancedApi.get('/api/v1/recoveries', {
    params: {} as any,
    retry: { times: 3, delay: 1000 },
    cache: { ttl: 5 * 60 * 1000 },
    label: '获取拆解回收统计',
  }) as RecoveryHeadView[];

  const statusCount = result.reduce((acc, recovery) => {
    acc[recovery.status] = (acc[recovery.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalSourceQty = result.reduce((sum, recovery) => {
    return sum + Number(recovery.source_qty);
  }, 0);

  const totalRecoveryQty = result.reduce((sum, recovery) => {
    return sum + (recovery.lines?.reduce((lineSum, line) => lineSum + Number(line.recovery_qty), 0) || 0);
  }, 0);

  return {
    total: result.length,
    byStatus: statusCount,
    totalSourceQty,
    totalRecoveryQty,
    recoveryRate: totalSourceQty > 0 ? (totalRecoveryQty / totalSourceQty * 100).toFixed(2) : '0',
  };
}

/**
 * 获取拆解回收单的源数量
 *
 * @example
 * const sourceQty = await getRecoverySourceQty(1)
 */
export async function getRecoverySourceQty(id: number): Promise<number> {
  const recovery = await getRecovery(id);
  return Number(recovery.source_qty);
}

/**
 * 获取拆解回收单的总回收数量
 *
 * @example
 * const totalQty = await getRecoveryTotalQty(1)
 */
export async function getRecoveryTotalQty(id: number): Promise<number> {
  const recovery = await getRecovery(id);
  return recovery.lines?.reduce((sum, line) => sum + Number(line.recovery_qty), 0) || 0;
}

/**
 * 获取拆解回收单的回收率
 *
 * @example
 * const rate = await getRecoveryRate(1)
 */
export async function getRecoveryRate(id: number): Promise<string> {
  const sourceQty = await getRecoverySourceQty(id);
  const recoveryQty = await getRecoveryTotalQty(id);

  if (sourceQty === 0) return '0';
  return ((recoveryQty / sourceQty) * 100).toFixed(2);
}

/**
 * 获取拆解回收单的物料数量
 *
 * @example
 * const materialCount = await getRecoveryMaterialCount(1)
 */
export async function getRecoveryMaterialCount(id: number): Promise<number> {
  const recovery = await getRecovery(id);
  return new Set(recovery.lines?.map(line => line.target_material_id)).size;
}

/**
 * 检查拆解回收单是否可编辑
 *
 * @example
 * const canEdit = await canEditRecovery(1)
 */
export async function canEditRecovery(id: number): Promise<boolean> {
  try {
    const recovery = await getRecovery(id);
    return recovery.status === 'PENDING';
  } catch {
    return false;
  }
}

/**
 * 检查拆解回收单是否可提交
 *
 * @example
 * const canSubmit = await canSubmitRecovery(1)
 */
export async function canSubmitRecovery(id: number): Promise<boolean> {
  try {
    const recovery = await getRecovery(id);
    return recovery.status === 'PENDING' && (recovery.lines?.length || 0) > 0;
  } catch {
    return false;
  }
}

/**
 * 获取待提交的拆解回收单
 *
 * @example
 * const pending = await getPendingRecoveries()
 */
export async function getPendingRecoveries() {
  return getRecoveriesByStatus('PENDING');
}

/**
 * 获取拆解回收单的打印数据
 *
 * @example
 * const printData = await getRecoveryPrintData(1)
 */
export async function getRecoveryPrintData(id: number) {
  const recovery = await getRecovery(id);

  return {
    header: {
      recovery_no: recovery.recovery_no,
      recovery_date: recovery.recovery_date,
      source_material_code: recovery.source_material_code,
      source_material_name: recovery.source_material_name,
      source_qty: recovery.source_qty,
      status: recovery.status,
    },
    lines: recovery.lines?.map(line => ({
      line_no: line.line_no,
      target_material_code: line.target_material_code,
      target_material_name: line.target_material_name,
      recovery_qty: line.recovery_qty,
      unit: line.unit,
      wh_name: line.wh_name,
      loc_name: line.loc_name,
    })) || [],
    summary: {
      total_lines: recovery.lines?.length || 0,
      source_qty: Number(recovery.source_qty),
      total_recovery_qty: recovery.lines?.reduce((sum, line) => sum + Number(line.recovery_qty), 0) || 0,
      recovery_rate: await getRecoveryRate(id),
    },
  };
}

// ============================================================================
// 缓存管理
// ============================================================================

/**
 * 清除拆解回收相关缓存
 */
export function clearRecoveryCache() {
  enhancedApi.clearCache('recoveries');
  enhancedApi.clearCache('status:');
  enhancedApi.clearCache('source:');
  enhancedApi.clearCache('target:');
  enhancedApi.clearCache('date:');
  enhancedApi.clearCache('no:');
}
