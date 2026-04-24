/**
 * 认证 API
 *
 * 提供登录、登出、刷新 token、获取当前用户、修改密码等功能
 */

import type { Schema } from '../shared/helpers';
import { api } from '../shared/client-factory';
import { enhancedApi } from '../shared/enhanced-client';

// ============================================================================
// 类型定义
// ============================================================================

export type LoginCommand = Schema<'LoginCommand'>;
export type LoginResult = Schema<'LoginResult'>;
export type UserView = Schema<'UserView'>;
export type ChangePasswordCommand = Schema<'ChangePasswordCommand'>;

// ============================================================================
// 认证操作
// ============================================================================

/**
 * 用户登录
 *
 * @example
 * const result = await login({
 *   login_name: 'admin',
 *   password: 'password123'
 * })
 */
export async function login(data: LoginCommand) {
  return api.post('/api/v1/auth/login', data) as Promise<LoginResult>;
}

/**
 * 用户登出
 *
 * @example
 * await logout()
 */
export async function logout() {
  return api.post('/api/v1/auth/logout', {});
}

/**
 * 刷新 token
 *
 * @example
 * const result = await refreshToken()
 */
export async function refreshToken() {
  return api.post('/api/v1/auth/refresh', {}) as Promise<LoginResult>;
}

/**
 * 获取当前用户信息
 *
 * @example
 * const user = await getCurrentUser()
 */
export async function getCurrentUser() {
  return api.get('/api/v1/auth/me') as Promise<UserView>;
}

/**
 * 修改当前用户密码
 *
 * @example
 * await changePassword({
 *   old_password: 'oldpass123',
 *   new_password: 'newpass456'
 * })
 */
export async function changePassword(data: ChangePasswordCommand) {
  return api.put('/api/v1/auth/password', data);
}

// ============================================================================
// 业务逻辑封装（使用 enhancedApi）
// ============================================================================

/**
 * 获取当前用户信息（带缓存）
 *
 * @example
 * const user = await getCurrentUserCached()
 */
export async function getCurrentUserCached() {
  return enhancedApi.get('/api/v1/auth/me', {
    cache: { ttl: 5 * 60 * 1000 }, // 缓存 5 分钟
    label: '获取当前用户',
  }) as Promise<UserView>;
}

/**
 * 登录（带重试）
 *
 * @example
 * const result = await loginWithRetry({
 *   login_name: 'admin',
 *   password: 'password123'
 * })
 */
export async function loginWithRetry(data: LoginCommand) {
  return enhancedApi.post('/api/v1/auth/login', data, {
    retry: { times: 3, delay: 1000 },
    label: '用户登录',
  }) as Promise<LoginResult>;
}

/**
 * 检查用户是否已登录
 *
 * @example
 * const isLoggedIn = await checkLoginStatus()
 */
export async function checkLoginStatus(): Promise<boolean> {
  try {
    await getCurrentUser();
    return true;
  } catch {
    return false;
  }
}

/**
 * 检查用户是否有指定权限
 *
 * @example
 * const hasPermission = await checkPermission('sys.user.manage')
 */
export async function checkPermission(permCode: string): Promise<boolean> {
  try {
    const user = await getCurrentUserCached();
    return user.permissions?.includes(permCode) || false;
  } catch {
    return false;
  }
}

/**
 * 检查用户是否有指定角色
 *
 * @example
 * const hasRole = await checkRole('admin')
 */
export async function checkRole(roleCode: string): Promise<boolean> {
  try {
    const user = await getCurrentUserCached();
    return user.roles?.includes(roleCode) || false;
  } catch {
    return false;
  }
}

/**
 * 获取用户权限列表
 *
 * @example
 * const permissions = await getUserPermissions()
 */
export async function getUserPermissions(): Promise<string[]> {
  try {
    const user = await getCurrentUserCached();
    return user.permissions || [];
  } catch {
    return [];
  }
}

/**
 * 获取用户角色列表
 *
 * @example
 * const roles = await getUserRoles()
 */
export async function getUserRoles(): Promise<string[]> {
  try {
    const user = await getCurrentUserCached();
    return user.roles || [];
  } catch {
    return [];
  }
}

// ============================================================================
// 缓存管理
// ============================================================================

/**
 * 清除当前用户缓存
 */
export function clearCurrentUserCache() {
  enhancedApi.clearCache('auth/me');
}

/**
 * 登出并清除所有缓存
 */
export async function logoutAndClearCache() {
  await logout();
  clearCurrentUserCache();
  enhancedApi.clearCache(); // 清除所有缓存
}
