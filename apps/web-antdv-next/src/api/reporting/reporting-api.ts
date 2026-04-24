/**
 * 报表 API
 *
 * 提供各类报表查询功能，包括库龄、呆滞、异常汇总、流水、库存、预警、待办、仪表盘等
 */

import type { Schema } from '../types';
import { api } from '../client-factory';
import { enhancedApi } from '../enhanced-client';

// ============================================================================
// 类型定义
// ============================================================================

export type AgingBucketRow = Schema<'AgingBucketRow'>;
export type DormantRow = Schema<'DormantRow'>;
export type ExceptionSummaryRow = Schema<'ExceptionSummaryRow'>;
export type TxnFlowRow = Schema<'TxnFlowRow'>;
export type InventoryByMaterialRow = Schema<'InventoryByMaterialRow'>;
export type InventoryByLocationRow = Schema<'InventoryByLocationRow'>;
export type LowStockWarningRow = Schema<'LowStockWarningRow'>;
export type AnomalyTodoRow = Schema<'AnomalyTodoRow'>;
export type TodayIoRow = Schema<'TodayIoRow'>;
export type DefectStats30dRow = Schema<'DefectStats30dRow'>;
export type OutsourceInTransitRow = Schema<'OutsourceInTransitRow'>;
export type DashboardData = Schema<'DashboardData'>;
export type PageResponse<T> = Schema<'PageResponse'> & { data: T[] };

export interface QueryAging {
  wh_id?: number;
  material_id?: number;
  page?: number;
  page_size?: number;
}

export interface QueryDormant {
  wh_id?: number;
  material_id?: number;
  days?: number;
  page?: number;
  page_size?: number;
}

export interface QueryExceptionSummary {
  date_from?: string;
  date_to?: string;
  wh_id?: number;
}

export interface QueryTxnFlow {
  date_from?: string;
  date_to?: string;
  material_id?: number;
  wh_id?: number;
  txn_type?: string;
}

export interface QueryInventoryByMaterial {
  wh_id?: number;
  material_id?: number;
  stock_status?: string;
}

export interface QueryInventoryByLocation {
  wh_id?: number;
  loc_id?: number;
  material_id?: number;
}

export interface QueryLowStockWarning {
  wh_id?: number;
  material_id?: number;
}

export interface QueryAnomalyTodo {
  wh_id?: number;
  todo_type?: string;
}

export interface QueryTodayIo {
  wh_id?: number;
}

export interface QueryDefectStats30d {
  material_id?: number;
  defect_type?: string;
}

export interface QueryOutsourceInTransit {
  supplier_id?: number;
  material_id?: number;
}

// ============================================================================
// 报表查询
// ============================================================================

/**
 * 库龄报表
 *
 * @example
 * const aging = await getAgingReport({ wh_id: 1, page: 1, page_size: 20 })
 */
export async function getAgingReport(params?: QueryAging) {
  return api.get('/api/v1/reports/aging', {
    params: params as any,
  }) as Promise<PageResponse<AgingBucketRow>>;
}

/**
 * 呆滞报表
 *
 * @example
 * const dormant = await getDormantReport({ days: 90, page: 1, page_size: 20 })
 */
export async function getDormantReport(params?: QueryDormant) {
  return api.get('/api/v1/reports/dormant', {
    params: params as any,
  }) as Promise<PageResponse<DormantRow>>;
}

/**
 * 异常汇总报表
 *
 * @example
 * const summary = await getExceptionSummaryReport({
 *   date_from: '2026-04-01',
 *   date_to: '2026-04-30'
 * })
 */
export async function getExceptionSummaryReport(params?: QueryExceptionSummary) {
  return api.get('/api/v1/reports/exception-summary', {
    params: params as any,
  }) as Promise<ExceptionSummaryRow[]>;
}

/**
 * 流水报表
 *
 * @example
 * const flow = await getTxnFlowReport({
 *   date_from: '2026-04-01',
 *   date_to: '2026-04-30',
 *   material_id: 1
 * })
 */
export async function getTxnFlowReport(params?: QueryTxnFlow) {
  return api.get('/api/v1/reports/txn-flow', {
    params: params as any,
  }) as Promise<TxnFlowRow[]>;
}

/**
 * 按物料库存报表
 *
 * @example
 * const inventory = await getInventoryByMaterialReport({ wh_id: 1 })
 */
export async function getInventoryByMaterialReport(params?: QueryInventoryByMaterial) {
  return api.get('/api/v1/reports/inventory-by-material', {
    params: params as any,
  }) as Promise<InventoryByMaterialRow[]>;
}

/**
 * 按仓位库存报表
 *
 * @example
 * const inventory = await getInventoryByLocationReport({ wh_id: 1 })
 */
export async function getInventoryByLocationReport(params?: QueryInventoryByLocation) {
  return api.get('/api/v1/reports/inventory-by-location', {
    params: params as any,
  }) as Promise<InventoryByLocationRow[]>;
}

/**
 * 低库存预警报表
 *
 * @example
 * const warnings = await getLowStockWarningReport({ wh_id: 1 })
 */
export async function getLowStockWarningReport(params?: QueryLowStockWarning) {
  return api.get('/api/v1/reports/low-stock-warning', {
    params: params as any,
  }) as Promise<LowStockWarningRow[]>;
}

/**
 * 异常待办报表
 *
 * @example
 * const todos = await getAnomalyTodoReport({ todo_type: 'DEFECT' })
 */
export async function getAnomalyTodoReport(params?: QueryAnomalyTodo) {
  return api.get('/api/v1/reports/anomaly-todo', {
    params: params as any,
  }) as Promise<AnomalyTodoRow[]>;
}

/**
 * 今日出入库报表
 *
 * @example
 * const todayIo = await getTodayIoReport({ wh_id: 1 })
 */
export async function getTodayIoReport(params?: QueryTodayIo) {
  return api.get('/api/v1/reports/today-io', {
    params: params as any,
  }) as Promise<TodayIoRow[]>;
}

/**
 * 不良统计报表（近30天）
 *
 * @example
 * const stats = await getDefectStats30dReport({ defect_type: 'PRODUCTION' })
 */
export async function getDefectStats30dReport(params?: QueryDefectStats30d) {
  return api.get('/api/v1/reports/defect-stats', {
    params: params as any,
  }) as Promise<DefectStats30dRow[]>;
}

/**
 * 委外在途报表
 *
 * @example
 * const inTransit = await getOutsourceInTransitReport({ supplier_id: 1 })
 */
export async function getOutsourceInTransitReport(params?: QueryOutsourceInTransit) {
  return api.get('/api/v1/reports/outsource-in-transit', {
    params: params as any,
  }) as Promise<OutsourceInTransitRow[]>;
}

/**
 * 仪表盘数据
 *
 * @example
 * const dashboard = await getDashboardData()
 */
export async function getDashboardData() {
  return api.get('/api/v1/dashboard') as Promise<DashboardData>;
}

// ============================================================================
// 业务逻辑封装（使用 enhancedApi）
// ============================================================================

/**
 * 获取库龄报表（带缓存）
 *
 * @example
 * const aging = await getCachedAgingReport({ wh_id: 1 })
 */
export async function getCachedAgingReport(params?: QueryAging) {
  return enhancedApi.get('/api/v1/reports/aging', {
    params: params as any,
    cache: { ttl: 10 * 60 * 1000, key: `aging:${JSON.stringify(params)}` },
    label: '获取库龄报表',
  }) as Promise<PageResponse<AgingBucketRow>>;
}

/**
 * 获取呆滞报表（带缓存）
 *
 * @example
 * const dormant = await getCachedDormantReport({ days: 90 })
 */
export async function getCachedDormantReport(params?: QueryDormant) {
  return enhancedApi.get('/api/v1/reports/dormant', {
    params: params as any,
    cache: { ttl: 10 * 60 * 1000, key: `dormant:${JSON.stringify(params)}` },
    label: '获取呆滞报表',
  }) as Promise<PageResponse<DormantRow>>;
}

/**
 * 获取异常汇总报表（带缓存）
 *
 * @example
 * const summary = await getCachedExceptionSummaryReport({
 *   date_from: '2026-04-01',
 *   date_to: '2026-04-30'
 * })
 */
export async function getCachedExceptionSummaryReport(params?: QueryExceptionSummary) {
  return enhancedApi.get('/api/v1/reports/exception-summary', {
    params: params as any,
    cache: { ttl: 5 * 60 * 1000, key: `exception:${JSON.stringify(params)}` },
    label: '获取异常汇总报表',
  }) as Promise<ExceptionSummaryRow[]>;
}

/**
 * 获取流水报表（带缓存）
 *
 * @example
 * const flow = await getCachedTxnFlowReport({
 *   date_from: '2026-04-01',
 *   date_to: '2026-04-30'
 * })
 */
export async function getCachedTxnFlowReport(params?: QueryTxnFlow) {
  return enhancedApi.get('/api/v1/reports/txn-flow', {
    params: params as any,
    cache: { ttl: 5 * 60 * 1000, key: `flow:${JSON.stringify(params)}` },
    label: '获取流水报表',
  }) as Promise<TxnFlowRow[]>;
}

/**
 * 获取按物料库存报表（带缓存）
 *
 * @example
 * const inventory = await getCachedInventoryByMaterialReport({ wh_id: 1 })
 */
export async function getCachedInventoryByMaterialReport(params?: QueryInventoryByMaterial) {
  return enhancedApi.get('/api/v1/reports/inventory-by-material', {
    params: params as any,
    cache: { ttl: 2 * 60 * 1000, key: `inv-material:${JSON.stringify(params)}` },
    label: '获取按物料库存报表',
  }) as Promise<InventoryByMaterialRow[]>;
}

/**
 * 获取按仓位库存报表（带缓存）
 *
 * @example
 * const inventory = await getCachedInventoryByLocationReport({ wh_id: 1 })
 */
export async function getCachedInventoryByLocationReport(params?: QueryInventoryByLocation) {
  return enhancedApi.get('/api/v1/reports/inventory-by-location', {
    params: params as any,
    cache: { ttl: 2 * 60 * 1000, key: `inv-location:${JSON.stringify(params)}` },
    label: '获取按仓位库存报表',
  }) as Promise<InventoryByLocationRow[]>;
}

/**
 * 获取低库存预警报表（带缓存）
 *
 * @example
 * const warnings = await getCachedLowStockWarningReport({ wh_id: 1 })
 */
export async function getCachedLowStockWarningReport(params?: QueryLowStockWarning) {
  return enhancedApi.get('/api/v1/reports/low-stock-warning', {
    params: params as any,
    cache: { ttl: 5 * 60 * 1000, key: `low-stock:${JSON.stringify(params)}` },
    label: '获取低库存预警报表',
  }) as Promise<LowStockWarningRow[]>;
}

/**
 * 获取异常待办报表（带缓存）
 *
 * @example
 * const todos = await getCachedAnomalyTodoReport({ todo_type: 'DEFECT' })
 */
export async function getCachedAnomalyTodoReport(params?: QueryAnomalyTodo) {
  return enhancedApi.get('/api/v1/reports/anomaly-todo', {
    params: params as any,
    cache: { ttl: 2 * 60 * 1000, key: `anomaly:${JSON.stringify(params)}` },
    label: '获取异常待办报表',
  }) as Promise<AnomalyTodoRow[]>;
}

/**
 * 获取今日出入库报表（带缓存）
 *
 * @example
 * const todayIo = await getCachedTodayIoReport({ wh_id: 1 })
 */
export async function getCachedTodayIoReport(params?: QueryTodayIo) {
  return enhancedApi.get('/api/v1/reports/today-io', {
    params: params as any,
    cache: { ttl: 5 * 60 * 1000, key: `today-io:${JSON.stringify(params)}` },
    label: '获取今日出入库报表',
  }) as Promise<TodayIoRow[]>;
}

/**
 * 获取不良统计报表（带缓存）
 *
 * @example
 * const stats = await getCachedDefectStats30dReport({ defect_type: 'PRODUCTION' })
 */
export async function getCachedDefectStats30dReport(params?: QueryDefectStats30d) {
  return enhancedApi.get('/api/v1/reports/defect-stats', {
    params: params as any,
    cache: { ttl: 10 * 60 * 1000, key: `defect-stats:${JSON.stringify(params)}` },
    label: '获取不良统计报表',
  }) as Promise<DefectStats30dRow[]>;
}

/**
 * 获取委外在途报表（带缓存）
 *
 * @example
 * const inTransit = await getCachedOutsourceInTransitReport({ supplier_id: 1 })
 */
export async function getCachedOutsourceInTransitReport(params?: QueryOutsourceInTransit) {
  return enhancedApi.get('/api/v1/reports/outsource-in-transit', {
    params: params as any,
    cache: { ttl: 5 * 60 * 1000, key: `outsource-transit:${JSON.stringify(params)}` },
    label: '获取委外在途报表',
  }) as Promise<OutsourceInTransitRow[]>;
}

/**
 * 获取仪表盘数据（带缓存和重试）
 *
 * @example
 * const dashboard = await getCachedDashboardData()
 */
export async function getCachedDashboardData() {
  return enhancedApi.get('/api/v1/dashboard', {
    retry: { times: 3, delay: 1000 },
    cache: { ttl: 2 * 60 * 1000 },
    label: '获取仪表盘数据',
  }) as Promise<DashboardData>;
}

/**
 * 批量获取多个报表数据
 *
 * @example
 * const [aging, dormant, lowStock] = await batchGetReports([
 *   () => getCachedAgingReport({ wh_id: 1 }),
 *   () => getCachedDormantReport({ days: 90 }),
 *   () => getCachedLowStockWarningReport({ wh_id: 1 })
 * ])
 */
export async function batchGetReports<T>(reportFns: Array<() => Promise<T>>) {
  return enhancedApi.batch(reportFns);
}

/**
 * 获取库存概览（物料+仓位）
 *
 * @example
 * const overview = await getInventoryOverview({ wh_id: 1 })
 */
export async function getInventoryOverview(params?: { wh_id?: number }) {
  const [byMaterial, byLocation] = await Promise.all([
    getCachedInventoryByMaterialReport(params),
    getCachedInventoryByLocationReport(params),
  ]);

  return {
    byMaterial,
    byLocation,
    totalMaterials: byMaterial.length,
    totalLocations: byLocation.length,
    totalQty: byMaterial.reduce((sum, row) => sum + Number(row.qty), 0),
  };
}

/**
 * 获取异常概览（异常汇总+待办）
 *
 * @example
 * const overview = await getExceptionOverview({
 *   date_from: '2026-04-01',
 *   date_to: '2026-04-30'
 * })
 */
export async function getExceptionOverview(params?: { date_from?: string; date_to?: string }) {
  const [summary, todos] = await Promise.all([
    getCachedExceptionSummaryReport(params),
    getCachedAnomalyTodoReport({}),
  ]);

  return {
    summary,
    todos,
    totalExceptions: summary.reduce((sum, row) => sum + Number(row.count), 0),
    totalTodos: todos.length,
  };
}

/**
 * 获取预警概览（低库存+呆滞）
 *
 * @example
 * const overview = await getWarningOverview({ wh_id: 1 })
 */
export async function getWarningOverview(params?: { wh_id?: number; days?: number }) {
  const [lowStock, dormant] = await Promise.all([
    getCachedLowStockWarningReport({ wh_id: params?.wh_id }),
    getCachedDormantReport({ wh_id: params?.wh_id, days: params?.days || 90 }),
  ]);

  return {
    lowStock,
    dormant: dormant.data || [],
    totalLowStock: lowStock.length,
    totalDormant: dormant.total || 0,
  };
}

/**
 * 导出报表数据为 CSV 格式
 *
 * @example
 * const csv = exportReportToCsv(agingData, ['material_code', 'material_name', 'qty', 'aging_days'])
 */
export function exportReportToCsv<T extends Record<string, any>>(
  data: T[],
  columns: (keyof T)[]
): string {
  if (data.length === 0) return '';

  const headers = columns.join(',');
  const rows = data.map(row =>
    columns.map(col => {
      const value = row[col];
      // 处理包含逗号的值
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value}"`;
      }
      return value;
    }).join(',')
  );

  return [headers, ...rows].join('\n');
}

/**
 * 获取报表数据的统计摘要
 *
 * @example
 * const summary = getReportSummary(inventoryData, 'qty')
 */
export function getReportSummary<T extends Record<string, any>>(
  data: T[],
  numericField: keyof T
): {
  count: number;
  sum: number;
  avg: number;
  min: number;
  max: number;
} {
  if (data.length === 0) {
    return { count: 0, sum: 0, avg: 0, min: 0, max: 0 };
  }

  const values = data.map(row => Number(row[numericField]));
  const sum = values.reduce((acc, val) => acc + val, 0);
  const avg = sum / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);

  return {
    count: data.length,
    sum,
    avg: Number(avg.toFixed(2)),
    min,
    max,
  };
}

// ============================================================================
// 缓存管理
// ============================================================================

/**
 * 清除报表相关缓存
 */
export function clearReportingCache() {
  enhancedApi.clearCache('aging:');
  enhancedApi.clearCache('dormant:');
  enhancedApi.clearCache('exception:');
  enhancedApi.clearCache('flow:');
  enhancedApi.clearCache('inv-material:');
  enhancedApi.clearCache('inv-location:');
  enhancedApi.clearCache('low-stock:');
  enhancedApi.clearCache('anomaly:');
  enhancedApi.clearCache('today-io:');
  enhancedApi.clearCache('defect-stats:');
  enhancedApi.clearCache('outsource-transit:');
  enhancedApi.clearCache('dashboard');
}

/**
 * 清除特定报表缓存
 */
export function clearSpecificReportCache(reportType: string) {
  enhancedApi.clearCache(`${reportType}:`);
}
