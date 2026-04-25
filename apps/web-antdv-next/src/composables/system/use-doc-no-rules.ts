import { ref } from 'vue';

import type {
  DocNoRuleStats,
  DocNoRuleUpdateBody,
  DocNoRuleView,
} from '#/api/system/doc-no-rule-api';

import {
  batchGetDocNoRules,
  clearDocNoRuleCache,
  clearDocNoRuleListCache,
  clearDocNoRuleStatsCache,
  getAllDocTypes,
  getDocDatePattern,
  getDocNoRuleByType,
  getDocNoRuleStats,
  getDocNoRulesCached,
  getDocPrefix,
  getDocSeqLength,
  listDocNoRules,
  preloadDocNoRules,
  previewDocNo,
  updateDocNoRule,
} from '#/api/system/doc-no-rule-api';

export function useDocNoRules() {
  const rules = ref<DocNoRuleView[]>([]);
  const docTypes = ref<string[]>([]);
  const stats = ref<DocNoRuleStats | null>(null);

  const loading = ref(false);
  const saving = ref(false);
  const statsLoading = ref(false);
  const error = ref<unknown>(null);

  async function loadRules(useCache = true) {
    loading.value = true;
    error.value = null;

    try {
      rules.value = useCache
        ? await getDocNoRulesCached()
        : await listDocNoRules();

      return rules.value;
    } catch (err) {
      error.value = err;
      return [];
    } finally {
      loading.value = false;
    }
  }

  async function updateRule(id: number, data: DocNoRuleUpdateBody) {
    saving.value = true;
    error.value = null;

    try {
      const result = await updateDocNoRule(id, data);
      await loadRules(false);
      return result;
    } catch (err) {
      error.value = err;
      return null;
    } finally {
      saving.value = false;
    }
  }

  async function findByType(docType: string) {
    return getDocNoRuleByType(docType);
  }

  async function getPrefix(docType: string) {
    return getDocPrefix(docType);
  }

  async function getDatePattern(docType: string) {
    return getDocDatePattern(docType);
  }

  async function getSeqLength(docType: string) {
    return getDocSeqLength(docType);
  }

  async function preview(docType: string) {
    return previewDocNo(docType);
  }

  async function loadDocTypes() {
    docTypes.value = await getAllDocTypes();
    return docTypes.value;
  }

  async function batchLoad(types: string[]) {
    return batchGetDocNoRules(types);
  }

  async function loadStats() {
    statsLoading.value = true;
    error.value = null;

    try {
      stats.value = await getDocNoRuleStats();
      return stats.value;
    } catch (err) {
      error.value = err;
      return null;
    } finally {
      statsLoading.value = false;
    }
  }

  function preload() {
    preloadDocNoRules();
  }

  function clearCache() {
    clearDocNoRuleCache();
  }

  function clearListCache() {
    clearDocNoRuleListCache();
  }

  function clearStatsCache() {
    clearDocNoRuleStatsCache();
  }

  return {
    rules,
    docTypes,
    stats,

    loading,
    saving,
    statsLoading,
    error,

    loadRules,
    updateRule,
    findByType,
    getPrefix,
    getDatePattern,
    getSeqLength,
    preview,
    loadDocTypes,
    batchLoad,
    loadStats,
    preload,

    clearCache,
    clearListCache,
    clearStatsCache,
  };
}
