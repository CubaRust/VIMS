/**
 * 工艺路线 API
 *
 * 提供工艺路线的完整 CRUD 操作和业务逻辑封装
 */

import type { Schema } from '../shared/helpers';
import { api } from '../shared/client-factory';
import { enhancedApi } from '../shared/enhanced-client';

// ============================================================================
// 类型定义
// ============================================================================

export type RouteHeadView = Schema<'RouteHeadView'>;
export type RouteStepView = Schema<'RouteStepView'>;
export type RouteCreateBody = Schema<'CreateRouteCommand'>;
export type RouteUpdateBody = Schema<'UpdateRouteCommand'>;

export interface RouteListQuery {
  route_code?: string;
  product_material_id?: number;
  is_active?: boolean;
}

// ============================================================================
// 基础 CRUD 操作
// ============================================================================

/**
 * 获取工艺路线列表
 *
 * @example
 * const routes = await listRoutes({ is_active: true })
 */
export async function listRoutes(params?: RouteListQuery) {
  return api.get('/api/v1/routes', {
    params: params as any,
  }) as Promise<RouteHeadView[]>;
}

/**
 * 获取工艺路线详情
 *
 * @example
 * const route = await getRoute(1)
 */
export async function getRoute(id: number) {
  return api.get('/api/v1/routes/{id}', {
    pathParams: { id },
  }) as Promise<RouteHeadView>;
}

/**
 * 创建工艺路线
 *
 * @example
 * const newRoute = await createRoute({
 *   route_code: 'RT001',
 *   route_name: '标准工艺路线',
 *   product_material_id: 1,
 *   steps: [
 *     { step_no: 1, process_name: '下料', semi_finished_flag: false }
 *   ]
 * })
 */
export async function createRoute(data: RouteCreateBody) {
  return api.post('/api/v1/routes', data) as Promise<RouteHeadView>;
}

/**
 * 更新工艺路线
 *
 * @example
 * const updated = await updateRoute(1, {
 *   route_name: '新工艺路线',
 *   product_material_id: 1,
 *   is_active: true,
 *   steps: [...]
 * })
 */
export async function updateRoute(id: number, data: RouteUpdateBody) {
  return api.put('/api/v1/routes/{id}', data, {
    pathParams: { id },
  }) as Promise<RouteHeadView>;
}

/**
 * 删除工艺路线
 *
 * @example
 * await deleteRoute(1)
 */
export async function deleteRoute(id: number) {
  return api.delete('/api/v1/routes/{id}', {
    pathParams: { id },
  });
}

/**
 * 切换工艺路线启用状态
 *
 * @example
 * await toggleRouteActive(1, false)
 */
export async function toggleRouteActive(id: number, isActive: boolean) {
  return api.patch('/api/v1/routes/{id}/toggle-active',
    { is_active: isActive },
    { pathParams: { id } }
  ) as Promise<RouteHeadView>;
}

// ============================================================================
// 业务逻辑封装（使用 enhancedApi）
// ============================================================================

/**
 * 获取启用的工艺路线列表（带缓存）
 *
 * @example
 * const routes = await getActiveRoutes()
 */
export async function getActiveRoutes() {
  return enhancedApi.get('/api/v1/routes', {
    params: { is_active: true } as any,
    cache: { ttl: 5 * 60 * 1000 }, // 缓存 5 分钟
    label: '获取启用工艺路线',
  }) as Promise<RouteHeadView[]>;
}

/**
 * 按产品物料获取工艺路线（带缓存）
 *
 * @example
 * const routes = await getRoutesByProduct(1)
 */
export async function getRoutesByProduct(productMaterialId: number) {
  return enhancedApi.get('/api/v1/routes', {
    params: {
      product_material_id: productMaterialId,
      is_active: true,
    } as any,
    cache: { ttl: 5 * 60 * 1000, key: `product:${productMaterialId}` },
    label: `获取产品工艺路线: ${productMaterialId}`,
  }) as Promise<RouteHeadView[]>;
}

/**
 * 按工艺路线代码搜索（带缓存）
 *
 * @example
 * const routes = await searchRoutesByCode('RT001')
 */
export async function searchRoutesByCode(code: string) {
  if (!code.trim()) {
    return [];
  }

  return enhancedApi.get('/api/v1/routes', {
    params: {
      route_code: code,
      is_active: true,
    } as any,
    cache: { ttl: 2 * 60 * 1000, key: `code:${code}` },
    label: `搜索工艺路线: ${code}`,
  }) as Promise<RouteHeadView[]>;
}

/**
 * 批量获取工艺路线详情
 *
 * @example
 * const routes = await batchGetRoutes([1, 2, 3])
 */
export async function batchGetRoutes(ids: number[]) {
  return enhancedApi.batch(
    ids.map((id) => () => getRoute(id))
  );
}

/**
 * 批量切换工艺路线状态
 *
 * @example
 * await batchToggleRoutes([1, 2, 3], false)
 */
export async function batchToggleRoutes(ids: number[], isActive: boolean) {
  return enhancedApi.batch(
    ids.map((id) => () => toggleRouteActive(id, isActive))
  );
}

/**
 * 检查工艺路线代码是否存在
 *
 * @example
 * const exists = await checkRouteCodeExists('RT001')
 */
export async function checkRouteCodeExists(code: string): Promise<boolean> {
  try {
    const result = await enhancedApi.get('/api/v1/routes', {
      params: { route_code: code } as any,
      cache: { ttl: 30 * 1000 },
    }) as RouteHeadView[];

    return result.length > 0;
  } catch {
    return false;
  }
}

/**
 * 获取工艺路线统计信息（带重试）
 *
 * @example
 * const stats = await getRouteStats()
 */
export async function getRouteStats() {
  const result = await enhancedApi.get('/api/v1/routes', {
    params: {} as any,
    retry: { times: 3, delay: 1000 },
    cache: { ttl: 10 * 60 * 1000 },
    label: '获取工艺路线统计',
  }) as RouteHeadView[];

  return {
    total: result.length,
    active: result.filter(r => r.is_active).length,
    inactive: result.filter(r => !r.is_active).length,
  };
}

/**
 * 获取工艺路线的步骤数量
 *
 * @example
 * const stepCount = await getRouteStepCount(1)
 */
export async function getRouteStepCount(id: number): Promise<number> {
  const route = await getRoute(id);
  return route.steps?.length || 0;
}

/**
 * 预加载常用工艺路线（后台加载）
 *
 * @example
 * preloadCommonRoutes()
 */
export function preloadCommonRoutes() {
  getActiveRoutes().catch(() => {
    // 忽略错误
  });
}

// ============================================================================
// 缓存管理
// ============================================================================

/**
 * 清除工艺路线相关缓存
 */
export function clearRouteCache() {
  enhancedApi.clearCache('routes');
}

/**
 * 清除搜索缓存
 */
export function clearRouteSearchCache() {
  enhancedApi.clearCache('code:');
  enhancedApi.clearCache('product:');
}
