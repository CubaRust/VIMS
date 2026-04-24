/**
 * 客户 API
 *
 * 提供客户的完整 CRUD 操作和业务逻辑封装
 */

import type { Schema } from '../shared/helpers';
import { api } from '../shared/client-factory';
import { enhancedApi } from '../shared/enhanced-client';

// ============================================================================
// 类型定义
// ============================================================================

export type CustomerView = Schema<'CustomerView'>;
export type CustomerCreateBody = Schema<'CreateCustomerCommand'>;
export type CustomerUpdateBody = Schema<'UpdateCustomerCommand'>;

export interface CustomerListQuery {
  keyword?: string;
  is_active?: boolean;
}

// ============================================================================
// 基础 CRUD 操作
// ============================================================================

/**
 * 获取客户列表
 *
 * @example
 * const customers = await listCustomers({ is_active: true })
 */
export async function listCustomers(params?: CustomerListQuery) {
  return api.get('/api/v1/customers', {
    params: params as any,
  }) as Promise<CustomerView[]>;
}

/**
 * 获取客户详情
 *
 * @example
 * const customer = await getCustomer(1)
 */
export async function getCustomer(id: number) {
  return api.get('/api/v1/customers/{id}', {
    pathParams: { id },
  }) as Promise<CustomerView>;
}

/**
 * 创建客户
 *
 * @example
 * const newCustomer = await createCustomer({
 *   customer_code: 'CUS001',
 *   customer_name: '测试客户',
 *   contact_name: '李四',
 *   contact_phone: '13900139000'
 * })
 */
export async function createCustomer(data: CustomerCreateBody) {
  return api.post('/api/v1/customers', data) as Promise<CustomerView>;
}

/**
 * 更新客户
 *
 * @example
 * const updated = await updateCustomer(1, {
 *   customer_name: '新客户名称',
 *   is_active: true
 * })
 */
export async function updateCustomer(id: number, data: CustomerUpdateBody) {
  return api.put('/api/v1/customers/{id}', data, {
    pathParams: { id },
  }) as Promise<CustomerView>;
}

/**
 * 删除客户
 *
 * @example
 * await deleteCustomer(1)
 */
export async function deleteCustomer(id: number) {
  return api.delete('/api/v1/customers/{id}', {
    pathParams: { id },
  });
}

/**
 * 切换客户启用状态
 *
 * @example
 * await toggleCustomerActive(1, false)
 */
export async function toggleCustomerActive(id: number, isActive: boolean) {
  return api.patch('/api/v1/customers/{id}/toggle-active',
    { is_active: isActive },
    { pathParams: { id } }
  ) as Promise<CustomerView>;
}

// ============================================================================
// 业务逻辑封装（使用 enhancedApi）
// ============================================================================

/**
 * 获取启用的客户列表（带缓存）
 *
 * @example
 * const customers = await getActiveCustomers()
 */
export async function getActiveCustomers() {
  return enhancedApi.get('/api/v1/customers', {
    params: { is_active: true } as any,
    cache: { ttl: 5 * 60 * 1000 }, // 缓存 5 分钟
    label: '获取启用客户',
  }) as Promise<CustomerView[]>;
}

/**
 * 搜索客户（带缓存）
 *
 * @example
 * const customers = await searchCustomers('小米')
 */
export async function searchCustomers(keyword: string) {
  if (!keyword.trim()) {
    return [];
  }

  return enhancedApi.get('/api/v1/customers', {
    params: {
      keyword,
      is_active: true,
    } as any,
    cache: { ttl: 2 * 60 * 1000, key: `search:${keyword}` },
    label: `搜索客户: ${keyword}`,
  }) as Promise<CustomerView[]>;
}

/**
 * 批量获取客户详情
 *
 * @example
 * const customers = await batchGetCustomers([1, 2, 3])
 */
export async function batchGetCustomers(ids: number[]) {
  return enhancedApi.batch(
    ids.map((id) => () => getCustomer(id))
  );
}

/**
 * 批量切换客户状态
 *
 * @example
 * await batchToggleCustomers([1, 2, 3], false)
 */
export async function batchToggleCustomers(ids: number[], isActive: boolean) {
  return enhancedApi.batch(
    ids.map((id) => () => toggleCustomerActive(id, isActive))
  );
}

/**
 * 检查客户代码是否存在
 *
 * @example
 * const exists = await checkCustomerCodeExists('CUS001')
 */
export async function checkCustomerCodeExists(code: string): Promise<boolean> {
  try {
    const result = await enhancedApi.get('/api/v1/customers', {
      params: { keyword: code } as any,
      cache: { ttl: 30 * 1000 },
    }) as CustomerView[];

    return result.some(c => c.customer_code === code);
  } catch {
    return false;
  }
}

/**
 * 获取客户统计信息（带重试）
 *
 * @example
 * const stats = await getCustomerStats()
 */
export async function getCustomerStats() {
  const result = await enhancedApi.get('/api/v1/customers', {
    params: {} as any,
    retry: { times: 3, delay: 1000 },
    cache: { ttl: 10 * 60 * 1000 },
    label: '获取客户统计',
  }) as CustomerView[];

  return {
    total: result.length,
    active: result.filter(c => c.is_active).length,
    inactive: result.filter(c => !c.is_active).length,
  };
}

/**
 * 预加载常用客户（后台加载）
 *
 * @example
 * preloadCommonCustomers()
 */
export function preloadCommonCustomers() {
  getActiveCustomers().catch(() => {
    // 忽略错误
  });
}

// ============================================================================
// 缓存管理
// ============================================================================

/**
 * 清除客户相关缓存
 */
export function clearCustomerCache() {
  enhancedApi.clearCache('customers');
}

/**
 * 清除搜索缓存
 */
export function clearCustomerSearchCache() {
  enhancedApi.clearCache('search:');
}
