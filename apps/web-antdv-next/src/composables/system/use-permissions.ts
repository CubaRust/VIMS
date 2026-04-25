import { ref, computed } from 'vue';
import type { PermissionStats, PermissionView } from '#/api/system';
import {
  checkPermissionCodeExists,
  clearPermissionCache,
  clearPermissionListCache,
  clearPermissionStatsCache,
  findPermissionByCode,
  getAllActions,
  getAllModules,
  getPermissionStats,
  getPermissionsByAction,
  getPermissionsByModule,
  getPermissionsCached,
  listPermissions,
  preloadPermissions,
  searchPermissionsByName,
} from '#/api/system';

export function usePermissions() {
  const permissions = ref<PermissionView[]>([]);
  const searchResult = ref<PermissionView[]>([]);
  const stats = ref<PermissionStats | null>(null);

  const loading = ref(false);
  const searching = ref(false);
  const statsLoading = ref(false);
  const error = ref<unknown>(null);

  // 计算属性：按模块分组
  const groupedByModule = computed(() => {
    const groups = new Map<string, PermissionView[]>();
    permissions.value.forEach((perm) => {
      const module = perm.module_code || '未分类';
      if (!groups.has(module)) {
        groups.set(module, []);
      }
      groups.get(module)!.push(perm);
    });
    return groups;
  });

  // 计算属性：按操作类型分组
  const groupedByAction = computed(() => {
    const groups = new Map<string, PermissionView[]>();
    permissions.value.forEach((perm) => {
      const action = perm.action_code || '未知';
      if (!groups.has(action)) {
        groups.set(action, []);
      }
      groups.get(action)!.push(perm);
    });
    return groups;
  });

  async function loadPermissions(useCache = true) {
    loading.value = true;
    error.value = null;

    try {
      const result = useCache ? await getPermissionsCached() : await listPermissions();
      if (!Array.isArray(result)) throw new Error('返回的数据不是数组');
      permissions.value = result;
      return permissions.value;
    } catch (err) {
      console.error('loadPermissions error:', err);
      error.value = err;
      permissions.value = [];
      return [];
    } finally {
      loading.value = false;
    }
  }

  async function search(keyword: string) {
    searching.value = true;
    error.value = null;

    try {
      const result = await searchPermissionsByName(keyword);
      if (!Array.isArray(result)) throw new Error('返回的数据不是数组');
      searchResult.value = result;
      return searchResult.value;
    } catch (err) {
      console.error('searchPermissionsByName error:', err);
      error.value = err;
      searchResult.value = [];
      return [];
    } finally {
      searching.value = false;
    }
  }

  async function loadStats() {
    statsLoading.value = true;
    error.value = null;

    try {
      const result = await getPermissionStats();
      stats.value = result;
      return stats.value;
    } catch (err) {
      console.error('getPermissionStats error:', err);
      error.value = err;
      stats.value = null;
      return null;
    } finally {
      statsLoading.value = false;
    }
  }

  async function findByCode(permCode: string) {
    try {
      return await findPermissionByCode(permCode);
    } catch (err) {
      console.error('findPermissionByCode error:', err);
      return null;
    }
  }

  async function exists(permCode: string) {
    try {
      return await checkPermissionCodeExists(permCode);
    } catch (err) {
      console.error('checkPermissionCodeExists error:', err);
      return false;
    }
  }

  async function loadModules() {
    try {
      return await getAllModules();
    } catch (err) {
      console.error('getAllModules error:', err);
      return [];
    }
  }

  async function loadActions() {
    try {
      return await getAllActions();
    } catch (err) {
      console.error('getAllActions error:', err);
      return [];
    }
  }

  async function filterByModule(moduleCode: string) {
    try {
      return await getPermissionsByModule(moduleCode);
    } catch (err) {
      console.error('getPermissionsByModule error:', err);
      return [];
    }
  }

  async function filterByAction(actionCode: string) {
    try {
      return await getPermissionsByAction(actionCode);
    } catch (err) {
      console.error('getPermissionsByAction error:', err);
      return [];
    }
  }

  function clearCache() {
    clearPermissionCache();
  }

  function clearListCache() {
    clearPermissionListCache();
  }

  function clearStatsCache() {
    clearPermissionStatsCache();
  }

  function preload() {
    try {
      preloadPermissions();
    } catch (err) {
      console.error('preloadPermissions error:', err);
    }
  }

  return {
    permissions,
    searchResult,
    stats,
    loading,
    searching,
    statsLoading,
    error,

    groupedByModule,
    groupedByAction,

    loadPermissions,
    search,
    loadStats,
    findByCode,
    exists,
    loadModules,
    loadActions,
    filterByModule,
    filterByAction,

    clearCache,
    clearListCache,
    clearStatsCache,
    preload,
  };
}
