/**
 * 不良品 API
 *
 * 提供不良品单的完整生命周期管理，包括待拆解、待报废、待返工查询
 */

import type { Schema } from '../types';
import { api } from '../client-factory';
import { enhancedApi } from '../enhanced-client';

// ============================================================================
// 类型定义
// ============================================================================

export type DefectHeadView = Schema<'DefectHeadView'>;
export type CreateDefectCommand = Schema<'CreateDefectCommand'>;
export type UpdateDefectCommand = Schema<'UpdateDefectCommand'>;
export type SubmitDefectResult = Schema<'SubmitDefectResult'>;

export interface QueryDefects {
  defect_no?: string;
  status?: string;
  material_id?: number;
  defect_type?: string;
  handle_method?: string;
  date_from?: string;
  date_to?: string;
}

// ============================================================================
// 基础 CRUD 操作
// ============================================================================

/**
 * 获取不良品单列表
 *
 * @example
 * const defects = await listDefects({ status: 'PENDING' })
 */
export async function listDefects(params?: QueryDefects) {
  return api.get('/api/v1/defects', {
    params: params as any,
  }) as Promise<DefectHeadView[]>;
}

/**
 * 获取不良品单详情
 *
 * @example
 * const defect = await getDefect(1)
 */
export async function getDefect(id: number) {
  return api.get('/api/v1/defects/{id}', {
    pathParams: { id },
  }) as Promise<DefectHeadView>;
}

/**
 * 创建不良品单
 *
 * @example
 * const newDefect = await createDefect({
 *   defect_date: '2026-04-23',
 *   defect_type: 'PRODUCTION',
 *   lines: [
 *     {
 *       line_no: 1,
 *       material_id: 1,
 *       defect_qty: 10,
 *       unit: 'PCS',
 *       defect_reason: '尺寸不符',
 *       handle_method: 'SCRAP'
 *     }
 *   ]
 * })
 */
export async function createDefect(data: CreateDefectCommand) {
  return api.post('/api/v1/defects', data) as Promise<DefectHeadView>;
}

/**
 * 更新不良品单
 *
 * @example
 * const updated = await updateDefect(1, {
 *   defect_type: 'PRODUCTION',
 *   lines: [...]
 * })
 */
export async function updateDefect(id: number, data: UpdateDefectCommand) {
  return api.put('/api/v1/defects/{id}', data, {
    pathParams: { id },
  }) as Promise<DefectHeadView>;
}

/**
 * 删除不良品单
 *
 * @example
 * await deleteDefect(1)
 */
export async function deleteDefect(id: number) {
  return api.delete('/api/v1/defects/{id}', {
    pathParams: { id },
  });
}

// ============================================================================
// 业务操作
// ============================================================================

/**
 * 提交不良品单
 *
 * @example
 * const result = await submitDefect(1)
 */
export async function submitDefect(id: number) {
  return api.post('/api/v1/defects/{id}/submit', {}, {
    pathParams: { id },
  }) as Promise<SubmitDefectResult>;
}

/**
 * 作废不良品单
 *
 * @example
 * await voidDefect(1)
 */
export async function voidDefect(id: number) {
  return api.post('/api/v1/defects/{id}/void', {}, {
    pathParams: { id },
  });
}

/**
 * 获取待拆解不良品列表
 *
 * @example
 * const pending = await getPendingDismantleDefects()
 */
export async function getPendingDismantleDefects() {
  return api.get('/api/v1/defects/pending-dismantle') as Promise<DefectHeadView[]>;
}

/**
 * 获取待报废不良品列表
 *
 * @example
 * const pending = await getPendingScrapDefects()
 */
export async function getPendingScrapDefects() {
  return api.get('/api/v1/defects/pending-scrap') as Promise<DefectHeadView[]>;
}

/**
 * 获取待返工不良品列表
 *
 * @example
 * const pending = await getPendingReworkDefects()
 */
export async function getPendingReworkDefects() {
  return api.get('/api/v1/defects/pending-rework') as Promise<DefectHeadView[]>;
}

// ============================================================================
// 业务逻辑封装（使用 enhancedApi）
// ============================================================================

/**
 * 按状态获取不良品单（带缓存）
 *
 * @example
 * const pending = await getDefectsByStatus('PENDING')
 */
export async function getDefectsByStatus(status: string) {
  return enhancedApi.get('/api/v1/defects', {
    params: { status } as any,
    cache: { ttl: 2 * 60 * 1000, key: `status:${status}` },
    label: `获取${status}状态不良品单`,
  }) as Promise<DefectHeadView[]>;
}

/**
 * 按不良类型获取不良品单
 *
 * @example
 * const defects = await getDefectsByType('PRODUCTION')
 */
export async function getDefectsByType(defectType: string) {
  return enhancedApi.get('/api/v1/defects', {
    params: { defect_type: defectType } as any,
    cache: { ttl: 2 * 60 * 1000, key: `type:${defectType}` },
    label: `获取${defectType}类型不良品单`,
  }) as Promise<DefectHeadView[]>;
}

/**
 * 按处理方式获取不良品单
 *
 * @example
 * const defects = await getDefectsByHandleMethod('SCRAP')
 */
export async function getDefectsByHandleMethod(handleMethod: string) {
  return enhancedApi.get('/api/v1/defects', {
    params: { handle_method: handleMethod } as any,
    cache: { ttl: 2 * 60 * 1000, key: `handle:${handleMethod}` },
    label: `获取${handleMethod}处理方式不良品单`,
  }) as Promise<DefectHeadView[]>;
}

/**
 * 按物料获取不良品单
 *
 * @example
 * const defects = await getDefectsByMaterial(1)
 */
export async function getDefectsByMaterial(materialId: number) {
  return enhancedApi.get('/api/v1/defects', {
    params: { material_id: materialId } as any,
    cache: { ttl: 2 * 60 * 1000, key: `material:${materialId}` },
    label: `获取物料${materialId}的不良品单`,
  }) as Promise<DefectHeadView[]>;
}

/**
 * 按日期范围获取不良品单
 *
 * @example
 * const defects = await getDefectsByDateRange('2026-04-01', '2026-04-30')
 */
export async function getDefectsByDateRange(dateFrom: string, dateTo: string) {
  return enhancedApi.get('/api/v1/defects', {
    params: { date_from: dateFrom, date_to: dateTo } as any,
    cache: { ttl: 5 * 60 * 1000, key: `date:${dateFrom}:${dateTo}` },
    label: `获取${dateFrom}至${dateTo}的不良品单`,
  }) as Promise<DefectHeadView[]>;
}

/**
 * 搜索不良品单（按单号）
 *
 * @example
 * const defects = await searchDefectsByNo('DF')
 */
export async function searchDefectsByNo(defectNo: string) {
  if (!defectNo.trim()) {
    return [];
  }

  return enhancedApi.get('/api/v1/defects', {
    params: { defect_no: defectNo } as any,
    cache: { ttl: 2 * 60 * 1000, key: `no:${defectNo}` },
    label: `搜索不良品单号: ${defectNo}`,
  }) as Promise<DefectHeadView[]>;
}

/**
 * 获取待拆解不良品（带缓存）
 *
 * @example
 * const pending = await getCachedPendingDismantleDefects()
 */
export async function getCachedPendingDismantleDefects() {
  return enhancedApi.get('/api/v1/defects/pending-dismantle', {
    cache: { ttl: 2 * 60 * 1000 },
    label: '获取待拆解不良品',
  }) as Promise<DefectHeadView[]>;
}

/**
 * 获取待报废不良品（带缓存）
 *
 * @example
 * const pending = await getCachedPendingScrapDefects()
 */
export async function getCachedPendingScrapDefects() {
  return enhancedApi.get('/api/v1/defects/pending-scrap', {
    cache: { ttl: 2 * 60 * 1000 },
    label: '获取待报废不良品',
  }) as Promise<DefectHeadView[]>;
}

/**
 * 获取待返工不良品（带缓存）
 *
 * @example
 * const pending = await getCachedPendingReworkDefects()
 */
export async function getCachedPendingReworkDefects() {
  return enhancedApi.get('/api/v1/defects/pending-rework', {
    cache: { ttl: 2 * 60 * 1000 },
    label: '获取待返工不良品',
  }) as Promise<DefectHeadView[]>;
}

/**
 * 批量获取不良品单详情
 *
 * @example
 * const defects = await batchGetDefects([1, 2, 3])
 */
export async function batchGetDefects(ids: number[]) {
  return enhancedApi.batch(
    ids.map((id) => () => getDefect(id))
  );
}

/**
 * 批量提交不良品单
 *
 * @example
 * await batchSubmitDefects([1, 2, 3])
 */
export async function batchSubmitDefects(ids: number[]) {
  return enhancedApi.batch(
    ids.map((id) => () => submitDefect(id))
  );
}

/**
 * 批量作废不良品单
 *
 * @example
 * await batchVoidDefects([1, 2, 3])
 */
export async function batchVoidDefects(ids: number[]) {
  return enhancedApi.batch(
    ids.map((id) => () => voidDefect(id))
  );
}

/**
 * 获取不良品单统计信息（带重试）
 *
 * @example
 * const stats = await getDefectStats()
 */
export async function getDefectStats() {
  const result = await enhancedApi.get('/api/v1/defects', {
    params: {} as any,
    retry: { times: 3, delay: 1000 },
    cache: { ttl: 5 * 60 * 1000 },
    label: '获取不良品统计',
  }) as DefectHeadView[];

  const statusCount = result.reduce((acc, defect) => {
    acc[defect.status] = (acc[defect.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const typeCount = result.reduce((acc, defect) => {
    acc[defect.defect_type] = (acc[defect.defect_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleMethodCount = result.reduce((acc, defect) => {
    defect.lines?.forEach(line => {
      if (line.handle_method) {
        acc[line.handle_method] = (acc[line.handle_method] || 0) + 1;
      }
    });
    return acc;
  }, {} as Record<string, number>);

  const totalQty = result.reduce((sum, defect) => {
    return sum + (defect.lines?.reduce((lineSum, line) => lineSum + Number(line.defect_qty), 0) || 0);
  }, 0);

  return {
    total: result.length,
    byStatus: statusCount,
    byType: typeCount,
    byHandleMethod: handleMethodCount,
    totalQty,
  };
}

/**
 * 获取不良品单的总数量
 *
 * @example
 * const totalQty = await getDefectTotalQty(1)
 */
export async function getDefectTotalQty(id: number): Promise<number> {
  const defect = await getDefect(id);
  return defect.lines?.reduce((sum, line) => sum + Number(line.defect_qty), 0) || 0;
}

/**
 * 获取不良品单的物料数量
 *
 * @example
 * const materialCount = await getDefectMaterialCount(1)
 */
export async function getDefectMaterialCount(id: number): Promise<number> {
  const defect = await getDefect(id);
  return new Set(defect.lines?.map(line => line.material_id)).size;
}

/**
 * 检查不良品单是否可编辑
 *
 * @example
 * const canEdit = await canEditDefect(1)
 */
export async function canEditDefect(id: number): Promise<boolean> {
  try {
    const defect = await getDefect(id);
    return defect.status === 'PENDING';
  } catch {
    return false;
  }
}

/**
 * 检查不良品单是否可提交
 *
 * @example
 * const canSubmit = await canSubmitDefect(1)
 */
export async function canSubmitDefect(id: number): Promise<boolean> {
  try {
    const defect = await getDefect(id);
    return defect.status === 'PENDING' && (defect.lines?.length || 0) > 0;
  } catch {
    return false;
  }
}

/**
 * 获取不良品待办统计
 *
 * @example
 * const todo = await getDefectTodoStats()
 */
export async function getDefectTodoStats() {
  const [dismantle, scrap, rework] = await Promise.all([
    getCachedPendingDismantleDefects(),
    getCachedPendingScrapDefects(),
    getCachedPendingReworkDefects(),
  ]);

  return {
    pendingDismantle: dismantle.length,
    pendingScrap: scrap.length,
    pendingRework: rework.length,
    total: dismantle.length + scrap.length + rework.length,
  };
}

/**
 * 获取不良品单的打印数据
 *
 * @example
 * const printData = await getDefectPrintData(1)
 */
export async function getDefectPrintData(id: number) {
  const defect = await getDefect(id);

  return {
    header: {
      defect_no: defect.defect_no,
      defect_date: defect.defect_date,
      defect_type: defect.defect_type,
      status: defect.status,
    },
    lines: defect.lines?.map(line => ({
      line_no: line.line_no,
      material_code: line.material_code,
      material_name: line.material_name,
      defect_qty: line.defect_qty,
      unit: line.unit,
      defect_reason: line.defect_reason,
      handle_method: line.handle_method,
    })) || [],
    summary: {
      total_lines: defect.lines?.length || 0,
      total_qty: defect.lines?.reduce((sum, line) => sum + Number(line.defect_qty), 0) || 0,
    },
  };
}

// ============================================================================
// 缓存管理
// ============================================================================

/**
 * 清除不良品相关缓存
 */
export function clearDefectCache() {
  enhancedApi.clearCache('defects');
  enhancedApi.clearCache('status:');
  enhancedApi.clearCache('type:');
  enhancedApi.clearCache('handle:');
  enhancedApi.clearCache('material:');
  enhancedApi.clearCache('date:');
  enhancedApi.clearCache('no:');
  enhancedApi.clearCache('pending-dismantle');
  enhancedApi.clearCache('pending-scrap');
  enhancedApi.clearCache('pending-rework');
}
