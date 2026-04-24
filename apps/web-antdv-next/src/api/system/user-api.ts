/**
 * 用户管理 API
 *
 * 提供用户列表查询功能
 */

import type { Schema } from '../shared/helpers';
import { api } from '../shared/client-factory';
import { enhancedApi } from '../shared/enhanced-client';

// ============================================================================
// 类型定义
// ============================================================================

export type UserView = Schema<'UserView'>;

export interface UserListQuery {
  keyword?: string;
  is_active?: boolean;
}

// ============================================================================
// 基础操作
// ============================================================================

/**
 * 获取用户列表
 *
 * @example
 * const users = await listUsers({ is_active: true })
 */
export async function listUsers(params?: UserListQuery) {
  return api.get('/api/v1/users', {
    params: params as any,
  }) as Promise<UserView[]>;
}

// ============================================================================
// 业务逻辑封装（使用 enhancedApi）
// ============================================================================

/**
 * 获取启用的用户列表（带缓存）
 *
 * @example
 * const users = await getActiveUsers()
 */
export async function getActiveUsers() {
  return enhancedApi.get('/api/v1/users', {
    params: { is_active: true } as any,
    cache: { ttl: 5 * 60 * 1000 }, // 缓存 5 分钟
    label: '获取启用用户',
  }) as Promise<UserView[]>;
}

/**
 * 搜索用户（带缓存）
 *
 * @example
 * const users = await searchUsers('张三')
 */
export async function searchUsers(keyword: string) {
  if (!keyword.trim()) {
    return [];
  }

  return enhancedApi.get('/api/v1/users', {
    params: {
      keyword,
      is_active: true,
    } as any,
    cache: { ttl: 2 * 60 * 1000, key: `search:${keyword}` },
    label: `搜索用户: ${keyword}`,
  }) as Promise<UserView[]>;
}

/**
 * 按用户代码查找用户
 *
 * @example
 * const user = await findUserByCode('U001')
 */
export async function findUserByCode(userCode: string): Promise<UserView | null> {
  try {
    const users = await listUsers();
    return users.find(u => u.user_code === userCode) || null;
  } catch {
    return null;
  }
}

/**
 * 按登录名查找用户
 *
 * @example
 * const user = await findUserByLoginName('admin')
 */
export async function findUserByLoginName(loginName: string): Promise<UserView | null> {
  try {
    const users = await listUsers();
    return users.find(u => u.login_name === loginName) || null;
  } catch {
    return null;
  }
}

/**
 * 获取用户统计信息（带重试）
 *
 * @example
 * const stats = await getUserStats()
 */
export async function getUserStats() {
  const result = await enhancedApi.get('/api/v1/users', {
    params: {} as any,
    retry: { times: 3, delay: 1000 },
    cache: { ttl: 10 * 60 * 1000 },
    label: '获取用户统计',
  }) as UserView[];

  return {
    total: result.length,
    active: result.filter(u => u.is_active).length,
    inactive: result.filter(u => !u.is_active).length,
  };
}

/**
 * 按角色筛选用户
 *
 * @example
 * const admins = await getUsersByRole('admin')
 */
export async function getUsersByRole(roleCode: string) {
  const users = await listUsers();
  return users.filter(u => u.roles?.includes(roleCode));
}

/**
 * 预加载常用用户（后台加载）
 *
 * @example
 * preloadCommonUsers()
 */
export function preloadCommonUsers() {
  getActiveUsers().catch(() => {
    // 忽略错误
  });
}

// ============================================================================
// 缓存管理
// ============================================================================

/**
 * 清除用户相关缓存
 */
export function clearUserCache() {
  enhancedApi.clearCache('users');
}

/**
 * 清除搜索缓存
 */
export function clearUserSearchCache() {
  enhancedApi.clearCache('search:');
}
