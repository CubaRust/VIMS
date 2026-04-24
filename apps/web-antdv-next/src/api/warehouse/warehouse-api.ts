/**
 * 仓库管理 API
 *
 * 提供仓库和仓位的完整 CRUD 操作、状态管理和占用率查询
 */

import type { Schema } from '../shared/helpers';
import { api } from '../shared/client-factory';
import { enhancedApi } from '../shared/enhanced-client';

// ============================================================================
// 类型定义
// ============================================================================

export type WarehouseView = Schema<'WarehouseView'>;
export type LocationView = Schema<'LocationView'>;
export type LocationOccupancy = Schema<'LocationOccupancy'>;
export type CreateWarehouseCommand = Schema<'CreateWarehouseCommand'>;
export type UpdateWarehouseCommand = Schema<'UpdateWarehouseCommand'>;
export type CreateLocationCommand = Schema<'CreateLocationCommand'>;
export type UpdateLocationCommand = Schema<'UpdateLocationCommand'>;

export interface QueryWarehouses {
  wh_code?: string;
  wh_name?: string;
  wh_type?: string;
  is_active?: boolean;
}

export interface QueryLocations {
  wh_id?: number;
  loc_code?: string;
  loc_name?: string;
  loc_type?: string;
  is_active?: boolean;
}

export interface ToggleStatusRequest {
  is_active: boolean;
}

// ============================================================================
// 仓库 CRUD 操作
// ============================================================================

/**
 * 获取仓库列表
 *
 * @example
 * const warehouses = await listWarehouses({ wh_type: 'RAW_WH' })
 */
export async function listWarehouses(params?: QueryWarehouses) {
  return api.get('/api/v1/warehouses', {
    params: params as any,
  }) as Promise<WarehouseView[]>;
}

/**
 * 获取仓库详情
 *
 * @example
 * const warehouse = await getWarehouse(1)
 */
export async function getWarehouse(id: number) {
  return api.get('/api/v1/warehouses/{id}', {
    pathParams: { id },
  }) as Promise<WarehouseView>;
}

/**
 * 创建仓库
 *
 * @example
 * const newWarehouse = await createWarehouse({
 *   wh_code: 'WH001',
 *   wh_name: '原材料仓',
 *   wh_type: 'RAW_WH',
 *   is_active: true
 * })
 */
export async function createWarehouse(data: CreateWarehouseCommand) {
  return api.post('/api/v1/warehouses', data) as Promise<WarehouseView>;
}

/**
 * 更新仓库
 *
 * @example
 * const updated = await updateWarehouse(1, {
 *   wh_name: '原材料仓库',
 *   wh_type: 'RAW_WH'
 * })
 */
export async function updateWarehouse(id: number, data: UpdateWarehouseCommand) {
  return api.put('/api/v1/warehouses/{id}', data, {
    pathParams: { id },
  }) as Promise<WarehouseView>;
}

/**
 * 删除仓库
 *
 * @example
 * await deleteWarehouse(1)
 */
export async function deleteWarehouse(id: number) {
  return api.delete('/api/v1/warehouses/{id}', {
    pathParams: { id },
  });
}

/**
 * 切换仓库状态（启用/禁用）
 *
 * @example
 * const updated = await toggleWarehouseStatus(1, { is_active: false })
 */
export async function toggleWarehouseStatus(id: number, data: ToggleStatusRequest) {
  return api.patch('/api/v1/warehouses/{id}/status', data, {
    pathParams: { id },
  }) as Promise<WarehouseView>;
}

// ============================================================================
// 仓位 CRUD 操作
// ============================================================================

/**
 * 获取仓位列表
 *
 * @example
 * const locations = await listLocations({ wh_id: 1, loc_type: 'NORMAL' })
 */
export async function listLocations(params?: QueryLocations) {
  return api.get('/api/v1/locations', {
    params: params as any,
  }) as Promise<LocationView[]>;
}

/**
 * 获取仓位详情
 *
 * @example
 * const location = await getLocation(1)
 */
export async function getLocation(id: number) {
  return api.get('/api/v1/locations/{id}', {
    pathParams: { id },
  }) as Promise<LocationView>;
}

/**
 * 创建仓位
 *
 * @example
 * const newLocation = await createLocation({
 *   wh_id: 1,
 *   loc_code: 'A01-01',
 *   loc_name: 'A区1排1位',
 *   loc_type: 'NORMAL',
 *   capacity: 1000,
 *   is_active: true
 * })
 */
export async function createLocation(data: CreateLocationCommand) {
  return api.post('/api/v1/locations', data) as Promise<LocationView>;
}

/**
 * 更新仓位
 *
 * @example
 * const updated = await updateLocation(1, {
 *   loc_name: 'A区1排1位（更新）',
 *   capacity: 1200
 * })
 */
export async function updateLocation(id: number, data: UpdateLocationCommand) {
  return api.put('/api/v1/locations/{id}', data, {
    pathParams: { id },
  }) as Promise<LocationView>;
}

/**
 * 删除仓位
 *
 * @example
 * await deleteLocation(1)
 */
export async function deleteLocation(id: number) {
  return api.delete('/api/v1/locations/{id}', {
    pathParams: { id },
  });
}

/**
 * 切换仓位状态（启用/禁用）
 *
 * @example
 * const updated = await toggleLocationStatus(1, { is_active: false })
 */
export async function toggleLocationStatus(id: number, data: ToggleStatusRequest) {
  return api.patch('/api/v1/locations/{id}/status', data, {
    pathParams: { id },
  }) as Promise<LocationView>;
}

// ============================================================================
// 仓位占用率查询
// ============================================================================

/**
 * 获取单个仓位的占用率
 *
 * @example
 * const occupancy = await getLocationOccupancy(1)
 */
export async function getLocationOccupancy(id: number) {
  return api.get('/api/v1/locations/{id}/occupancy', {
    pathParams: { id },
  }) as Promise<LocationOccupancy>;
}

/**
 * 获取仓位占用率列表
 *
 * @example
 * const occupancies = await listLocationOccupancies({ wh_id: 1 })
 */
export async function listLocationOccupancies(params?: { wh_id?: number }) {
  return api.get('/api/v1/locations/occupancy', {
    params: params as any,
  }) as Promise<LocationOccupancy[]>;
}

// ============================================================================
// 业务逻辑封装（使用 enhancedApi）
// ============================================================================

/**
 * 按仓库类型获取仓库（带缓存）
 *
 * @example
 * const rawWarehouses = await getWarehousesByType('RAW_WH')
 */
export async function getWarehousesByType(whType: string) {
  return enhancedApi.get('/api/v1/warehouses', {
    params: { wh_type: whType } as any,
    cache: { ttl: 5 * 60 * 1000, key: `type:${whType}` },
    label: `获取${whType}类型仓库`,
  }) as Promise<WarehouseView[]>;
}

/**
 * 获取启用的仓库（带缓存）
 *
 * @example
 * const activeWarehouses = await getActiveWarehouses()
 */
export async function getActiveWarehouses() {
  return enhancedApi.get('/api/v1/warehouses', {
    params: { is_active: true } as any,
    cache: { ttl: 5 * 60 * 1000, key: 'active' },
    label: '获取启用仓库',
  }) as Promise<WarehouseView[]>;
}

/**
 * 按仓库获取仓位（带缓存）
 *
 * @example
 * const locations = await getLocationsByWarehouse(1)
 */
export async function getLocationsByWarehouse(whId: number) {
  return enhancedApi.get('/api/v1/locations', {
    params: { wh_id: whId } as any,
    cache: { ttl: 5 * 60 * 1000, key: `wh:${whId}` },
    label: `获取仓库${whId}的仓位`,
  }) as Promise<LocationView[]>;
}

/**
 * 按仓位类型获取仓位（带缓存）
 *
 * @example
 * const normalLocations = await getLocationsByType('NORMAL')
 */
export async function getLocationsByType(locType: string) {
  return enhancedApi.get('/api/v1/locations', {
    params: { loc_type: locType } as any,
    cache: { ttl: 5 * 60 * 1000, key: `type:${locType}` },
    label: `获取${locType}类型仓位`,
  }) as Promise<LocationView[]>;
}

/**
 * 获取启用的仓位（带缓存）
 *
 * @example
 * const activeLocations = await getActiveLocations()
 */
export async function getActiveLocations() {
  return enhancedApi.get('/api/v1/locations', {
    params: { is_active: true } as any,
    cache: { ttl: 5 * 60 * 1000, key: 'active' },
    label: '获取启用仓位',
  }) as Promise<LocationView[]>;
}

/**
 * 搜索仓库（按编码或名称）
 *
 * @example
 * const warehouses = await searchWarehouses('WH')
 */
export async function searchWarehouses(keyword: string) {
  if (!keyword.trim()) {
    return [];
  }

  const [byCode, byName] = await Promise.all([
    enhancedApi.get('/api/v1/warehouses', {
      params: { wh_code: keyword } as any,
      cache: { ttl: 2 * 60 * 1000, key: `code:${keyword}` },
      label: `搜索仓库编码: ${keyword}`,
    }) as Promise<WarehouseView[]>,
    enhancedApi.get('/api/v1/warehouses', {
      params: { wh_name: keyword } as any,
      cache: { ttl: 2 * 60 * 1000, key: `name:${keyword}` },
      label: `搜索仓库名称: ${keyword}`,
    }) as Promise<WarehouseView[]>,
  ]);

  // 合并去重
  const map = new Map<number, WarehouseView>();
  [...byCode, ...byName].forEach(wh => map.set(wh.id, wh));
  return Array.from(map.values());
}

/**
 * 搜索仓位（按编码或名称）
 *
 * @example
 * const locations = await searchLocations('A01')
 */
export async function searchLocations(keyword: string) {
  if (!keyword.trim()) {
    return [];
  }

  const [byCode, byName] = await Promise.all([
    enhancedApi.get('/api/v1/locations', {
      params: { loc_code: keyword } as any,
      cache: { ttl: 2 * 60 * 1000, key: `code:${keyword}` },
      label: `搜索仓位编码: ${keyword}`,
    }) as Promise<LocationView[]>,
    enhancedApi.get('/api/v1/locations', {
      params: { loc_name: keyword } as any,
      cache: { ttl: 2 * 60 * 1000, key: `name:${keyword}` },
      label: `搜索仓位名称: ${keyword}`,
    }) as Promise<LocationView[]>,
  ]);

  // 合并去重
  const map = new Map<number, LocationView>();
  [...byCode, ...byName].forEach(loc => map.set(loc.id, loc));
  return Array.from(map.values());
}

/**
 * 批量获取仓库详情
 *
 * @example
 * const warehouses = await batchGetWarehouses([1, 2, 3])
 */
export async function batchGetWarehouses(ids: number[]) {
  return enhancedApi.batch(
    ids.map((id) => () => getWarehouse(id))
  );
}

/**
 * 批量获取仓位详情
 *
 * @example
 * const locations = await batchGetLocations([1, 2, 3])
 */
export async function batchGetLocations(ids: number[]) {
  return enhancedApi.batch(
    ids.map((id) => () => getLocation(id))
  );
}

/**
 * 批量获取仓位占用率
 *
 * @example
 * const occupancies = await batchGetLocationOccupancies([1, 2, 3])
 */
export async function batchGetLocationOccupancies(ids: number[]) {
  return enhancedApi.batch(
    ids.map((id) => () => getLocationOccupancy(id))
  );
}

/**
 * 获取仓库统计信息（带重试）
 *
 * @example
 * const stats = await getWarehouseStats()
 */
export async function getWarehouseStats() {
  const result = await enhancedApi.get('/api/v1/warehouses', {
    params: {} as any,
    retry: { times: 3, delay: 1000 },
    cache: { ttl: 5 * 60 * 1000 },
    label: '获取仓库统计',
  }) as WarehouseView[];

  const typeCount = result.reduce((acc, wh) => {
    acc[wh.wh_type] = (acc[wh.wh_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const activeCount = result.filter(wh => wh.is_active).length;

  return {
    total: result.length,
    active: activeCount,
    inactive: result.length - activeCount,
    byType: typeCount,
  };
}

/**
 * 获取仓位统计信息（带重试）
 *
 * @example
 * const stats = await getLocationStats()
 */
export async function getLocationStats() {
  const result = await enhancedApi.get('/api/v1/locations', {
    params: {} as any,
    retry: { times: 3, delay: 1000 },
    cache: { ttl: 5 * 60 * 1000 },
    label: '获取仓位统计',
  }) as LocationView[];

  const typeCount = result.reduce((acc, loc) => {
    acc[loc.loc_type] = (acc[loc.loc_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const activeCount = result.filter(loc => loc.is_active).length;

  return {
    total: result.length,
    active: activeCount,
    inactive: result.length - activeCount,
    byType: typeCount,
  };
}

/**
 * 获取仓库的总容量
 *
 * @example
 * const totalCapacity = await getWarehouseTotalCapacity(1)
 */
export async function getWarehouseTotalCapacity(whId: number): Promise<number> {
  const locations = await getLocationsByWarehouse(whId);
  return locations.reduce((sum, loc) => sum + (Number(loc.capacity) || 0), 0);
}

/**
 * 获取仓库的占用率统计
 *
 * @example
 * const occupancyStats = await getWarehouseOccupancyStats(1)
 */
export async function getWarehouseOccupancyStats(whId: number) {
  const occupancies = await listLocationOccupancies({ wh_id: whId });

  const totalCapacity = occupancies.reduce((sum, occ) => sum + Number(occ.capacity), 0);
  const totalUsed = occupancies.reduce((sum, occ) => sum + Number(occ.used_capacity), 0);
  const avgOccupancy = occupancies.length > 0
    ? occupancies.reduce((sum, occ) => sum + Number(occ.occupancy_rate), 0) / occupancies.length
    : 0;

  return {
    totalCapacity,
    totalUsed,
    totalAvailable: totalCapacity - totalUsed,
    avgOccupancyRate: avgOccupancy,
    locationCount: occupancies.length,
  };
}

/**
 * 检查仓库是否可删除（无关联仓位）
 *
 * @example
 * const canDelete = await canDeleteWarehouse(1)
 */
export async function canDeleteWarehouse(id: number): Promise<boolean> {
  try {
    const locations = await getLocationsByWarehouse(id);
    return locations.length === 0;
  } catch {
    return false;
  }
}

/**
 * 检查仓位是否可删除（无库存）
 *
 * @example
 * const canDelete = await canDeleteLocation(1)
 */
export async function canDeleteLocation(id: number): Promise<boolean> {
  try {
    const occupancy = await getLocationOccupancy(id);
    return Number(occupancy.used_capacity) === 0;
  } catch {
    return false;
  }
}

// ============================================================================
// 缓存管理
// ============================================================================

/**
 * 清除仓库相关缓存
 */
export function clearWarehouseCache() {
  enhancedApi.clearCache('warehouses');
  enhancedApi.clearCache('type:');
  enhancedApi.clearCache('active');
  enhancedApi.clearCache('code:');
  enhancedApi.clearCache('name:');
}

/**
 * 清除仓位相关缓存
 */
export function clearLocationCache() {
  enhancedApi.clearCache('locations');
  enhancedApi.clearCache('wh:');
  enhancedApi.clearCache('type:');
  enhancedApi.clearCache('active');
  enhancedApi.clearCache('code:');
  enhancedApi.clearCache('name:');
}
