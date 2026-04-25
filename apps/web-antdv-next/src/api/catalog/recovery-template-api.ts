/**
 * 回收拆解模板 API
 *
 * 提供回收拆解模板的完整 CRUD 操作和业务逻辑封装
 */

import type { Schema } from '../shared/helpers';
import { api } from '../shared/api';
import { enhancedApi } from '../shared/enhanced-api';

// ============================================================================
// 类型定义
// ============================================================================

export type RecoveryTplHeadView = Schema<'RecoveryTplHeadView'>;
export type RecoveryTplLineView = Schema<'RecoveryTplLineView'>;
export type RecoveryTplCreateBody = Schema<'CreateRecoveryTplCommand'>;
export type RecoveryTplUpdateBody = Schema<'UpdateRecoveryTplCommand'>;

export interface RecoveryTplListQuery {
  tpl_code?: string;
  source_material_id?: number;
  is_active?: boolean;
}

// ============================================================================
// 基础 CRUD 操作
// ============================================================================

/**
 * 获取回收拆解模板列表
 *
 * @example
 * const templates = await listRecoveryTemplates({ is_active: true })
 */
export async function listRecoveryTemplates(params?: RecoveryTplListQuery) {
  return api.get('/api/v1/recovery-templates', {
    params: params as any,
  }) as Promise<RecoveryTplHeadView[]>;
}

/**
 * 获取回收拆解模板详情
 *
 * @example
 * const template = await getRecoveryTemplate(1)
 */
export async function getRecoveryTemplate(id: number) {
  return api.get('/api/v1/recovery-templates/{id}', {
    pathParams: { id },
  }) as Promise<RecoveryTplHeadView>;
}

/**
 * 创建回收拆解模板
 *
 * @example
 * const newTemplate = await createRecoveryTemplate({
 *   tpl_code: 'REC001',
 *   tpl_name: '标准回收模板',
 *   source_material_id: 1,
 *   lines: [
 *     { line_no: 1, target_material_id: 2, default_recovery_qty: 1.0, scrap_flag: false }
 *   ]
 * })
 */
export async function createRecoveryTemplate(data: RecoveryTplCreateBody) {
  return api.post('/api/v1/recovery-templates', data) as Promise<RecoveryTplHeadView>;
}

/**
 * 更新回收拆解模板
 *
 * @example
 * const updated = await updateRecoveryTemplate(1, {
 *   tpl_name: '新回收模板',
 *   source_material_id: 1,
 *   is_active: true,
 *   lines: [...]
 * })
 */
export async function updateRecoveryTemplate(id: number, data: RecoveryTplUpdateBody) {
  return api.put('/api/v1/recovery-templates/{id}', data, {
    pathParams: { id },
  }) as Promise<RecoveryTplHeadView>;
}

/**
 * 删除回收拆解模板
 *
 * @example
 * await deleteRecoveryTemplate(1)
 */
export async function deleteRecoveryTemplate(id: number) {
  return api.delete('/api/v1/recovery-templates/{id}', {
    pathParams: { id },
  });
}

/**
 * 切换回收拆解模板启用状态
 *
 * @example
 * await toggleRecoveryTemplateActive(1, false)
 */
export async function toggleRecoveryTemplateActive(id: number, isActive: boolean) {
  return api.patch('/api/v1/recovery-templates/{id}/toggle-active',
    { is_active: isActive },
    { pathParams: { id } }
  ) as Promise<RecoveryTplHeadView>;
}

// ============================================================================
// 业务逻辑封装（使用 enhancedApi）
// ============================================================================

/**
 * 获取启用的回收拆解模板列表（带缓存）
 *
 * @example
 * const templates = await getActiveRecoveryTemplates()
 */
export async function getActiveRecoveryTemplates() {
  return enhancedApi.get('/api/v1/recovery-templates', {
    params: { is_active: true } as any,
    cache: { ttl: 5 * 60 * 1000 }, // 缓存 5 分钟
    label: '获取启用回收模板',
  }) as Promise<RecoveryTplHeadView[]>;
}

/**
 * 按源物料获取回收拆解模板（带缓存）
 *
 * @example
 * const templates = await getRecoveryTemplatesBySource(1)
 */
export async function getRecoveryTemplatesBySource(sourceMaterialId: number) {
  return enhancedApi.get('/api/v1/recovery-templates', {
    params: {
      source_material_id: sourceMaterialId,
      is_active: true,
    } as any,
    cache: { ttl: 5 * 60 * 1000, key: `source:${sourceMaterialId}` },
    label: `获取源物料回收模板: ${sourceMaterialId}`,
  }) as Promise<RecoveryTplHeadView[]>;
}

/**
 * 按模板代码搜索（带缓存）
 *
 * @example
 * const templates = await searchRecoveryTemplatesByCode('REC001')
 */
export async function searchRecoveryTemplatesByCode(code: string) {
  if (!code.trim()) {
    return [];
  }

  return enhancedApi.get('/api/v1/recovery-templates', {
    params: {
      tpl_code: code,
      is_active: true,
    } as any,
    cache: { ttl: 2 * 60 * 1000, key: `code:${code}` },
    label: `搜索回收模板: ${code}`,
  }) as Promise<RecoveryTplHeadView[]>;
}

/**
 * 批量获取回收拆解模板详情
 *
 * @example
 * const templates = await batchGetRecoveryTemplates([1, 2, 3])
 */
export async function batchGetRecoveryTemplates(ids: number[]) {
  return enhancedApi.batch(
    ids.map((id) => () => getRecoveryTemplate(id))
  );
}

/**
 * 批量切换回收拆解模板状态
 *
 * @example
 * await batchToggleRecoveryTemplates([1, 2, 3], false)
 */
export async function batchToggleRecoveryTemplates(ids: number[], isActive: boolean) {
  return enhancedApi.batch(
    ids.map((id) => () => toggleRecoveryTemplateActive(id, isActive))
  );
}

/**
 * 检查回收拆解模板代码是否存在
 *
 * @example
 * const exists = await checkRecoveryTemplateCodeExists('REC001')
 */
export async function checkRecoveryTemplateCodeExists(code: string): Promise<boolean> {
  try {
    const result = await enhancedApi.get('/api/v1/recovery-templates', {
      params: { tpl_code: code } as any,
      cache: { ttl: 30 * 1000 },
    }) as RecoveryTplHeadView[];

    return result.length > 0;
  } catch {
    return false;
  }
}

/**
 * 获取回收拆解模板统计信息（带重试）
 *
 * @example
 * const stats = await getRecoveryTemplateStats()
 */
export async function getRecoveryTemplateStats() {
  const result = await enhancedApi.get('/api/v1/recovery-templates', {
    params: {} as any,
    retry: { times: 3, delay: 1000 },
    cache: { ttl: 10 * 60 * 1000 },
    label: '获取回收模板统计',
  }) as RecoveryTplHeadView[];

  return {
    total: result.length,
    active: result.filter(t => t.is_active).length,
    inactive: result.filter(t => !t.is_active).length,
  };
}

/**
 * 获取回收拆解模板的明细行数量
 *
 * @example
 * const lineCount = await getRecoveryTemplateLineCount(1)
 */
export async function getRecoveryTemplateLineCount(id: number): Promise<number> {
  const template = await getRecoveryTemplate(id);
  return template.lines?.length || 0;
}

/**
 * 获取回收拆解模板的报废行
 *
 * @example
 * const scrapLines = await getRecoveryTemplateScrapLines(1)
 */
export async function getRecoveryTemplateScrapLines(id: number) {
  const template = await getRecoveryTemplate(id);
  return template.lines?.filter(line => line.scrap_flag) || [];
}

/**
 * 获取回收拆解模板的非报废行
 *
 * @example
 * const recoveryLines = await getRecoveryTemplateRecoveryLines(1)
 */
export async function getRecoveryTemplateRecoveryLines(id: number) {
  const template = await getRecoveryTemplate(id);
  return template.lines?.filter(line => !line.scrap_flag) || [];
}

/**
 * 预加载常用回收拆解模板（后台加载）
 *
 * @example
 * preloadCommonRecoveryTemplates()
 */
export function preloadCommonRecoveryTemplates() {
  getActiveRecoveryTemplates().catch(() => {
    // 忽略错误
  });
}

// ============================================================================
// 缓存管理
// ============================================================================

/**
 * 清除回收拆解模板相关缓存
 */
export function clearRecoveryTemplateCache() {
  enhancedApi.clearCache('recovery-templates');
}

/**
 * 清除搜索缓存
 */
export function clearRecoveryTemplateSearchCache() {
  enhancedApi.clearCache('code:');
  enhancedApi.clearCache('source:');
}
