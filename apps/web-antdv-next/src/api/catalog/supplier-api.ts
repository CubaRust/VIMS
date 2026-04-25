/**
 * 供应商 API
 *
 * 提供供应商的完整 CRUD 操作和业务逻辑封装
 */

import type { Schema } from '../shared/helpers';
import { api } from '../shared/api';
import { enhancedApi } from '../shared/enhanced-api';

// ============================================================================
// 类型定义
// ============================================================================

export type SupplierView = Schema<'SupplierView'>;
export type SupplierCreateBody = Schema<'CreateSupplierCommand'>;
export type SupplierUpdateBody = Schema<'UpdateSupplierCommand'>;

export interface SupplierListQuery {
  keyword?: string;
  is_active?: boolean;
}

// ============================================================================
// 基础 CRUD 操作
// ============================================================================

/**
 * 获取供应商列表
 *
 * @example
 * const suppliers = await listSuppliers({ is_active: true })
 */
export async function listSuppliers(params?: SupplierListQuery) {
  return api.get('/api/v1/suppliers', {
    params: params as any,
  }) as Promise<SupplierView[]>;
}

/**
 * 获取供应商详情
 *
 * @example
 * const supplier = await getSupplier(1)
 */
export async function getSupplier(id: number) {
  return api.get('/api/v1/suppliers/{id}', {
    pathParams: { id },
  }) as Promise<SupplierView>;
}

/**
 * 创建供应商
 *
 * @example
 * const newSupplier = await createSupplier({
 *   supplier_code: 'SUP001',
 *   supplier_name: '测试供应商',
 *   contact_name: '张三',
 *   contact_phone: '13800138000'
 * })
 */
export async function createSupplier(data: SupplierCreateBody) {
  return api.post('/api/v1/suppliers', data) as Promise<SupplierView>;
}

/**
 * 更新供应商
 *
 * @example
 * const updated = await updateSupplier(1, {
 *   supplier_name: '新供应商名称',
 *   is_active: true
 * })
 */
export async function updateSupplier(id: number, data: SupplierUpdateBody) {
  return api.put('/api/v1/suppliers/{id}', data, {
    pathParams: { id },
  }) as Promise<SupplierView>;
}

/**
 * 删除供应商
 *
 * @example
 * await deleteSupplier(1)
 */
export async function deleteSupplier(id: number) {
  return api.delete('/api/v1/suppliers/{id}', {
    pathParams: { id },
  });
}

/**
 * 切换供应商启用状态
 *
 * @example
 * await toggleSupplierActive(1, false)
 */
export async function toggleSupplierActive(id: number, isActive: boolean) {
  return api.patch('/api/v1/suppliers/{id}/toggle-active',
    { is_active: isActive },
    { pathParams: { id } }
  ) as Promise<SupplierView>;
}

// ============================================================================
// 业务逻辑封装（使用 enhancedApi）
// ============================================================================

/**
 * 获取启用的供应商列表（带缓存）
 *
 * @example
 * const suppliers = await getActiveSuppliers()
 */
export async function getActiveSuppliers() {
  return enhancedApi.get('/api/v1/suppliers', {
    params: { is_active: true } as any,
    cache: { ttl: 5 * 60 * 1000 }, // 缓存 5 分钟
    label: '获取启用供应商',
  }) as Promise<SupplierView[]>;
}

/**
 * 搜索供应商（带缓存）
 *
 * @example
 * const suppliers = await searchSuppliers('华为')
 */
export async function searchSuppliers(keyword: string) {
  if (!keyword.trim()) {
    return [];
  }

  return enhancedApi.get('/api/v1/suppliers', {
    params: {
      keyword,
      is_active: true,
    } as any,
    cache: { ttl: 2 * 60 * 1000, key: `search:${keyword}` },
    label: `搜索供应商: ${keyword}`,
  }) as Promise<SupplierView[]>;
}

/**
 * 批量获取供应商详情
 *
 * @example
 * const suppliers = await batchGetSuppliers([1, 2, 3])
 */
export async function batchGetSuppliers(ids: number[]) {
  return enhancedApi.batch(
    ids.map((id) => () => getSupplier(id))
  );
}

/**
 * 批量切换供应商状态
 *
 * @example
 * await batchToggleSuppliers([1, 2, 3], false)
 */
export async function batchToggleSuppliers(ids: number[], isActive: boolean) {
  return enhancedApi.batch(
    ids.map((id) => () => toggleSupplierActive(id, isActive))
  );
}

/**
 * 检查供应商代码是否存在
 *
 * @example
 * const exists = await checkSupplierCodeExists('SUP001')
 */
export async function checkSupplierCodeExists(code: string): Promise<boolean> {
  try {
    const result = await enhancedApi.get('/api/v1/suppliers', {
      params: { keyword: code } as any,
      cache: { ttl: 30 * 1000 },
    }) as SupplierView[];

    return result.some(s => s.supplier_code === code);
  } catch {
    return false;
  }
}

/**
 * 获取供应商统计信息（带重试）
 *
 * @example
 * const stats = await getSupplierStats()
 */
export async function getSupplierStats() {
  const result = await enhancedApi.get('/api/v1/suppliers', {
    params: {} as any,
    retry: { times: 3, delay: 1000 },
    cache: { ttl: 10 * 60 * 1000 },
    label: '获取供应商统计',
  }) as SupplierView[];

  return {
    total: result.length,
    active: result.filter(s => s.is_active).length,
    inactive: result.filter(s => !s.is_active).length,
  };
}

/**
 * 预加载常用供应商（后台加载）
 *
 * @example
 * preloadCommonSuppliers()
 */
export function preloadCommonSuppliers() {
  getActiveSuppliers().catch(() => {
    // 忽略错误
  });
}

// ============================================================================
// 缓存管理
// ============================================================================

/**
 * 清除供应商相关缓存
 */
export function clearSupplierCache() {
  enhancedApi.clearCache('suppliers');
}

/**
 * 清除搜索缓存
 */
export function clearSupplierSearchCache() {
  enhancedApi.clearCache('search:');
}
