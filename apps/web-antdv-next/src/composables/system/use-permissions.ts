import { ref } from 'vue';

import type {
  PermissionStats,
  PermissionView,
} from '#/api/system/permission-api';

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
} from '#/api/system/permission-api';

export function usePermissions() {
  const permissions = ref<PermissionView[]>([]);
  const modules = ref<string[]>([]);
  const actions = ref<string[]>([]);
  const searchResult = ref<PermissionView[]>([]);
  const stats = ref<PermissionStats | null>(null);

  const loading = ref(false);
  const searching = ref(false);
  const statsLoading = ref(false);
  const error = ref<unknown>(null);

  async function loadPermissions(useCache = true) {
    loading.value = true;
    error.value = null;

    try {
      permissions.value = useCache
        ? await getPermissionsCached()
        : await listPermissions();

      return permissions.value;
    } catch (err) {
      error.value = err;
      return [];
    } finally {
      loading.value = false;
    }
  }

  async function loadByModule(moduleCode: string) {
    loading.value = true;
    error.value = null;

    try {
      permissions.value = await getPermissionsByModule(moduleCode);
      return permissions.value;
    } catch (err) {
      error.value = err;
      return [];
    } finally {
      loading.value = false;
    }
  }

  async function loadByAction(actionCode: string) {
    loading.value = true;
    error.value = null;

    try {
      permissions.value = await getPermissionsByAction(actionCode);
      return permissions.value;
    } catch (err) {
      error.value = err;
      return [];
    } finally {
      loading.value = false;
    }
  }

  async function search(keyword: string) {
    searching.value = true;
    error.value = null;

    try {
      searchResult.value = await searchPermissionsByName(keyword);
      return searchResult.value;
    } catch (err) {
      error.value = err;
      return [];
    } finally {
      searching.value = false;
    }
  }

  async function loadModules() {
    modules.value = await getAllModules();
    return modules.value;
  }

  async function loadActions() {
    actions.value = await getAllActions();
    return actions.value;
  }

  async function loadStats() {
    statsLoading.value = true;
    error.value = null;

    try {
      stats.value = await getPermissionStats();
      return stats.value;
    } catch (err) {
      error.value = err;
      return null;
    } finally {
      statsLoading.value = false;
    }
  }

  async function findByCode(permCode: string) {
    return findPermissionByCode(permCode);
  }

  async function exists(permCode: string) {
    return checkPermissionCodeExists(permCode);
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
    preloadPermissions();
  }

  return {
    permissions,
    modules,
    actions,
    searchResult,
    stats,

    loading,
    searching,
    statsLoading,
    error,

    loadPermissions,
    loadByModule,
    loadByAction,
    search,
    loadModules,
    loadActions,
    loadStats,
    findByCode,
    exists,

    clearCache,
    clearListCache,
    clearStatsCache,
    preload,
  };
}
