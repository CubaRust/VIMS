/**
 * 供应商退货 API
 *
 * 提供供应商退货单的完整生命周期管理
 */

import type { Schema } from '../shared/helpers';
import { api } from '../shared/client-factory';
import { enhancedApi } from '../shared/enhanced-client';

// ============================================================================
// 类型定义
// ============================================================================

export type SupplierReturnHeadView = Schema<'SupplierReturnHeadView'>;
export type CreateSupplierReturnCommand = Schema<'CreateSupplierReturnCommand'>;
export type UpdateSupplierReturnCommand = Schema<'UpdateSupplierReturnCommand'>;
export type SubmitSupplierReturnResult = Schema<'SubmitSupplierReturnResult'>;

export interface QuerySupplierReturns {
  return_no?: string;
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
 * 获取供应商退货单列表
 *
 * @example
 * const returns = await listSupplierReturns({ status: 'PENDING' })
 */
export async function listSupplierReturns(params?: QuerySupplierReturns) {
  return api.get('/api/v1/supplier-returns', {
    params: params as any,
  }) as Promise<SupplierReturnHeadView[]>;
}

/**
 * 获取供应商退货单详情
 *
 * @example
 * const supplierReturn = await getSupplierReturn(1)
 */
export async function getSupplierReturn(id: number) {
  return api.get('/api/v1/supplier-returns/{id}', {
    pathParams: { id },
  }) as Promise<SupplierReturnHeadView>;
}

/**
 * 创建供应商退货单
 *
 * @example
 * const newReturn = await createSupplierReturn({
 *   supplier_id: 1,
 *   return_date: '2026-04-23',
 *   lines: [
 *     {
 *       line_no: 1,
 *       material_id: 1,
 *       return_qty: 10,
 *       unit: 'PCS',
 *       reason: '质量不合格'
 *     }
 *   ]
 * })
 */
export async function createSupplierReturn(data: CreateSupplierReturnCommand) {
  return api.post('/api/v1/supplier-returns', data) as Promise<SupplierReturnHeadView>;
}

/**
 * 更新供应商退货单
 *
 * @example
 * const updated = await updateSupplierReturn(1, {
 *   supplier_id: 1,
 *   lines: [...]
 * })
 */
export async function updateSupplierReturn(id: number, data: UpdateSupplierReturnCommand) {
  return api.put('/api/v1/supplier-returns/{id}', data, {
    pathParams: { id },
  }) as Promise<SupplierReturnHeadView>;
}

/**
 * 删除供应商退货单
 *
 * @example
 * await deleteSupplierReturn(1)
 */
export async function deleteSupplierReturn(id: number) {
  return api.delete('/api/v1/supplier-returns/{id}', {
    pathParams: { id },
  });
}

// ============================================================================
// 提交和作废
// ============================================================================

/**
 * 提交供应商退货单
 *
 * @example
 * const result = await submitSupplierReturn(1)
 */
export async function submitSupplierReturn(id: number) {
  return api.post('/api/v1/supplier-returns/{id}/submit', {}, {
    pathParams: { id },
  }) as Promise<SubmitSupplierReturnResult>;
}

/**
 * 作废供应商退货单
 *
 * @example
 * await voidSupplierReturn(1)
 */
export async function voidSupplierReturn(id: number) {
  return api.post('/api/v1/supplier-returns/{id}/void', {}, {
    pathParams: { id },
  });
}

// ============================================================================
// 业务逻辑封装（使用 enhancedApi）
// ============================================================================

/**
 * 按状态获取供应商退货单（带缓存）
 *
 * @example
 * const pending = await getSupplierReturnsByStatus('PENDING')
 */
export async function getSupplierReturnsByStatus(status: string) {
  return enhancedApi.get('/api/v1/supplier-returns', {
    params: { status } as any,
    cache: { ttl: 2 * 60 * 1000, key: `status:${status}` },
    label: `获取${status}状态供应商退货单`,
  }) as Promise<SupplierReturnHeadView[]>;
}

/**
 * 按供应商获取退货单
 *
 * @example
 * const returns = await getSupplierReturnsBySupplier(1)
 */
export async function getSupplierReturnsBySupplier(supplierId: number) {
  return enhancedApi.get('/api/v1/supplier-returns', {
    params: { supplier_id: supplierId } as any,
    cache: { ttl: 2 * 60 * 1000, key: `supplier:${supplierId}` },
    label: `获取供应商${supplierId}的退货单`,
  }) as Promise<SupplierReturnHeadView[]>;
}

/**
 * 按物料获取退货单
 *
 * @example
 * const returns = await getSupplierReturnsByMaterial(1)
 */
export async function getSupplierReturnsByMaterial(materialId: number) {
  return enhancedApi.get('/api/v1/supplier-returns', {
    params: { material_id: materialId } as any,
    cache: { ttl: 2 * 60 * 1000, key: `material:${materialId}` },
    label: `获取物料${materialId}的退货单`,
  }) as Promise<SupplierReturnHeadView[]>;
}

/**
 * 按日期范围获取退货单
 *
 * @example
 * const returns = await getSupplierReturnsByDateRange('2026-04-01', '2026-04-30')
 */
export async function getSupplierReturnsByDateRange(dateFrom: string, dateTo: string) {
  return enhancedApi.get('/api/v1/supplier-returns', {
    params: { date_from: dateFrom, date_to: dateTo } as any,
    cache: { ttl: 5 * 60 * 1000, key: `date:${dateFrom}:${dateTo}` },
    label: `获取${dateFrom}至${dateTo}的退货单`,
  }) as Promise<SupplierReturnHeadView[]>;
}

/**
 * 搜索供应商退货单（按单号）
 *
 * @example
 * const returns = await searchSupplierReturnsByNo('SR')
 */
export async function searchSupplierReturnsByNo(returnNo: string) {
  if (!returnNo.trim()) {
    return [];
  }

  return enhancedApi.get('/api/v1/supplier-returns', {
    params: { return_no: returnNo } as any,
    cache: { ttl: 2 * 60 * 1000, key: `no:${returnNo}` },
    label: `搜索退货单号: ${returnNo}`,
  }) as Promise<SupplierReturnHeadView[]>;
}

/**
 * 批量获取供应商退货单详情
 *
 * @example
 * const returns = await batchGetSupplierReturns([1, 2, 3])
 */
export async function batchGetSupplierReturns(ids: number[]) {
  return enhancedApi.batch(
    ids.map((id) => () => getSupplierReturn(id))
  );
}

/**
 * 批量提交供应商退货单
 *
 * @example
 * await batchSubmitSupplierReturns([1, 2, 3])
 */
export async function batchSubmitSupplierReturns(ids: number[]) {
  return enhancedApi.batch(
    ids.map((id) => () => submitSupplierReturn(id))
  );
}

/**
 * 批量作废供应商退货单
 *
 * @example
 * await batchVoidSupplierReturns([1, 2, 3])
 */
export async function batchVoidSupplierReturns(ids: number[]) {
  return enhancedApi.batch(
    ids.map((id) => () => voidSupplierReturn(id))
  );
}

/**
 * 获取供应商退货单统计信息（带重试）
 *
 * @example
 * const stats = await getSupplierReturnStats()
 */
export async function getSupplierReturnStats() {
  const result = await enhancedApi.get('/api/v1/supplier-returns', {
    params: {} as any,
    retry: { times: 3, delay: 1000 },
    cache: { ttl: 5 * 60 * 1000 },
    label: '获取供应商退货统计',
  }) as SupplierReturnHeadView[];

  const statusCount = result.reduce((acc, ret) => {
    acc[ret.status] = (acc[ret.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalQty = result.reduce((sum, ret) => {
    return sum + (ret.lines?.reduce((lineSum, line) => lineSum + Number(line.return_qty), 0) || 0);
  }, 0);

  return {
    total: result.length,
    byStatus: statusCount,
    totalQty,
  };
}

/**
 * 获取供应商退货单的总数量
 *
 * @example
 * const totalQty = await getSupplierReturnTotalQty(1)
 */
export async function getSupplierReturnTotalQty(id: number): Promise<number> {
  const supplierReturn = await getSupplierReturn(id);
  return supplierReturn.lines?.reduce((sum, line) => sum + Number(line.return_qty), 0) || 0;
}

/**
 * 获取供应商退货单的物料数量
 *
 * @example
 * const materialCount = await getSupplierReturnMaterialCount(1)
 */
export async function getSupplierReturnMaterialCount(id: number): Promise<number> {
  const supplierReturn = await getSupplierReturn(id);
  return new Set(supplierReturn.lines?.map(line => line.material_id)).size;
}

/**
 * 检查供应商退货单是否可编辑
 *
 * @example
 * const canEdit = await canEditSupplierReturn(1)
 */
export async function canEditSupplierReturn(id: number): Promise<boolean> {
  try {
    const supplierReturn = await getSupplierReturn(id);
    return supplierReturn.status === 'PENDING';
  } catch {
    return false;
  }
}

/**
 * 检查供应商退货单是否可提交
 *
 * @example
 * const canSubmit = await canSubmitSupplierReturn(1)
 */
export async function canSubmitSupplierReturn(id: number): Promise<boolean> {
  try {
    const supplierReturn = await getSupplierReturn(id);
    return supplierReturn.status === 'PENDING' && (supplierReturn.lines?.length || 0) > 0;
  } catch {
    return false;
  }
}

/**
 * 获取待提交的供应商退货单
 *
 * @example
 * const pending = await getPendingSupplierReturns()
 */
export async function getPendingSupplierReturns() {
  return getSupplierReturnsByStatus('PENDING');
}

/**
 * 获取供应商退货单的打印数据
 *
 * @example
 * const printData = await getSupplierReturnPrintData(1)
 */
export async function getSupplierReturnPrintData(id: number) {
  const supplierReturn = await getSupplierReturn(id);

  return {
    header: {
      return_no: supplierReturn.return_no,
      supplier_name: supplierReturn.supplier_name,
      return_date: supplierReturn.return_date,
      status: supplierReturn.status,
    },
    lines: supplierReturn.lines?.map(line => ({
      line_no: line.line_no,
      material_code: line.material_code,
      material_name: line.material_name,
      return_qty: line.return_qty,
      unit: line.unit,
      reason: line.reason,
    })) || [],
    summary: {
      total_lines: supplierReturn.lines?.length || 0,
      total_qty: supplierReturn.lines?.reduce((sum, line) => sum + Number(line.return_qty), 0) || 0,
    },
  };
}

// ============================================================================
// 缓存管理
// ============================================================================

/**
 * 清除供应商退货相关缓存
 */
export function clearSupplierReturnCache() {
  enhancedApi.clearCache('supplier-returns');
  enhancedApi.clearCache('status:');
  enhancedApi.clearCache('supplier:');
  enhancedApi.clearCache('material:');
  enhancedApi.clearCache('date:');
  enhancedApi.clearCache('no:');
}
