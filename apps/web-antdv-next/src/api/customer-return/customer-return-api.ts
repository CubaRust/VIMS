/**
 * 客户退货 API
 *
 * 提供客户退货单的完整生命周期管理，包括判定流程和历史查询
 */

import type { Schema } from '../shared/helpers';
import { api } from '../shared/client-factory';
import { enhancedApi } from '../shared/enhanced-client';

// ============================================================================
// 类型定义
// ============================================================================

export type CustomerReturnHeadView = Schema<'CustomerReturnHeadView'>;
export type CreateCustomerReturnCommand = Schema<'CreateCustomerReturnCommand'>;
export type UpdateCustomerReturnCommand = Schema<'UpdateCustomerReturnCommand'>;
export type SubmitCustomerReturnResult = Schema<'SubmitCustomerReturnResult'>;
export type JudgeLineCommand = Schema<'JudgeLineCommand'>;
export type JudgeHistoryView = Schema<'JudgeHistoryView'>;

export interface QueryCustomerReturns {
  return_no?: string;
  status?: string;
  customer_id?: number;
  material_id?: number;
  date_from?: string;
  date_to?: string;
}

// ============================================================================
// 基础 CRUD 操作
// ============================================================================

/**
 * 获取客户退货单列表
 *
 * @example
 * const returns = await listCustomerReturns({ status: 'PENDING' })
 */
export async function listCustomerReturns(params?: QueryCustomerReturns) {
  return api.get('/api/v1/customer-returns', {
    params: params as any,
  }) as Promise<CustomerReturnHeadView[]>;
}

/**
 * 获取客户退货单详情
 *
 * @example
 * const customerReturn = await getCustomerReturn(1)
 */
export async function getCustomerReturn(id: number) {
  return api.get('/api/v1/customer-returns/{id}', {
    pathParams: { id },
  }) as Promise<CustomerReturnHeadView>;
}

/**
 * 创建客户退货单
 *
 * @example
 * const newReturn = await createCustomerReturn({
 *   customer_id: 1,
 *   return_date: '2026-04-23',
 *   lines: [
 *     {
 *       line_no: 1,
 *       material_id: 1,
 *       return_qty: 10,
 *       unit: 'PCS',
 *       reason: '质量问题'
 *     }
 *   ]
 * })
 */
export async function createCustomerReturn(data: CreateCustomerReturnCommand) {
  return api.post('/api/v1/customer-returns', data) as Promise<CustomerReturnHeadView>;
}

/**
 * 更新客户退货单
 *
 * @example
 * const updated = await updateCustomerReturn(1, {
 *   customer_id: 1,
 *   lines: [...]
 * })
 */
export async function updateCustomerReturn(id: number, data: UpdateCustomerReturnCommand) {
  return api.put('/api/v1/customer-returns/{id}', data, {
    pathParams: { id },
  }) as Promise<CustomerReturnHeadView>;
}

/**
 * 删除客户退货单
 *
 * @example
 * await deleteCustomerReturn(1)
 */
export async function deleteCustomerReturn(id: number) {
  return api.delete('/api/v1/customer-returns/{id}', {
    pathParams: { id },
  });
}

// ============================================================================
// 判定流程
// ============================================================================

/**
 * 判定客户退货单（批量判定多行）
 *
 * @example
 * await judgeCustomerReturn(1, [
 *   {
 *     line_id: 1,
 *     judge_result: 'QUALIFIED',
 *     judge_qty: 10,
 *     wh_id: 1,
 *     loc_id: 1,
 *     stock_status: 'QUALIFIED'
 *   }
 * ])
 */
export async function judgeCustomerReturn(id: number, lines: JudgeLineCommand[]) {
  return api.post('/api/v1/customer-returns/{id}/judge', lines, {
    pathParams: { id },
  });
}

/**
 * 获取客户退货单的判定历史
 *
 * @example
 * const history = await getCustomerReturnJudgeHistory(1)
 */
export async function getCustomerReturnJudgeHistory(id: number) {
  return api.get('/api/v1/customer-returns/{id}/judge-history', {
    pathParams: { id },
  }) as Promise<JudgeHistoryView[]>;
}

/**
 * 获取客户退货单行的判定历史
 *
 * @example
 * const history = await getCustomerReturnLineJudgeHistory(1)
 */
export async function getCustomerReturnLineJudgeHistory(lineId: number) {
  return api.get('/api/v1/customer-returns/lines/{line_id}/judge-history', {
    pathParams: { line_id: lineId },
  }) as Promise<JudgeHistoryView[]>;
}

// ============================================================================
// 提交和作废
// ============================================================================

/**
 * 提交客户退货单
 *
 * @example
 * const result = await submitCustomerReturn(1)
 */
export async function submitCustomerReturn(id: number) {
  return api.post('/api/v1/customer-returns/{id}/submit', {}, {
    pathParams: { id },
  }) as Promise<SubmitCustomerReturnResult>;
}

/**
 * 作废客户退货单
 *
 * @example
 * await voidCustomerReturn(1)
 */
export async function voidCustomerReturn(id: number) {
  return api.post('/api/v1/customer-returns/{id}/void', {}, {
    pathParams: { id },
  });
}

// ============================================================================
// 业务逻辑封装（使用 enhancedApi）
// ============================================================================

/**
 * 按状态获取客户退货单（带缓存）
 *
 * @example
 * const pending = await getCustomerReturnsByStatus('PENDING')
 */
export async function getCustomerReturnsByStatus(status: string) {
  return enhancedApi.get('/api/v1/customer-returns', {
    params: { status } as any,
    cache: { ttl: 2 * 60 * 1000, key: `status:${status}` },
    label: `获取${status}状态客户退货单`,
  }) as Promise<CustomerReturnHeadView[]>;
}

/**
 * 按客户获取退货单
 *
 * @example
 * const returns = await getCustomerReturnsByCustomer(1)
 */
export async function getCustomerReturnsByCustomer(customerId: number) {
  return enhancedApi.get('/api/v1/customer-returns', {
    params: { customer_id: customerId } as any,
    cache: { ttl: 2 * 60 * 1000, key: `customer:${customerId}` },
    label: `获取客户${customerId}的退货单`,
  }) as Promise<CustomerReturnHeadView[]>;
}

/**
 * 按物料获取退货单
 *
 * @example
 * const returns = await getCustomerReturnsByMaterial(1)
 */
export async function getCustomerReturnsByMaterial(materialId: number) {
  return enhancedApi.get('/api/v1/customer-returns', {
    params: { material_id: materialId } as any,
    cache: { ttl: 2 * 60 * 1000, key: `material:${materialId}` },
    label: `获取物料${materialId}的退货单`,
  }) as Promise<CustomerReturnHeadView[]>;
}

/**
 * 按日期范围获取退货单
 *
 * @example
 * const returns = await getCustomerReturnsByDateRange('2026-04-01', '2026-04-30')
 */
export async function getCustomerReturnsByDateRange(dateFrom: string, dateTo: string) {
  return enhancedApi.get('/api/v1/customer-returns', {
    params: { date_from: dateFrom, date_to: dateTo } as any,
    cache: { ttl: 5 * 60 * 1000, key: `date:${dateFrom}:${dateTo}` },
    label: `获取${dateFrom}至${dateTo}的退货单`,
  }) as Promise<CustomerReturnHeadView[]>;
}

/**
 * 搜索客户退货单（按单号）
 *
 * @example
 * const returns = await searchCustomerReturnsByNo('CR')
 */
export async function searchCustomerReturnsByNo(returnNo: string) {
  if (!returnNo.trim()) {
    return [];
  }

  return enhancedApi.get('/api/v1/customer-returns', {
    params: { return_no: returnNo } as any,
    cache: { ttl: 2 * 60 * 1000, key: `no:${returnNo}` },
    label: `搜索退货单号: ${returnNo}`,
  }) as Promise<CustomerReturnHeadView[]>;
}

/**
 * 批量获取客户退货单详情
 *
 * @example
 * const returns = await batchGetCustomerReturns([1, 2, 3])
 */
export async function batchGetCustomerReturns(ids: number[]) {
  return enhancedApi.batch(
    ids.map((id) => () => getCustomerReturn(id))
  );
}

/**
 * 批量提交客户退货单
 *
 * @example
 * await batchSubmitCustomerReturns([1, 2, 3])
 */
export async function batchSubmitCustomerReturns(ids: number[]) {
  return enhancedApi.batch(
    ids.map((id) => () => submitCustomerReturn(id))
  );
}

/**
 * 批量作废客户退货单
 *
 * @example
 * await batchVoidCustomerReturns([1, 2, 3])
 */
export async function batchVoidCustomerReturns(ids: number[]) {
  return enhancedApi.batch(
    ids.map((id) => () => voidCustomerReturn(id))
  );
}

/**
 * 获取客户退货单统计信息（带重试）
 *
 * @example
 * const stats = await getCustomerReturnStats()
 */
export async function getCustomerReturnStats() {
  const result = await enhancedApi.get('/api/v1/customer-returns', {
    params: {} as any,
    retry: { times: 3, delay: 1000 },
    cache: { ttl: 5 * 60 * 1000 },
    label: '获取客户退货统计',
  }) as CustomerReturnHeadView[];

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
 * 获取客户退货单的总数量
 *
 * @example
 * const totalQty = await getCustomerReturnTotalQty(1)
 */
export async function getCustomerReturnTotalQty(id: number): Promise<number> {
  const customerReturn = await getCustomerReturn(id);
  return customerReturn.lines?.reduce((sum, line) => sum + Number(line.return_qty), 0) || 0;
}

/**
 * 获取客户退货单的物料数量
 *
 * @example
 * const materialCount = await getCustomerReturnMaterialCount(1)
 */
export async function getCustomerReturnMaterialCount(id: number): Promise<number> {
  const customerReturn = await getCustomerReturn(id);
  return new Set(customerReturn.lines?.map(line => line.material_id)).size;
}

/**
 * 检查客户退货单是否可编辑
 *
 * @example
 * const canEdit = await canEditCustomerReturn(1)
 */
export async function canEditCustomerReturn(id: number): Promise<boolean> {
  try {
    const customerReturn = await getCustomerReturn(id);
    return customerReturn.status === 'PENDING';
  } catch {
    return false;
  }
}

/**
 * 检查客户退货单是否可提交
 *
 * @example
 * const canSubmit = await canSubmitCustomerReturn(1)
 */
export async function canSubmitCustomerReturn(id: number): Promise<boolean> {
  try {
    const customerReturn = await getCustomerReturn(id);
    // 所有行都已判定才能提交
    const allJudged = customerReturn.lines?.every(line => line.judge_result) || false;
    return customerReturn.status === 'PENDING' && allJudged;
  } catch {
    return false;
  }
}

/**
 * 检查客户退货单是否可判定
 *
 * @example
 * const canJudge = await canJudgeCustomerReturn(1)
 */
export async function canJudgeCustomerReturn(id: number): Promise<boolean> {
  try {
    const customerReturn = await getCustomerReturn(id);
    return customerReturn.status === 'PENDING';
  } catch {
    return false;
  }
}

/**
 * 获取待判定的客户退货单
 *
 * @example
 * const pending = await getPendingJudgeCustomerReturns()
 */
export async function getPendingJudgeCustomerReturns() {
  const returns = await getCustomerReturnsByStatus('PENDING');
  return returns.filter(ret => {
    const hasUnjudged = ret.lines?.some(line => !line.judge_result);
    return hasUnjudged;
  });
}

/**
 * 获取客户退货单的打印数据
 *
 * @example
 * const printData = await getCustomerReturnPrintData(1)
 */
export async function getCustomerReturnPrintData(id: number) {
  const customerReturn = await getCustomerReturn(id);

  return {
    header: {
      return_no: customerReturn.return_no,
      customer_name: customerReturn.customer_name,
      return_date: customerReturn.return_date,
      status: customerReturn.status,
    },
    lines: customerReturn.lines?.map(line => ({
      line_no: line.line_no,
      material_code: line.material_code,
      material_name: line.material_name,
      return_qty: line.return_qty,
      unit: line.unit,
      reason: line.reason,
      judge_result: line.judge_result,
      judge_qty: line.judge_qty,
    })) || [],
    summary: {
      total_lines: customerReturn.lines?.length || 0,
      total_qty: customerReturn.lines?.reduce((sum, line) => sum + Number(line.return_qty), 0) || 0,
      judged_lines: customerReturn.lines?.filter(line => line.judge_result).length || 0,
    },
  };
}

// ============================================================================
// 缓存管理
// ============================================================================

/**
 * 清除客户退货相关缓存
 */
export function clearCustomerReturnCache() {
  enhancedApi.clearCache('customer-returns');
  enhancedApi.clearCache('status:');
  enhancedApi.clearCache('customer:');
  enhancedApi.clearCache('material:');
  enhancedApi.clearCache('date:');
  enhancedApi.clearCache('no:');
}
