/**
 * 物料主数据 API
 *
 * 提供物料的完整 CRUD 操作和业务逻辑封装
 */

import type { Schema } from '../shared/helpers';
import { api } from '../shared/client-factory';
import { enhancedApi } from '../shared/enhanced-client';

// ============================================================================
// 类型定义
// ============================================================================

export type MaterialView = Schema<'MaterialView'>;
export type MaterialCreateBody = Schema<'MaterialCreateBody'>;
export type MaterialUpdateBody = Partial<MaterialCreateBody>;

export interface MaterialListQuery {
  page?: number;
  page_size?: number;
  is_active?: boolean;
  material_category?: string;
  material_code?: string;
  material_name?: string;
}

export interface MaterialListResponse {
  items: MaterialView[];
  page: number;
  page_size: number;
  total: number;
}

// ============================================================================
// 基础 CRUD 操作
// ============================================================================

/**
 * 获取物料列表（分页）
 *
 * @example
 * const result = await listMaterials({ is_active: true, page: 1, page_size: 20 })
 */
export async function listMaterials(params?: MaterialListQuery) {
  return api.get('/api/v1/materials', {
    params: params as any,
  }) as Promise<MaterialListResponse>;
}

/**
 * 获取物料详情
 *
 * @example
 * const material = await getMaterial(1)
 */
export async function getMaterial(id: number) {
  return api.get('/api/v1/materials/{id}', {
    pathParams: { id },
  }) as Promise<MaterialView>;
}

/**
 * 创建物料
 *
 * @example
 * const newMaterial = await createMaterial({
 *   material_code: 'MAT001',
 *   material_name: '测试物料',
 *   unit: 'PCS',
 *   material_category: 'RAW'
 * })
 */
export async function createMaterial(data: MaterialCreateBody) {
  return api.post('/api/v1/materials', data) as Promise<MaterialView>;
}

/**
 * 更新物料
 *
 * @example
 * const updated = await updateMaterial(1, { material_name: '新名称' })
 */
export async function updateMaterial(id: number, data: MaterialUpdateBody) {
  // 先获取完整数据
  const current = await getMaterial(id);

  // 合并数据
  const fullData = { ...current, ...data };

  return api.put('/api/v1/materials/{id}', fullData as any, {
    pathParams: { id },
  }) as Promise<MaterialView>;
}

/**
 * 删除物料
 *
 * @example
 * await deleteMaterial(1)
 */
export async function deleteMaterial(id: number) {
  return api.delete('/api/v1/materials/{id}', {
    pathParams: { id },
  });
}

/**
 * 切换物料启用状态
 *
 * @example
 * await toggleMaterialActive(1, false)
 */
export async function toggleMaterialActive(id: number, isActive: boolean) {
  return api.patch('/api/v1/materials/{id}/toggle-active',
    { is_active: isActive },
    { pathParams: { id } }
  ) as Promise<MaterialView>;
}

// ============================================================================
// 业务逻辑封装（使用 enhancedApi）
// ============================================================================

/**
 * 获取启用的物料列表（带缓存）
 *
 * @example
 * const materials = await getActiveMaterials()
 */
export async function getActiveMaterials() {
  const result = await enhancedApi.get('/api/v1/materials', {
    params: { is_active: true } as any,
    cache: { ttl: 5 * 60 * 1000 }, // 缓存 5 分钟
    label: '获取启用物料',
  }) as MaterialListResponse;

  return result.items || [];
}

/**
 * 搜索物料（带缓存）
 *
 * @example
 * const materials = await searchMaterials('螺丝')
 */
export async function searchMaterials(keyword: string) {
  if (!keyword.trim()) {
    return [];
  }

  const result = await enhancedApi.get('/api/v1/materials', {
    params: {
      material_name: keyword,
      is_active: true,
    } as any,
    cache: { ttl: 2 * 60 * 1000, key: `search:${keyword}` },
    label: `搜索物料: ${keyword}`,
  }) as MaterialListResponse;

  return result.items || [];
}

/**
 * 按物料代码搜索（带缓存）
 *
 * @example
 * const materials = await searchMaterialsByCode('MAT001')
 */
export async function searchMaterialsByCode(code: string) {
  if (!code.trim()) {
    return [];
  }

  const result = await enhancedApi.get('/api/v1/materials', {
    params: {
      material_code: code,
      is_active: true,
    } as any,
    cache: { ttl: 2 * 60 * 1000, key: `code:${code}` },
    label: `按代码搜索物料: ${code}`,
  }) as MaterialListResponse;

  return result.items || [];
}

/**
 * 按分类获取物料（带缓存）
 *
 * @example
 * const materials = await getMaterialsByCategory('RAW')
 */
export async function getMaterialsByCategory(category: string) {
  const result = await enhancedApi.get('/api/v1/materials', {
    params: {
      material_category: category,
      is_active: true,
    } as any,
    cache: { ttl: 5 * 60 * 1000, key: `category:${category}` },
    label: `获取分类物料: ${category}`,
  }) as MaterialListResponse;

  return result.items || [];
}

/**
 * 批量获取物料详情
 *
 * @example
 * const materials = await batchGetMaterials([1, 2, 3])
 */
export async function batchGetMaterials(ids: number[]) {
  return enhancedApi.batch(
    ids.map((id) => () => getMaterial(id))
  );
}

/**
 * 批量切换物料状态
 *
 * @example
 * await batchToggleMaterials([1, 2, 3], false)
 */
export async function batchToggleMaterials(ids: number[], isActive: boolean) {
  return enhancedApi.batch(
    ids.map((id) => () => toggleMaterialActive(id, isActive))
  );
}

/**
 * 检查物料代码是否存在
 *
 * @example
 * const exists = await checkMaterialCodeExists('MAT001')
 */
export async function checkMaterialCodeExists(code: string): Promise<boolean> {
  try {
    const result = await enhancedApi.get('/api/v1/materials', {
      params: { material_code: code } as any,
      cache: { ttl: 30 * 1000 },
    }) as MaterialListResponse;

    return (result.items?.length || 0) > 0;
  } catch {
    return false;
  }
}

/**
 * 获取物料统计信息（带重试）
 *
 * @example
 * const stats = await getMaterialStats()
 */
export async function getMaterialStats() {
  const result = await enhancedApi.get('/api/v1/materials', {
    params: { page: 1, page_size: 1 } as any,
    retry: { times: 3, delay: 1000 },
    cache: { ttl: 10 * 60 * 1000 },
    label: '获取物料统计',
  }) as MaterialListResponse;

  return {
    total: result.total || 0,
  };
}

/**
 * 预加载常用物料（后台加载）
 *
 * @example
 * preloadCommonMaterials()
 */
export function preloadCommonMaterials() {
  getActiveMaterials().catch(() => {
    // 忽略错误
  });
}

// ============================================================================
// 缓存管理
// ============================================================================

/**
 * 清除物料相关缓存
 */
export function clearMaterialCache() {
  enhancedApi.clearCache('materials');
}

/**
 * 清除搜索缓存
 */
export function clearSearchCache() {
  enhancedApi.clearCache('search:');
  enhancedApi.clearCache('code:');
  enhancedApi.clearCache('category:');
}
