/**
 * 物料管理 Composable
 *
 * 提供物料的完整管理功能，特别优化了选择器和搜索功能
 *
 * @example
 * // 物料选择器（最常用）
 * const { options, search, selectedMaterial } = useMaterialSelector()
 * await search('螺丝')
 *
 * // 列表管理
 * const { materials, loadMaterials } = useMaterialList()
 * await loadMaterials({ is_active: true })
 *
 * // 完整管理器
 * const manager = useMaterialManager()
 * await manager.list.loadMaterials()
 * await manager.create.create({ ... })
 */

import { ref, computed, watch, toValue } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import {
  listMaterials,
  getMaterial,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  toggleMaterialActive,
  getActiveMaterials,
  searchMaterials,
  searchMaterialsByCode,
  getMaterialsByCategory,
  batchGetMaterials,
  batchToggleMaterials,
  checkMaterialCodeExists,
  getMaterialStats,
  preloadCommonMaterials,
  clearMaterialCache,
  clearSearchCache,
  type MaterialView,
  type MaterialCreateBody,
  type MaterialUpdateBody,
  type MaterialListQuery,
} from '../../../api/catalog/material-api'

// ============================================================================
// 类型定义
// ============================================================================

export interface UseMaterialListOptions {
  /** 是否自动加载 */
  autoLoad?: boolean
  /** 初始查询参数 */
  initialQuery?: MaterialListQuery
}

export interface MaterialStats {
  total: number
  active: number
  inactive: number
  byCategory: Record<string, number>
}

// ============================================================================
// 1. 列表管理
// ============================================================================

/**
 * 物料列表管理
 *
 * @example
 * const { materials, loading, loadMaterials, refresh } = useMaterialList({
 *   autoLoad: true,
 *   initialQuery: { is_active: true }
 * })
 */
export function useMaterialList(options: UseMaterialListOptions = {}) {
  const materials = ref<MaterialView[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const total = ref(0)
  const currentQuery = ref<MaterialListQuery | undefined>(options.initialQuery)

  /**
   * 加载物料列表
   */
  async function loadMaterials(query?: MaterialListQuery) {
    loading.value = true
    error.value = null
    currentQuery.value = query

    try {
      const result = await listMaterials(query)
      materials.value = result.items || []
      total.value = result.total || 0
      return result
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * 刷新列表
   */
  async function refresh() {
    clearMaterialCache()
    return loadMaterials(currentQuery.value)
  }

  /**
   * 按分类筛选
   */
  async function filterByCategory(category: string) {
    loading.value = true
    error.value = null

    try {
      const data = await getMaterialsByCategory(category)
      materials.value = data
      total.value = data.length
      return data
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * 按状态筛选
   */
  async function filterByStatus(isActive: boolean) {
    return loadMaterials({ ...currentQuery.value, is_active: isActive })
  }

  /**
   * 搜索物料
   */
  async function search(keyword: string) {
    loading.value = true
    error.value = null

    try {
      const data = await searchMaterials(keyword)
      materials.value = data
      total.value = data.length
      return data
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  // 自动加载
  if (options.autoLoad) {
    loadMaterials(options.initialQuery)
  }

  return {
    materials,
    loading,
    error,
    total,
    currentQuery,
    loadMaterials,
    refresh,
    filterByCategory,
    filterByStatus,
    search,
  }
}

// ============================================================================
// 2. 详情管理
// ============================================================================

/**
 * 单个物料管理
 *
 * @example
 * const materialId = ref(1)
 * const { material, loading, loadMaterial, update } = useMaterial(materialId)
 * await loadMaterial()
 */
export function useMaterial(id: MaybeRefOrGetter<number | undefined>) {
  const material = ref<MaterialView | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  /**
   * 加载物料详情
   */
  async function loadMaterial() {
    const materialId = toValue(id)
    if (!materialId) {
      material.value = null
      return null
    }

    loading.value = true
    error.value = null

    try {
      const data = await getMaterial(materialId)
      material.value = data
      return data
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新物料
   */
  async function update(data: MaterialUpdateBody) {
    const materialId = toValue(id)
    if (!materialId) {
      throw new Error('物料 ID 不能为空')
    }

    loading.value = true
    error.value = null

    try {
      const updated = await updateMaterial(materialId, data)
      material.value = updated
      clearMaterialCache()
      return updated
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * 切换启用状态
   */
  async function toggleStatus() {
    const materialId = toValue(id)
    if (!materialId || !material.value) {
      throw new Error('物料数据不存在')
    }

    loading.value = true
    error.value = null

    try {
      const newStatus = !material.value.is_active
      const updated = await toggleMaterialActive(materialId, newStatus)
      material.value = updated
      clearMaterialCache()
      return updated
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  // 计算属性
  const isActive = computed(() => material.value?.is_active ?? false)
  const canEdit = computed(() => isActive.value)

  // 监听 ID 变化自动加载
  watch(() => toValue(id), (newId) => {
    if (newId) {
      loadMaterial()
    } else {
      material.value = null
    }
  }, { immediate: true })

  return {
    material,
    loading,
    error,
    isActive,
    canEdit,
    loadMaterial,
    update,
    toggleStatus,
  }
}

// ============================================================================
// 3. 创建管理
// ============================================================================

/**
 * 物料创建管理
 *
 * @example
 * const { creating, create, checkCodeExists } = useMaterialCreate()
 * const exists = await checkCodeExists('MAT001')
 * if (!exists) {
 *   await create({ material_code: 'MAT001', ... })
 * }
 */
export function useMaterialCreate() {
  const creating = ref(false)
  const error = ref<Error | null>(null)

  /**
   * 创建物料
   */
  async function create(data: MaterialCreateBody) {
    creating.value = true
    error.value = null

    try {
      const newMaterial = await createMaterial(data)
      clearMaterialCache()
      return newMaterial
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      creating.value = false
    }
  }

  /**
   * 检查物料代码是否存在
   */
  async function checkCodeExists(code: string) {
    try {
      return await checkMaterialCodeExists(code)
    } catch (e) {
      console.error('检查物料代码失败:', e)
      return false
    }
  }

  /**
   * 验证物料数据
   */
  function validateData(data: MaterialCreateBody): string[] {
    const errors: string[] = []

    if (!data.material_code) {
      errors.push('物料代码不能为空')
    }

    if (!data.material_name) {
      errors.push('物料名称不能为空')
    }

    if (!data.material_category) {
      errors.push('物料分类不能为空')
    }

    if (!data.unit) {
      errors.push('单位不能为空')
    }

    return errors
  }

  return {
    creating,
    error,
    create,
    checkCodeExists,
    validateData,
  }
}

// ============================================================================
// 4. 删除管理
// ============================================================================

/**
 * 物料删除管理
 *
 * @example
 * const { deleting, deleteOne, deleteMany } = useMaterialDelete()
 * await deleteOne(1)
 */
export function useMaterialDelete() {
  const deleting = ref(false)
  const error = ref<Error | null>(null)

  /**
   * 删除单个物料
   */
  async function deleteOne(id: number) {
    deleting.value = true
    error.value = null

    try {
      await deleteMaterial(id)
      clearMaterialCache()
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      deleting.value = false
    }
  }

  /**
   * 批量删除物料
   */
  async function deleteMany(ids: number[]) {
    deleting.value = true
    error.value = null

    try {
      await Promise.all(ids.map(id => deleteMaterial(id)))
      clearMaterialCache()
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      deleting.value = false
    }
  }

  return {
    deleting,
    error,
    deleteOne,
    deleteMany,
  }
}

// ============================================================================
// 5. 物料选择器（重点功能）
// ============================================================================

/**
 * 物料选择器 Composable
 *
 * 专为下拉选择、搜索选择等场景优化
 *
 * @example
 * const { options, loading, search, select, selectedMaterial } = useMaterialSelector()
 *
 * // 搜索物料
 * await search('螺丝')
 *
 * // 加载启用的物料
 * await loadActive()
 *
 * // 选择物料
 * select(options.value[0])
 */
export function useMaterialSelector() {
  const options = ref<MaterialView[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const selectedMaterial = ref<MaterialView | null>(null)
  const searchKeyword = ref('')

  /**
   * 搜索物料
   */
  async function search(keyword: string) {
    if (!keyword.trim()) {
      options.value = []
      searchKeyword.value = ''
      return []
    }

    loading.value = true
    error.value = null
    searchKeyword.value = keyword

    try {
      const data = await searchMaterials(keyword)
      options.value = data
      return data
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * 按物料代码搜索
   */
  async function searchByCode(code: string) {
    if (!code.trim()) {
      options.value = []
      return []
    }

    loading.value = true
    error.value = null

    try {
      const data = await searchMaterialsByCode(code)
      options.value = data
      return data
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * 加载启用的物料（带缓存）
   */
  async function loadActive() {
    loading.value = true
    error.value = null

    try {
      const data = await getActiveMaterials()
      options.value = data
      return data
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * 按分类加载物料
   */
  async function loadByCategory(category: string) {
    loading.value = true
    error.value = null

    try {
      const data = await getMaterialsByCategory(category)
      options.value = data
      return data
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * 选择物料
   */
  function select(material: MaterialView | null) {
    selectedMaterial.value = material
  }

  /**
   * 清除选择
   */
  function clear() {
    selectedMaterial.value = null
    options.value = []
    searchKeyword.value = ''
  }

  /**
   * 预加载常用物料
   */
  function preload() {
    preloadCommonMaterials()
  }

  // 计算属性
  const hasOptions = computed(() => options.value.length > 0)
  const hasSelection = computed(() => selectedMaterial.value !== null)

  return {
    options,
    loading,
    error,
    selectedMaterial,
    searchKeyword,
    hasOptions,
    hasSelection,
    search,
    searchByCode,
    loadActive,
    loadByCategory,
    select,
    clear,
    preload,
  }
}

// ============================================================================
// 6. 批量操作
// ============================================================================

/**
 * 物料批量操作管理
 *
 * @example
 * const { processing, batchLoad, batchToggle } = useMaterialBatch()
 * const materials = await batchLoad([1, 2, 3])
 * await batchToggle([1, 2, 3], false)
 */
export function useMaterialBatch() {
  const processing = ref(false)
  const error = ref<Error | null>(null)
  const progress = ref(0)

  /**
   * 批量加载物料
   */
  async function batchLoad(ids: number[]) {
    processing.value = true
    error.value = null
    progress.value = 0

    try {
      const data = await batchGetMaterials(ids)
      progress.value = 100
      return data
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      processing.value = false
    }
  }

  /**
   * 批量切换状态
   */
  async function batchToggle(ids: number[], isActive: boolean) {
    processing.value = true
    error.value = null
    progress.value = 0

    try {
      await batchToggleMaterials(ids, isActive)
      progress.value = 100
      clearMaterialCache()
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      processing.value = false
    }
  }

  return {
    processing,
    error,
    progress,
    batchLoad,
    batchToggle,
  }
}

// ============================================================================
// 7. 统计查询
// ============================================================================

/**
 * 物料统计查询
 *
 * @example
 * const { stats, loading, loadStats } = useMaterialStats()
 * await loadStats()
 */
export function useMaterialStats() {
  const stats = ref<MaterialStats | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  /**
   * 加载统计信息
   */
  async function loadStats() {
    loading.value = true
    error.value = null

    try {
      const data = await getMaterialStats()
      stats.value = data as MaterialStats
      return data
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    stats,
    loading,
    error,
    loadStats,
  }
}

// ============================================================================
// 8. 完整管理器
// ============================================================================

/**
 * 物料完整管理器
 *
 * 组合所有功能模块，提供统一的管理接口
 *
 * @example
 * const manager = useMaterialManager()
 *
 * // 列表操作
 * await manager.list.loadMaterials()
 *
 * // 选择器
 * await manager.selector.search('螺丝')
 * manager.selector.select(material)
 *
 * // 创建
 * await manager.create.create({ ... })
 *
 * // 批量操作
 * await manager.batch.batchToggle([1, 2, 3], false)
 */
export function useMaterialManager() {
  const selectedId = ref<number>()

  const list = useMaterialList()
  const detail = useMaterial(computed(() => selectedId.value))
  const create = useMaterialCreate()
  const deleteOps = useMaterialDelete()
  const selector = useMaterialSelector()
  const batch = useMaterialBatch()
  const stats = useMaterialStats()

  /**
   * 选择物料
   */
  function selectMaterial(id: number) {
    selectedId.value = id
  }

  /**
   * 取消选择
   */
  function clearSelection() {
    selectedId.value = undefined
  }

  /**
   * 全局加载状态
   */
  const isLoading = computed(() =>
    list.loading.value ||
    detail.loading.value ||
    create.creating.value ||
    deleteOps.deleting.value ||
    selector.loading.value ||
    batch.processing.value ||
    stats.loading.value
  )

  /**
   * 全局错误状态
   */
  const hasError = computed(() =>
    !!list.error.value ||
    !!detail.error.value ||
    !!create.error.value ||
    !!deleteOps.error.value ||
    !!selector.error.value ||
    !!batch.error.value ||
    !!stats.error.value
  )

  return {
    selectedId,
    list,
    detail,
    create,
    delete: deleteOps,
    selector,
    batch,
    stats,
    selectMaterial,
    clearSelection,
    isLoading,
    hasError,
  }
}
