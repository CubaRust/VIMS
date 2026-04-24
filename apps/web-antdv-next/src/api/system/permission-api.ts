/**
 * 权限管理 API
 *
 * 提供权限列表查询功能
 */

import type { Schema } from '../shared/helpers';
import { api } from '../shared/client-factory';
import { enhancedApi } from '../shared/enhanced-client';

// ============================================================================
// 类型定义
// ============================================================================

export type PermissionView = Schema<'PermissionView'>;

// ============================================================================
// 基础操作
// ============================================================================

/**
 * 获取权限列表
 *
 * @example
 * const permissions = await listPermissions()
 */
export async function listPermissions() {
  return api.get('/api/v1/permissions') as Promise<PermissionView[]>;
}

// ============================================================================
// 业务逻辑封装（使用 enhancedApi）
// ============================================================================

/**
 * 获取权限列表（带缓存）
 *
 * @example
 * const permissions = await getPermissionsCached()
 */
export async function getPermissionsCached() {
  return enhancedApi.get('/api/v1/permissions', {
    cache: { ttl: 10 * 60 * 1000 }, // 缓存 10 分钟（权限变化较少）
    label: '获取权限列表',
  }) as Promise<PermissionView[]>;
}

/**
 * 按模块获取权限
 *
 * @example
 * const permissions = await getPermissionsByModule('sys')
 */
export async function getPermissionsByModule(moduleCode: string) {
  const permissions = await getPermissionsCached();
  return permissions.filter(p => p.module_code === moduleCode);
}

/**
 * 按操作类型获取权限
 *
 * @example
 * const permissions = await getPermissionsByAction('view')
 */
export async function getPermissionsByAction(actionCode: string) {
  const permissions = await getPermissionsCached();
  return permissions.filter(p => p.action_code === actionCode);
}

/**
 * 按权限代码查找权限
 *
 * @example
 * const permission = await findPermissionByCode('sys.user.manage')
 */
export async function findPermissionByCode(permCode: string): Promise<PermissionView | null> {
  try {
    const permissions = await getPermissionsCached();
    return permissions.find(p => p.perm_code === permCode) || null;
  } catch {
    return null;
  }
}

/**
 * 按权限名称搜索
 *
 * @example
 * const permissions = await searchPermissionsByName('用户')
 */
export async function searchPermissionsByName(keyword: string) {
  if (!keyword.trim()) {
    return [];
  }

  const permissions = await getPermissionsCached();
  return permissions.filter(p =>
    p.perm_name.includes(keyword) || p.perm_code.includes(keyword)
  );
}

/**
 * 检查权限代码是否存在
 *
 * @example
 * const exists = await checkPermissionCodeExists('sys.user.manage')
 */
export async function checkPermissionCodeExists(permCode: string): Promise<boolean> {
  try {
    const permission = await findPermissionByCode(permCode);
    return permission !== null;
  } catch {
    return false;
  }
}

/**
 * 获取所有模块列表
 *
 * @example
 * const modules = await getAllModules()
 */
export async function getAllModules(): Promise<string[]> {
  const permissions = await getPermissionsCached();
  const modules = new Set(permissions.map(p => p.module_code));
  return Array.from(modules).sort();
}

/**
 * 获取所有操作类型列表
 *
 * @example
 * const actions = await getAllActions()
 */
export async function getAllActions(): Promise<string[]> {
  const permissions = await getPermissionsCached();
  const actions = new Set(permissions.map(p => p.action_code));
  return Array.from(actions).sort();
}

/**
 * 获取权限统计信息（带重试）
 *
 * @example
 * const stats = await getPermissionStats()
 */
export async function getPermissionStats() {
  const result = await enhancedApi.get('/api/v1/permissions', {
    retry: { times: 3, delay: 1000 },
    cache: { ttl: 10 * 60 * 1000 },
    label: '获取权限统计',
  }) as PermissionView[];

  const moduleCount = new Set(result.map(p => p.module_code)).size;
  const actionCount = new Set(result.map(p => p.action_code)).size;

  return {
    total: result.length,
    moduleCount,
    actionCount,
  };
}

/**
 * 预加载权限数据（后台加载）
 *
 * @example
 * preloadPermissions()
 */
export function preloadPermissions() {
  getPermissionsCached().catch(() => {
    // 忽略错误
  });
}

// ============================================================================
// 缓存管理
// ============================================================================

/**
 * 清除权限相关缓存
 */
export function clearPermissionCache() {
  enhancedApi.clearCache('permissions');
}
