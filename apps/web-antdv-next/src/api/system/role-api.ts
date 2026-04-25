// ==========================
// role-api.ts 安全完整版本
// ==========================

import type { Schema } from '#/api';
import { api } from '#/api';
import { enhancedApi } from '#/api';

// ==========================
// 类型定义
// ==========================
export type RoleView = Schema<'RoleView'>;

export type RoleWithStatusView = RoleView & {
  is_active?: boolean;
};

export interface RoleStats {
  total: number;
  active: number;
  inactive: number;
}

// ==========================
// 工具函数
// ==========================
function normalizeText(value: string) {
  return value.trim();
}

function isRoleActive(role: RoleWithStatusView): boolean {
  return role.is_active !== false;
}

// ==========================
// 基础操作
// ==========================
export async function listRoles(): Promise<RoleWithStatusView[]> {
  try {
    const result = await api.get('/roles'); // 注意去掉 /api，代理会自动加 /api/v1
    if (!Array.isArray(result)) throw new Error('返回数据不是数组');
    return result;
  } catch (err) {
    console.error('listRoles error:', err);
    return [];
  }
}

export async function getRolesCached(): Promise<RoleWithStatusView[]> {
  try {
    const result = await enhancedApi.get('/roles', {
      cache: { ttl: 10 * 60 * 1000, key: 'roles:list' },
      label: '获取角色列表',
    });
    if (!Array.isArray(result)) throw new Error('返回数据不是数组');
    return result;
  } catch (err) {
    console.error('getRolesCached error:', err);
    return [];
  }
}

export async function getActiveRoles(): Promise<RoleWithStatusView[]> {
  const roles = await getRolesCached();
  return roles.filter(isRoleActive);
}

export async function findRoleByCode(
  roleCode: string
): Promise<RoleWithStatusView | null> {
  const code = normalizeText(roleCode);
  if (!code) return null;

  try {
    const roles = await getRolesCached();
    return roles.find((r) => r.role_code === code) ?? null;
  } catch (err) {
    console.error('findRoleByCode error:', err);
    return null;
  }
}

export async function searchRolesByName(
  keyword: string
): Promise<RoleWithStatusView[]> {
  const key = normalizeText(keyword);
  if (!key) return [];

  try {
    const roles = await getRolesCached();
    return roles.filter(
      (r) => r.role_name.includes(key) || r.role_code.includes(key)
    );
  } catch (err) {
    console.error('searchRolesByName error:', err);
    return [];
  }
}

export async function checkRoleCodeExists(roleCode: string): Promise<boolean> {
  const role = await findRoleByCode(roleCode);
  return role !== null;
}

export async function getRoleStats(): Promise<RoleStats> {
  try {
    const roles = await enhancedApi.get('/roles', {
      cache: { ttl: 10 * 60 * 1000, key: 'roles:stats' },
      retry: { times: 3, delay: 1000 },
      label: '获取角色统计',
    });
    if (!Array.isArray(roles)) throw new Error('返回数据不是数组');

    const active = roles.filter(isRoleActive).length;
    const inactive = roles.filter((r) => r.is_active === false).length;

    return { total: roles.length, active, inactive };
  } catch (err) {
    console.error('getRoleStats error:', err);
    return { total: 0, active: 0, inactive: 0 };
  }
}

export function preloadRoles() {
  void getRolesCached().catch((err) => console.error('preloadRoles error:', err));
}

// ==========================
// 缓存管理
// ==========================
export function clearRoleCache() {
  enhancedApi.clearCache('roles:');
}
export function clearRoleListCache() {
  enhancedApi.clearCache('roles:list');
}
export function clearRoleStatsCache() {
  enhancedApi.clearCache('roles:stats');
}
