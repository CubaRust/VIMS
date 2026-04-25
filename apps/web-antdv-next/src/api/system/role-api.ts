// ==========================
// role-api.ts 安全完整版本
// ==========================

import type { Schema } from '#/api';
import { api, enhancedApi } from '#/api';

// ==========================
// 类型定义
// ==========================
export type RoleView = Schema<'RoleView'>;

export type RoleWithStatusView = RoleView & {
  is_active?: boolean;
  user_count?: number;
  permission_ids?: number[];
  description?: string;
};

export interface RoleCreateParams {
  role_code: string;
  role_name: string;
  description?: string;
  is_active?: boolean;
}

export interface RoleUpdateParams {
  role_id: number;
  role_name?: string;
  description?: string;
  is_active?: boolean;
}

export interface RolePermissionParams {
  role_id: number;
  permission_ids: number[];
}

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
// 基础 CRUD 操作
// ==========================

/**
 * 获取角色列表
 */
export async function listRoles(): Promise<RoleWithStatusView[]> {
  try {
    const result = await enhancedApi.get('/api/v1/roles');

    if (!Array.isArray(result)) {
      throw new Error('返回数据不是数组');
    }
    return result as RoleWithStatusView[];
  } catch (err) {
    console.error('listRoles error:', err);
    return [];
  }
}

/**
 * 获取角色详情
 */
export async function getRoleDetail(roleId: number): Promise<RoleWithStatusView | null> {
  try {
    const result = await api.get(`/api/v1/roles/${roleId}` as any);
    if (!result) throw new Error('角色不存在');
    return result as RoleWithStatusView;
  } catch (err) {
    console.error('getRoleDetail error:', err);
    return null;
  }
}

/**
 * 创建角色
 */
export async function createRole(params: RoleCreateParams): Promise<RoleWithStatusView> {
  console.log('Creating role with params:', params);
  const result = await api.post('/api/v1/roles' as any, params);
  console.log('Create role response:', result);
  return result as Promise<RoleWithStatusView>;
}

/**
 * 更新角色
 */
export async function updateRole(params: RoleUpdateParams): Promise<RoleWithStatusView> {
  console.log('Updating role:', params.role_id, params);
  const result = await api.put(`/api/v1/roles/${params.role_id}` as any, params);
  console.log('Update role response:', result);
  return result as Promise<RoleWithStatusView>;
}

/**
 * 删除角色
 */
export async function deleteRole(roleId: number): Promise<void> {
  console.log('Deleting role:', roleId);
  const result = await api.delete(`/api/v1/roles/${roleId}` as any);
  console.log('Delete role response:', result);
  return result as Promise<void>;
}

/**
 * 分配权限
 */
export async function assignPermissions(params: RolePermissionParams): Promise<void> {
  console.log('Assigning permissions:', params.role_id, params.permission_ids);
  const result = await api.post(`/api/v1/roles/${params.role_id}/permissions` as any, { permission_ids: params.permission_ids });
  console.log('Assign permissions response:', result);
  return result as Promise<void>;
}

/**
 * 获取角色的权限
 */
export async function getRolePermissions(roleId: number): Promise<number[]> {
  console.log('Getting role permissions:', roleId);
  const result = await api.get(`/api/v1/roles/${roleId}/permissions` as any);
  console.log('Get role permissions response:', result);
  return (result as any)?.permission_ids || [];
}

/**
 * 获取带缓存的角色列表
 */

/**
 * 获取带缓存的角色列表
 */
export async function getRolesCached(): Promise<RoleWithStatusView[]> {
  try {
    const result = await enhancedApi.get('/api/v1/roles', {
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
    const roles = await enhancedApi.get('/api/v1/roles', {
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
