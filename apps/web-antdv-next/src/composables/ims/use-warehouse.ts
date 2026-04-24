/**
 * Warehouse & Location Composable
 * 仓库和仓位管理 Composable
 *
 * 提供仓库和仓位的完整管理功能，包括：
 * - 仓库列表、详情、创建、更新、删除
 * - 仓位列表、详情、创建、更新、删除
 * - 仓库选择器（用于下拉选择）
 * - 仓位选择器（用于下拉选择）
 * - 仓位占用率查询
 *
 * @example
 * ```ts
 * // 仓库选择器
 * const { warehouses, loading, search } = useWarehouseSelector();
 * await search('原料仓');
 *
 * // 仓位选择器
 * const { locations, loading, searchByWarehouse } = useLocationSelector();
 * await searchByWarehouse(1);
 *
 * // 占用率查询
 * const { occupancy, loading, fetchOccupancy } = useLocationOccupancy();
 * await fetchOccupancy(1);
 * ```
 */

import { ref, computed, type Ref } from 'vue';
import type {
  WarehouseView,
  LocationView,
  LocationOccupancy,
  CreateWarehouseCommand,
  UpdateWarehouseCommand,
  CreateLocationCommand,
  UpdateLocationCommand,
  QueryWarehouses,
  QueryLocations,
  ToggleStatusRequest,
} from '@/api/shared/types';
import * as warehouseApi from '@/api/warehouse/warehouse-api';

// ============================================================================
// 1. Warehouse List Management - 仓库列表管理
// ============================================================================

export interface UseWarehouseListOptions {
  autoLoad?: boolean;
  initialParams?: QueryWarehouses;
}

export interface UseWarehouseListReturn {
  warehouses: Ref<WarehouseView[]>;
  loading: Ref<boolean>;
  error: Ref<Error | null>;
  fetchWarehouses: (params?: QueryWarehouses) => Promise<void>;
  refresh: () => Promise<void>;
  clearCache: () => void;
}

/**
 * 仓库列表管理
 */
export function useWarehouseList(options: UseWarehouseListOptions = {}): UseWarehouseListReturn {
  const { autoLoad = true, initialParams } = options;

  const warehouses = ref<WarehouseView[]>([]);
  const loading = ref(false);
  const error = ref<Error | null>(null);
  const currentParams = ref<QueryWarehouses | undefined>(initialParams);

  const fetchWarehouses = async (params?: QueryWarehouses) => {
    loading.value = true;
    error.value = null;
    currentParams.value = params;

    try {
      warehouses.value = await warehouseApi.listWarehouses(params);
    } catch (e) {
      error.value = e as Error;
      console.error('Failed to fetch warehouses:', e);
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const refresh = () => fetchWarehouses(currentParams.value);

  const clearCache = () => {
    warehouseApi.clearWarehouseCache();
  };

  if (autoLoad) {
    fetchWarehouses(initialParams);
  }

  return {
    warehouses,
    loading,
    error,
    fetchWarehouses,
    refresh,
    clearCache,
  };
}

// ============================================================================
// 2. Warehouse Detail Management - 仓库详情管理
// ============================================================================

export interface UseWarehouseReturn {
  warehouse: Ref<WarehouseView | null>;
  loading: Ref<boolean>;
  error: Ref<Error | null>;
  fetchWarehouse: (id: number) => Promise<void>;
  updateWarehouse: (id: number, data: UpdateWarehouseCommand) => Promise<void>;
  toggleStatus: (id: number, isActive: boolean) => Promise<void>;
  clearCache: () => void;
}

/**
 * 仓库详情管理
 */
export function useWarehouse(): UseWarehouseReturn {
  const warehouse = ref<WarehouseView | null>(null);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  const fetchWarehouse = async (id: number) => {
    loading.value = true;
    error.value = null;

    try {
      warehouse.value = await warehouseApi.getWarehouse(id);
    } catch (e) {
      error.value = e as Error;
      console.error('Failed to fetch warehouse:', e);
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const updateWarehouse = async (id: number, data: UpdateWarehouseCommand) => {
    loading.value = true;
    error.value = null;

    try {
      await warehouseApi.updateWarehouse(id, data);
      await fetchWarehouse(id);
      warehouseApi.clearWarehouseCache();
    } catch (e) {
      error.value = e as Error;
      console.error('Failed to update warehouse:', e);
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const toggleStatus = async (id: number, isActive: boolean) => {
    loading.value = true;
    error.value = null;

    try {
      await warehouseApi.toggleWarehouseStatus(id, { is_active: isActive });
      await fetchWarehouse(id);
      warehouseApi.clearWarehouseCache();
    } catch (e) {
      error.value = e as Error;
      console.error('Failed to toggle warehouse status:', e);
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const clearCache = () => {
    warehouseApi.clearWarehouseCache();
  };

  return {
    warehouse,
    loading,
    error,
    fetchWarehouse,
    updateWarehouse,
    toggleStatus,
    clearCache,
  };
}

// ============================================================================
// 3. Warehouse Create Management - 仓库创建管理
// ============================================================================

export interface UseWarehouseCreateReturn {
  loading: Ref<boolean>;
  error: Ref<Error | null>;
  createWarehouse: (data: CreateWarehouseCommand) => Promise<WarehouseView>;
  validateData: (data: CreateWarehouseCommand) => string[];
}

/**
 * 仓库创建管理
 */
export function useWarehouseCreate(): UseWarehouseCreateReturn {
  const loading = ref(false);
  const error = ref<Error | null>(null);

  const createWarehouse = async (data: CreateWarehouseCommand): Promise<WarehouseView> => {
    loading.value = true;
    error.value = null;

    try {
      const result = await warehouseApi.createWarehouse(data);
      warehouseApi.clearWarehouseCache();
      return result;
    } catch (e) {
      error.value = e as Error;
      console.error('Failed to create warehouse:', e);
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const validateData = (data: CreateWarehouseCommand): string[] => {
    const errors: string[] = [];

    if (!data.wh_code?.trim()) {
      errors.push('仓库编码不能为空');
    }
    if (!data.wh_name?.trim()) {
      errors.push('仓库名称不能为空');
    }
    if (!data.wh_type?.trim()) {
      errors.push('仓库类型不能为空');
    }

    return errors;
  };

  return {
    loading,
    error,
    createWarehouse,
    validateData,
  };
}

// ============================================================================
// 4. Warehouse Delete Management - 仓库删除管理
// ============================================================================

export interface UseWarehouseDeleteReturn {
  loading: Ref<boolean>;
  error: Ref<Error | null>;
  deleteWarehouse: (id: number) => Promise<void>;
}

/**
 * 仓库删除管理
 */
export function useWarehouseDelete(): UseWarehouseDeleteReturn {
  const loading = ref(false);
  const error = ref<Error | null>(null);

  const deleteWarehouse = async (id: number) => {
    loading.value = true;
    error.value = null;

    try {
      await warehouseApi.deleteWarehouse(id);
      warehouseApi.clearWarehouseCache();
    } catch (e) {
      error.value = e as Error;
      console.error('Failed to delete warehouse:', e);
      throw e;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    error,
    deleteWarehouse,
  };
}

// ============================================================================
// 5. Warehouse Selector - 仓库选择器
// ============================================================================

export interface UseWarehouseSelectorOptions {
  autoLoad?: boolean;
  activeOnly?: boolean;
  whType?: string;
}

export interface UseWarehouseSelectorReturn {
  warehouses: Ref<WarehouseView[]>;
  loading: Ref<boolean>;
  error: Ref<Error | null>;
  search: (keyword?: string) => Promise<void>;
  searchByType: (whType: string) => Promise<void>;
  loadActive: () => Promise<void>;
  refresh: () => Promise<void>;
  clearCache: () => void;
}

/**
 * 仓库选择器
 * 用于下拉选择、搜索选择等场景
 */
export function useWarehouseSelector(options: UseWarehouseSelectorOptions = {}): UseWarehouseSelectorReturn {
  const { autoLoad = true, activeOnly = true, whType } = options;

  const warehouses = ref<WarehouseView[]>([]);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  const search = async (keyword?: string) => {
    loading.value = true;
    error.value = null;

    try {
      const params: QueryWarehouses = {
        keyword,
        is_active: activeOnly ? true : undefined,
        wh_type: whType,
      };
      warehouses.value = await warehouseApi.listWarehouses(params);
    } catch (e) {
      error.value = e as Error;
      console.error('Failed to search warehouses:', e);
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const searchByType = async (type: string) => {
    loading.value = true;
    error.value = null;

    try {
      warehouses.value = await warehouseApi.getWarehousesByType(type);
    } catch (e) {
      error.value = e as Error;
      console.error('Failed to search warehouses by type:', e);
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const loadActive = async () => {
    loading.value = true;
    error.value = null;

    try {
      warehouses.value = await warehouseApi.getActiveWarehouses();
    } catch (e) {
      error.value = e as Error;
      console.error('Failed to load active warehouses:', e);
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const refresh = () => search();

  const clearCache = () => {
    warehouseApi.clearWarehouseCache();
  };

  if (autoLoad) {
    if (activeOnly) {
      loadActive();
    } else {
      search();
    }
  }

  return {
    warehouses,
    loading,
    error,
    search,
    searchByType,
    loadActive,
    refresh,
    clearCache,
  };
}

// ============================================================================
// 6. Location List Management - 仓位列表管理
// ============================================================================

export interface UseLocationListOptions {
  autoLoad?: boolean;
  initialParams?: QueryLocations;
}

export interface UseLocationListReturn {
  locations: Ref<LocationView[]>;
  loading: Ref<boolean>;
  error: Ref<Error | null>;
  fetchLocations: (params?: QueryLocations) => Promise<void>;
  refresh: () => Promise<void>;
  clearCache: () => void;
}

/**
 * 仓位列表管理
 */
export function useLocationList(options: UseLocationListOptions = {}): UseLocationListReturn {
  const { autoLoad = true, initialParams } = options;

  const locations = ref<LocationView[]>([]);
  const loading = ref(false);
  const error = ref<Error | null>(null);
  const currentParams = ref<QueryLocations | undefined>(initialParams);

  const fetchLocations = async (params?: QueryLocations) => {
    loading.value = true;
    error.value = null;
    currentParams.value = params;

    try {
      locations.value = await warehouseApi.listLocations(params);
    } catch (e) {
      error.value = e as Error;
      console.error('Failed to fetch locations:', e);
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const refresh = () => fetchLocations(currentParams.value);

  const clearCache = () => {
    warehouseApi.clearLocationCache();
  };

  if (autoLoad) {
    fetchLocations(initialParams);
  }

  return {
    locations,
    loading,
    error,
    fetchLocations,
    refresh,
    clearCache,
  };
}

// ============================================================================
// 7. Location Detail Management - 仓位详情管理
// ============================================================================

export interface UseLocationReturn {
  location: Ref<LocationView | null>;
  loading: Ref<boolean>;
  error: Ref<Error | null>;
  fetchLocation: (id: number) => Promise<void>;
  updateLocation: (id: number, data: UpdateLocationCommand) => Promise<void>;
  toggleStatus: (id: number, isActive: boolean) => Promise<void>;
  clearCache: () => void;
}

/**
 * 仓位详情管理
 */
export function useLocation(): UseLocationReturn {
  const location = ref<LocationView | null>(null);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  const fetchLocation = async (id: number) => {
    loading.value = true;
    error.value = null;

    try {
      location.value = await warehouseApi.getLocation(id);
    } catch (e) {
      error.value = e as Error;
      console.error('Failed to fetch location:', e);
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const updateLocation = async (id: number, data: UpdateLocationCommand) => {
    loading.value = true;
    error.value = null;

    try {
      await warehouseApi.updateLocation(id, data);
      await fetchLocation(id);
      warehouseApi.clearLocationCache();
    } catch (e) {
      error.value = e as Error;
      console.error('Failed to update location:', e);
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const toggleStatus = async (id: number, isActive: boolean) => {
    loading.value = true;
    error.value = null;

    try {
      await warehouseApi.toggleLocationStatus(id, { is_active: isActive });
      await fetchLocation(id);
      warehouseApi.clearLocationCache();
    } catch (e) {
      error.value = e as Error;
      console.error('Failed to toggle location status:', e);
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const clearCache = () => {
    warehouseApi.clearLocationCache();
  };

  return {
    location,
    loading,
    error,
    fetchLocation,
    updateLocation,
    toggleStatus,
    clearCache,
  };
}

// ============================================================================
// 8. Location Create Management - 仓位创建管理
// ============================================================================

export interface UseLocationCreateReturn {
  loading: Ref<boolean>;
  error: Ref<Error | null>;
  createLocation: (data: CreateLocationCommand) => Promise<LocationView>;
  validateData: (data: CreateLocationCommand) => string[];
}

/**
 * 仓位创建管理
 */
export function useLocationCreate(): UseLocationCreateReturn {
  const loading = ref(false);
  const error = ref<Error | null>(null);

  const createLocation = async (data: CreateLocationCommand): Promise<LocationView> => {
    loading.value = true;
    error.value = null;

    try {
      const result = await warehouseApi.createLocation(data);
      warehouseApi.clearLocationCache();
      return result;
    } catch (e) {
      error.value = e as Error;
      console.error('Failed to create location:', e);
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const validateData = (data: CreateLocationCommand): string[] => {
    const errors: string[] = [];

    if (!data.wh_id) {
      errors.push('仓库ID不能为空');
    }
    if (!data.loc_code?.trim()) {
      errors.push('仓位编码不能为空');
    }
    if (!data.loc_name?.trim()) {
      errors.push('仓位名称不能为空');
    }
    if (!data.loc_type?.trim()) {
      errors.push('仓位类型不能为空');
    }

    return errors;
  };

  return {
    loading,
    error,
    createLocation,
    validateData,
  };
}

// ============================================================================
// 9. Location Delete Management - 仓位删除管理
// ============================================================================

export interface UseLocationDeleteReturn {
  loading: Ref<boolean>;
  error: Ref<Error | null>;
  deleteLocation: (id: number) => Promise<void>;
}

/**
 * 仓位删除管理
 */
export function useLocationDelete(): UseLocationDeleteReturn {
  const loading = ref(false);
  const error = ref<Error | null>(null);

  const deleteLocation = async (id: number) => {
    loading.value = true;
    error.value = null;

    try {
      await warehouseApi.deleteLocation(id);
      warehouseApi.clearLocationCache();
    } catch (e) {
      error.value = e as Error;
      console.error('Failed to delete location:', e);
      throw e;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    error,
    deleteLocation,
  };
}

// ============================================================================
// 10. Location Selector - 仓位选择器
// ============================================================================

export interface UseLocationSelectorOptions {
  autoLoad?: boolean;
  activeOnly?: boolean;
  whId?: number;
  locType?: string;
}

export interface UseLocationSelectorReturn {
  locations: Ref<LocationView[]>;
  loading: Ref<boolean>;
  error: Ref<Error | null>;
  search: (keyword?: string) => Promise<void>;
  searchByWarehouse: (whId: number) => Promise<void>;
  searchByType: (locType: string) => Promise<void>;
  refresh: () => Promise<void>;
  clearCache: () => void;
}

/**
 * 仓位选择器
 * 用于下拉选择、搜索选择等场景
 */
export function useLocationSelector(options: UseLocationSelectorOptions = {}): UseLocationSelectorReturn {
  const { autoLoad = true, activeOnly = true, whId, locType } = options;

  const locations = ref<LocationView[]>([]);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  const search = async (keyword?: string) => {
    loading.value = true;
    error.value = null;

    try {
      const params: QueryLocations = {
        keyword,
        is_active: activeOnly ? true : undefined,
        wh_id: whId,
        loc_type: locType,
      };
      locations.value = await warehouseApi.listLocations(params);
    } catch (e) {
      error.value = e as Error;
      console.error('Failed to search locations:', e);
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const searchByWarehouse = async (warehouseId: number) => {
    loading.value = true;
    error.value = null;

    try {
      locations.value = await warehouseApi.getLocationsByWarehouse(warehouseId);
    } catch (e) {
      error.value = e as Error;
      console.error('Failed to search locations by warehouse:', e);
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const searchByType = async (type: string) => {
    loading.value = true;
    error.value = null;

    try {
      locations.value = await warehouseApi.getLocationsByType(type);
    } catch (e) {
      error.value = e as Error;
      console.error('Failed to search locations by type:', e);
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const refresh = () => search();

  const clearCache = () => {
    warehouseApi.clearLocationCache();
  };

  if (autoLoad) {
    if (whId) {
      searchByWarehouse(whId);
    } else {
      search();
    }
  }

  return {
    locations,
    loading,
    error,
    search,
    searchByWarehouse,
    searchByType,
    refresh,
    clearCache,
  };
}

// ============================================================================
// 11. Location Occupancy - 仓位占用率查询
// ============================================================================

export interface UseLocationOccupancyReturn {
  occupancy: Ref<LocationOccupancy | null>;
  occupancies: Ref<LocationOccupancy[]>;
  loading: Ref<boolean>;
  error: Ref<Error | null>;
  fetchOccupancy: (id: number) => Promise<void>;
  fetchOccupancies: (whId?: number) => Promise<void>;
  occupancyRate: Ref<number>;
  isHighOccupancy: Ref<boolean>;
  clearCache: () => void;
}

/**
 * 仓位占用率查询
 */
export function useLocationOccupancy(): UseLocationOccupancyReturn {
  const occupancy = ref<LocationOccupancy | null>(null);
  const occupancies = ref<LocationOccupancy[]>([]);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  const fetchOccupancy = async (id: number) => {
    loading.value = true;
    error.value = null;

    try {
      occupancy.value = await warehouseApi.getLocationOccupancy(id);
    } catch (e) {
      error.value = e as Error;
      console.error('Failed to fetch location occupancy:', e);
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const fetchOccupancies = async (whId?: number) => {
    loading.value = true;
    error.value = null;

    try {
      occupancies.value = await warehouseApi.listLocationOccupancies({ wh_id: whId });
    } catch (e) {
      error.value = e as Error;
      console.error('Failed to fetch location occupancies:', e);
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const occupancyRate = computed(() => {
    if (!occupancy.value) return 0;
    const { total_capacity, used_capacity } = occupancy.value;
    if (!total_capacity || total_capacity === 0) return 0;
    return (used_capacity / total_capacity) * 100;
  });

  const isHighOccupancy = computed(() => occupancyRate.value >= 80);

  const clearCache = () => {
    warehouseApi.clearLocationCache();
  };

  return {
    occupancy,
    occupancies,
    loading,
    error,
    fetchOccupancy,
    fetchOccupancies,
    occupancyRate,
    isHighOccupancy,
    clearCache,
  };
}

// ============================================================================
// 12. Warehouse Manager - 完整管理器
// ============================================================================

export interface UseWarehouseManagerReturn {
  // Warehouse
  warehouseList: ReturnType<typeof useWarehouseList>;
  warehouse: ReturnType<typeof useWarehouse>;
  warehouseCreate: ReturnType<typeof useWarehouseCreate>;
  warehouseDelete: ReturnType<typeof useWarehouseDelete>;
  warehouseSelector: ReturnType<typeof useWarehouseSelector>;

  // Location
  locationList: ReturnType<typeof useLocationList>;
  location: ReturnType<typeof useLocation>;
  locationCreate: ReturnType<typeof useLocationCreate>;
  locationDelete: ReturnType<typeof useLocationDelete>;
  locationSelector: ReturnType<typeof useLocationSelector>;
  locationOccupancy: ReturnType<typeof useLocationOccupancy>;

  // Global actions
  clearAllCache: () => void;
}

/**
 * 仓库和仓位完整管理器
 * 整合所有功能模块
 */
export function useWarehouseManager(): UseWarehouseManagerReturn {
  const warehouseList = useWarehouseList({ autoLoad: false });
  const warehouse = useWarehouse();
  const warehouseCreate = useWarehouseCreate();
  const warehouseDelete = useWarehouseDelete();
  const warehouseSelector = useWarehouseSelector({ autoLoad: false });

  const locationList = useLocationList({ autoLoad: false });
  const location = useLocation();
  const locationCreate = useLocationCreate();
  const locationDelete = useLocationDelete();
  const locationSelector = useLocationSelector({ autoLoad: false });
  const locationOccupancy = useLocationOccupancy();

  const clearAllCache = () => {
    warehouseApi.clearWarehouseCache();
    warehouseApi.clearLocationCache();
  };

  return {
    warehouseList,
    warehouse,
    warehouseCreate,
    warehouseDelete,
    warehouseSelector,
    locationList,
    location,
    locationCreate,
    locationDelete,
    locationSelector,
    locationOccupancy,
    clearAllCache,
  };
}
