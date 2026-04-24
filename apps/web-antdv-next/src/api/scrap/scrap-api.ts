/**
 * 报废 API
 *
 * 提供报废单的完整生命周期管理，包括审批流程
 */

import type { Schema } from '../types';
import { api } from '../client-factory';
import { enhancedApi } from '../enhanced-client';

// ============================================================================
// 类型定义
// ============================================================================

export type ScrapHeadView = Schema<'ScrapHeadView'>;
export type CreateScrapCommand = Schema<'CreateScrapCommand'>;
export type UpdateScrapCommand = Schema<'UpdateScrapCommand'>;
export type SubmitScrapResult = Schema<'SubmitScrapResult'>;
export type ApproveScrapCommand = Schema<'ApproveScrapCommand'>;
export type RejectScrapCommand = Schema<'RejectScrapCommand'>;

export interface QueryScraps {
  scrap_no?: string;
  status?: string;
  material_id?: number;
  scrap_reason?: string;
  date_from?: string;
  date_to?: string;
}

// ============================================================================
// 基础 CRUD 操作
// ============================================================================

/**
 * 获取报废单列表
 *
 * @example
 * const scraps = await listScraps({ status: 'PENDING' })
 */
export async function listScraps(params?: QueryScraps) {
  return api.get('/api/v1/scraps', {
    params: params as any,
  }) as Promise<ScrapHeadView[]>;
}

/**
 * 获取报废单详情
 *
 * @example
 * const scrap = await getScrap(1)
 */
export async function getScrap(id: number) {
  return api.get('/api/v1/scraps/{id}', {
    pathParams: { id },
  }) as Promise<ScrapHeadView>;
}

/**
 * 创建报废单
 *
 * @example
 * const newScrap = await createScrap({
 *   scrap_date: '2026-04-23',
 *   scrap_reason: '过期报废',
 *   lines: [
 *     {
 *       line_no: 1,
 *       material_id: 1,
 *       scrap_qty: 50,
 *       unit: 'PCS',
 *       wh_id: 1,
 *       loc_id: 1
 *     }
 *   ]
 * })
 */
export async function createScrap(data: CreateScrapCommand) {
  return api.post('/api/v1/scraps', data) as Promise<ScrapHeadView>;
}

/**
 * 更新报废单
 *
 * @example
 * const updated = await updateScrap(1, {
 *   scrap_reason: '质量问题',
 *   lines: [...]
 * })
 */
export async function updateScrap(id: number, data: UpdateScrapCommand) {
  return api.put('/api/v1/scraps/{id}', data, {
    pathParams: { id },
  }) as Promise<ScrapHeadView>;
}

/**
 * 删除报废单
 *
 * @example
 * await deleteScrap(1)
 */
export async function deleteScrap(id: number) {
  return api.delete('/api/v1/scraps/{id}', {
    pathParams: { id },
  });
}

// ============================================================================
// 审批流程
// ============================================================================

/**
 * 提交报废单审批
 *
 * @example
 * const submitted = await submitScrapForApproval(1)
 */
export async function submitScrapForApproval(id: number) {
  return api.post('/api/v1/scraps/{id}/submit-for-approval', {}, {
    pathParams: { id },
  }) as Promise<ScrapHeadView>;
}

/**
 * 审批通过报废单
 *
 * @example
 * const approved = await approveScrap(1, {
 *   approve_comment: '同意报废'
 * })
 */
export async function approveScrap(id: number, data: ApproveScrapCommand) {
  return api.post('/api/v1/scraps/{id}/approve', data, {
    pathParams: { id },
  }) as Promise<ScrapHeadView>;
}

/**
 * 审批拒绝报废单
 *
 * @example
 * const rejected = await rejectScrap(1, {
 *   reject_reason: '不符合报废条件'
 * })
 */
export async function rejectScrap(id: number, data: RejectScrapCommand) {
  return api.post('/api/v1/scraps/{id}/reject', data, {
    pathParams: { id },
  }) as Promise<ScrapHeadView>;
}

/**
 * 提交报废单（执行报废）
 *
 * @example
 * const result = await submitScrap(1)
 */
export async function submitScrap(id: number) {
  return api.post('/api/v1/scraps/{id}/submit', {}, {
    pathParams: { id },
  }) as Promise<SubmitScrapResult>;
}

/**
 * 作废报废单
 *
 * @example
 * await voidScrap(1)
 */
export async function voidScrap(id: number) {
  return api.post('/api/v1/scraps/{id}/void', {}, {
    pathParams: { id },
  });
}

// ============================================================================
// 业务逻辑封装（使用 enhancedApi）
// ============================================================================

/**
 * 按状态获取报废单（带缓存）
 *
 * @example
 * const pending = await getScrapsByStatus('PENDING')
 */
export async function getScrapsByStatus(status: string) {
  return enhancedApi.get('/api/v1/scraps', {
    params: { status } as any,
    cache: { ttl: 2 * 60 * 1000, key: `status:${status}` },
    label: `获取${status}状态报废单`,
  }) as Promise<ScrapHeadView[]>;
}

/**
 * 按报废原因获取报废单
 *
 * @example
 * const scraps = await getScrapsByReason('过期报废')
 */
export async function getScrapsByReason(scrapReason: string) {
  return enhancedApi.get('/api/v1/scraps', {
    params: { scrap_reason: scrapReason } as any,
    cache: { ttl: 2 * 60 * 1000, key: `reason:${scrapReason}` },
    label: `获取${scrapReason}原因的报废单`,
  }) as Promise<ScrapHeadView[]>;
}

/**
 * 按物料获取报废单
 *
 * @example
 * const scraps = await getScrapsByMaterial(1)
 */
export async function getScrapsByMaterial(materialId: number) {
  return enhancedApi.get('/api/v1/scraps', {
    params: { material_id: materialId } as any,
    cache: { ttl: 2 * 60 * 1000, key: `material:${materialId}` },
    label: `获取物料${materialId}的报废单`,
  }) as Promise<ScrapHeadView[]>;
}

/**
 * 按日期范围获取报废单
 *
 * @example
 * const scraps = await getScrapsByDateRange('2026-04-01', '2026-04-30')
 */
export async function getScrapsByDateRange(dateFrom: string, dateTo: string) {
  return enhancedApi.get('/api/v1/scraps', {
    params: { date_from: dateFrom, date_to: dateTo } as any,
    cache: { ttl: 5 * 60 * 1000, key: `date:${dateFrom}:${dateTo}` },
    label: `获取${dateFrom}至${dateTo}的报废单`,
  }) as Promise<ScrapHeadView[]>;
}

/**
 * 搜索报废单（按单号）
 *
 * @example
 * const scraps = await searchScrapsByNo('SC')
 */
export async function searchScrapsByNo(scrapNo: string) {
  if (!scrapNo.trim()) {
    return [];
  }

  return enhancedApi.get('/api/v1/scraps', {
    params: { scrap_no: scrapNo } as any,
    cache: { ttl: 2 * 60 * 1000, key: `no:${scrapNo}` },
    label: `搜索报废单号: ${scrapNo}`,
  }) as Promise<ScrapHeadView[]>;
}

/**
 * 批量获取报废单详情
 *
 * @example
 * const scraps = await batchGetScraps([1, 2, 3])
 */
export async function batchGetScraps(ids: number[]) {
  return enhancedApi.batch(
    ids.map((id) => () => getScrap(id))
  );
}

/**
 * 批量提交审批
 *
 * @example
 * await batchSubmitScrapsForApproval([1, 2, 3])
 */
export async function batchSubmitScrapsForApproval(ids: number[]) {
  return enhancedApi.batch(
    ids.map((id) => () => submitScrapForApproval(id))
  );
}

/**
 * 批量审批通过
 *
 * @example
 * await batchApproveScraps([1, 2, 3], { approve_comment: '批量通过' })
 */
export async function batchApproveScraps(ids: number[], data: ApproveScrapCommand) {
  return enhancedApi.batch(
    ids.map((id) => () => approveScrap(id, data))
  );
}

/**
 * 批量提交报废
 *
 * @example
 * await batchSubmitScraps([1, 2, 3])
 */
export async function batchSubmitScraps(ids: number[]) {
  return enhancedApi.batch(
    ids.map((id) => () => submitScrap(id))
  );
}

/**
 * 批量作废报废单
 *
 * @example
 * await batchVoidScraps([1, 2, 3])
 */
export async function batchVoidScraps(ids: number[]) {
  return enhancedApi.batch(
    ids.map((id) => () => voidScrap(id))
  );
}

/**
 * 获取报废单统计信息（带重试）
 *
 * @example
 * const stats = await getScrapStats()
 */
export async function getScrapStats() {
  const result = await enhancedApi.get('/api/v1/scraps', {
    params: {} as any,
    retry: { times: 3, delay: 1000 },
    cache: { ttl: 5 * 60 * 1000 },
    label: '获取报废统计',
  }) as ScrapHeadView[];

  const statusCount = result.reduce((acc, scrap) => {
    acc[scrap.status] = (acc[scrap.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const reasonCount = result.reduce((acc, scrap) => {
    acc[scrap.scrap_reason] = (acc[scrap.scrap_reason] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalQty = result.reduce((sum, scrap) => {
    return sum + (scrap.lines?.reduce((lineSum, line) => lineSum + Number(line.scrap_qty), 0) || 0);
  }, 0);

  return {
    total: result.length,
    byStatus: statusCount,
    byReason: reasonCount,
    totalQty,
  };
}

/**
 * 获取报废单的总数量
 *
 * @example
 * const totalQty = await getScrapTotalQty(1)
 */
export async function getScrapTotalQty(id: number): Promise<number> {
  const scrap = await getScrap(id);
  return scrap.lines?.reduce((sum, line) => sum + Number(line.scrap_qty), 0) || 0;
}

/**
 * 获取报废单的物料数量
 *
 * @example
 * const materialCount = await getScrapMaterialCount(1)
 */
export async function getScrapMaterialCount(id: number): Promise<number> {
  const scrap = await getScrap(id);
  return new Set(scrap.lines?.map(line => line.material_id)).size;
}

/**
 * 检查报废单是否可编辑
 *
 * @example
 * const canEdit = await canEditScrap(1)
 */
export async function canEditScrap(id: number): Promise<boolean> {
  try {
    const scrap = await getScrap(id);
    return scrap.status === 'PENDING';
  } catch {
    return false;
  }
}

/**
 * 检查报废单是否可提交审批
 *
 * @example
 * const canSubmitForApproval = await canSubmitScrapForApproval(1)
 */
export async function canSubmitScrapForApproval(id: number): Promise<boolean> {
  try {
    const scrap = await getScrap(id);
    return scrap.status === 'PENDING' && (scrap.lines?.length || 0) > 0;
  } catch {
    return false;
  }
}

/**
 * 检查报废单是否可审批
 *
 * @example
 * const canApprove = await canApproveScrap(1)
 */
export async function canApproveScrap(id: number): Promise<boolean> {
  try {
    const scrap = await getScrap(id);
    return scrap.status === 'PENDING_APPROVAL';
  } catch {
    return false;
  }
}

/**
 * 检查报废单是否可提交（执行报废）
 *
 * @example
 * const canSubmit = await canSubmitScrap(1)
 */
export async function canSubmitScrap(id: number): Promise<boolean> {
  try {
    const scrap = await getScrap(id);
    return scrap.status === 'APPROVED';
  } catch {
    return false;
  }
}

/**
 * 获取待审批的报废单
 *
 * @example
 * const pending = await getPendingApprovalScraps()
 */
export async function getPendingApprovalScraps() {
  return getScrapsByStatus('PENDING_APPROVAL');
}

/**
 * 获取已审批待执行的报废单
 *
 * @example
 * const approved = await getApprovedScraps()
 */
export async function getApprovedScraps() {
  return getScrapsByStatus('APPROVED');
}

/**
 * 获取报废单的打印数据
 *
 * @example
 * const printData = await getScrapPrintData(1)
 */
export async function getScrapPrintData(id: number) {
  const scrap = await getScrap(id);

  return {
    header: {
      scrap_no: scrap.scrap_no,
      scrap_date: scrap.scrap_date,
      scrap_reason: scrap.scrap_reason,
      status: scrap.status,
      approve_comment: scrap.approve_comment,
      reject_reason: scrap.reject_reason,
    },
    lines: scrap.lines?.map(line => ({
      line_no: line.line_no,
      material_code: line.material_code,
      material_name: line.material_name,
      scrap_qty: line.scrap_qty,
      unit: line.unit,
      wh_name: line.wh_name,
      loc_name: line.loc_name,
    })) || [],
    summary: {
      total_lines: scrap.lines?.length || 0,
      total_qty: scrap.lines?.reduce((sum, line) => sum + Number(line.scrap_qty), 0) || 0,
    },
  };
}

// ============================================================================
// 缓存管理
// ============================================================================

/**
 * 清除报废相关缓存
 */
export function clearScrapCache() {
  enhancedApi.clearCache('scraps');
  enhancedApi.clearCache('status:');
  enhancedApi.clearCache('reason:');
  enhancedApi.clearCache('material:');
  enhancedApi.clearCache('date:');
  enhancedApi.clearCache('no:');
}
