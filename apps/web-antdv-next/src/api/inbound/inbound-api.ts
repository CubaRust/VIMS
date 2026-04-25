/**
 * 入库单 API
 *
 * 提供入库单的完整 CRUD 操作、审批流程和业务逻辑封装
 */

import type { Schema } from '../shared/helpers';
import { api } from '../shared/api';
import { enhancedApi } from '../shared/enhanced-api';

// ============================================================================
// 类型定义
// ============================================================================

export type InboundHeadView = Schema<'InboundHeadView'>;
export type InboundLineView = Schema<'InboundLineView'>;
export type InboundCreateBody = Schema<'CreateInboundCommand'>;
export type InboundUpdateBody = Schema<'UpdateInboundCommand'>;
export type InboundPrintData = Schema<'InboundPrintData'>;
export type SubmitInboundResult = Schema<'SubmitInboundResult'>;

export interface InboundListQuery {
  inbound_no?: string;
  inbound_type?: string;
  supplier_id?: number;
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
 * 获取入库单列表
 *
 * @example
 * const inbounds = await listInbounds({ doc_status: 'DRAFT' })
 */
export async function listInbounds(params?: InboundListQuery) {
  return api.get('/api/v1/inbounds', {
    params: params as any,
  }) as Promise<InboundHeadView[]>;
}

/**
 * 获取入库单详情
 *
 * @example
 * const inbound = await getInbound(1)
 */
export async function getInbound(id: number) {
  return api.get('/api/v1/inbounds/{id}', {
    pathParams: { id },
  }) as Promise<InboundHeadView>;
}

/**
 * 创建入库单
 *
 * @example
 * const newInbound = await createInbound({
 *   inbound_type: 'PURCHASE',
 *   supplier_id: 1,
 *   wh_id: 1,
 *   loc_id: 1,
 *   inbound_date: '2026-04-23',
 *   lines: [
 *     { line_no: 1, material_id: 1, batch_no: 'B001', qty: 100, unit: 'PCS' }
 *   ]
 * })
 */
export async function createInbound(data: InboundCreateBody) {
  return api.post('/api/v1/inbounds', data) as Promise<InboundHeadView>;
}

/**
 * 更新入库单（仅 DRAFT 状态可更新）
 *
 * @example
 * const updated = await updateInbound(1, {
 *   inbound_type: 'PURCHASE',
 *   wh_id: 1,
 *   inbound_date: '2026-04-23',
 *   lines: [...]
 * })
 */
export async function updateInbound(id: number, data: InboundUpdateBody) {
  return api.put('/api/v1/inbounds/{id}', data, {
    pathParams: { id },
  }) as Promise<InboundHeadView>;
}

/**
 * 删除入库单（仅 DRAFT 状态可删除）
 *
 * @example
 * await deleteInbound(1)
 */
export async function deleteInbound(id: number) {
  return api.delete('/api/v1/inbounds/{id}', {
    pathParams: { id },
  });
}

// ============================================================================
// 审批流程操作
// ============================================================================

/**
 * 提交入库单（提交到库存）
 *
 * @example
 * const result = await submitInbound(1)
 */
export async function submitInbound(id: number) {
  return api.post('/api/v1/inbounds/{id}/submit', {}, {
    pathParams: { id },
  }) as Promise<SubmitInboundResult>;
}

/**
 * 作废入库单
 *
 * @example
 * await voidInbound(1)
 */
export async function voidInbound(id: number) {
  return api.post('/api/v1/inbounds/{id}/void', {}, {
    pathParams: { id },
  });
}

/**
 * 审批通过入库单
 *
 * @example
 * const approved = await approveInbound(1)
 */
export async function approveInbound(id: number) {
  return api.post('/api/v1/inbounds/{id}/approve', {}, {
    pathParams: { id },
  }) as Promise<InboundHeadView>;
}

/**
 * 审批拒绝入库单
 *
 * @example
 * const rejected = await rejectInbound(1, { reason: '数量不符' })
 */
export async function rejectInbound(id: number, data: RejectRequest) {
  return api.post('/api/v1/inbounds/{id}/reject', data, {
    pathParams: { id },
  }) as Promise<InboundHeadView>;
}

/**
 * 获取入库单打印数据
 *
 * @example
 * const printData = await getInboundPrintData(1)
 */
export async function getInboundPrintData(id: number) {
  return api.get('/api/v1/inbounds/{id}/print', {
    pathParams: { id },
  }) as Promise<InboundPrintData>;
}

// ============================================================================
// 业务逻辑封装（使用 enhancedApi）
// ============================================================================

/**
 * 按状态获取入库单（带缓存）
 *
 * @example
 * const drafts = await getInboundsByStatus('DRAFT')
 */
export async function getInboundsByStatus(docStatus: string) {
  return enhancedApi.get('/api/v1/inbounds', {
    params: { doc_status: docStatus } as any,
    cache: { ttl: 2 * 60 * 1000, key: `status:${docStatus}` },
    label: `获取${docStatus}状态入库单`,
  }) as Promise<InboundHeadView[]>;
}

/**
 * 按入库类型获取入库单（带缓存）
 *
 * @example
 * const purchases = await getInboundsByType('PURCHASE')
 */
export async function getInboundsByType(inboundType: string) {
  return enhancedApi.get('/api/v1/inbounds', {
    params: { inbound_type: inboundType } as any,
    cache: { ttl: 2 * 60 * 1000, key: `type:${inboundType}` },
    label: `获取${inboundType}类型入库单`,
  }) as Promise<InboundHeadView[]>;
}

/**
 * 按供应商获取入库单（带缓存）
 *
 * @example
 * const inbounds = await getInboundsBySupplier(1)
 */
export async function getInboundsBySupplier(supplierId: number) {
  return enhancedApi.get('/api/v1/inbounds', {
    params: { supplier_id: supplierId } as any,
    cache: { ttl: 2 * 60 * 1000, key: `supplier:${supplierId}` },
    label: `获取供应商${supplierId}入库单`,
  }) as Promise<InboundHeadView[]>;
}

/**
 * 按日期范围获取入库单
 *
 * @example
 * const inbounds = await getInboundsByDateRange('2026-04-01', '2026-04-30')
 */
export async function getInboundsByDateRange(dateFrom: string, dateTo: string) {
  return enhancedApi.get('/api/v1/inbounds', {
    params: { date_from: dateFrom, date_to: dateTo } as any,
    cache: { ttl: 5 * 60 * 1000, key: `date:${dateFrom}:${dateTo}` },
    label: `获取${dateFrom}至${dateTo}入库单`,
  }) as Promise<InboundHeadView[]>;
}

/**
 * 搜索入库单（按单号）
 *
 * @example
 * const inbounds = await searchInboundsByNo('RCV')
 */
export async function searchInboundsByNo(inboundNo: string) {
  if (!inboundNo.trim()) {
    return [];
  }

  return enhancedApi.get('/api/v1/inbounds', {
    params: { inbound_no: inboundNo } as any,
    cache: { ttl: 1 * 60 * 1000, key: `no:${inboundNo}` },
    label: `搜索入库单: ${inboundNo}`,
  }) as Promise<InboundHeadView[]>;
}

/**
 * 批量获取入库单详情
 *
 * @example
 * const inbounds = await batchGetInbounds([1, 2, 3])
 */
export async function batchGetInbounds(ids: number[]) {
  return enhancedApi.batch(
    ids.map((id) => () => getInbound(id))
  );
}

/**
 * 批量提交入库单
 *
 * @example
 * const results = await batchSubmitInbounds([1, 2, 3])
 */
export async function batchSubmitInbounds(ids: number[]) {
  return enhancedApi.batch(
    ids.map((id) => () => submitInbound(id))
  );
}

/**
 * 批量审批通过入库单
 *
 * @example
 * const results = await batchApproveInbounds([1, 2, 3])
 */
export async function batchApproveInbounds(ids: number[]) {
  return enhancedApi.batch(
    ids.map((id) => () => approveInbound(id))
  );
}

/**
 * 获取入库单统计信息（带重试）
 *
 * @example
 * const stats = await getInboundStats()
 */
export async function getInboundStats() {
  const result = await enhancedApi.get('/api/v1/inbounds', {
    params: {} as any,
    retry: { times: 3, delay: 1000 },
    cache: { ttl: 5 * 60 * 1000 },
    label: '获取入库单统计',
  }) as InboundHeadView[];

  const statusCount = result.reduce((acc, inbound) => {
    acc[inbound.doc_status] = (acc[inbound.doc_status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const typeCount = result.reduce((acc, inbound) => {
    acc[inbound.inbound_type] = (acc[inbound.inbound_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    total: result.length,
    byStatus: statusCount,
    byType: typeCount,
  };
}

/**
 * 获取入库单的总数量
 *
 * @example
 * const totalQty = await getInboundTotalQty(1)
 */
export async function getInboundTotalQty(id: number): Promise<number> {
  const inbound = await getInbound(id);
  return inbound.lines?.reduce((sum, line) => sum + Number(line.qty), 0) || 0;
}

/**
 * 获取入库单的物料种类数
 *
 * @example
 * const materialCount = await getInboundMaterialCount(1)
 */
export async function getInboundMaterialCount(id: number): Promise<number> {
  const inbound = await getInbound(id);
  const materialIds = new Set(inbound.lines?.map(l => l.material_id) || []);
  return materialIds.size;
}

/**
 * 检查入库单是否可编辑
 *
 * @example
 * const canEdit = await canEditInbound(1)
 */
export async function canEditInbound(id: number): Promise<boolean> {
  try {
    const inbound = await getInbound(id);
    return inbound.doc_status === 'DRAFT';
  } catch {
    return false;
  }
}

/**
 * 检查入库单是否可提交
 *
 * @example
 * const canSubmit = await canSubmitInbound(1)
 */
export async function canSubmitInbound(id: number): Promise<boolean> {
  try {
    const inbound = await getInbound(id);
    return ['DRAFT', 'SUBMITTED'].includes(inbound.doc_status);
  } catch {
    return false;
  }
}

// ============================================================================
// 缓存管理
// ============================================================================

/**
 * 清除入库单相关缓存
 */
export function clearInboundCache() {
  enhancedApi.clearCache('inbounds');
}

/**
 * 清除搜索缓存
 */
export function clearInboundSearchCache() {
  enhancedApi.clearCache('status:');
  enhancedApi.clearCache('type:');
  enhancedApi.clearCache('supplier:');
  enhancedApi.clearCache('date:');
  enhancedApi.clearCache('no:');
}
