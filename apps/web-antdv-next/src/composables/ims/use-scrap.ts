/**
 * 报废管理 Composable
 * 提供报废单的完整生命周期管理，包括审批流程
 */

import { ref, computed, type Ref } from 'vue'
import type { ScrapHeadView, CreateScrapCommand, UpdateScrapCommand, ApproveScrapCommand, RejectScrapCommand, QueryScraps } from '../../api/scrap/scrap-api'
import {
  listScraps, getScrap, createScrap, updateScrap, deleteScrap, submitScrap, voidScrap, approveScrap, rejectScrap,
  getScrapsByStatus, getScrapsByReason, getScrapsByMaterial, getScrapsByDateRange, searchScrapsByNo,
  batchGetScraps, batchSubmitScraps, batchApproveScraps, batchVoidScraps,
  getScrapStats, getScrapTotalQty, getScrapMaterialCount, canEditScrap, canSubmitScrap, canApproveScrap,
  getPendingScraps, getScrapPrintData, clearScrapCache,
} from '../../api/scrap/scrap-api'

export function useScrapList(options: { autoLoad?: boolean; filters?: Ref<QueryScraps> } = {}) {
  const { autoLoad = false, filters } = options
  const scraps = ref<ScrapHeadView[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const load = async (params?: QueryScraps) => { loading.value = true; error.value = null; try { scraps.value = await listScraps(params || filters?.value) } catch (e) { error.value = e as Error; throw e } finally { loading.value = false } }
  const refresh = () => load(filters?.value)
  const filterByStatus = async (status: string) => { loading.value = true; error.value = null; try { scraps.value = await getScrapsByStatus(status) } catch (e) { error.value = e as Error; throw e } finally { loading.value = false } }
  const filterByReason = async (reason: string) => { loading.value = true; error.value = null; try { scraps.value = await getScrapsByReason(reason) } catch (e) { error.value = e as Error; throw e } finally { loading.value = false } }
  const filterByMaterial = async (materialId: number) => { loading.value = true; error.value = null; try { scraps.value = await getScrapsByMaterial(materialId) } catch (e) { error.value = e as Error; throw e } finally { loading.value = false } }
  const filterByDateRange = async (dateFrom: string, dateTo: string) => { loading.value = true; error.value = null; try { scraps.value = await getScrapsByDateRange(dateFrom, dateTo) } catch (e) { error.value = e as Error; throw e } finally { loading.value = false } }
  const search = async (scrapNo: string) => { loading.value = true; error.value = null; try { scraps.value = await searchScrapsByNo(scrapNo) } catch (e) { error.value = e as Error; throw e } finally { loading.value = false } }
  const loadPending = async () => { loading.value = true; error.value = null; try { scraps.value = await getPendingScraps() } catch (e) { error.value = e as Error; throw e } finally { loading.value = false } }

  if (autoLoad) load()
  return { scraps, loading, error, load, refresh, filterByStatus, filterByReason, filterByMaterial, filterByDateRange, search, loadPending }
}

export function useScrapDetail(id: Ref<number | null>) {
  const scrap = ref<ScrapHeadView | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const load = async () => { if (!id.value) return; loading.value = true; error.value = null; try { scrap.value = await getScrap(id.value) } catch (e) { error.value = e as Error; throw e } finally { loading.value = false } }
  const refresh = () => load()
  const update = async (data: UpdateScrapCommand) => { if (!id.value) throw new Error('报废单 ID 不能为空'); loading.value = true; error.value = null; try { scrap.value = await updateScrap(id.value, data); clearScrapCache() } catch (e) { error.value = e as Error; throw e } finally { loading.value = false } }

  const canEdit = computed(() => scrap.value?.status === 'PENDING')
  const canSubmit = computed(() => scrap.value?.status === 'PENDING' && (scrap.value?.lines?.length || 0) > 0)
  const canApprove = computed(() => scrap.value?.status === 'SUBMITTED')
  const checkCanEdit = async () => { if (!id.value) return false; return await canEditScrap(id.value) }
  const checkCanSubmit = async () => { if (!id.value) return false; return await canSubmitScrap(id.value) }
  const checkCanApprove = async () => { if (!id.value) return false; return await canApproveScrap(id.value) }

  return { scrap, loading, error, load, refresh, update, canEdit, canSubmit, canApprove, checkCanEdit, checkCanSubmit, checkCanApprove }
}

export function useScrapForm() {
  const formData = ref<Partial<CreateScrapCommand>>({ lines: [] })
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const create = async (data: CreateScrapCommand) => { loading.value = true; error.value = null; try { const result = await createScrap(data); clearScrapCache(); return result } catch (e) { error.value = e as Error; throw e } finally { loading.value = false } }
  const reset = () => { formData.value = { lines: [] }; error.value = null }
  const validate = () => { if (!formData.value.scrap_date) throw new Error('报废日期不能为空'); if (!formData.value.lines || formData.value.lines.length === 0) throw new Error('报废明细不能为空'); return true }

  return { formData, loading, error, create, reset, validate }
}

export function useScrapWorkflow() {
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const deleteOne = async (id: number) => { loading.value = true; error.value = null; try { await deleteScrap(id); clearScrapCache() } catch (e) { error.value = e as Error; throw e } finally { loading.value = false } }
  const voidOne = async (id: number) => { loading.value = true; error.value = null; try { await voidScrap(id); clearScrapCache() } catch (e) { error.value = e as Error; throw e } finally { loading.value = false } }
  const submit = async (id: number) => { loading.value = true; error.value = null; try { const result = await submitScrap(id); clearScrapCache(); return result } catch (e) { error.value = e as Error; throw e } finally { loading.value = false } }
  const approve = async (id: number, data: ApproveScrapCommand) => { loading.value = true; error.value = null; try { const result = await approveScrap(id, data); clearScrapCache(); return result } catch (e) { error.value = e as Error; throw e } finally { loading.value = false } }
  const reject = async (id: number, data: RejectScrapCommand) => { loading.value = true; error.value = null; try { await rejectScrap(id, data); clearScrapCache() } catch (e) { error.value = e as Error; throw e } finally { loading.value = false } }

  return { loading, error, deleteOne, voidOne, submit, approve, reject }
}

export function useScrapStats() {
  const stats = ref<any>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const load = async () => { loading.value = true; error.value = null; try { stats.value = await getScrapStats() } catch (e) { error.value = e as Error; throw e } finally { loading.value = false } }
  const loadQuantities = async (id: number) => { loading.value = true; error.value = null; try { const [totalQty, materialCount] = await Promise.all([getScrapTotalQty(id), getScrapMaterialCount(id)]); return { totalQty, materialCount } } catch (e) { error.value = e as Error; throw e } finally { loading.value = false } }

  return { stats, loading, error, load, loadQuantities }
}

export function useScrapBatch() {
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const batchGet = async (ids: number[]) => { loading.value = true; error.value = null; try { return await batchGetScraps(ids) } catch (e) { error.value = e as Error; throw e } finally { loading.value = false } }
  const batchSubmit = async (ids: number[]) => { loading.value = true; error.value = null; try { await batchSubmitScraps(ids); clearScrapCache() } catch (e) { error.value = e as Error; throw e } finally { loading.value = false } }
  const batchApprove = async (ids: number[]) => { loading.value = true; error.value = null; try { await batchApproveScraps(ids); clearScrapCache() } catch (e) { error.value = e as Error; throw e } finally { loading.value = false } }
  const batchVoid = async (ids: number[]) => { loading.value = true; error.value = null; try { await batchVoidScraps(ids); clearScrapCache() } catch (e) { error.value = e as Error; throw e } finally { loading.value = false } }

  return { loading, error, batchGet, batchSubmit, batchApprove, batchVoid }
}

export function useScrapPrint() {
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const getPrintData = async (id: number) => { loading.value = true; error.value = null; try { return await getScrapPrintData(id) } catch (e) { error.value = e as Error; throw e } finally { loading.value = false } }
  return { loading, error, getPrintData }
}

export function useScrapManager() {
  const currentId = ref<number | null>(null)
  const list = useScrapList()
  const detail = useScrapDetail(currentId)
  const form = useScrapForm()
  const workflow = useScrapWorkflow()
  const stats = useScrapStats()
  const batch = useScrapBatch()
  const print = useScrapPrint()

  const setCurrentId = (id: number | null) => { currentId.value = id; if (id) detail.load() }
  const createScrap = async (data: CreateScrapCommand) => { const result = await form.create(data); await list.refresh(); return result }
  const updateScrap = async (id: number, data: UpdateScrapCommand) => { currentId.value = id; const result = await detail.update(data); await list.refresh(); return result }
  const deleteScrap = async (id: number) => { await workflow.deleteOne(id); await list.refresh(); if (currentId.value === id) currentId.value = null }
  const voidScrap = async (id: number) => { await workflow.voidOne(id); if (currentId.value === id) await detail.refresh(); await list.refresh() }
  const submitScrap = async (id: number) => { const result = await workflow.submit(id); if (currentId.value === id) await detail.refresh(); await list.refresh(); return result }
  const approveScrap = async (id: number, data: ApproveScrapCommand) => { const result = await workflow.approve(id, data); if (currentId.value === id) await detail.refresh(); await list.refresh(); return result }
  const rejectScrap = async (id: number, data: RejectScrapCommand) => { await workflow.reject(id, data); if (currentId.value === id) await detail.refresh(); await list.refresh() }

  return {
    currentId, scraps: list.scraps, currentScrap: detail.scrap, stats: stats.stats,
    loading: computed(() => list.loading.value || detail.loading.value || form.loading.value || workflow.loading.value || stats.loading.value || batch.loading.value || print.loading.value),
    loadList: list.load, refreshList: list.refresh, filterByStatus: list.filterByStatus, filterByReason: list.filterByReason, filterByMaterial: list.filterByMaterial, filterByDateRange: list.filterByDateRange, search: list.search, loadPending: list.loadPending,
    setCurrentId, loadDetail: (id: number) => { setCurrentId(id); return detail.load() }, refreshDetail: detail.refresh,
    createScrap, updateScrap, deleteScrap, voidScrap, submitScrap, approveScrap, rejectScrap,
    formData: form.formData, resetForm: form.reset, validateForm: form.validate,
    loadStats: stats.load, loadQuantities: stats.loadQuantities,
    batchGet: batch.batchGet, batchSubmit: batch.batchSubmit, batchApprove: batch.batchApprove, batchVoid: batch.batchVoid,
    getPrintData: print.getPrintData, canEdit: detail.canEdit, canSubmit: detail.canSubmit, canApprove: detail.canApprove, checkCanEdit: detail.checkCanEdit, checkCanSubmit: detail.checkCanSubmit, checkCanApprove: detail.checkCanApprove,
  }
}
