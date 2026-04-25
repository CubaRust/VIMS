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

export interface UserListQuery {
  keyword?: string;
  is_active?: boolean;
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
}

export interface UserCreateParams {
  login_name: string;
  user_name: string;
  user_code?: string;
  mobile?: string;
  roles?: string[];
  is_active?: boolean;
}

export interface UserUpdateParams {
  id: number;
  user_name?: string;
  mobile?: string;
  roles?: string[];
  is_active?: boolean;
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
): Promise<UserView[]> {
  return enhancedApi.get('/api/v1/users', {
    params: normalizeUserListQuery(params),
  }) as Promise<UserView[]>;
}

/**
 * 获取全部用户
 *
 * @example
 * const users = await listAllUsers()
 */
export async function listAllUsers(): Promise<UserView[]> {
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
export async function getActiveUsers(): Promise<UserView[]> {
  return enhancedApi.get('/api/v1/users', {
    params: normalizeUserListQuery({
      is_active: true,
    }),
    cache: {
      ttl: 5 * 60 * 1000,
      key: 'users:active',
    },
    label: '获取启用用户',
  }) as Promise<UserView[]>;
}

/**
 * 搜索启用用户，带缓存
 *
 * @example
 * const users = await searchUsers('张三')
 */
export async function searchUsers(
  keyword: string,
): Promise<UserView[]> {
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
  }) as Promise<UserView[]>;
}

/**
 * 按用户代码查找用户
 *
 * @example
 * const user = await findUserByCode('U001')
 */
export async function findUserByCode(
  userCode: string,
): Promise<UserView | null> {
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
): Promise<UserView | null> {
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
  })) as UserView[];

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
): Promise<UserView[]> {
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

// ============================================================================
// 用户 CRUD 操作
// ============================================================================

/**
 * 获取用户详情
 *
 * @example
 * const user = await getUserDetail(1)
 */
export async function getUserDetail(
  userId: number,
): Promise<UserView | null> {
  try {
    return (await api.get(`/api/v1/users/${userId}` as any)) as UserView;
  } catch {
    return null;
  }
}

/**
 * 创建用户
 *
 * @example
 * const user = await createUser({
 *   login_name: 'testuser',
 *   user_name: '测试用户',
 *   roles: ['user'],
 *   is_active: true,
 * })
 */
export async function createUser(
  params: UserCreateParams,
): Promise<UserView> {
  console.log('Creating user with params:', params);
  try {
    const result = await api.post('/api/v1/users' as any, params);
    console.log('Create user response:', result);
    return result as UserView;
  } catch (error) {
    console.error('Create user error:', error);
    throw error;
  }
}

/**
 * 更新用户
 *
 * @example
 * const user = await updateUser({
 *   id: 1,
 *   user_name: '新用户名',
 *   is_active: false,
 * })
 */
export async function updateUser(
  params: UserUpdateParams,
): Promise<UserView> {
  return api.put(`/api/v1/users/${params.id}` as any, params) as Promise<UserView>;
}

/**
 * 删除用户
 *
 * @example
 * await deleteUser(1)
 */
export async function deleteUser(userId: number): Promise<void> {
  return api.delete(`/api/v1/users/${userId}` as any) as Promise<void>;
}

/**
 * 重置用户密码
 *
 * @example
 * await resetPassword(1, 'newpassword123')
 */
export async function resetPassword(
  userId: number,
  newPassword: string = '123456',
): Promise<void> {
  return api.post(`/api/v1/users/${userId}/reset-password` as any, { password: newPassword }) as Promise<void>;
}
