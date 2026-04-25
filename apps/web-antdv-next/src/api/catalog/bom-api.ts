/**
 * BOM（物料清单）API
 *
 * 提供 BOM 的完整 CRUD 操作、推荐功能和业务逻辑封装
 */

import type { Schema } from '../shared/helpers';
import { api } from '../shared/api';
import { enhancedApi } from '../shared/enhanced-api';

// ============================================================================
// 类型定义
// ============================================================================

export type BomHeadView = Schema<'BomHeadView'>;
export type BomLineView = Schema<'BomLineView'>;
export type BomCreateBody = Schema<'CreateBomCommand'>;
export type BomUpdateBody = Schema<'UpdateBomCommand'>;
export type BomRecommendResult = Schema<'BomRecommendResult'>;
export type BomRecommendLine = Schema<'BomRecommendLine'>;

export interface BomListQuery {
  bom_code?: string;
  product_material_id?: number;
  is_active?: boolean;
}

export interface BomRecommendQuery {
  product_material_id: number;
  production_qty?: number;
  bom_id?: number;
}

// ============================================================================
// 基础 CRUD 操作
// ============================================================================

/**
 * 获取 BOM 列表
 *
 * @example
 * const boms = await listBoms({ is_active: true })
 */
export async function listBoms(params?: BomListQuery) {
  return api.get('/api/v1/boms', {
    params: params as any,
  }) as Promise<BomHeadView[]>;
}

/**
 * 获取 BOM 详情
 *
 * @example
 * const bom = await getBom(1)
 */
export async function getBom(id: number) {
  return api.get('/api/v1/boms/{id}', {
    pathParams: { id },
  }) as Promise<BomHeadView>;
}

/**
 * 创建 BOM
 *
 * @example
 * const newBom = await createBom({
 *   bom_code: 'BOM001',
 *   bom_version: 'V1.0',
 *   product_material_id: 1,
 *   lines: [
 *     { line_no: 1, material_id: 2, usage_qty: 1.5, loss_rate: 0.05 }
 *   ]
 * })
 */
export async function createBom(data: BomCreateBody) {
  return api.post('/api/v1/boms', data) as Promise<BomHeadView>;
}

/**
 * 更新 BOM
 *
 * @example
 * const updated = await updateBom(1, {
 *   bom_version: 'V2.0',
 *   product_material_id: 1,
 *   is_active: true,
 *   lines: [...]
 * })
 */
export async function updateBom(id: number, data: BomUpdateBody) {
  return api.put('/api/v1/boms/{id}', data, {
    pathParams: { id },
  }) as Promise<BomHeadView>;
}

/**
 * 删除 BOM
 *
 * @example
 * await deleteBom(1)
 */
export async function deleteBom(id: number) {
  return api.delete('/api/v1/boms/{id}', {
    pathParams: { id },
  });
}

/**
 * 切换 BOM 启用状态
 *
 * @example
 * await toggleBomActive(1, false)
 */
export async function toggleBomActive(id: number, isActive: boolean) {
  return api.patch('/api/v1/boms/{id}/toggle-active',
    { is_active: isActive },
    { pathParams: { id } }
  ) as Promise<BomHeadView>;
}

// ============================================================================
// BOM 推荐功能
// ============================================================================

/**
 * BOM 推荐发料
 *
 * 根据产品物料和生产数量，推荐需要发料的物料清单
 *
 * @example
 * const recommend = await bomRecommend({
 *   product_material_id: 1,
 *   production_qty: 100
 * })
 */
export async function bomRecommend(params: BomRecommendQuery) {
  return api.get('/api/v1/boms/recommend', {
    params: params as any,
  }) as Promise<BomRecommendResult>;
}

// ============================================================================
// 业务逻辑封装（使用 enhancedApi）
// ============================================================================

/**
 * 获取启用的 BOM 列表（带缓存）
 *
 * @example
 * const boms = await getActiveBoms()
 */
export async function getActiveBoms() {
  return enhancedApi.get('/api/v1/boms', {
    params: { is_active: true } as any,
    cache: { ttl: 5 * 60 * 1000 }, // 缓存 5 分钟
    label: '获取启用 BOM',
  }) as Promise<BomHeadView[]>;
}

/**
 * 按产品物料获取 BOM（带缓存）
 *
 * @example
 * const boms = await getBomsByProduct(1)
 */
export async function getBomsByProduct(productMaterialId: number) {
  return enhancedApi.get('/api/v1/boms', {
    params: {
      product_material_id: productMaterialId,
      is_active: true,
    } as any,
    cache: { ttl: 5 * 60 * 1000, key: `product:${productMaterialId}` },
    label: `获取产品 BOM: ${productMaterialId}`,
  }) as Promise<BomHeadView[]>;
}

/**
 * 按 BOM 代码搜索（带缓存）
 *
 * @example
 * const boms = await searchBomsByCode('BOM001')
 */
export async function searchBomsByCode(code: string) {
  if (!code.trim()) {
    return [];
  }

  return enhancedApi.get('/api/v1/boms', {
    params: {
      bom_code: code,
      is_active: true,
    } as any,
    cache: { ttl: 2 * 60 * 1000, key: `code:${code}` },
    label: `搜索 BOM: ${code}`,
  }) as Promise<BomHeadView[]>;
}

/**
 * 批量获取 BOM 详情
 *
 * @example
 * const boms = await batchGetBoms([1, 2, 3])
 */
export async function batchGetBoms(ids: number[]) {
  return enhancedApi.batch(
    ids.map((id) => () => getBom(id))
  );
}

/**
 * 批量切换 BOM 状态
 *
 * @example
 * await batchToggleBoms([1, 2, 3], false)
 */
export async function batchToggleBoms(ids: number[], isActive: boolean) {
  return enhancedApi.batch(
    ids.map((id) => () => toggleBomActive(id, isActive))
  );
}

/**
 * 获取 BOM 推荐（带缓存）
 *
 * @example
 * const recommend = await getBomRecommendCached({
 *   product_material_id: 1,
 *   production_qty: 100
 * })
 */
export async function getBomRecommendCached(params: BomRecommendQuery) {
  const cacheKey = `recommend:${params.product_material_id}:${params.production_qty || 1}:${params.bom_id || 'auto'}`;

  return enhancedApi.get('/api/v1/boms/recommend', {
    params: params as any,
    cache: { ttl: 2 * 60 * 1000, key: cacheKey },
    label: `BOM 推荐: 产品${params.product_material_id}`,
  }) as Promise<BomRecommendResult>;
}

/**
 * 检查 BOM 代码是否存在
 *
 * @example
 * const exists = await checkBomCodeExists('BOM001')
 */
export async function checkBomCodeExists(code: string): Promise<boolean> {
  try {
    const result = await enhancedApi.get('/api/v1/boms', {
      params: { bom_code: code } as any,
      cache: { ttl: 30 * 1000 },
    }) as BomHeadView[];

    return result.length > 0;
  } catch {
    return false;
  }
}

/**
 * 获取 BOM 统计信息（带重试）
 *
 * @example
 * const stats = await getBomStats()
 */
export async function getBomStats() {
  const result = await enhancedApi.get('/api/v1/boms', {
    params: {} as any,
    retry: { times: 3, delay: 1000 },
    cache: { ttl: 10 * 60 * 1000 },
    label: '获取 BOM 统计',
  }) as BomHeadView[];

  return {
    total: result.length,
    active: result.filter(b => b.is_active).length,
    inactive: result.filter(b => !b.is_active).length,
  };
}

/**
 * 预加载常用 BOM（后台加载）
 *
 * @example
 * preloadCommonBoms()
 */
export function preloadCommonBoms() {
  getActiveBoms().catch(() => {
    // 忽略错误
  });
}

// ============================================================================
// 缓存管理
// ============================================================================

/**
 * 清除 BOM 相关缓存
 */
export function clearBomCache() {
  enhancedApi.clearCache('boms');
}

/**
 * 清除 BOM 推荐缓存
 */
export function clearBomRecommendCache() {
  enhancedApi.clearCache('recommend:');
}

/**
 * 清除搜索缓存
 */
export function clearBomSearchCache() {
  enhancedApi.clearCache('code:');
  enhancedApi.clearCache('product:');
}
