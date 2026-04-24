/**
 * 数据字典 API
 *
 * 提供数据字典的查询、创建、更新功能
 */

import type { Schema } from '../shared/helpers';
import { api } from '../shared/client-factory';
import { enhancedApi } from '../shared/enhanced-client';

// ============================================================================
// 类型定义
// ============================================================================

export type DictView = Schema<'DictView'>;
export type DictCreateBody = Schema<'CreateDictCommand'>;
export type DictUpdateBody = Schema<'UpdateDictCommand'>;

export interface DictListQuery {
  dict_type?: string;
}

// ============================================================================
// 基础操作
// ============================================================================

/**
 * 获取数据字典列表
 *
 * @example
 * const dicts = await listDicts({ dict_type: 'material_category' })
 */
export async function listDicts(params?: DictListQuery) {
  return api.get('/api/v1/dicts', {
    params: params as any,
  }) as Promise<DictView[]>;
}

/**
 * 创建数据字典
 *
 * @example
 * const newDict = await createDict({
 *   dict_type: 'material_category',
 *   dict_key: 'RAW',
 *   dict_value: '原材料',
 *   dict_order: 1
 * })
 */
export async function createDict(data: DictCreateBody) {
  return api.post('/api/v1/dicts', data) as Promise<DictView>;
}

/**
 * 更新数据字典
 *
 * @example
 * const updated = await updateDict(1, {
 *   dict_value: '新的值',
 *   is_active: true
 * })
 */
export async function updateDict(id: number, data: DictUpdateBody) {
  return api.put('/api/v1/dicts/{id}', data, {
    pathParams: { id },
  }) as Promise<DictView>;
}

// ============================================================================
// 业务逻辑封装（使用 enhancedApi）
// ============================================================================

/**
 * 获取数据字典列表（带缓存）
 *
 * @example
 * const dicts = await getDictsCached({ dict_type: 'material_category' })
 */
export async function getDictsCached(params?: DictListQuery) {
  const cacheKey = params?.dict_type ? `type:${params.dict_type}` : 'all';

  return enhancedApi.get('/api/v1/dicts', {
    params: params as any,
    cache: { ttl: 10 * 60 * 1000, key: cacheKey }, // 缓存 10 分钟
    label: params?.dict_type ? `获取字典: ${params.dict_type}` : '获取所有字典',
  }) as Promise<DictView[]>;
}

/**
 * 按字典类型获取字典（带缓存）
 *
 * @example
 * const dicts = await getDictsByType('material_category')
 */
export async function getDictsByType(dictType: string) {
  return getDictsCached({ dict_type: dictType });
}

/**
 * 获取启用的字典项
 *
 * @example
 * const activeDicts = await getActiveDicts('material_category')
 */
export async function getActiveDicts(dictType: string) {
  const dicts = await getDictsByType(dictType);
  return dicts.filter(d => d.is_active).sort((a, b) => a.dict_order - b.dict_order);
}

/**
 * 按字典键查找字典值
 *
 * @example
 * const value = await getDictValue('material_category', 'RAW')
 */
export async function getDictValue(dictType: string, dictKey: string): Promise<string | null> {
  try {
    const dicts = await getDictsByType(dictType);
    const dict = dicts.find(d => d.dict_key === dictKey && d.is_active);
    return dict?.dict_value || null;
  } catch {
    return null;
  }
}

/**
 * 按字典值查找字典键
 *
 * @example
 * const key = await getDictKey('material_category', '原材料')
 */
export async function getDictKey(dictType: string, dictValue: string): Promise<string | null> {
  try {
    const dicts = await getDictsByType(dictType);
    const dict = dicts.find(d => d.dict_value === dictValue && d.is_active);
    return dict?.dict_key || null;
  } catch {
    return null;
  }
}

/**
 * 获取字典键值对映射
 *
 * @example
 * const map = await getDictMap('material_category')
 * // { 'RAW': '原材料', 'SEMI': '半成品', ... }
 */
export async function getDictMap(dictType: string): Promise<Record<string, string>> {
  const dicts = await getActiveDicts(dictType);
  return dicts.reduce((map, dict) => {
    map[dict.dict_key] = dict.dict_value;
    return map;
  }, {} as Record<string, string>);
}

/**
 * 获取所有字典类型列表
 *
 * @example
 * const types = await getAllDictTypes()
 */
export async function getAllDictTypes(): Promise<string[]> {
  const dicts = await getDictsCached();
  const types = new Set(dicts.map(d => d.dict_type));
  return Array.from(types).sort();
}

/**
 * 检查字典键是否存在
 *
 * @example
 * const exists = await checkDictKeyExists('material_category', 'RAW')
 */
export async function checkDictKeyExists(dictType: string, dictKey: string): Promise<boolean> {
  try {
    const dicts = await getDictsByType(dictType);
    return dicts.some(d => d.dict_key === dictKey);
  } catch {
    return false;
  }
}

/**
 * 批量获取多个字典类型
 *
 * @example
 * const result = await batchGetDicts(['material_category', 'unit_type'])
 */
export async function batchGetDicts(dictTypes: string[]) {
  return enhancedApi.batch(
    dictTypes.map((type) => () => getDictsByType(type))
  );
}

/**
 * 获取字典统计信息（带重试）
 *
 * @example
 * const stats = await getDictStats()
 */
export async function getDictStats() {
  const result = await enhancedApi.get('/api/v1/dicts', {
    params: {} as any,
    retry: { times: 3, delay: 1000 },
    cache: { ttl: 10 * 60 * 1000 },
    label: '获取字典统计',
  }) as DictView[];

  const typeCount = new Set(result.map(d => d.dict_type)).size;

  return {
    total: result.length,
    typeCount,
    active: result.filter(d => d.is_active).length,
    inactive: result.filter(d => !d.is_active).length,
  };
}

/**
 * 预加载常用字典（后台加载）
 *
 * @example
 * preloadCommonDicts(['material_category', 'unit_type'])
 */
export function preloadCommonDicts(dictTypes: string[]) {
  dictTypes.forEach(type => {
    getDictsByType(type).catch(() => {
      // 忽略错误
    });
  });
}

// ============================================================================
// 缓存管理
// ============================================================================

/**
 * 清除字典相关缓存
 */
export function clearDictCache() {
  enhancedApi.clearCache('dicts');
}

/**
 * 清除指定类型的字典缓存
 */
export function clearDictTypeCache(dictType: string) {
  enhancedApi.clearCache(`type:${dictType}`);
}
