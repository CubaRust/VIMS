/**
 * 委外加工 API
 *
 * 提供委外加工单的完整生命周期管理，包括发出、回收、在途查询
 */

import type { Schema } from '../types';
import { api } from '../client-factory';
import { enhancedApi } from '../enhanced-client';

// ============================================================================
// 类型定义
// ============================================================================

export type OutsourceHeadView = Schema<'OutsourceHeadView'>;
export type CreateOutsourceCommand = Schema<'CreateOutsourceCommand'>;
export type UpdateOutsourceCommand = Schema<'UpdateOutsourceCommand'>;
export type SubmitResult = Schema<'SubmitResult'>;
export type SubmitBackCommand = Schema<'SubmitBackCommand'>;
export type OutsourceInTransitView = Schema<'OutsourceInTransitView'>;

export interface QueryOutsources {
  outsource_no?: string;
  status?: string;
  supplier_id?: number;
  material_id?: number;
  date_from?: string;
  date_to?: string;
}

// ============================================================================
// 基础 CRUD 操作
// ============================================================================

/**
 * 获取委外加工单列表
 *
 * @example
 * const outsources = await listOutsources({ status: 'PENDING' })
 */
export async function listOutsources(params?: QueryOutsources) {
  return api.get('/api/v1/outsources', {
    params: params as any,
  }) as Promise<OutsourceHeadView[]>;
}

/**
 * 获取委外加工单详情
 *
 * @example
 * const outsource = await getOutsource(1)
 */
export async function getOutsource(id: number) {
  return api.get('/api/v1/outsources/{id}', {
    pathParams: { id },
  }) as Promise<OutsourceHeadView>;
}

/**
 * 创建委外加工单
 *
 * @example
 * const newOutsource = await createOutsource({
 *   supplier_id: 1,
 *   outsource_date: '2026-04-23',
 *   lines: [
 *     {
 *       line_no: 1,
 *       material_id: 1,
 *       send_qty: 100,
 *       unit: 'PCS'
 *     }
 *   ]
 * })
 */
export async function createOutsource(data: CreateOutsourceCommand) {
  return api.post('/api/v1/outsources', data) as Promise<OutsourceHeadView>;
}

/**
 * 更新委外加工单
 *
 * @example
 * const updated = await updateOutsource(1, {
 *   supplier_id: 1,
 *   lines: [...]
 * })
 */
export async function updateOutsource(id: number, data: UpdateOutsourceCommand) {
  return api.put('/api/v1/outsources/{id}', data, {
    pathParams: { id },
  }) as Promise<OutsourceHeadView>;
}

/**
 * 删除委外加工单
 *
 * @example
 * await deleteOutsource(1)
 */
export async function deleteOutsource(id: number) {
  return api.delete('/api/v1/outsources/{id}', {
    pathParams: { id },
  });
}

// ============================================================================
// 业务操作
// ============================================================================

/**
 * 发出委外加工单
 *
 * @example
 * const result = await sendOutsource(1)
 */
export async function sendOutsource(id: number) {
  return api.post('/api/v1/outsources/{id}/send', {}, {
    pathParams: { id },
  }) as Promise<SubmitResult>;
}

/**
 * 回收委外加工单
 *
 * @example
 * await backOutsource(1, {
 *   lines: [
 *     {
 *       line_id: 1,
 *       back_qty: 90,
 *       qualified_qty: 85,
 *       defect_qty: 5
 *     }
 *   ]
 * })
 */
export async function backOutsource(id: number, data: SubmitBackCommand) {
  return api.post('/api/v1/outsources/{id}/back', data, {
    pathParams: { id },
  }) as Promise<SubmitResult>;
}

/**
 * 关闭委外加工单
 *
 * @example
 * const closed = await closeOutsource(1)
 */
export async function closeOutsource(id: number) {
  return api.post('/api/v1/outsources/{id}/close', {}, {
    pathParams: { id },
  }) as Promise<OutsourceHeadView>;
}

/**
 * 作废委外加工单
 *
 * @example
 * await voidOutsource(1)
 */
export async function voidOutsource(id: number) {
  return api.post('/api/v1/outsources/{id}/void', {}, {
    pathParams: { id },
  });
}

/**
 * 获取在途委外加工单列表
 *
 * @example
 * const inTransit = await getOutsourcesInTransit()
 */
export async function getOutsourcesInTransit() {
  return api.get('/api/v1/outsources/in-transit') as Promise<OutsourceInTransitView[]>;
}

// ============================================================================
// 业务逻辑封装（使用 enhancedApi）
// ============================================================================

/**
 * 按状态获取委外加工单（带缓存）
 *
 * @example
 * const pending = await getOutsourcesByStatus('PENDING')
 */
export async function getOutsourcesByStatus(status: string) {
  return enhancedApi.get('/api/v1/outsources', {
    params: { status } as any,
    cache: { ttl: 2 * 60 * 1000, key: `status:${status}` },
    label: `获取${status}状态委外加工单`,
  }) as Promise<OutsourceHeadView[]>;
}

/**
 * 按供应商获取委外加工单
 *
 * @example
 * const outsources = await getOutsourcesBySupplier(1)
 */
export async function getOutsourcesBySupplier(supplierId: number) {
  return enhancedApi.get('/api/v1/outsources', {
    params: { supplier_id: supplierId } as any,
    cache: { ttl: 2 * 60 * 1000, key: `supplier:${supplierId}` },
    label: `获取供应商${supplierId}的委外加工单`,
  }) as Promise<OutsourceHeadView[]>;
}

/**
 * 按物料获取委外加工单
 *
 * @example
 * const outsources = await getOutsourcesByMaterial(1)
 */
export async function getOutsourcesByMaterial(materialId: number) {
  return enhancedApi.get('/api/v1/outsources', {
    params: { material_id: materialId } as any,
    cache: { ttl: 2 * 60 * 1000, key: `material:${materialId}` },
    label: `获取物料${materialId}的委外加工单`,
  }) as Promise<OutsourceHeadView[]>;
}

/**
 * 按日期范围获取委外加工单
 *
 * @example
 * const outsources = await getOutsourcesByDateRange('2026-04-01', '2026-04-30')
 */
export async function getOutsourcesByDateRange(dateFrom: string, dateTo: string) {
  return enhancedApi.get('/api/v1/outsources', {
    params: { date_from: dateFrom, date_to: dateTo } as any,
    cache: { ttl: 5 * 60 * 1000, key: `date:${dateFrom}:${dateTo}` },
    label: `获取${dateFrom}至${dateTo}的委外加工单`,
  }) as Promise<OutsourceHeadView[]>;
}

/**
 * 搜索委外加工单（按单号）
 *
 * @example
 * const outsources = await searchOutsourcesByNo('OS')
 */
export async function searchOutsourcesByNo(outsourceNo: string) {
  if (!outsourceNo.trim()) {
    return [];
  }

  return enhancedApi.get('/api/v1/outsources', {
    params: { outsource_no: outsourceNo } as any,
    cache: { ttl: 2 * 60 * 1000, key: `no:${outsourceNo}` },
    label: `搜索委外加工单号: ${outsourceNo}`,
  }) as Promise<OutsourceHeadView[]>;
}

/**
 * 获取在途委外加工单（带缓存）
 *
 * @example
 * const inTransit = await getInTransitOutsources()
 */
export async function getInTransitOutsources() {
  return enhancedApi.get('/api/v1/outsources/in-transit', {
    cache: { ttl: 2 * 60 * 1000 },
    label: '获取在途委外加工单',
  }) as Promise<OutsourceInTransitView[]>;
}

/**
 * 批量获取委外加工单详情
 *
 * @example
 * const outsources = await batchGetOutsources([1, 2, 3])
 */
export async function batchGetOutsources(ids: number[]) {
  return enhancedApi.batch(
    ids.map((id) => () => getOutsource(id))
  );
}

/**
 * 批量发出委外加工单
 *
 * @example
 * await batchSendOutsources([1, 2, 3])
 */
export async function batchSendOutsources(ids: number[]) {
  return enhancedApi.batch(
    ids.map((id) => () => sendOutsource(id))
  );
}

/**
 * 批量关闭委外加工单
 *
 * @example
 * await batchCloseOutsources([1, 2, 3])
 */
export async function batchCloseOutsources(ids: number[]) {
  return enhancedApi.batch(
    ids.map((id) => () => closeOutsource(id))
  );
}

/**
 * 批量作废委外加工单
 *
 * @example
 * await batchVoidOutsources([1, 2, 3])
 */
export async function batchVoidOutsources(ids: number[]) {
  return enhancedApi.batch(
    ids.map((id) => () => voidOutsource(id))
  );
}

/**
 * 获取委外加工单统计信息（带重试）
 *
 * @example
 * const stats = await getOutsourceStats()
 */
export async function getOutsourceStats() {
  const result = await enhancedApi.get('/api/v1/outsources', {
    params: {} as any,
    retry: { times: 3, delay: 1000 },
    cache: { ttl: 5 * 60 * 1000 },
    label: '获取委外加工统计',
  }) as OutsourceHeadView[];

  const statusCount = result.reduce((acc, outsource) => {
    acc[outsource.status] = (acc[outsource.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalSendQty = result.reduce((sum, outsource) => {
    return sum + (outsource.lines?.reduce((lineSum, line) => lineSum + Number(line.send_qty), 0) || 0);
  }, 0);

  const totalBackQty = result.reduce((sum, outsource) => {
    return sum + (outsource.lines?.reduce((lineSum, line) => lineSum + Number(line.back_qty || 0), 0) || 0);
  }, 0);

  return {
    total: result.length,
    byStatus: statusCount,
    totalSendQty,
    totalBackQty,
    inTransitQty: totalSendQty - totalBackQty,
  };
}

/**
 * 获取委外加工单的总发出数量
 *
 * @example
 * const totalQty = await getOutsourceTotalSendQty(1)
 */
export async function getOutsourceTotalSendQty(id: number): Promise<number> {
  const outsource = await getOutsource(id);
  return outsource.lines?.reduce((sum, line) => sum + Number(line.send_qty), 0) || 0;
}

/**
 * 获取委外加工单的总回收数量
 *
 * @example
 * const totalQty = await getOutsourceTotalBackQty(1)
 */
export async function getOutsourceTotalBackQty(id: number): Promise<number> {
  const outsource = await getOutsource(id);
  return outsource.lines?.reduce((sum, line) => sum + Number(line.back_qty || 0), 0) || 0;
}

/**
 * 获取委外加工单的在途数量
 *
 * @example
 * const inTransitQty = await getOutsourceInTransitQty(1)
 */
export async function getOutsourceInTransitQty(id: number): Promise<number> {
  const sendQty = await getOutsourceTotalSendQty(id);
  const backQty = await getOutsourceTotalBackQty(id);
  return sendQty - backQty;
}

/**
 * 检查委外加工单是否可编辑
 *
 * @example
 * const canEdit = await canEditOutsource(1)
 */
export async function canEditOutsource(id: number): Promise<boolean> {
  try {
    const outsource = await getOutsource(id);
    return outsource.status === 'PENDING';
  } catch {
    return false;
  }
}

/**
 * 检查委外加工单是否可发出
 *
 * @example
 * const canSend = await canSendOutsource(1)
 */
export async function canSendOutsource(id: number): Promise<boolean> {
  try {
    const outsource = await getOutsource(id);
    return outsource.status === 'PENDING' && (outsource.lines?.length || 0) > 0;
  } catch {
    return false;
  }
}

/**
 * 检查委外加工单是否可回收
 *
 * @example
 * const canBack = await canBackOutsource(1)
 */
export async function canBackOutsource(id: number): Promise<boolean> {
  try {
    const outsource = await getOutsource(id);
    return outsource.status === 'SENT';
  } catch {
    return false;
  }
}

/**
 * 检查委外加工单是否可关闭
 *
 * @example
 * const canClose = await canCloseOutsource(1)
 */
export async function canCloseOutsource(id: number): Promise<boolean> {
  try {
    const outsource = await getOutsource(id);
    return outsource.status === 'SENT' || outsource.status === 'PARTIAL_BACK';
  } catch {
    return false;
  }
}

/**
 * 获取待发出的委外加工单
 *
 * @example
 * const pending = await getPendingSendOutsources()
 */
export async function getPendingSendOutsources() {
  return getOutsourcesByStatus('PENDING');
}

/**
 * 获取待回收的委外加工单
 *
 * @example
 * const sent = await getPendingBackOutsources()
 */
export async function getPendingBackOutsources() {
  return getOutsourcesByStatus('SENT');
}

/**
 * 获取委外加工单的打印数据
 *
 * @example
 * const printData = await getOutsourcePrintData(1)
 */
export async function getOutsourcePrintData(id: number) {
  const outsource = await getOutsource(id);

  return {
    header: {
      outsource_no: outsource.outsource_no,
      supplier_name: outsource.supplier_name,
      outsource_date: outsource.outsource_date,
      status: outsource.status,
    },
    lines: outsource.lines?.map(line => ({
      line_no: line.line_no,
      material_code: line.material_code,
      material_name: line.material_name,
      send_qty: line.send_qty,
      back_qty: line.back_qty,
      in_transit_qty: Number(line.send_qty) - Number(line.back_qty || 0),
      unit: line.unit,
    })) || [],
    summary: {
      total_lines: outsource.lines?.length || 0,
      total_send_qty: outsource.lines?.reduce((sum, line) => sum + Number(line.send_qty), 0) || 0,
      total_back_qty: outsource.lines?.reduce((sum, line) => sum + Number(line.back_qty || 0), 0) || 0,
    },
  };
}

// ============================================================================
// 缓存管理
// ============================================================================

/**
 * 清除委外加工相关缓存
 */
export function clearOutsourceCache() {
  enhancedApi.clearCache('outsources');
  enhancedApi.clearCache('status:');
  enhancedApi.clearCache('supplier:');
  enhancedApi.clearCache('material:');
  enhancedApi.clearCache('date:');
  enhancedApi.clearCache('no:');
  enhancedApi.clearCache('in-transit');
}
