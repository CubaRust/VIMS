import { computed, ref } from 'vue';

import type {
  DictListQuery,
  DictStats,
  DictView,
} from '#/api/system/dict-api';

import {
  batchGetDicts,
  checkDictKeyExists,
  clearDictCache,
  clearDictListCache,
  clearDictStatsCache,
  clearDictTypeCache,
  createDict,
  getActiveDicts,
  getAllDictTypes,
  getDictKey,
  getDictMap,
  getDictsByType,
  getDictsCached,
  getDictStats,
  getDictValue,
  listDicts,
  preloadCommonDicts,
  updateDict,
} from '#/api/system/dict-api';

import type {
  DictCreateBody,
  DictUpdateBody,
} from '#/api/system/dict-api';

export function useDicts() {
  const dicts = ref<DictView[]>([]);
  const activeDicts = ref<DictView[]>([]);
  const dictTypes = ref<string[]>([]);
  const stats = ref<DictStats | null>(null);

  const loading = ref(false);
  const saving = ref(false);
  const statsLoading = ref(false);
  const error = ref<unknown>(null);

  const dictOptions = computed(() =>
    activeDicts.value.map((dict) => ({
      label: dict.dict_value,
      value: dict.dict_key,
      disabled: !dict.is_active,
    })),
  );

  async function loadDicts(params?: DictListQuery, useCache = true) {
    loading.value = true;
    error.value = null;

    try {
      dicts.value = useCache
        ? await getDictsCached(params)
        : await listDicts(params);

      return dicts.value;
    } catch (err) {
      error.value = err;
      return [];
    } finally {
      loading.value = false;
    }
  }

  async function loadByType(dictType: string) {
    loading.value = true;
    error.value = null;

    try {
      dicts.value = await getDictsByType(dictType);
      return dicts.value;
    } catch (err) {
      error.value = err;
      return [];
    } finally {
      loading.value = false;
    }
  }

  async function loadActiveByType(dictType: string) {
    loading.value = true;
    error.value = null;

    try {
      activeDicts.value = await getActiveDicts(dictType);
      return activeDicts.value;
    } catch (err) {
      error.value = err;
      return [];
    } finally {
      loading.value = false;
    }
  }

  async function saveDict(data: DictCreateBody) {
    saving.value = true;
    error.value = null;

    try {
      const result = await createDict(data);
      return result;
    } catch (err) {
      error.value = err;
      return null;
    } finally {
      saving.value = false;
    }
  }

  async function modifyDict(id: number, data: DictUpdateBody) {
    saving.value = true;
    error.value = null;

    try {
      const result = await updateDict(id, data);
      return result;
    } catch (err) {
      error.value = err;
      return null;
    } finally {
      saving.value = false;
    }
  }

  async function loadTypes() {
    dictTypes.value = await getAllDictTypes();
    return dictTypes.value;
  }

  async function loadStats() {
    statsLoading.value = true;
    error.value = null;

    try {
      stats.value = await getDictStats();
      return stats.value;
    } catch (err) {
      error.value = err;
      return null;
    } finally {
      statsLoading.value = false;
    }
  }

  async function getValue(dictType: string, dictKey: string) {
    return getDictValue(dictType, dictKey);
  }

  async function getKey(dictType: string, dictValue: string) {
    return getDictKey(dictType, dictValue);
  }

  async function getMap(dictType: string) {
    return getDictMap(dictType);
  }

  async function exists(dictType: string, dictKey: string) {
    return checkDictKeyExists(dictType, dictKey);
  }

  async function batchLoad(dictTypes: string[]) {
    return batchGetDicts(dictTypes);
  }

  function preload(dictTypes: string[]) {
    preloadCommonDicts(dictTypes);
  }

  function clearCache() {
    clearDictCache();
  }

  function clearListCache() {
    clearDictListCache();
  }

  function clearStatsCache() {
    clearDictStatsCache();
  }

  function clearTypeCache(dictType: string) {
    clearDictTypeCache(dictType);
  }

  return {
    dicts,
    activeDicts,
    dictTypes,
    stats,

    loading,
    saving,
    statsLoading,
    error,

    dictOptions,

    loadDicts,
    loadByType,
    loadActiveByType,
    saveDict,
    modifyDict,
    loadTypes,
    loadStats,
    getValue,
    getKey,
    getMap,
    exists,
    batchLoad,
    preload,

    clearCache,
    clearListCache,
    clearStatsCache,
    clearTypeCache,
  };
}
