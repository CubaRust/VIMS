/**
 * 用户管理 API
 *
 * 提供用户列表查询、搜索、筛选、统计等功能
 */

import type { Schema } from '#/api';

import { api } from '#/api';
import { enhancedApi } from '#/api';

// ============================================================================
// 类型定义
// ============================================================================

export type UserView = Schema<'UserView'>;

/**
 * 后端实际返回的用户列表里包含 roles，
 * 但 Swagger 生成的 UserView 里没有 roles，
 * 所以前端这里扩展一个类型。
 */
export type UserWithRolesView = UserView & {
  roles?: string[];
};

export interface UserListQuery {
  keyword?: string;
  is_active?: boolean;
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
}

/**
 * 当前 Swagger 里 /api/v1/users 的 query 参数可能没有完整声明。
 *
 * 如果后端后续在 OpenAPI 里补充了：
 * - keyword
 * - is_active
 *
 * 那么这里可以删除 as any，调用处直接传 params。
 */
function normalizeUserListQuery(params?: UserListQuery) {
  return params as any;
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
export async function listUsers(
  params?: UserListQuery,
): Promise<UserWithRolesView[]> {
  return api.get('/api/v1/users', {
    params: normalizeUserListQuery(params),
  }) as Promise<UserWithRolesView[]>;
}

/**
 * 获取全部用户
 *
 * @example
 * const users = await listAllUsers()
 */
export async function listAllUsers(): Promise<UserWithRolesView[]> {
  return listUsers();
}

// ============================================================================
// 业务逻辑封装：缓存 / 搜索 / 统计
// ============================================================================

/**
 * 获取启用的用户列表，带缓存
 *
 * @example
 * const users = await getActiveUsers()
 */
export async function getActiveUsers(): Promise<UserWithRolesView[]> {
  return enhancedApi.get('/api/v1/users', {
    params: normalizeUserListQuery({
      is_active: true,
    }),
    cache: {
      ttl: 5 * 60 * 1000,
      key: 'users:active',
    },
    label: '获取启用用户',
  }) as Promise<UserWithRolesView[]>;
}

/**
 * 搜索启用用户，带缓存
 *
 * @example
 * const users = await searchUsers('张三')
 */
export async function searchUsers(
  keyword: string,
): Promise<UserWithRolesView[]> {
  const normalizedKeyword = keyword.trim();

  if (!normalizedKeyword) {
    return [];
  }

  return enhancedApi.get('/api/v1/users', {
    params: normalizeUserListQuery({
      keyword: normalizedKeyword,
      is_active: true,
    }),
    cache: {
      ttl: 2 * 60 * 1000,
      key: `users:search:${normalizedKeyword}`,
    },
    label: `搜索用户: ${normalizedKeyword}`,
  }) as Promise<UserWithRolesView[]>;
}

/**
 * 按用户代码查找用户
 *
 * @example
 * const user = await findUserByCode('U001')
 */
export async function findUserByCode(
  userCode: string,
): Promise<UserWithRolesView | null> {
  const normalizedUserCode = userCode.trim();

  if (!normalizedUserCode) {
    return null;
  }

  try {
    const users = await listUsers();

    return users.find((user) => user.user_code === normalizedUserCode) ?? null;
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
export async function findUserByLoginName(
  loginName: string,
): Promise<UserWithRolesView | null> {
  const normalizedLoginName = loginName.trim();

  if (!normalizedLoginName) {
    return null;
  }

  try {
    const users = await listUsers();

    return (
      users.find((user) => user.login_name === normalizedLoginName) ?? null
    );
  } catch {
    return null;
  }
}

/**
 * 获取用户统计信息，带重试和缓存
 *
 * @example
 * const stats = await getUserStats()
 */
export async function getUserStats(): Promise<UserStats> {
  const users = (await enhancedApi.get('/api/v1/users', {
    params: normalizeUserListQuery(),
    retry: {
      times: 3,
      delay: 1000,
    },
    cache: {
      ttl: 10 * 60 * 1000,
      key: 'users:stats',
    },
    label: '获取用户统计',
  })) as UserWithRolesView[];

  return {
    total: users.length,
    active: users.filter((user) => user.is_active).length,
    inactive: users.filter((user) => !user.is_active).length,
  };
}

/**
 * 按角色筛选用户
 *
 * @example
 * const admins = await getUsersByRole('ADMIN')
 */
export async function getUsersByRole(
  roleCode: string,
): Promise<UserWithRolesView[]> {
  const normalizedRoleCode = roleCode.trim();

  if (!normalizedRoleCode) {
    return [];
  }

  const users = await listUsers();

  return users.filter((user) => user.roles?.includes(normalizedRoleCode));
}

/**
 * 预加载常用用户
 *
 * @example
 * preloadCommonUsers()
 */
export function preloadCommonUsers() {
  void getActiveUsers().catch(() => {
    // 忽略预加载失败
  });
}

// ============================================================================
// 缓存管理
// ============================================================================

/**
 * 清除用户相关缓存
 */
export function clearUserCache() {
  enhancedApi.clearCache('users:');
}

/**
 * 清除用户搜索缓存
 */
export function clearUserSearchCache() {
  enhancedApi.clearCache('users:search:');
}

/**
 * 清除启用用户缓存
 */
export function clearActiveUserCache() {
  enhancedApi.clearCache('users:active');
}

/**
 * 清除用户统计缓存
 */
export function clearUserStatsCache() {
  enhancedApi.clearCache('users:stats');
}
