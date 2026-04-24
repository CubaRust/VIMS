/**
 * 状态流转规则 API
 *
 * 提供状态流转规则的完整 CRUD 操作和业务逻辑封装
 */

import type { Schema } from '../shared/helpers';
import { api } from '../shared/client-factory';
import { enhancedApi } from '../shared/enhanced-client';

// ============================================================================
// 类型定义
// ============================================================================

export type StatusFlowView = Schema<'StatusFlowView'>;
export type StatusFlowCreateBody = Schema<'CreateStatusFlowCommand'>;
export type StatusFlowUpdateBody = Schema<'UpdateStatusFlowCommand'>;

export interface StatusFlowListQuery {
  source_status?: string;
  scene_code?: string;
  is_active?: boolean;
}

// ============================================================================
// 基础 CRUD 操作
// ============================================================================

/**
 * 获取状态流转规则列表
 *
 * @example
 * const flows = await listStatusFlows({ is_active: true })
 */
export async function listStatusFlows(params?: StatusFlowListQuery) {
  return api.get('/api/v1/status-flows', {
    params: params as any,
  }) as Promise<StatusFlowView[]>;
}

/**
 * 获取状态流转规则详情
 *
 * @example
 * const flow = await getStatusFlow(1)
 */
export async function getStatusFlow(id: number) {
  return api.get('/api/v1/status-flows/{id}', {
    pathParams: { id },
  }) as Promise<StatusFlowView>;
}

/**
 * 创建状态流转规则
 *
 * @example
 * const newFlow = await createStatusFlow({
 *   source_status: 'PENDING',
 *   target_status: 'APPROVED',
 *   scene_code: 'INBOUND',
 *   need_auth_flag: true
 * })
 */
export async function createStatusFlow(data: StatusFlowCreateBody) {
  return api.post('/api/v1/status-flows', data) as Promise<StatusFlowView>;
}

/**
 * 更新状态流转规则
 *
 * @example
 * const updated = await updateStatusFlow(1, {
 *   source_status: 'PENDING',
 *   target_status: 'APPROVED',
 *   scene_code: 'INBOUND',
 *   need_auth_flag: false,
 *   is_active: true
 * })
 */
export async function updateStatusFlow(id: number, data: StatusFlowUpdateBody) {
  return api.put('/api/v1/status-flows/{id}', data, {
    pathParams: { id },
  }) as Promise<StatusFlowView>;
}

/**
 * 删除状态流转规则
 *
 * @example
 * await deleteStatusFlow(1)
 */
export async function deleteStatusFlow(id: number) {
  return api.delete('/api/v1/status-flows/{id}', {
    pathParams: { id },
  });
}

/**
 * 切换状态流转规则启用状态
 *
 * @example
 * await toggleStatusFlowActive(1, false)
 */
export async function toggleStatusFlowActive(id: number, isActive: boolean) {
  return api.patch('/api/v1/status-flows/{id}/toggle-active',
    { is_active: isActive },
    { pathParams: { id } }
  ) as Promise<StatusFlowView>;
}

// ============================================================================
// 业务逻辑封装（使用 enhancedApi）
// ============================================================================

/**
 * 获取启用的状态流转规则列表（带缓存）
 *
 * @example
 * const flows = await getActiveStatusFlows()
 */
export async function getActiveStatusFlows() {
  return enhancedApi.get('/api/v1/status-flows', {
    params: { is_active: true } as any,
    cache: { ttl: 10 * 60 * 1000 }, // 缓存 10 分钟（状态流转规则变化较少）
    label: '获取启用状态流转规则',
  }) as Promise<StatusFlowView[]>;
}

/**
 * 按场景获取状态流转规则（带缓存）
 *
 * @example
 * const flows = await getStatusFlowsByScene('INBOUND')
 */
export async function getStatusFlowsByScene(sceneCode: string) {
  return enhancedApi.get('/api/v1/status-flows', {
    params: {
      scene_code: sceneCode,
      is_active: true,
    } as any,
    cache: { ttl: 10 * 60 * 1000, key: `scene:${sceneCode}` },
    label: `获取场景状态流转: ${sceneCode}`,
  }) as Promise<StatusFlowView[]>;
}

/**
 * 按源状态获取可流转的目标状态（带缓存）
 *
 * @example
 * const flows = await getStatusFlowsBySource('PENDING')
 */
export async function getStatusFlowsBySource(sourceStatus: string) {
  return enhancedApi.get('/api/v1/status-flows', {
    params: {
      source_status: sourceStatus,
      is_active: true,
    } as any,
    cache: { ttl: 10 * 60 * 1000, key: `source:${sourceStatus}` },
    label: `获取源状态流转: ${sourceStatus}`,
  }) as Promise<StatusFlowView[]>;
}

/**
 * 获取指定场景和源状态的可流转目标状态（带缓存）
 *
 * @example
 * const flows = await getAvailableTargetStatuses('INBOUND', 'PENDING')
 */
export async function getAvailableTargetStatuses(sceneCode: string, sourceStatus: string) {
  const flows = await enhancedApi.get('/api/v1/status-flows', {
    params: {
      scene_code: sceneCode,
      source_status: sourceStatus,
      is_active: true,
    } as any,
    cache: { ttl: 10 * 60 * 1000, key: `flow:${sceneCode}:${sourceStatus}` },
    label: `获取可流转状态: ${sceneCode}/${sourceStatus}`,
  }) as Promise<StatusFlowView[]>;

  return flows.map(f => ({
    targetStatus: f.target_status,
    needAuth: f.need_auth_flag,
  }));
}

/**
 * 检查状态流转是否允许
 *
 * @example
 * const allowed = await isStatusFlowAllowed('INBOUND', 'PENDING', 'APPROVED')
 */
export async function isStatusFlowAllowed(
  sceneCode: string,
  sourceStatus: string,
  targetStatus: string
): Promise<boolean> {
  try {
    const flows = await getAvailableTargetStatuses(sceneCode, sourceStatus);
    return flows.some(f => f.targetStatus === targetStatus);
  } catch {
    return false;
  }
}

/**
 * 检查状态流转是否需要授权
 *
 * @example
 * const needAuth = await isStatusFlowNeedAuth('INBOUND', 'PENDING', 'APPROVED')
 */
export async function isStatusFlowNeedAuth(
  sceneCode: string,
  sourceStatus: string,
  targetStatus: string
): Promise<boolean> {
  try {
    const flows = await getAvailableTargetStatuses(sceneCode, sourceStatus);
    const flow = flows.find(f => f.targetStatus === targetStatus);
    return flow?.needAuth || false;
  } catch {
    return false;
  }
}

/**
 * 批量获取状态流转规则详情
 *
 * @example
 * const flows = await batchGetStatusFlows([1, 2, 3])
 */
export async function batchGetStatusFlows(ids: number[]) {
  return enhancedApi.batch(
    ids.map((id) => () => getStatusFlow(id))
  );
}

/**
 * 批量切换状态流转规则状态
 *
 * @example
 * await batchToggleStatusFlows([1, 2, 3], false)
 */
export async function batchToggleStatusFlows(ids: number[], isActive: boolean) {
  return enhancedApi.batch(
    ids.map((id) => () => toggleStatusFlowActive(id, isActive))
  );
}

/**
 * 获取状态流转规则统计信息（带重试）
 *
 * @example
 * const stats = await getStatusFlowStats()
 */
export async function getStatusFlowStats() {
  const result = await enhancedApi.get('/api/v1/status-flows', {
    params: {} as any,
    retry: { times: 3, delay: 1000 },
    cache: { ttl: 10 * 60 * 1000 },
    label: '获取状态流转统计',
  }) as StatusFlowView[];

  return {
    total: result.length,
    active: result.filter(f => f.is_active).length,
    inactive: result.filter(f => !f.is_active).length,
    needAuth: result.filter(f => f.need_auth_flag).length,
  };
}

/**
 * 预加载常用状态流转规则（后台加载）
 *
 * @example
 * preloadCommonStatusFlows()
 */
export function preloadCommonStatusFlows() {
  getActiveStatusFlows().catch(() => {
    // 忽略错误
  });
}

// ============================================================================
// 缓存管理
// ============================================================================

/**
 * 清除状态流转规则相关缓存
 */
export function clearStatusFlowCache() {
  enhancedApi.clearCache('status-flows');
}

/**
 * 清除场景缓存
 */
export function clearStatusFlowSceneCache() {
  enhancedApi.clearCache('scene:');
  enhancedApi.clearCache('source:');
  enhancedApi.clearCache('flow:');
}
