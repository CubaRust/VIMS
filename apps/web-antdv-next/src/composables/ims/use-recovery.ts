/**
 * 拆解回收管理 Composable
 * 提供拆解回收单的完整生命周期管理，包括模板应用功能
 */

import { ref, computed, type Ref } from 'vue'
import type { RecoveryHeadView, CreateRecoveryCommand, UpdateRecoveryCommand, ApplyTemplateCommand, QueryRecoveries } from '../../api/recovery/recovery-api'
import {
  listRecoveries, getRecovery, createRecovery, updateRecovery, deleteRecovery, submitRecovery, voidRecovery, applyTemplate,
  getRecoveriesByStatus, getRecoveriesBySourceMaterial, getRecoveriesByTargetMaterial, getRecoveriesByDateRange, searchRecoveriesByNo,
  batchGetRecoveries, batchSubmitRecoveries, batchVoidRecoveries,
  getRecoveryStats, getRecoveryTotalSourceQty, getRecoveryTotalTargetQty, canEditRecovery, canSubmitRecovery,
  getPendingRecoveries, getRecoveryPrintData, clearRecoveryCache,
} from '../../api/recovery/recovery-api'

export function useRecoveryList(options: { autoLoad?: boolean; filters?: Ref<QueryRecoveries> } = {}) {
  const { autoLoad = false, filters } = options
  const recoveries = ref<RecoveryHeadView[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const load = async (params?: QueryRecoveries) => { loading.value = true; error.value = null; try { recoveries.value = await listRecoveries(params || filters?.value) } catch (e) { error.value = e as Error; throw e } finally { loading.value = false } }
  const refresh = () => load(filters?.value)
  const filterByStatus = async (status: string) => { loading.value = true; error.value = null; try { recoveries.value = await getRecoveriesByStatus(status) } catch (e) { error.value = e as Error; throw e } finally { loading.value = false } }
  const filterBySourceMaterial = async (materialId: number) => { loading.value = true; error.value = null; try { recoveries.value = await getRecoveriesBySourceMaterial(materialId) } catch (e) { error.value = e as Error; throw e } finally { loading.value = false } }
  const filterByTargetMaterial = async (materialId: number) => { loading.value = true; error.value = null; try { recoveries.value = await getRecoveriesByTargetMaterial(materialId) } catch (e) { error.value = e as Error; throw e } finally { loading.value = false } }
  const filterByDateRange = async (dateFrom: string, dateTo: string) => { loading.value = true; error.value = null; try { recoveries.value = await getRecoveriesByDateRange(dateFrom, dateTo) } catch (e) { error.value = e as Error; throw e } finally { loading.value = false } }
  const search = async (recoveryNo: string) => { loading.value = true; error.value = null; try { recoveries.value = await searchRecoveriesByNo(recoveryNo) } catch (e) { error.value = e as Error; throw e } finally { loading.value = false } }
  const loadPending = async () => { loading.value = true; error.value = null; try { recoveries.value = await getPendingRecoveries() } catch (e) { error.value = e as Error; throw e } finally { loading.value = false } }

  if (autoLoad) load()
  return { recoveries, loading, error, load, refresh, filterByStatus, filterBySourceMaterial, filterByTargetMaterial, filterByDateRange, search, loadPending }
}

export function useRecoveryDetail(id: Ref<number | null>) {
  const recovery = ref<RecoveryHeadView | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const load = async () => { if (!id.value) return; loading.value = true; error.value = null; try { recovery.value = await getRecovery(id.value) } catch (e) { error.value = e as Error; throw e } finally { loading.value = false } }
  const refresh = () => load()
  const update = async (data: UpdateRecoveryCommand) => { if (!id.value) throw new Error('拆解回收单 ID 不能为空'); loading.value = true; error.value = null; try { recovery.value = await updateRecovery(id.value, data); clearRecoveryCache() } catch (e) { error.value = e as Error; throw e } finally { loading.value = false } }

  const canEdit = computed(() => recovery.value?.status === 'PENDING')
  const canSubmit = computed(() => recovery.value?.status === 'PENDING' && (recovery.value?.lines?.length || 0) > 0)
  const checkCanEdit = async () => { if (!id.value) return false; return await canEditRecovery(id.value) }
  const checkCanSubmit = async () => { if (!id.value) return false; return await canSubmitRecovery(id.value) }

  return { recovery, loading, error, load, refresh, update, canEdit, canSubmit, checkCanEdit, checkCanSubmit }
}

export function useRecoveryForm() {
  const formData = ref<Partial<CreateRecoveryCommand>>({ lines: [] })
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const create = async (data: CreateRecoveryCommand) => { loading.value = true; error.value = null; try { const result = await createRecovery(data); clearRecoveryCache(); return result } catch (e) { error.value = e as Error; throw e } finally { loading.value = false } }
  const reset = () => { formData.value = { lines: [] }; error.value = null }
  const validate = () => { if (!formData.value.recovery_date) throw new Error('拆解日期不能为空'); if (!formData.value.source_material_id) throw new Error('源物料不能为空'); if (!formData.value.lines || formData.value.lines.length === 0) throw new Error('回收明细不能为空'); return true }

  return { formData, loading, error, create, reset, validate }
}

export function useRecoveryWorkflow() {
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const deleteOne = async (id: number) => { loading.value = true; error.value = null; try { await deleteRecovery(id); clearRecoveryCache() } catch (e) { error.value = e as Error; throw e } finally { loading.value = false } }
  const voidOne = async (id: number) => { loading.value = true; error.value = null; try { await voidRecovery(id); clearRecoveryCache() } catch (e) { error.value = e as Error; throw e } finally { loading.value = false } }
  const submit = async (id: number) => { loading.value = true; error.value = null; try { const result = await submitRecovery(id); clearRecoveryCache(); return result } catch (e) { error.value = e as Error; throw e } finally { loading.value = false } }
  const applyTpl = async (id: number, data: ApplyTemplateCommand) => { loading.value = true; error.value = null; try { const result = await applyTemplate(id, data); clearRecoveryCache(); return result } catch (e) { error.value = e as Error; throw e } finally { loading.value = false } }

  return { loading, error, deleteOne, voidOne, submit, applyTpl }
}

export function useRecoveryStats() {
  const stats = ref<any>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const load = async () => { loading.value = true; error.value = null; try { stats.value = await getRecoveryStats() } catch (e) { error.value = e as Error; throw e } finally { loading.value = false } }
  const loadQuantities = async (id: number) => { loading.value = true; error.value = null; try { const [sourceQty, targetQty] = await Promise.all([getRecoveryTotalSourceQty(id), getRecoveryTotalTargetQty(id)]); return { sourceQty, targetQty } } catch (e) { error.value = e as Error; throw e } finally { loading.value = false } }

  return { stats, loading, error, load, loadQuantities }
}

export function useRecoveryBatch() {
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const batchGet = async (ids: number[]) => { loading.value = true; error.value = null; try { return await batchGetRecoveries(ids) } catch (e) { error.value = e as Error; throw e } finally { loading.value = false } }
  const batchSubmit = async (ids: number[]) => { loading.value = true; error.value = null; try { await batchSubmitRecoveries(ids); clearRecoveryCache() } catch (e) { error.value = e as Error; throw e } finally { loading.value = false } }
  const batchVoid = async (ids: number[]) => { loading.value = true; error.value = null; try { await batchVoidRecoveries(ids); clearRecoveryCache() } catch (e) { error.value = e as Error; throw e } finally { loading.value = false } }

  return { loading, error, batchGet, batchSubmit, batchVoid }
}

export function useRecoveryPrint() {
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const getPrintData = async (id: number) => { loading.value = true; error.value = null; try { return await getRecoveryPrintData(id) } catch (e) { error.value = e as Error; throw e } finally { loading.value = false } }
  return { loading, error, getPrintData }
}

export function useRecoveryManager() {
  const currentId = ref<number | null>(null)
  const list = useRecoveryList()
  const detail = useRecoveryDetail(currentId)
  const form = useRecoveryForm()
  const workflow = useRecoveryWorkflow()
  const stats = useRecoveryStats()
  const batch = useRecoveryBatch()
  const print = useRecoveryPrint()

  const setCurrentId = (id: number | null) => { currentId.value = id; if (id) detail.load() }
  const createRecovery = async (data: CreateRecoveryCommand) => { const result = await form.create(data); await list.refresh(); return result }
  const updateRecovery = async (id: number, data: UpdateRecoveryCommand) => { currentId.value = id; const result = await detail.update(data); await list.refresh(); return result }
  const deleteRecovery = async (id: number) => { await workflow.deleteOne(id); await list.refresh(); if (currentId.value === id) currentId.value = null }
  const voidRecovery = async (id: number) => { await workflow.voidOne(id); if (currentId.value === id) await detail.refresh(); await list.refresh() }
  const submitRecovery = async (id: number) => { const result = await workflow.submit(id); if (currentId.value === id) await detail.refresh(); await list.refresh(); return result }
  const applyTemplate = async (id: number, data: ApplyTemplateCommand) => { const result = await workflow.applyTpl(id, data); if (currentId.value === id) await detail.refresh(); await list.refresh(); return result }

  return {
    currentId, recoveries: list.recoveries, currentRecovery: detail.recovery, stats: stats.stats,
    loading: computed(() => list.loading.value || detail.loading.value || form.loading.value || workflow.loading.value || stats.loading.value || batch.loading.value || print.loading.value),
    loadList: list.load, refreshList: list.refresh, filterByStatus: list.filterByStatus, filterBySourceMaterial: list.filterBySourceMaterial, filterByTargetMaterial: list.filterByTargetMaterial, filterByDateRange: list.filterByDateRange, search: list.search, loadPending: list.loadPending,
    setCurrentId, loadDetail: (id: number) => { setCurrentId(id); return detail.load() }, refreshDetail: detail.refresh,
    createRecovery, updateRecovery, deleteRecovery, voidRecovery, submitRecovery, applyTemplate,
    formData: form.formData, resetForm: form.reset, validateForm: form.validate,
    loadStats: stats.load, loadQuantities: stats.loadQuantities,
    batchGet: batch.batchGet, batchSubmit: batch.batchSubmit, batchVoid: batch.batchVoid,
    getPrintData: print.getPrintData, canEdit: detail.canEdit, canSubmit: detail.canSubmit, checkCanEdit: detail.checkCanEdit, checkCanSubmit: detail.checkCanSubmit,
  }
}
