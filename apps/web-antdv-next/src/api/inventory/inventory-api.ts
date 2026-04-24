/**
 * 库存管理 API
 *
 * 提供库存事务提交、余额查询、流水查询等核心功能
 */

import type { Schema } from '../shared/helpers';
import { api } from '../shared/client-factory';
import { enhancedApi } from '../shared/enhanced-client';

// ============================================================================
// 类型定义
// ============================================================================

export type CommitTxnCommand = Schema<'CommitTxnCommand'>;
export type CommitTxnResult = Schema<'CommitTxnResult'>;
export type BalanceView = Schema<'BalanceView'>;
export type TxnHeadView = Schema<'TxnHeadView'>;
export type TxnLineView = Schema<'TxnLineView'>;
export type PageResponse<T> = Schema<'PageResponse'> & { data: T[] };

export interface QueryBalance {
  material_id?: number;
  wh_id?: number;
  loc_id?: number;
  batch_no?: string;
  stock_status?: string;
}

export interface QueryTxns {
  txn_no?: string;
  txn_type?: string;
  io_flag?: string;
  source_doc_type?: string;
  source_doc_id?: number;
  date_from?: string;
  date_to?: string;
}

export interface PageQuery {
  page?: number;
  page_size?: number;
}

// ============================================================================
// 库存事务操作
// ============================================================================

/**
 * 提交库存事务
 *
 * @example
 * const result = await commitInventoryTxn({
 *   txn_type: 'INBOUND',
 *   io_flag: 'IN',
 *   source_doc_type: 'INBOUND',
 *   source_doc_id: 1,
 *   txn_date: '2026-04-23',
 *   lines: [
 *     {
 *       material_id: 1,
 *       wh_id: 1,
 *       loc_id: 1,
 *       batch_no: 'B001',
 *       qty: 100,
 *       unit: 'PCS',
 *       stock_status: 'QUALIFIED'
 *     }
 *   ]
 * })
 */
export async function commitInventoryTxn(data: CommitTxnCommand) {
  return api.post('/api/v1/inventory/txn', data) as Promise<CommitTxnResult>;
}

// ============================================================================
// 库存余额查询
// ============================================================================

/**
 * 查询库存余额（分页）
 *
 * @example
 * const balances = await listInventoryBalance({
 *   material_id: 1,
 *   wh_id: 1,
 *   page: 1,
 *   page_size: 20
 * })
 */
export async function listInventoryBalance(params: QueryBalance & PageQuery) {
  return api.get('/api/v1/inventory/balance', {
    params: params as any,
  }) as Promise<PageResponse<BalanceView>>;
}

/**
 * 查询指定物料的库存余额
 *
 * @example
 * const balances = await getInventoryBalanceByMaterial(1, { page: 1, page_size: 20 })
 */
export async function getInventoryBalanceByMaterial(
  materialId: number,
  pageQuery?: PageQuery
) {
  return listInventoryBalance({
    material_id: materialId,
    ...pageQuery,
  });
}

/**
 * 查询指定仓库的库存余额
 *
 * @example
 * const balances = await getInventoryBalanceByWarehouse(1, { page: 1, page_size: 20 })
 */
export async function getInventoryBalanceByWarehouse(
  whId: number,
  pageQuery?: PageQuery
) {
  return listInventoryBalance({
    wh_id: whId,
    ...pageQuery,
  });
}

/**
 * 查询指定仓位的库存余额
 *
 * @example
 * const balances = await getInventoryBalanceByLocation(1, { page: 1, page_size: 20 })
 */
export async function getInventoryBalanceByLocation(
  locId: number,
  pageQuery?: PageQuery
) {
  return listInventoryBalance({
    loc_id: locId,
    ...pageQuery,
  });
}

/**
 * 查询指定批次的库存余额
 *
 * @example
 * const balances = await getInventoryBalanceByBatch('B001', { page: 1, page_size: 20 })
 */
export async function getInventoryBalanceByBatch(
  batchNo: string,
  pageQuery?: PageQuery
) {
  return listInventoryBalance({
    batch_no: batchNo,
    ...pageQuery,
  });
}

/**
 * 查询指定库存状态的余额
 *
 * @example
 * const balances = await getInventoryBalanceByStatus('QUALIFIED', { page: 1, page_size: 20 })
 */
export async function getInventoryBalanceByStatus(
  stockStatus: string,
  pageQuery?: PageQuery
) {
  return listInventoryBalance({
    stock_status: stockStatus,
    ...pageQuery,
  });
}

// ============================================================================
// 库存流水查询
// ============================================================================

/**
 * 查询库存流水（分页）
 *
 * @example
 * const txns = await listInventoryTxns({
 *   txn_type: 'INBOUND',
 *   date_from: '2026-04-01',
 *   date_to: '2026-04-30',
 *   page: 1,
 *   page_size: 20
 * })
 */
export async function listInventoryTxns(params: QueryTxns & PageQuery) {
  return api.get('/api/v1/inventory/txn', {
    params: params as any,
  }) as Promise<PageResponse<TxnHeadView>>;
}

/**
 * 查询库存流水明细行
 *
 * @example
 * const lines = await getInventoryTxnLines(1)
 */
export async function getInventoryTxnLines(txnId: number) {
  return api.get('/api/v1/inventory/txn/{id}', {
    pathParams: { id: txnId },
  }) as Promise<TxnLineView[]>;
}

/**
 * 按事务类型查询流水
 *
 * @example
 * const txns = await getInventoryTxnsByType('INBOUND', { page: 1, page_size: 20 })
 */
export async function getInventoryTxnsByType(
  txnType: string,
  pageQuery?: PageQuery
) {
  return listInventoryTxns({
    txn_type: txnType,
    ...pageQuery,
  });
}

/**
 * 按出入库标志查询流水
 *
 * @example
 * const txns = await getInventoryTxnsByIoFlag('IN', { page: 1, page_size: 20 })
 */
export async function getInventoryTxnsByIoFlag(
  ioFlag: string,
  pageQuery?: PageQuery
) {
  return listInventoryTxns({
    io_flag: ioFlag,
    ...pageQuery,
  });
}

/**
 * 按源单据查询流水
 *
 * @example
 * const txns = await getInventoryTxnsBySourceDoc('INBOUND', 1, { page: 1, page_size: 20 })
 */
export async function getInventoryTxnsBySourceDoc(
  sourceDocType: string,
  sourceDocId: number,
  pageQuery?: PageQuery
) {
  return listInventoryTxns({
    source_doc_type: sourceDocType,
    source_doc_id: sourceDocId,
    ...pageQuery,
  });
}

/**
 * 按日期范围查询流水
 *
 * @example
 * const txns = await getInventoryTxnsByDateRange('2026-04-01', '2026-04-30', { page: 1, page_size: 20 })
 */
export async function getInventoryTxnsByDateRange(
  dateFrom: string,
  dateTo: string,
  pageQuery?: PageQuery
) {
  return listInventoryTxns({
    date_from: dateFrom,
    date_to: dateTo,
    ...pageQuery,
  });
}

/**
 * 搜索流水（按单号）
 *
 * @example
 * const txns = await searchInventoryTxnsByNo('TXN', { page: 1, page_size: 20 })
 */
export async function searchInventoryTxnsByNo(
  txnNo: string,
  pageQuery?: PageQuery
) {
  if (!txnNo.trim()) {
    return { data: [], total: 0, page: 1, page_size: 20 } as PageResponse<TxnHeadView>;
  }

  return listInventoryTxns({
    txn_no: txnNo,
    ...pageQuery,
  });
}

// ============================================================================
// 业务逻辑封装（使用 enhancedApi）
// ============================================================================

/**
 * 获取物料的总库存数量（所有仓库）
 *
 * @example
 * const totalQty = await getMaterialTotalQty(1)
 */
export async function getMaterialTotalQty(materialId: number): Promise<number> {
  const result = await listInventoryBalance({
    material_id: materialId,
    page: 1,
    page_size: 1000, // 假设不会超过1000条
  });

  return result.data.reduce((sum, balance) => sum + Number(balance.qty), 0);
}

/**
 * 获取物料在指定仓库的库存数量
 *
 * @example
 * const qty = await getMaterialQtyInWarehouse(1, 1)
 */
export async function getMaterialQtyInWarehouse(
  materialId: number,
  whId: number
): Promise<number> {
  const result = await listInventoryBalance({
    material_id: materialId,
    wh_id: whId,
    page: 1,
    page_size: 1000,
  });

  return result.data.reduce((sum, balance) => sum + Number(balance.qty), 0);
}

/**
 * 获取物料在指定仓位的库存数量
 *
 * @example
 * const qty = await getMaterialQtyInLocation(1, 1)
 */
export async function getMaterialQtyInLocation(
  materialId: number,
  locId: number
): Promise<number> {
  const result = await listInventoryBalance({
    material_id: materialId,
    loc_id: locId,
    page: 1,
    page_size: 1000,
  });

  return result.data.reduce((sum, balance) => sum + Number(balance.qty), 0);
}

/**
 * 获取物料的合格品库存数量
 *
 * @example
 * const qualifiedQty = await getMaterialQualifiedQty(1)
 */
export async function getMaterialQualifiedQty(materialId: number): Promise<number> {
  const result = await listInventoryBalance({
    material_id: materialId,
    stock_status: 'QUALIFIED',
    page: 1,
    page_size: 1000,
  });

  return result.data.reduce((sum, balance) => sum + Number(balance.qty), 0);
}

/**
 * 获取仓库的库存统计
 *
 * @example
 * const stats = await getWarehouseInventoryStats(1)
 */
export async function getWarehouseInventoryStats(whId: number) {
  const result = await listInventoryBalance({
    wh_id: whId,
    page: 1,
    page_size: 10000, // 假设不会超过10000条
  });

  const totalQty = result.data.reduce((sum, balance) => sum + Number(balance.qty), 0);
  const materialCount = new Set(result.data.map(b => b.material_id)).size;
  const locationCount = new Set(result.data.map(b => b.loc_id)).size;

  const statusCount = result.data.reduce((acc, balance) => {
    acc[balance.stock_status] = (acc[balance.stock_status] || 0) + Number(balance.qty);
    return acc;
  }, {} as Record<string, number>);

  return {
    totalQty,
    materialCount,
    locationCount,
    byStatus: statusCount,
  };
}

/**
 * 获取库存流水统计
 *
 * @example
 * const stats = await getInventoryTxnStats('2026-04-01', '2026-04-30')
 */
export async function getInventoryTxnStats(dateFrom: string, dateTo: string) {
  const result = await listInventoryTxns({
    date_from: dateFrom,
    date_to: dateTo,
    page: 1,
    page_size: 10000,
  });

  const typeCount = result.data.reduce((acc, txn) => {
    acc[txn.txn_type] = (acc[txn.txn_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const ioCount = result.data.reduce((acc, txn) => {
    acc[txn.io_flag] = (acc[txn.io_flag] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    total: result.total,
    byType: typeCount,
    byIoFlag: ioCount,
  };
}

/**
 * 批量获取流水明细
 *
 * @example
 * const linesArray = await batchGetInventoryTxnLines([1, 2, 3])
 */
export async function batchGetInventoryTxnLines(txnIds: number[]) {
  return enhancedApi.batch(
    txnIds.map((id) => () => getInventoryTxnLines(id))
  );
}

/**
 * 检查物料是否有库存
 *
 * @example
 * const hasStock = await hasMaterialStock(1)
 */
export async function hasMaterialStock(materialId: number): Promise<boolean> {
  try {
    const qty = await getMaterialTotalQty(materialId);
    return qty > 0;
  } catch {
    return false;
  }
}

/**
 * 检查物料在指定仓库是否有库存
 *
 * @example
 * const hasStock = await hasMaterialStockInWarehouse(1, 1)
 */
export async function hasMaterialStockInWarehouse(
  materialId: number,
  whId: number
): Promise<boolean> {
  try {
    const qty = await getMaterialQtyInWarehouse(materialId, whId);
    return qty > 0;
  } catch {
    return false;
  }
}

/**
 * 获取物料的批次列表
 *
 * @example
 * const batches = await getMaterialBatches(1)
 */
export async function getMaterialBatches(materialId: number): Promise<string[]> {
  const result = await listInventoryBalance({
    material_id: materialId,
    page: 1,
    page_size: 1000,
  });

  const batches = new Set(result.data.map(b => b.batch_no));
  return Array.from(batches);
}

/**
 * 获取物料在指定批次的库存数量
 *
 * @example
 * const qty = await getMaterialBatchQty(1, 'B001')
 */
export async function getMaterialBatchQty(
  materialId: number,
  batchNo: string
): Promise<number> {
  const result = await listInventoryBalance({
    material_id: materialId,
    batch_no: batchNo,
    page: 1,
    page_size: 1000,
  });

  return result.data.reduce((sum, balance) => sum + Number(balance.qty), 0);
}

// ============================================================================
// 缓存管理
// ============================================================================

/**
 * 清除库存余额缓存
 */
export function clearInventoryBalanceCache() {
  enhancedApi.clearCache('balance');
}

/**
 * 清除库存流水缓存
 */
export function clearInventoryTxnCache() {
  enhancedApi.clearCache('txn');
}
