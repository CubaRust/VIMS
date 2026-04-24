/**
 * 角色管理 API
 *
 * 提供角色列表查询功能
 */

import type { Schema } from '../shared/helpers';
import { api } from '../shared/client-factory';
import { enhancedApi } from '../shared/enhanced-client';

// ============================================================================
// 类型定义
// ============================================================================

export type RoleView = Schema<'RoleView'>;

// ============================================================================
// 基础操作
// ============================================================================

/**
 * 获取角色列表
 *
 * @example
 * const roles = await listRoles()
 */
export async function listRoles() {
  return api.get('/api/v1/roles') as Promise<RoleView[]>;
}

// ============================================================================
// 业务逻辑封装（使用 enhancedApi）
// ============================================================================

/**
 * 获取角色列表（带缓存）
 *
 * @example
 * const roles = await getRolesCached()
 */
export async function getRolesCached() {
  return enhancedApi.get('/api/v1/roles', {
    cache: { ttl: 10 * 60 * 1000 }, // 缓存 10 分钟（角色变化较少）
    label: '获取角色列表',
  }) as Promise<RoleView[]>;
}

/**
 * 获取启用的角色列表
 *
 * @example
 * const activeRoles = await getActiveRoles()
 */
export async function getActiveRoles() {
  const roles = await getRolesCached();
  return roles.filter(r => r.is_active);
}

/**
 * 按角色代码查找角色
 *
 * @example
 * const role = await findRoleByCode('admin')
 */
export async function findRoleByCode(roleCode: string): Promise<RoleView | null> {
  try {
    const roles = await getRolesCached();
    return roles.find(r => r.role_code === roleCode) || null;
  } catch {
    return null;
  }
}

/**
 * 按角色名称搜索
 *
 * @example
 * const roles = await searchRolesByName('管理')
 */
export async function searchRolesByName(keyword: string) {
  if (!keyword.trim()) {
    return [];
  }

  const roles = await getRolesCached();
  return roles.filter(r =>
    r.role_name.includes(keyword) || r.role_code.includes(keyword)
  );
}

/**
 * 检查角色代码是否存在
 *
 * @example
 * const exists = await checkRoleCodeExists('admin')
 */
export async function checkRoleCodeExists(roleCode: string): Promise<boolean> {
  try {
    const role = await findRoleByCode(roleCode);
    return role !== null;
  } catch {
    return false;
  }
}

/**
 * 获取角色统计信息（带重试）
 *
 * @example
 * const stats = await getRoleStats()
 */
export async function getRoleStats() {
  const result = await enhancedApi.get('/api/v1/roles', {
    retry: { times: 3, delay: 1000 },
    cache: { ttl: 10 * 60 * 1000 },
    label: '获取角色统计',
  }) as RoleView[];

  return {
    total: result.length,
    active: result.filter(r => r.is_active).length,
    inactive: result.filter(r => !r.is_active).length,
  };
}

/**
 * 预加载角色数据（后台加载）
 *
 * @example
 * preloadRoles()
 */
export function preloadRoles() {
  getRolesCached().catch(() => {
    // 忽略错误
  });
}

// ============================================================================
// 缓存管理
// ============================================================================

/**
 * 清除角色相关缓存
 */
export function clearRoleCache() {
  enhancedApi.clearCache('roles');
}
