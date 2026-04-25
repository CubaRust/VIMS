/**
 * 数据字典 API
 *
 * 提供数据字典的查询、创建、更新、映射、统计等功能
 */

import type { Schema } from '#/api';

import { api } from '#/api';
import { enhancedApi } from '#/api';

// ============================================================================
// 类型定义
// ============================================================================

export type DictView = Schema<'DictView'>;
export type DictCreateBody = Schema<'DictCreateBody'>;
export type DictUpdateBody = Schema<'DictUpdateBody'>;

export interface DictListQuery {
  dict_type?: string;
}

export interface DictStats {
  total: number;
  typeCount: number;
  active: number;
  inactive: number;
}

/**
 * 当前 Swagger 里 /api/v1/dicts 的 query 参数可能没有完整声明。
 *
 * 如果后端后续在 OpenAPI 里补充了 dict_type，
 * 那么这里可以删除 as any，调用处直接传 params。
 */
function normalizeDictListQuery(params?: DictListQuery) {
  return params as any;
}

function normalizeText(value: string) {
  return value.trim();
}

function getDictCacheKey(params?: DictListQuery) {
  const dictType = params?.dict_type?.trim();

  return dictType ? `dicts:type:${dictType}` : 'dicts:list';
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
export async function listDicts(params?: DictListQuery): Promise<DictView[]> {
  return api.get('/api/v1/dicts', {
    params: normalizeDictListQuery(params),
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
export async function createDict(data: DictCreateBody): Promise<DictView> {
  const result = await api.post('/api/v1/dicts', data);

  clearDictCache();

  return result as DictView;
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
export async function updateDict(
  id: number,
  data: DictUpdateBody,
): Promise<DictView> {
  const result = await api.put('/api/v1/dicts/{id}', data, {
    pathParams: { id },
  });

  clearDictCache();

  return result as DictView;
}

// ============================================================================
// 业务逻辑封装：缓存 / 查询 / 映射 / 统计
// ============================================================================

/**
 * 获取数据字典列表，带缓存
 *
 * @example
 * const dicts = await getDictsCached({ dict_type: 'material_category' })
 */
export async function getDictsCached(
  params?: DictListQuery,
): Promise<DictView[]> {
  const normalizedParams: DictListQuery | undefined = params?.dict_type
    ? { dict_type: params.dict_type.trim() }
    : undefined;

  return enhancedApi.get('/api/v1/dicts', {
    params: normalizeDictListQuery(normalizedParams),
    cache: {
      ttl: 10 * 60 * 1000,
      key: getDictCacheKey(normalizedParams),
    },
    label: normalizedParams?.dict_type
      ? `获取字典: ${normalizedParams.dict_type}`
      : '获取所有字典',
  }) as Promise<DictView[]>;
}

/**
 * 按字典类型获取字典，带缓存
 *
 * @example
 * const dicts = await getDictsByType('material_category')
 */
export async function getDictsByType(dictType: string): Promise<DictView[]> {
  const normalizedDictType = normalizeText(dictType);

  if (!normalizedDictType) {
    return [];
  }

  return getDictsCached({
    dict_type: normalizedDictType,
  });
}

/**
 * 获取启用的字典项
 *
 * @example
 * const activeDicts = await getActiveDicts('material_category')
 */
export async function getActiveDicts(dictType: string): Promise<DictView[]> {
  const dicts = await getDictsByType(dictType);

  return dicts
    .filter((dict) => dict.is_active)
    .sort((a, b) => a.dict_order - b.dict_order);
}

/**
 * 按字典键查找字典值
 *
 * @example
 * const value = await getDictValue('material_category', 'RAW')
 */
export async function getDictValue(
  dictType: string,
  dictKey: string,
): Promise<string | null> {
  const normalizedDictKey = normalizeText(dictKey);

  if (!normalizedDictKey) {
    return null;
  }

  try {
    const dicts = await getDictsByType(dictType);

    const dict = dicts.find(
      (item) => item.dict_key === normalizedDictKey && item.is_active,
    );

    return dict?.dict_value ?? null;
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
export async function getDictKey(
  dictType: string,
  dictValue: string,
): Promise<string | null> {
  const normalizedDictValue = normalizeText(dictValue);

  if (!normalizedDictValue) {
    return null;
  }

  try {
    const dicts = await getDictsByType(dictType);

    const dict = dicts.find(
      (item) => item.dict_value === normalizedDictValue && item.is_active,
    );

    return dict?.dict_key ?? null;
  } catch {
    return null;
  }
}

/**
 * 获取字典键值对映射
 *
 * @example
 * const map = await getDictMap('material_category')
 * // { RAW: '原材料', SEMI: '半成品' }
 */
export async function getDictMap(
  dictType: string,
): Promise<Record<string, string>> {
  const dicts = await getActiveDicts(dictType);

  return dicts.reduce<Record<string, string>>((map, dict) => {
    map[dict.dict_key] = dict.dict_value;
    return map;
  }, {});
}

/**
 * 获取所有字典类型列表
 *
 * @example
 * const types = await getAllDictTypes()
 */
export async function getAllDictTypes(): Promise<string[]> {
  const dicts = await getDictsCached();

  return Array.from(
    new Set(
      dicts
        .map((dict) => dict.dict_type)
        .filter(Boolean),
    ),
  ).sort();
}

/**
 * 检查字典键是否存在
 *
 * @example
 * const exists = await checkDictKeyExists('material_category', 'RAW')
 */
export async function checkDictKeyExists(
  dictType: string,
  dictKey: string,
): Promise<boolean> {
  const normalizedDictKey = normalizeText(dictKey);

  if (!normalizedDictKey) {
    return false;
  }

  try {
    const dicts = await getDictsByType(dictType);

    return dicts.some((dict) => dict.dict_key === normalizedDictKey);
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
export async function batchGetDicts(
  dictTypes: string[],
): Promise<DictView[][]> {
  const normalizedDictTypes = Array.from(
    new Set(
      dictTypes
        .map((dictType) => normalizeText(dictType))
        .filter(Boolean),
    ),
  );

  if (normalizedDictTypes.length === 0) {
    return [];
  }

  return enhancedApi.batch(
    normalizedDictTypes.map(
      (dictType) => () => getDictsByType(dictType),
    ),
  );
}

/**
 * 获取字典统计信息，带重试和缓存
 *
 * @example
 * const stats = await getDictStats()
 */
export async function getDictStats(): Promise<DictStats> {
  const dicts = (await enhancedApi.get('/api/v1/dicts', {
    params: normalizeDictListQuery(),
    retry: {
      times: 3,
      delay: 1000,
    },
    cache: {
      ttl: 10 * 60 * 1000,
      key: 'dicts:stats',
    },
    label: '获取字典统计',
  })) as DictView[];

  const typeCount = new Set(
    dicts
      .map((dict) => dict.dict_type)
      .filter(Boolean),
  ).size;

  return {
    total: dicts.length,
    typeCount,
    active: dicts.filter((dict) => dict.is_active).length,
    inactive: dicts.filter((dict) => !dict.is_active).length,
  };
}

/**
 * 预加载常用字典
 *
 * @example
 * preloadCommonDicts(['material_category', 'unit_type'])
 */
export function preloadCommonDicts(dictTypes: string[]) {
  const normalizedDictTypes = Array.from(
    new Set(
      dictTypes
        .map((dictType) => normalizeText(dictType))
        .filter(Boolean),
    ),
  );

  normalizedDictTypes.forEach((dictType) => {
    void getDictsByType(dictType).catch(() => {
      // 忽略预加载失败
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
  enhancedApi.clearCache('dicts:');
}

/**
 * 清除字典列表缓存
 */
export function clearDictListCache() {
  enhancedApi.clearCache('dicts:list');
}

/**
 * 清除字典统计缓存
 */
export function clearDictStatsCache() {
  enhancedApi.clearCache('dicts:stats');
}

/**
 * 清除指定类型的字典缓存
 */
export function clearDictTypeCache(dictType: string) {
  const normalizedDictType = normalizeText(dictType);

  if (!normalizedDictType) {
    return;
  }

  enhancedApi.clearCache(`dicts:type:${normalizedDictType}`);
}
