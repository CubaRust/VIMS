/**
 * 不良品管理 Composable
 *
 * 提供不良品单的完整生命周期管理，包括待拆解、待报废、待返工查询
 *
 * @example
 * ```ts
 * const manager = useDefectManager()
 * await manager.loadList()
 * await manager.createDefect(data)
 * await manager.loadPendingDismantle()
 * ```
 */

import { ref, computed, type Ref } from 'vue'
import type {
  DefectHeadView,
  CreateDefectCommand,
  UpdateDefectCommand,
  QueryDefects,
} from '../../api/defect/defect-api'
import {
  listDefects,
  getDefect,
  createDefect,
  updateDefect,
  deleteDefect,
  submitDefect,
  voidDefect,
  getPendingDismantleDefects,
  getPendingScrapDefects,
  getPendingReworkDefects,
  getDefectsByStatus,
  getDefectsByType,
  getDefectsByHandleMethod,
  getDefectsByMaterial,
  getDefectsByDateRange,
  searchDefectsByNo,
  getCachedPendingDismantleDefects,
  getCachedPendingScrapDefects,
  getCachedPendingReworkDefects,
  batchGetDefects,
  batchSubmitDefects,
  batchVoidDefects,
  getDefectStats,
  getDefectTotalQty,
  getDefectMaterialCount,
  canEditDefect,
  canSubmitDefect,
  getDefectTodoStats,
  getDefectPrintData,
  clearDefectCache,
} from '../../api/defect/defect-api'

export function useDefectList(options: { autoLoad?: boolean; filters?: Ref<QueryDefects> } = {}) {
  const { autoLoad = false, filters } = options
  const defects = ref<DefectHeadView[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const load = async (params?: QueryDefects) => {
    loading.value = true
    error.value = null
    try {
      defects.value = await listDefects(params || filters?.value)
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  const refresh = () => load(filters?.value)
  const filterByStatus = async (status: string) => { loading.value = true; error.value = null; try { defects.value = await getDefectsByStatus(status) } catch (e) { error.value = e as Error; throw e } finally { loading.value = false } }
  const filterByType = async (type: string) => { loading.value = true; error.value = null; try { defects.value = await getDefectsByType(type) } catch (e) { error.value = e as Error; throw e } finally { loading.value = false } }
  const filterByHandleMethod = async (method: string) => { loading.value = true; error.value = null; try { defects.value = await getDefectsByHandleMethod(method) } catch (e) { error.value = e as Error; throw e } finally { loading.value = false } }
  const filterByMaterial = async (materialId: number) => { loading.value = true; error.value = null; try { defects.value = await getDefectsByMaterial(materialId) } catch (e) { error.value = e as Error; throw e } finally { loading.value = false } }
  const filterByDateRange = async (dateFrom: string, dateTo: string) => { loading.value = true; error.value = null; try { defects.value = await getDefectsByDateRange(dateFrom, dateTo) } catch (e) { error.value = e as Error; throw e } finally { loading.value = false } }
  const search = async (defectNo: string) => { loading.value = true; error.value = null; try { defects.value = await searchDefectsByNo(defectNo) } catch (e) { error.value = e as Error; throw e } finally { loading.value = false } }
  const loadPendingDismantle = async () => { loading.value = true; error.value = null; try { defects.value = await getCachedPendingDismantleDefects() } catch (e) { error.value = e as Error; throw e } finally { loading.value = false } }
  const loadPendingScrap = async () => { loading.value = true; error.value = null; try { defects.value = await getCachedPendingScrapDefects() } catch (e) { error.value = e as Error; throw e } finally { loading.value = false } }
  const loadPendingRework = async () => { loading.value = true; error.value = null; try { defects.value = await getCachedPendingReworkDefects() } catch (e) { error.value = e as Error; throw e } finally { loading.value = false } }

  if (autoLoad) load()

  return { defects, loading, error, load, refresh, filterByStatus, filterByType, filterByHandleMethod, filterByMaterial, filterByDateRange, search, loadPendingDismantle, loadPendingScrap, loadPendingRework }
}

export function useDefectDetail(id: Ref<number | null>) {
  const defect = ref<DefectHeadView | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const load = async () => { if (!id.value) return; loading.value = true; error.value = null; try { defect.value = await getDefect(id.value) } catch (e) { error.value = e as Error; throw e } finally { loading.value = false } }
  const refresh = () => load()
  const update = async (data: UpdateDefectCommand) => { if (!id.value) throw new Error('不良品单 ID 不能为空'); loading.value = true; error.value = null; try { defect.value = await updateDefect(id.value, data); clearDefectCache() } catch (e) { error.value = e as Error; throw e } finally { loading.value = false } }

  const canEdit = computed(() => defect.value?.status === 'PENDING')
  const canSubmit = computed(() => defect.value?.status === 'PENDING' && (defect.value?.lines?.length || 0) > 0)
  const checkCanEdit = async () => { if (!id.value) return false; return await canEditDefect(id.value) }
  const checkCanSubmit = async () => { if (!id.value) return false; return await canSubmitDefect(id.value) }

  return { defect, loading, error, load, refresh, update, canEdit, canSubmit, checkCanEdit, checkCanSubmit }
}

export function useDefectForm() {
  const formData = ref<Partial<CreateDefectCommand>>({ lines: [] })
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const create = async (data: CreateDefectCommand) => { loading.value = true; error.value = null; try { const result = await createDefect(data); clearDefectCache(); return result } catch (e) { error.value = e as Error; throw e } finally { loading.value = false } }
  const reset = () => { formData.value = { lines: [] }; error.value = null }
  const validate = () => { if (!formData.value.defect_date) throw new Error('不良日期不能为空'); if (!formData.value.defect_type) throw new Error('不良类型不能为空'); if (!formData.value.lines || formData.value.lines.length === 0) throw new Error('不良明细不能为空'); return true }

  return { formData, loading, error, create, reset, validate }
}

export function useDefectActions() {
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const deleteOne = async (id: number) => { loading.value = true; error.value = null; try { await deleteDefect(id); clearDefectCache() } catch (e) { error.value = e as Error; throw e } finally { loading.value = false } }
  const voidOne = async (id: number) => { loading.value = true; error.value = null; try { await voidDefect(id); clearDefectCache() } catch (e) { error.value = e as Error; throw e } finally { loading.value = false } }
  const submit = async (id: number) => { loading.value = true; error.value = null; try { const result = await submitDefect(id); clearDefectCache(); return result } catch (e) { error.value = e as Error; throw e } finally { loading.value = false } }

  return { loading, error, deleteOne, voidOne, submit }
}

export function useDefectStats() {
  const stats = ref<any>(null)
  const todoStats = ref<any>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const load = async () => { loading.value = true; error.value = null; try { stats.value = await getDefectStats() } catch (e) { error.value = e as Error; throw e } finally { loading.value = false } }
  const loadTodoStats = async () => { loading.value = true; error.value = null; try { todoStats.value = await getDefectTodoStats() } catch (e) { error.value = e as Error; throw e } finally { loading.value = false } }
  const loadQuantities = async (id: number) => { loading.value = true; error.value = null; try { const [totalQty, materialCount] = await Promise.all([getDefectTotalQty(id), getDefectMaterialCount(id)]); return { totalQty, materialCount } } catch (e) { error.value = e as Error; throw e } finally { loading.value = false } }

  return { stats, todoStats, loading, error, load, loadTodoStats, loadQuantities }
}

export function useDefectBatch() {
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const batchGet = async (ids: number[]) => { loading.value = true; error.value = null; try { return await batchGetDefects(ids) } catch (e) { error.value = e as Error; throw e } finally { loading.value = false } }
  const batchSubmit = async (ids: number[]) => { loading.value = true; error.value = null; try { await batchSubmitDefects(ids); clearDefectCache() } catch (e) { error.value = e as Error; throw e } finally { loading.value = false } }
  const batchVoid = async (ids: number[]) => { loading.value = true; error.value = null; try { await batchVoidDefects(ids); clearDefectCache() } catch (e) { error.value = e as Error; throw e } finally { loading.value = false } }

  return { loading, error, batchGet, batchSubmit, batchVoid }
}

export function useDefectPrint() {
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const getPrintData = async (id: number) => { loading.value = true; error.value = null; try { return await getDefectPrintData(id) } catch (e) { error.value = e as Error; throw e } finally { loading.value = false } }
  return { loading, error, getPrintData }
}

export function useDefectManager() {
  const currentId = ref<number | null>(null)
  const list = useDefectList()
  const detail = useDefectDetail(currentId)
  const form = useDefectForm()
  const actions = useDefectActions()
  const stats = useDefectStats()
  const batch = useDefectBatch()
  const print = useDefectPrint()

  const setCurrentId = (id: number | null) => { currentId.value = id; if (id) detail.load() }
  const createDefect = async (data: CreateDefectCommand) => { const result = await form.create(data); await list.refresh(); return result }
  const updateDefect = async (id: number, data: UpdateDefectCommand) => { currentId.value = id; const result = await detail.update(data); await list.refresh(); return result }
  const deleteDefect = async (id: number) => { await actions.deleteOne(id); await list.refresh(); if (currentId.value === id) currentId.value = null }
  const voidDefect = async (id: number) => { await actions.voidOne(id); if (currentId.value === id) await detail.refresh(); await list.refresh() }
  const submitDefect = async (id: number) => { const result = await actions.submit(id); if (currentId.value === id) await detail.refresh(); await list.refresh(); return result }

  return {
    currentId, defects: list.defects, currentDefect: detail.defect, stats: stats.stats, todoStats: stats.todoStats,
    loading: computed(() => list.loading.value || detail.loading.value || form.loading.value || actions.loading.value || stats.loading.value || batch.loading.value || print.loading.value),
    loadList: list.load, refreshList: list.refresh, filterByStatus: list.filterByStatus, filterByType: list.filterByType, filterByHandleMethod: list.filterByHandleMethod,
    filterByMaterial: list.filterByMaterial, filterByDateRange: list.filterByDateRange, search: list.search,
    loadPendingDismantle: list.loadPendingDismantle, loadPendingScrap: list.loadPendingScrap, loadPendingRework: list.loadPendingRework,
    setCurrentId, loadDetail: (id: number) => { setCurrentId(id); return detail.load() }, refreshDetail: detail.refresh,
    createDefect, updateDefect, deleteDefect, voidDefect, submitDefect,
    formData: form.formData, resetForm: form.reset, validateForm: form.validate,
    loadStats: stats.load, loadTodoStats: stats.loadTodoStats, loadQuantities: stats.loadQuantities,
    batchGet: batch.batchGet, batchSubmit: batch.batchSubmit, batchVoid: batch.batchVoid,
    getPrintData: print.getPrintData, canEdit: detail.canEdit, canSubmit: detail.canSubmit, checkCanEdit: detail.checkCanEdit, checkCanSubmit: detail.checkCanSubmit,
  }
}
