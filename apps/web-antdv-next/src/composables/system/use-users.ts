import { computed, ref } from 'vue';

import type {
  UserListQuery,
  UserStats,
  UserView,
} from '#/api/system/user-api';

import {
  clearActiveUserCache,
  clearUserCache,
  clearUserSearchCache,
  clearUserStatsCache,
  findUserByCode,
  findUserByLoginName,
  getActiveUsers,
  getUserStats,
  getUsersByRole,
  listUsers,
  preloadCommonUsers,
  searchUsers,
} from '#/api/system';

export function useUsers() {
  const users = ref<UserView[]>([]);
  const activeUsers = ref<UserView[]>([]);
  const searchResult = ref<UserView[]>([]);
  const stats = ref<UserStats | null>(null);

  const loading = ref(false);
  const searching = ref(false);
  const statsLoading = ref(false);
  const error = ref<unknown>(null);

  const enabledUsers = computed(() =>
    users.value.filter((user) => user.is_active),
  );

  const disabledUsers = computed(() =>
    users.value.filter((user) => !user.is_active),
  );

  async function loadUsers(params?: UserListQuery) {
    loading.value = true;
    error.value = null;

    try {
      users.value = await listUsers(params);
      return users.value;
    } catch (err) {
      error.value = err;
      return [];
    } finally {
      loading.value = false;
    }
  }

  async function loadActiveUsers() {
    loading.value = true;
    error.value = null;

    try {
      activeUsers.value = await getActiveUsers();
      return activeUsers.value;
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
      searchResult.value = await searchUsers(keyword);
      return searchResult.value;
    } catch (err) {
      error.value = err;
      return [];
    } finally {
      searching.value = false;
    }
  }

  async function loadStats() {
    statsLoading.value = true;
    error.value = null;

    try {
      stats.value = await getUserStats();
      return stats.value;
    } catch (err) {
      error.value = err;
      return null;
    } finally {
      statsLoading.value = false;
    }
  }

  async function findByCode(userCode: string) {
    return findUserByCode(userCode);
  }

  async function findByLoginName(loginName: string) {
    return findUserByLoginName(loginName);
  }

  async function loadUsersByRole(roleCode: string) {
    loading.value = true;
    error.value = null;

    try {
      users.value = await getUsersByRole(roleCode);
      return users.value;
    } catch (err) {
      error.value = err;
      return [];
    } finally {
      loading.value = false;
    }
  }

  function clearCache() {
    clearUserCache();
  }

  function clearSearchCache() {
    clearUserSearchCache();
  }

  function clearActiveCache() {
    clearActiveUserCache();
  }

  function clearStatsCache() {
    clearUserStatsCache();
  }

  function preload() {
    preloadCommonUsers();
  }

  return {
    users,
    activeUsers,
    searchResult,
    stats,
    loading,
    searching,
    statsLoading,
    error,

    enabledUsers,
    disabledUsers,

    loadUsers,
    loadActiveUsers,
    search,
    loadStats,
    findByCode,
    findByLoginName,
    loadUsersByRole,

    clearCache,
    clearSearchCache,
    clearActiveCache,
    clearStatsCache,
    preload,
  };
}
