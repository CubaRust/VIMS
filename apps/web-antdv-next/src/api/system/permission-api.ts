/**
 * 权限管理 API
 *
 * 提供权限列表查询、搜索、筛选、统计等功能
 */

import type { Schema } from '#/api';

import { api } from '#/api';
import { enhancedApi } from '#/api';

// ============================================================================
// 类型定义
// ============================================================================

export type PermissionView = Schema<'PermissionView'>;

export interface PermissionStats {
  total: number;
  moduleCount: number;
  actionCount: number;
}

// ============================================================================
// 基础操作
// ============================================================================

/**
 * 获取权限列表
 *
 * @example
 * const permissions = await listPermissions()
 */
export async function listPermissions(): Promise<PermissionView[]> {
  return enhancedApi.get('/api/v1/permissions') as Promise<PermissionView[]>;
}

// ============================================================================
// 业务逻辑封装：缓存 / 搜索 / 筛选 / 统计
// ============================================================================

/**
 * 获取权限列表，带缓存
 *
 * @example
 * const permissions = await getPermissionsCached()
 */
export async function getPermissionsCached(): Promise<PermissionView[]> {
  return enhancedApi.get('/api/v1/permissions', {
    cache: {
      ttl: 10 * 60 * 1000,
      key: 'permissions:list',
    },
    label: '获取权限列表',
  }) as Promise<PermissionView[]>;
}

/**
 * 按模块获取权限
 *
 * @example
 * const permissions = await getPermissionsByModule('sys')
 */
export async function getPermissionsByModule(
  moduleCode: string,
): Promise<PermissionView[]> {
  const normalizedModuleCode = moduleCode.trim();

  if (!normalizedModuleCode) {
    return [];
  }

  const permissions = await getPermissionsCached();

  return permissions.filter(
    (permission) => permission.module_code === normalizedModuleCode,
  );
}

/**
 * 按操作类型获取权限
 *
 * @example
 * const permissions = await getPermissionsByAction('view')
 */
export async function getPermissionsByAction(
  actionCode: string,
): Promise<PermissionView[]> {
  const normalizedActionCode = actionCode.trim();

  if (!normalizedActionCode) {
    return [];
  }

  const permissions = await getPermissionsCached();

  return permissions.filter(
    (permission) => permission.action_code === normalizedActionCode,
  );
}

/**
 * 按权限代码查找权限
 *
 * @example
 * const permission = await findPermissionByCode('sys.user.manage')
 */
export async function findPermissionByCode(
  permCode: string,
): Promise<PermissionView | null> {
  const normalizedPermCode = permCode.trim();

  if (!normalizedPermCode) {
    return null;
  }

  try {
    const permissions = await getPermissionsCached();

    return (
      permissions.find(
        (permission) => permission.perm_code === normalizedPermCode,
      ) ?? null
    );
  } catch {
    return null;
  }
}

/**
 * 按权限名称或权限代码搜索
 *
 * @example
 * const permissions = await searchPermissionsByName('用户')
 */
export async function searchPermissionsByName(
  keyword: string,
): Promise<PermissionView[]> {
  const normalizedKeyword = keyword.trim();

  if (!normalizedKeyword) {
    return [];
  }

  const permissions = await getPermissionsCached();

  return permissions.filter(
    (permission) =>
      permission.perm_name.includes(normalizedKeyword) ||
      permission.perm_code.includes(normalizedKeyword),
  );
}

/**
 * 检查权限代码是否存在
 *
 * @example
 * const exists = await checkPermissionCodeExists('sys.user.manage')
 */
export async function checkPermissionCodeExists(
  permCode: string,
): Promise<boolean> {
  const normalizedPermCode = permCode.trim();

  if (!normalizedPermCode) {
    return false;
  }

  const permission = await findPermissionByCode(normalizedPermCode);

  return permission !== null;
}

/**
 * 获取所有模块列表
 *
 * @example
 * const modules = await getAllModules()
 */
export async function getAllModules(): Promise<string[]> {
  const permissions = await getPermissionsCached();

  const modules = new Set(
    permissions
      .map((permission) => permission.module_code)
      .filter(Boolean),
  );

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

  const actions = new Set(
    permissions
      .map((permission) => permission.action_code)
      .filter(Boolean),
  );

  return Array.from(actions).sort();
}

/**
 * 获取权限统计信息，带重试和缓存
 *
 * @example
 * const stats = await getPermissionStats()
 */
export async function getPermissionStats(): Promise<PermissionStats> {
  const permissions = (await enhancedApi.get('/api/v1/permissions', {
    retry: {
      times: 3,
      delay: 1000,
    },
    cache: {
      ttl: 10 * 60 * 1000,
      key: 'permissions:stats',
    },
    label: '获取权限统计',
  })) as PermissionView[];

  const moduleCount = new Set(
    permissions
      .map((permission) => permission.module_code)
      .filter(Boolean),
  ).size;

  const actionCount = new Set(
    permissions
      .map((permission) => permission.action_code)
      .filter(Boolean),
  ).size;

  return {
    total: permissions.length,
    moduleCount,
    actionCount,
  };
}

/**
 * 预加载权限数据
 *
 * @example
 * preloadPermissions()
 */
export function preloadPermissions() {
  void getPermissionsCached().catch(() => {
    // 忽略预加载失败
  });
}

// ============================================================================
// 缓存管理
// ============================================================================

/**
 * 清除权限相关缓存
 */
export function clearPermissionCache() {
  enhancedApi.clearCache('permissions:');
}

/**
 * 清除权限列表缓存
 */
export function clearPermissionListCache() {
  enhancedApi.clearCache('permissions:list');
}

/**
 * 清除权限统计缓存
 */
export function clearPermissionStatsCache() {
  enhancedApi.clearCache('permissions:stats');
}
