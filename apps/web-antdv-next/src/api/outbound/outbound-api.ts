/**
 * 出库单 API
 *
 * 提供出库单的完整 CRUD 操作、审批流程、批量出库和业务逻辑封装
 */

import type { Schema } from '../shared/helpers';
import { api } from '../shared/api';
import { enhancedApi } from '../shared/enhanced-api';

// ============================================================================
// 类型定义
// ============================================================================

export type OutboundHeadView = Schema<'OutboundHeadView'>;
export type OutboundLineView = Schema<'OutboundLineView'>;
export type OutboundCreateBody = Schema<'CreateOutboundCommand'>;
export type OutboundUpdateBody = Schema<'UpdateOutboundCommand'>;
export type OutboundPrintData = Schema<'OutboundPrintData'>;
export type SubmitOutboundResult = Schema<'SubmitOutboundResult'>;
export type BatchOutboundCommand = Schema<'BatchOutboundCommand'>;

export interface OutboundListQuery {
  outbound_no?: string;
  outbound_type?: string;
  work_order_no?: string;
  doc_status?: string;
  date_from?: string;
  date_to?: string;
}

export interface RejectRequest {
  reason?: string;
}

// ============================================================================
// 基础 CRUD 操作
// ============================================================================

/**
 * 获取出库单列表
 *
 * @example
 * const outbounds = await listOutbounds({ doc_status: 'DRAFT' })
 */
export async function listOutbounds(params?: OutboundListQuery) {
  return api.get('/api/v1/outbounds', {
    params: params as any,
  }) as Promise<OutboundHeadView[]>;
}

/**
 * 获取出库单详情
 *
 * @example
 * const outbound = await getOutbound(1)
 */
export async function getOutbound(id: number) {
  return api.get('/api/v1/outbounds/{id}', {
    pathParams: { id },
  }) as Promise<OutboundHeadView>;
}

/**
 * 创建出库单
 *
 * @example
 * const newOutbound = await createOutbound({
 *   outbound_type: 'PRODUCTION',
 *   work_order_no: 'WO001',
 *   wh_id: 1,
 *   loc_id: 1,
 *   outbound_date: '2026-04-23',
 *   lines: [
 *     { line_no: 1, material_id: 1, batch_no: 'B001', actual_qty: 100, unit: 'PCS' }
 *   ]
 * })
 */
export async function createOutbound(data: OutboundCreateBody) {
  return api.post('/api/v1/outbounds', data) as Promise<OutboundHeadView>;
}

/**
 * 更新出库单（仅 DRAFT 状态可更新）
 *
 * @example
 * const updated = await updateOutbound(1, {
 *   outbound_type: 'PRODUCTION',
 *   wh_id: 1,
 *   loc_id: 1,
 *   outbound_date: '2026-04-23',
 *   lines: [...]
 * })
 */
export async function updateOutbound(id: number, data: OutboundUpdateBody) {
  return api.put('/api/v1/outbounds/{id}', data, {
    pathParams: { id },
  }) as Promise<OutboundHeadView>;
}

/**
 * 删除出库单（仅 DRAFT 状态可删除）
 *
 * @example
 * await deleteOutbound(1)
 */
export async function deleteOutbound(id: number) {
  return api.delete('/api/v1/outbounds/{id}', {
    pathParams: { id },
  });
}

// ============================================================================
// 审批流程操作
// ============================================================================

/**
 * 提交出库单（提交到库存）
 *
 * @example
 * const result = await submitOutbound(1)
 */
export async function submitOutbound(id: number) {
  return api.post('/api/v1/outbounds/{id}/submit', {}, {
    pathParams: { id },
  }) as Promise<SubmitOutboundResult>;
}

/**
 * 作废出库单
 *
 * @example
 * await voidOutbound(1)
 */
export async function voidOutbound(id: number) {
  return api.post('/api/v1/outbounds/{id}/void', {}, {
    pathParams: { id },
  });
}

/**
 * 审批通过出库单
 *
 * @example
 * const approved = await approveOutbound(1)
 */
export async function approveOutbound(id: number) {
  return api.post('/api/v1/outbounds/{id}/approve', {}, {
    pathParams: { id },
  }) as Promise<OutboundHeadView>;
}

/**
 * 审批拒绝出库单
 *
 * @example
 * const rejected = await rejectOutbound(1, { reason: '数量不符' })
 */
export async function rejectOutbound(id: number, data: RejectRequest) {
  return api.post('/api/v1/outbounds/{id}/reject', data, {
    pathParams: { id },
  }) as Promise<OutboundHeadView>;
}

/**
 * 获取出库单打印数据
 *
 * @example
 * const printData = await getOutboundPrintData(1)
 */
export async function getOutboundPrintData(id: number) {
  return api.get('/api/v1/outbounds/{id}/print', {
    pathParams: { id },
  }) as Promise<OutboundPrintData>;
}

// ============================================================================
// 批量出库
// ============================================================================

/**
 * 批量出库（快速出库多个物料）
 *
 * @example
 * const result = await batchOutbound({
 *   outbound_type: 'PRODUCTION',
 *   work_order_no: 'WO001',
 *   wh_id: 1,
 *   loc_id: 1,
 *   outbound_date: '2026-04-23',
 *   materials: [
 *     { material_id: 1, batch_no: 'B001', qty: 100, unit: 'PCS', stock_status: 'QUALIFIED' }
 *   ]
 * })
 */
export async function batchOutbound(data: BatchOutboundCommand) {
  return api.post('/api/v1/outbounds/batch', data) as Promise<SubmitOutboundResult>;
}

// ============================================================================
// 业务逻辑封装（使用 enhancedApi）
// ============================================================================

/**
 * 按状态获取出库单（带缓存）
 *
 * @example
 * const drafts = await getOutboundsByStatus('DRAFT')
 */
export async function getOutboundsByStatus(docStatus: string) {
  return enhancedApi.get('/api/v1/outbounds', {
    params: { doc_status: docStatus } as any,
    cache: { ttl: 2 * 60 * 1000, key: `status:${docStatus}` },
    label: `获取${docStatus}状态出库单`,
  }) as Promise<OutboundHeadView[]>;
}

/**
 * 按出库类型获取出库单（带缓存）
 *
 * @example
 * const productions = await getOutboundsByType('PRODUCTION')
 */
export async function getOutboundsByType(outboundType: string) {
  return enhancedApi.get('/api/v1/outbounds', {
    params: { outbound_type: outboundType } as any,
    cache: { ttl: 2 * 60 * 1000, key: `type:${outboundType}` },
    label: `获取${outboundType}类型出库单`,
  }) as Promise<OutboundHeadView[]>;
}

/**
 * 按工单号获取出库单（带缓存）
 *
 * @example
 * const outbounds = await getOutboundsByWorkOrder('WO001')
 */
export async function getOutboundsByWorkOrder(workOrderNo: string) {
  return enhancedApi.get('/api/v1/outbounds', {
    params: { work_order_no: workOrderNo } as any,
    cache: { ttl: 2 * 60 * 1000, key: `wo:${workOrderNo}` },
    label: `获取工单${workOrderNo}出库单`,
  }) as Promise<OutboundHeadView[]>;
}

/**
 * 按日期范围获取出库单
 *
 * @example
 * const outbounds = await getOutboundsByDateRange('2026-04-01', '2026-04-30')
 */
export async function getOutboundsByDateRange(dateFrom: string, dateTo: string) {
  return enhancedApi.get('/api/v1/outbounds', {
    params: { date_from: dateFrom, date_to: dateTo } as any,
    cache: { ttl: 5 * 60 * 1000, key: `date:${dateFrom}:${dateTo}` },
    label: `获取${dateFrom}至${dateTo}出库单`,
  }) as Promise<OutboundHeadView[]>;
}

/**
 * 搜索出库单（按单号）
 *
 * @example
 * const outbounds = await searchOutboundsByNo('OUT')
 */
export async function searchOutboundsByNo(outboundNo: string) {
  if (!outboundNo.trim()) {
    return [];
  }

  return enhancedApi.get('/api/v1/outbounds', {
    params: { outbound_no: outboundNo } as any,
    cache: { ttl: 1 * 60 * 1000, key: `no:${outboundNo}` },
    label: `搜索出库单: ${outboundNo}`,
  }) as Promise<OutboundHeadView[]>;
}

/**
 * 批量获取出库单详情
 *
 * @example
 * const outbounds = await batchGetOutbounds([1, 2, 3])
 */
export async function batchGetOutbounds(ids: number[]) {
  return enhancedApi.batch(
    ids.map((id) => () => getOutbound(id))
  );
}

/**
 * 批量提交出库单
 *
 * @example
 * const results = await batchSubmitOutbounds([1, 2, 3])
 */
export async function batchSubmitOutbounds(ids: number[]) {
  return enhancedApi.batch(
    ids.map((id) => () => submitOutbound(id))
  );
}

/**
 * 批量审批通过出库单
 *
 * @example
 * const results = await batchApproveOutbounds([1, 2, 3])
 */
export async function batchApproveOutbounds(ids: number[]) {
  return enhancedApi.batch(
    ids.map((id) => () => approveOutbound(id))
  );
}

/**
 * 获取出库单统计信息（带重试）
 *
 * @example
 * const stats = await getOutboundStats()
 */
export async function getOutboundStats() {
  const result = await enhancedApi.get('/api/v1/outbounds', {
    params: {} as any,
    retry: { times: 3, delay: 1000 },
    cache: { ttl: 5 * 60 * 1000 },
    label: '获取出库单统计',
  }) as OutboundHeadView[];

  const statusCount = result.reduce((acc, outbound) => {
    acc[outbound.doc_status] = (acc[outbound.doc_status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const typeCount = result.reduce((acc, outbound) => {
    acc[outbound.outbound_type] = (acc[outbound.outbound_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    total: result.length,
    byStatus: statusCount,
    byType: typeCount,
  };
}

/**
 * 获取出库单的总数量
 *
 * @example
 * const totalQty = await getOutboundTotalQty(1)
 */
export async function getOutboundTotalQty(id: number): Promise<number> {
  const outbound = await getOutbound(id);
  return outbound.lines?.reduce((sum, line) => sum + Number(line.actual_qty), 0) || 0;
}

/**
 * 获取出库单的物料种类数
 *
 * @example
 * const materialCount = await getOutboundMaterialCount(1)
 */
export async function getOutboundMaterialCount(id: number): Promise<number> {
  const outbound = await getOutbound(id);
  const materialIds = new Set(outbound.lines?.map(l => l.material_id) || []);
  return materialIds.size;
}

/**
 * 获取出库单的预发料行数
 *
 * @example
 * const preissueCount = await getOutboundPreissueLineCount(1)
 */
export async function getOutboundPreissueLineCount(id: number): Promise<number> {
  const outbound = await getOutbound(id);
  return outbound.lines?.filter(l => l.preissue_flag).length || 0;
}

/**
 * 获取出库单的 BOM 推荐行数
 *
 * @example
 * const bomRecommendCount = await getOutboundBomRecommendLineCount(1)
 */
export async function getOutboundBomRecommendLineCount(id: number): Promise<number> {
  const outbound = await getOutbound(id);
  return outbound.lines?.filter(l => l.bom_recommended_flag).length || 0;
}

/**
 * 检查出库单是否可编辑
 *
 * @example
 * const canEdit = await canEditOutbound(1)
 */
export async function canEditOutbound(id: number): Promise<boolean> {
  try {
    const outbound = await getOutbound(id);
    return outbound.doc_status === 'DRAFT';
  } catch {
    return false;
  }
}

/**
 * 检查出库单是否可提交
 *
 * @example
 * const canSubmit = await canSubmitOutbound(1)
 */
export async function canSubmitOutbound(id: number): Promise<boolean> {
  try {
    const outbound = await getOutbound(id);
    return ['DRAFT', 'SUBMITTED'].includes(outbound.doc_status);
  } catch {
    return false;
  }
}

// ============================================================================
// 缓存管理
// ============================================================================

/**
 * 清除出库单相关缓存
 */
export function clearOutboundCache() {
  enhancedApi.clearCache('outbounds');
}

/**
 * 清除搜索缓存
 */
export function clearOutboundSearchCache() {
  enhancedApi.clearCache('status:');
  enhancedApi.clearCache('type:');
  enhancedApi.clearCache('wo:');
  enhancedApi.clearCache('date:');
  enhancedApi.clearCache('no:');
}
