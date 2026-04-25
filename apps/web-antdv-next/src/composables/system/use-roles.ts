import { ref, computed } from 'vue';
import type { RoleStats, RoleView } from '#/api/system';
import {
  checkRoleCodeExists,
  clearRoleCache,
  clearRoleListCache,
  clearRoleStatsCache,
  findRoleByCode,
  getActiveRoles,
  getRoleStats,
  getRolesCached,
  listRoles,
  preloadRoles,
  searchRolesByName,
} from '#/api/system';

export function useRoles() {
  const roles = ref<RoleView[]>([]);
  const searchResult = ref<RoleView[]>([]);
  const stats = ref<RoleStats | null>(null);

  const loading = ref(false);
  const searching = ref(false);
  const statsLoading = ref(false);
  const error = ref<unknown>(null);

  const activeRoles = computed(() =>
    roles.value.filter((role) => role.is_active),
  );

  const inactiveRoles = computed(() =>
    roles.value.filter((role) => !role.is_active),
  );

  async function loadRoles(useCache = true) {
    loading.value = true;
    error.value = null;

    try {
      const result = useCache ? await getRolesCached() : await listRoles();
      if (!Array.isArray(result)) throw new Error('返回的数据不是数组');
      roles.value = result;
      return roles.value;
    } catch (err) {
      console.error('loadRoles error:', err);
      error.value = err;
      roles.value = [];
      return [];
    } finally {
      loading.value = false;
    }
  }

  async function loadActiveRoles() {
    loading.value = true;
    error.value = null;

    try {
      const result = await getActiveRoles();
      if (!Array.isArray(result)) throw new Error('返回的数据不是数组');
      roles.value = result;
      return roles.value;
    } catch (err) {
      console.error('loadActiveRoles error:', err);
      error.value = err;
      roles.value = [];
      return [];
    } finally {
      loading.value = false;
    }
  }

  async function search(keyword: string) {
    searching.value = true;
    error.value = null;

    try {
      const result = await searchRolesByName(keyword);
      if (!Array.isArray(result)) throw new Error('返回的数据不是数组');
      searchResult.value = result;
      return searchResult.value;
    } catch (err) {
      console.error('searchRolesByName error:', err);
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
      const result = await getRoleStats();
      stats.value = result;
      return stats.value;
    } catch (err) {
      console.error('getRoleStats error:', err);
      error.value = err;
      stats.value = null;
      return null;
    } finally {
      statsLoading.value = false;
    }
  }

  async function findByCode(roleCode: string) {
    try {
      return await findRoleByCode(roleCode);
    } catch (err) {
      console.error('findRoleByCode error:', err);
      return null;
    }
  }

  async function exists(roleCode: string) {
    try {
      return await checkRoleCodeExists(roleCode);
    } catch (err) {
      console.error('checkRoleCodeExists error:', err);
      return false;
    }
  }

  function clearCache() {
    clearRoleCache();
  }

  function clearListCache() {
    clearRoleListCache();
  }

  function clearStatsCache() {
    clearRoleStatsCache();
  }

  function preload() {
    try {
      preloadRoles();
    } catch (err) {
      console.error('preloadRoles error:', err);
    }
  }

  return {
    roles,
    searchResult,
    stats,
    loading,
    searching,
    statsLoading,
    error,

    activeRoles,
    inactiveRoles,

    loadRoles,
    loadActiveRoles,
    search,
    loadStats,
    findByCode,
    exists,

    clearCache,
    clearListCache,
    clearStatsCache,
    preload,
  };
}
